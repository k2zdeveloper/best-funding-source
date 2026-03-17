import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type Role = 'borrower' | 'lender' | 'admin' | 'super_admin' | null;

interface AuthContextType {
  user: User | null;
  role: Role;
  isVerified: boolean; // NEW: Expose verification status globally
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  isVerified: false,
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const extractUserRole = (currentUser: User): Role => {
    const metaRole = currentUser.user_metadata?.requested_role || currentUser.user_metadata?.role;
    return (metaRole ? metaRole.toLowerCase().trim() : 'borrower') as Role;
  };

  // NEW: Background fetch for verification status (Non-blocking)
  const fetchVerificationStatus = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('is_verified').eq('id', userId).maybeSingle();
    if (data) setIsVerified(!!data.is_verified);
  };

  useEffect(() => {
    let mounted = true;

    const initializeSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user && mounted) {
          setUser(session.user);
          setRole(extractUserRole(session.user));
          fetchVerificationStatus(session.user.id); // Fetch in background
        }
      } catch (err) {
        console.error("[AUTH] Session error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted || event === 'INITIAL_SESSION') return;

      if (event === 'SIGNED_OUT') {
        setUser(null); setRole(null); setIsVerified(false); setLoading(false);
        return;
      }

      if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        setUser(session.user);
        setRole(extractUserRole(session.user));
        fetchVerificationStatus(session.user.id);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, isVerified, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};