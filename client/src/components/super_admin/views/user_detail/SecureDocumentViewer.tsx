import React, { useState, useEffect } from 'react';
import { 
  X, Download, FileText, Image as ImageIcon, Lock, 
  Loader2, ZoomIn, ZoomOut, Maximize 
} from 'lucide-react';

interface SecureDocumentViewerProps {
  activeDocument: { url: string; type: 'pdf' | 'image'; title: string } | null;
  onClose: () => void;
}

export const SecureDocumentViewer: React.FC<SecureDocumentViewerProps> = ({ activeDocument, onClose }) => {
  const [downloading, setDownloading] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [zoom, setZoom] = useState(1);

  // --- KEYBOARD ACCESSIBILITY ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (activeDocument) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeDocument, onClose]);

  // Reset states when a new document opens
  useEffect(() => {
    setMediaLoading(true);
    setZoom(1);
  }, [activeDocument]);

  if (!activeDocument) return null;

  // --- ZOOM CONTROLS FOR IMAGES ---
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.4, 4)); // Max 400%
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.4, 0.5)); // Min 50%
  const handleZoomReset = () => setZoom(1);

  // --- SECURE DOWNLOAD HANDLER ---
  const handleSecureDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch(activeDocument.url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${activeDocument.title.replace(/\s+/g, '_')}_Audit.${activeDocument.type === 'pdf' ? 'pdf' : 'jpg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Secure download failed", err);
      alert("Failed to securely download document.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-50/95 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      
      {/* --- MINIMALIST LIGHT HEADER --- */}
      <div className="flex items-center justify-between p-3 md:p-4 border-b border-slate-200 bg-white/80 shrink-0 shadow-sm">
        <div className="flex items-center gap-3 md:gap-4 truncate mr-2">
          <div className="p-2 md:p-2.5 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
            {activeDocument.type === 'pdf' ? <FileText className="w-5 h-5 md:w-6 md:h-6 text-blue-600" /> : <ImageIcon className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />}
          </div>
          <div className="truncate">
            <h3 className="font-bold text-sm md:text-base text-slate-900 tracking-tight truncate">{activeDocument.title}</h3>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest flex items-center gap-1 mt-0.5">
              <Lock className="w-3 h-3 text-slate-400" /> <span className="hidden sm:inline">Secure Audit Session</span><span className="sm:hidden">Secure</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <button 
            onClick={handleSecureDownload} 
            disabled={downloading} 
            className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 text-xs md:text-sm font-bold rounded-xl transition-all disabled:opacity-50 border border-slate-200 shadow-sm"
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} 
            {/* Hides text on mobile to save space, shows text on desktop */}
            <span className="hidden sm:inline">{downloading ? 'Encrypting...' : 'Save Copy'}</span>
          </button>
          
          <div className="hidden md:block w-px h-8 bg-slate-200 mx-1"></div>
          
          <button 
            onClick={onClose} 
            className="p-2 md:p-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all border border-red-100 shadow-sm"
            title="Close Viewer (Esc)"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>

      {/* --- VIEWER BODY --- */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-2 md:p-6 select-none" onContextMenu={(e) => e.preventDefault()}>
        
        {/* Elegant Loading Overlay */}
        {mediaLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-50/50 backdrop-blur-sm">
            <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-200 flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-600" />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Decrypting Media...</p>
            </div>
          </div>
        )}

        {activeDocument.type === 'pdf' ? (
          <iframe 
            src={`${activeDocument.url}#toolbar=0&navpanes=0`} 
            className={`w-full h-full bg-white rounded-2xl shadow-xl border border-slate-200 transition-opacity duration-300 ${mediaLoading ? 'opacity-0' : 'opacity-100'}`} 
            title="Secure PDF Viewer" 
            onLoad={() => setMediaLoading(false)}
            sandbox="allow-same-origin allow-scripts" 
          />
        ) : (
          <div className={`w-full h-full overflow-auto flex items-center justify-center bg-slate-100/50 rounded-2xl border border-slate-200 relative transition-opacity duration-300 ${mediaLoading ? 'opacity-0' : 'opacity-100'}`}>
            
            <img 
              src={activeDocument.url} 
              alt="Secure Document" 
              className="max-w-none transition-transform duration-200 ease-out shadow-sm rounded-lg" 
              style={{ 
                transform: `scale(${zoom})`, 
                transformOrigin: 'center center',
                maxHeight: zoom <= 1 ? '100%' : 'none',
                maxWidth: zoom <= 1 ? '100%' : 'none',
              }}
              onLoad={() => setMediaLoading(false)}
              onDragStart={(e) => e.preventDefault()}
            />

            {/* Light Theme Floating Zoom Controls */}
            {!mediaLoading && (
              <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1.5 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl z-20">
                <button onClick={handleZoomOut} className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-30">
                  <ZoomOut className="w-5 h-5" />
                </button>
                <div className="w-14 text-center text-xs font-bold font-mono text-slate-700 select-none">
                  {Math.round(zoom * 100)}%
                </div>
                <button onClick={handleZoomIn} className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors">
                  <ZoomIn className="w-5 h-5" />
                </button>
                <div className="w-px h-6 bg-slate-200 mx-1"></div>
                <button onClick={handleZoomReset} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors" title="Reset Zoom">
                  <Maximize className="w-5 h-5" />
                </button>
              </div>
            )}
            
          </div>
        )}
      </div>
    </div>
  );
};