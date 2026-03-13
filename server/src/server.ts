import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import cluster from 'node:cluster';
import os from 'node:os';
import dotenv from 'dotenv';

// Initialize environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;
const numCPUs = os.cpus().length;

// ==========================================
// ⚖️ NATIVE LOAD BALANCING (Clustering)
// ==========================================
// If this is the Master process, fork worker processes for each CPU core.
if (cluster.isPrimary) {
  console.log(`[SYSTEM START]: Primary Load Balancer running on PID ${process.pid}`);
  console.log(`[CLUSTER]: Booting ${numCPUs} worker threads for maximum throughput...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Auto-restart dead workers to ensure zero downtime
  cluster.on('exit', (worker, code, signal) => {
    console.error(`[CLUSTER ALARM]: Worker ${worker.process.pid} died. Spinning up a replacement...`);
    cluster.fork();
  });

} else {
  // ==========================================
  // 🛡️ WORKER PROCESS: ENTERPRISE EXPRESS APP
  // ==========================================
  const app: Application = express();

  // 1. Helmet: OWASP Top 10 Header Protection (Stops XSS, Clickjacking)
  app.use(helmet());

  // 2. Strict CORS: Whitelist ONLY your approved frontend domains
  const whitelist = process.env.NODE_ENV === 'production'
    ? ['https://bestfundingsource.com']
    : ['http://localhost:5173']; // Vite default local port

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests) ONLY if explicitly needed.
      // For strict web-only security, remove the `!origin` check.
      if (!origin || whitelist.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by Strict CORS Policy'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // 3. Payload Limits: Block massive payloads designed to crash the server memory
  app.use(express.json({ limit: '100kb' })); 
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));

  // 4. HTTP Parameter Pollution Protection: Strips duplicate query strings
  app.use(hpp());

  // 5. Global Rate Limiter: Prevent brute-force and DDoS
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: { error: 'Strict rate limit exceeded. Please try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  // ==========================================
  // 🛣️ ROUTING ARCHITECTURE
  // ==========================================
  
  // Health Check for external load balancers (AWS ELB, Render, DigitalOcean)
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ 
      status: 'Secure Terminal Online', 
      worker_pid: process.pid,
      timestamp: new Date().toISOString() 
    });
  });

  // ==========================================
  // ⚠️ FALLBACK & ERROR HANDLING
  // ==========================================
  
  // Handle 404s
  app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Secure Endpoint Not Found' });
  });

  // Global Error Catcher (Prevents stack traces from leaking to the client)
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(`[WORKER ${process.pid} ERROR]:`, err.message);
    res.status(err.status || 500).json({
      error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
    });
  });

  // Boot the worker
  app.listen(PORT, () => {
    console.log(`[WORKER ${process.pid}]: Online and listening on port ${PORT}`);
  });
}