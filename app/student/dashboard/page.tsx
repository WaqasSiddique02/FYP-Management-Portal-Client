'use client';

import React from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import StudentDashboard from '@/components/dashboard/StudentDashboard';
import { useAuthProtection } from '@/lib/hooks/useAuthProtection';

export default function StudentDashboardPage() {
  const { isAuthenticated, user, isChecking } = useAuthProtection('STUDENT');

  // Show loading while checking authentication
  if (isChecking || !isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout role="student">
      <StudentDashboard />
    </DashboardLayout>
  );
}