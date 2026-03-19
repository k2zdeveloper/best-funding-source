import React, { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import { Navigation } from './Navigation';
import { Footer } from './Footer';

// --- ACCESSIBILITY: Skip Link ---
// This allows keyboard and screen-reader users to bypass the navigation 
// and jump straight to the page content. It remains hidden until focused.
const SkipLink = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:font-bold focus:rounded-lg focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all"
  >
    Skip to main content
  </a>
);

// --- PERFORMANCE: Fallback Loader ---
// If any public child routes are lazy-loaded (code-split), this provides a smooth transition
const PageLoader = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center animate-in fade-in duration-500">
    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
    <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Loading...</p>
  </div>
);

export const MainLayout: React.FC = () => {
  const { pathname } = useLocation();

  // --- UX FIX: Scroll Restoration ---
  // React Router does not reset scroll position by default. 
  // This ensures that when a user clicks a link in the footer, the new page loads at the very top.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div className="min-h-screen font-sans flex flex-col bg-slate-50 relative selection:bg-blue-200 selection:text-blue-900 overflow-x-hidden">
      
      {/* 1. WCAG Accessibility Link */}
      <SkipLink />
      
      {/* 2. Global Top Navigation */}
      <Navigation />
      
      {/* 3. Semantic Main Content Area */}
      {/* Using <main> instead of <div> significantly improves SEO and accessibility */}
      <main 
        id="main-content" 
        className="flex-1 flex flex-col w-full focus:outline-none" 
        tabIndex={-1}
      >
        {/* Suspense boundary ensures lazy-loaded pages don't break the layout */}
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      
      {/* 4. Global Footer */}
      <Footer />

    </div>
  );
};