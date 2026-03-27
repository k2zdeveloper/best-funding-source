import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type Role = 'borrower' | 'lender' | 'admin' | 'super_admin' | null;

interface AuthState {
  user: User | null;
  role: Role;
  isVerified: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  role: null,
  isVerified: false,
  loading: true, // Always start in loading state to protect routes
};

const AuthContext = createContext<AuthState>(initialState);

// --- STRICT TYPE GUARDING ---
const isValidRole = (role: any): role is Role => {
  return ['borrower', 'lender', 'admin', 'super_admin'].includes(role);
};

const normalizeRole = (rawRole: any, fallback: Role = 'borrower'): Role => {
  if (!rawRole) return fallback;
  const cleanRole = String(rawRole).toLowerCase().trim();
  return isValidRole(cleanRole) ? cleanRole : fallback;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);

  // --- THE UX FIX: Session Memory ---
  // Tracks the active user ID outside the render cycle to prevent stale closures 
  // from triggering false-positive loading screens on tab focus.
  const activeUserId = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true; 

    const processSession = async (sessionUser: User | null) => {
      // 1. Handle Logged Out State
      if (!sessionUser) {
        activeUserId.current = null;
        if (isMounted) setState({ user: null, role: null, isVerified: false, loading: false });
        return;
      }

      // Update the memory reference
      activeUserId.current = sessionUser.id;

      // 2. Handle Logged In State (Silent Background Fetch)
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role, is_verified')
          .eq('id', sessionUser.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') throw error;

        const finalRole = data?.role || sessionUser.user_metadata?.requested_role;
        const safeRole = normalizeRole(finalRole);

        if (isMounted) {
          setState(prev => ({
            ...prev,
            user: sessionUser,
            role: safeRole,
            isVerified: !!data?.is_verified,
            loading: false, // Always drop shield when complete
          }));
        }
      } catch (err) {
        console.error("[AUTH] Identity sync failed. Engaging secure fallback protocol.");
        const backupRole = normalizeRole(sessionUser.user_metadata?.requested_role);

        if (isMounted) {
          setState(prev => ({
            ...prev,
            user: sessionUser,
            role: backupRole,
            isVerified: false,
            loading: false,
          }));
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session: Session | null) => {
      // Check if the incoming broadcast belongs to a new user or the current one
      const isNewUser = session?.user?.id !== activeUserId.current;

      if (event === 'INITIAL_SESSION') {
        processSession(session?.user || null);
      } 
      else if (event === 'SIGNED_IN') {
        // Only show the loading shield if this is a genuinely NEW login.
        // If the ID matches, it's just Supabase syncing tabs in the background.
        if (isNewUser && isMounted) {
          setState(prev => ({ ...prev, loading: true }));
        }
        processSession(session?.user || null);
      } 
      else if (event === 'TOKEN_REFRESHED') {
        // Tokens refresh silently in the background. Never show a loading screen for this.
        processSession(session?.user || null);
      } 
      else if (event === 'SIGNED_OUT') {
        processSession(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // PERFORMANCE: Memoize the context value to prevent unnecessary app-wide re-renders
  const contextValue = useMemo(() => state, [state]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used strictly within an AuthProvider');
  }
  return context;
};