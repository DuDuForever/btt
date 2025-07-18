
"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Define the role type
export type UserRole = 'owner' | 'assistant' | null;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: UserRole;
  setRole: (role: UserRole) => void;
  login: (email: string, pass: string) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  role: null,
  setRole: () => {},
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRoleState] = useState<UserRole>(null);
  const router = useRouter();

  useEffect(() => {
    // Attempt to load role from session storage on initial load
    const savedRole = sessionStorage.getItem('userRole') as UserRole;
    if (savedRole) {
      setRoleState(savedRole);
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const token = await user.getIdToken();
        // Set session cookie
        await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
         // Clear session cookie and role
        await fetch('/api/auth/session', { method: 'DELETE' });
        sessionStorage.removeItem('userRole');
        setRoleState(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setRole = useCallback((newRole: UserRole) => {
    setRoleState(newRole);
    if (newRole) {
      sessionStorage.setItem('userRole', newRole);
    } else {
      sessionStorage.removeItem('userRole');
    }
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        // Do not set role here, let AppContent handle the role selection modal
        setUser(userCredential.user);
        // Do not redirect here, let AppContent handle it after role selection
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
    } finally {
        setLoading(false);
    }
  };

  const logout = useCallback(async () => {
    setLoading(true);
    try {
        await signOut(auth);
        setUser(null);
        setRole(null); // Clear role on logout
        router.push('/login');
    } catch (error) {
        console.error("Logout failed:", error);
    } finally {
        setLoading(false);
    }
  }, [router, setRole]);
  
   // Auto-logout on tab/browser close
  useEffect(() => {
    const handleBeforeUnload = () => {
        // This runs just before the window is closed.
        // We can't guarantee an async call like logout() completes,
        // but we can try. A more robust solution for security is short session expiry.
        if (auth.currentUser) {
            logout();
        }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [logout]);
  
  const value = {
    user,
    loading,
    role,
    setRole,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
