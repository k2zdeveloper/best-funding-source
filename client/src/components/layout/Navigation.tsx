import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Menu } from 'lucide-react';

export const Navigation: React.FC = () => {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Logo Area */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-blue-600 p-2 rounded-lg group-hover:bg-blue-700 transition-colors">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-2xl text-slate-900 tracking-tight">
                Enterprise<span className="text-blue-600">Funding</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/apply" 
              className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
            >
              Public Intake Form
            </Link>
            
            <div className="h-6 w-px bg-slate-200" aria-hidden="true"></div>
            
            <Link 
              to="/login" 
              className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
            >
              Log in
            </Link>
            
            <div className="flex items-center gap-3">
              <Link 
                to="/signup/borrower" 
                className="text-sm font-bold px-5 py-2.5 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 rounded-lg transition-all"
              >
                Apply as Borrower
              </Link>
              <Link 
                to="/signup/lender" 
                className="text-sm font-bold px-5 py-2.5 text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm hover:shadow-md transition-all"
              >
                Partner as Lender
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button (Visual Only for this component) */}
          <div className="md:hidden flex items-center">
            <button className="text-slate-500 hover:text-slate-900 p-2">
              <Menu className="h-6 w-6" />
            </button>
          </div>
          
        </div>
      </div>
    </nav>
  );
};