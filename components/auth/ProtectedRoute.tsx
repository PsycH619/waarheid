'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: 'admin' | 'client';
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        router.push('/login');
      } else if (requiredRole && userData?.role !== requiredRole) {
        // Redirect to appropriate dashboard based on role
        if (userData?.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (userData?.role === 'client') {
          router.push('/client/dashboard');
        } else {
          router.push('/login');
        }
      }
    }
  }, [user, userData, loading, requireAuth, requiredRole, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return null;
  }

  if (requiredRole && userData?.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
