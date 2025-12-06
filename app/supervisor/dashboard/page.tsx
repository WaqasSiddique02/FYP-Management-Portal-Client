'use client';

import React from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useAuthProtection } from '@/lib/hooks/useAuthProtection';

export default function SupervisorDashboardPage() {
  const { isAuthenticated, user } = useAuthProtection('SUPERVISOR');

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout role="supervisor">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600 mt-1">Supervisor Dashboard</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-600">Supervisor dashboard coming soon...</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
