'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, getUserData } from '../utils/token';

export const useAuthProtection = (requiredRole?: 'STUDENT' | 'SUPERVISOR' | 'COORDINATOR') => {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Small delay to allow storage operations to complete
    const checkAuth = () => {
      const token = getToken();
      const user = getUserData();

      // If no token or user data, redirect to home/login
      if (!token || !user) {
        router.replace('/');
        return;
      }

      // If specific role is required, check if user has that role
      if (requiredRole && user.role.toUpperCase() !== requiredRole) {
        // Redirect to appropriate dashboard based on actual role
        switch (user.role.toUpperCase()) {
          case 'STUDENT':
            router.replace('/student/dashboard');
            break;
          case 'SUPERVISOR':
            router.replace('/supervisor/dashboard');
            break;
          case 'COORDINATOR':
            router.replace('/coordinator/dashboard');
            break;
          default:
            router.replace('/');
        }
      } else {
        setIsChecking(false);
      }
    };

    // Delay to ensure storage is ready
    const timeout = setTimeout(checkAuth, 200);
    return () => clearTimeout(timeout);
  }, [router, requiredRole]);

  const token = getToken();
  const user = getUserData();

  return {
    isAuthenticated: !!token && !!user,
    user,
    token,
    isChecking,
  };
};
