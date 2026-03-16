import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Explicitly export the Role type so it can be used strictly across the app
export type Role = 'borrower' | 'lender' | 'admin' | 'super_admin' | null;

interface AuthContextType {
  user: User | null;
  role: Role;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  
  // Start loading as true to prevent premature redirects in ProtectedRoute
  const [loading, setLoading] = useState(true);

  // --- UNIFIED PROFILE LOADER ---
  // Extracted to strictly enforce the hierarchy of role resolution
  const resolveUserRole = async (currentUser: User): Promise<Role> => {
    try {
      // 1. Always use maybeSingle() to prevent unhandled 0-row exceptions when a profile is lagging
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (error) {
        console.warn('[AUTH WARNING] Profile fetch delay or RLS block:', error.message);
      }

      // 2. Primary Source: Database Profile (The single source of truth)
      if (profile?.role) {
        return profile.role as Role;
      }

      // 3. Failsafe: JWT User Metadata (Written during the initial signUp call)
      // CRITICAL FIX: Checking 'requested_role' where the AuthPortal actually writes the data
      const metaRole = currentUser.user_metadata?.requested_role || currentUser.user_metadata?.role;
      if (metaRole) {
        return metaRole as Role;
      }

      // 4. Absolute Fallback: Default to lowest privilege if both DB and Metadata fail
      console.warn('[AUTH FALLBACK] No role found in DB or Metadata. Defaulting to borrower.');
      return 'borrower';

    } catch (err) {
      console.error('[AUTH FATAL] Error resolving user role:', err);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Step 1: Get the current active session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (session?.user) {
          if (mounted) setUser(session.user);
          const resolvedRole = await resolveUserRole(session.user);
          if (mounted) setRole(resolvedRole);
        } else {
          if (mounted) {
            setUser(null);
            setRole(null);
          }
        }
      } catch (error) {
        console.error("[AUTH FATAL] Session initialization failure:", error);
        if (mounted) {
          setUser(null);
          setRole(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // Fire the initial fetch on mount
    initializeAuth();

    // Step 2: Listen for subsequent auth state changes
    // We only react to specific events to prevent the 'INITIAL_SESSION' double-fire bug
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      // Ignore INITIAL_SESSION because initializeAuth() already handles the initial mount state
      if (event === 'INITIAL_SESSION') return;

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED')) {
        // Only trigger a loading state if we actually need to fetch new data (e.g., a new user logging in)
        if (!user || user.id !== session.user.id) {
            setLoading(true);
        }
        
        setUser(session.user);
        const resolvedRole = await resolveUserRole(session.user);
        
        if (mounted) {
          setRole(resolvedRole);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [user?.id]); // STRICT DEPENDENCY: Only re-run if the actual user ID changes

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};