import React from 'react';

export interface TooltipProps {
  children: React.ReactNode;
  text: string;
  disabled?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({ children, text, disabled = false }) => {
  if (disabled) return <>{children}</>;

  return (
    <div className="group relative flex items-center justify-center">
      {children}
      {/* Tooltip Body */}
      <div className="absolute bottom-full mb-2 px-2.5 py-1 bg-slate-800 text-white text-[10px] font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-md border border-slate-700">
        {text}
        {/* Tooltip Arrow (SVG pointing down) */}
        <svg 
          className="absolute text-slate-800 h-2 w-full left-0 top-full" 
          x="0px" y="0px" viewBox="0 0 255 255" xmlSpace="preserve"
        >
          <polygon className="fill-current" points="0,0 127.5,127.5 255,0" />
        </svg>
      </div>
    </div>
  );
};