
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
  login: (email: string, pass: string, rememberMe?: boolean) => Promise<any>;
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

const REMEMBER_ME_STORAGE_KEY = "salonflow-remember-me";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRoleState] = useState<UserRole>(null);
  const [shouldRemember, setShouldRemember] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    // Check local storage for remember me preference
    const savedRememberMe = localStorage.getItem(REMEMBER_ME_STORAGE_KEY);
    if (savedRememberMe === 'true') {
        setShouldRemember(true);
    }

    const savedRole = sessionStorage.getItem('userRole') as UserRole;
    if (savedRole) {
      setRoleState(savedRole);
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const token = await user.getIdToken();
        await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        await fetch('/api/auth/session', { method: 'DELETE' });
        sessionStorage.removeItem('userRole');
        localStorage.removeItem(REMEMBER_ME_STORAGE_KEY);
        setRoleState(null);
        setShouldRemember(false);
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

  const login = async (email: string, pass: string, rememberMe: boolean = false) => {
    setLoading(true);
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        setShouldRemember(rememberMe);
        if (rememberMe) {
            localStorage.setItem(REMEMBER_ME_STORAGE_KEY, 'true');
        } else {
            localStorage.removeItem(REMEMBER_ME_STORAGE_KEY);
        }
        setUser(userCredential.user);
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
        setRole(null);
        localStorage.removeItem(REMEMBER_ME_STORAGE_KEY);
        router.push('/login');
    } catch (error) {
        console.error("Logout failed:", error);
    } finally {
        setLoading(false);
    }
  }, [router, setRole]);
  
  useEffect(() => {
    const handleBeforeUnload = () => {
        // Only auto-logout if the user did NOT check "Keep me logged in"
        if (!shouldRemember && auth.currentUser) {
            signOut(auth);
        }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [shouldRemember]);
  
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
