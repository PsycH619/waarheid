'use client';

import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { onAuthChange, getUserData, signOut as authSignOut, ensureUserDocument } from '@/lib/auth';
import type { User, UserRole } from '@/types';

interface AuthContextType {
  user: FirebaseUser | null;
  userData: User | null;
  role: UserRole | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      setError(null);

      if (firebaseUser) {
        try {
          // Fetch user data from Firestore
          let data = await getUserData(firebaseUser.uid);

          // Safety net: If user document doesn't exist, create it
          if (!data) {
            console.warn('⚠️ User document missing, creating now...');
            data = await ensureUserDocument(firebaseUser);
          }

          setUserData(data);
        } catch (err: any) {
          console.error('❌ Error loading user data:', err);
          setError(err.message || 'Failed to load user data');
          setUserData(null);
        }
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await authSignOut();
    setUser(null);
    setUserData(null);
  };

  const value: AuthContextType = {
    user,
    userData,
    role: userData?.role || null,
    loading,
    error,
    signOut: handleSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
