'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import SupervisorStatsCards from '@/components/dashboard/SupervisorStatsCards';
import RecentActivityList from '@/components/dashboard/RecentActivityList';
import WorkloadSummary from '@/components/dashboard/WorkloadSummary';
import SupervisorCharts from '@/components/dashboard/SupervisorCharts';
import { supervisorApi } from '@/lib/api/supervisor.api';
import { SupervisorDashboardData } from '@/lib/types/supervisor.types';
import { Loader2 } from 'lucide-react';
import { useAuthContext } from '@/lib/contexts/AuthContext';

export default function SupervisorDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthContext();
  const [dashboardData, setDashboardData] = useState<SupervisorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/supervisor/login');
      return;
    }

    if (user && user.role.toLowerCase() !== 'supervisor') {
      router.push(`/${user.role.toLowerCase()}/dashboard`);
      return;
    }

    if (user) {
      fetchDashboardData();
    }
  }, [user, authLoading, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await supervisorApi.getDashboard();
      setDashboardData(response.data);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout role="supervisor">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="supervisor">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg
                className="h-12 w-12 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-gray-900 font-semibold mb-2">Error Loading Dashboard</p>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <DashboardLayout role="supervisor">
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Supervisor Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's an overview of your supervision activities.
          </p>
        </div>

        {/* Stats Cards */}
        <SupervisorStatsCards
          assignedGroupsCount={dashboardData.assignedGroups.assignedGroupsCount}
          totalDocumentsReceived={dashboardData.documentSummary.totalDocumentsReceived}
          documentsAwaitingReview={dashboardData.documentSummary.documentsAwaitingReview}
          pendingProposalsCount={dashboardData.pendingWork.pendingProposalsCount}
          pendingDocumentsCount={dashboardData.pendingWork.pendingDocumentsCount}
          pendingFinalEvaluationsCount={dashboardData.pendingWork.pendingFinalEvaluationsCount}
          totalIdeasCreated={dashboardData.personalProjectIdeas.totalIdeasCreated}
          ideasSelected={dashboardData.personalProjectIdeas.ideasSelected}
        />

        {/* Charts Section */}
        <SupervisorCharts
          pendingWork={dashboardData.pendingWork}
          personalProjectIdeas={dashboardData.personalProjectIdeas}
          documentSummary={dashboardData.documentSummary}
          evaluations={dashboardData.evaluations}
        />

        {/* Activity and Workload Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <RecentActivityList activities={dashboardData.recentActivity.activities} />

          {/* Workload Summary */}
          <WorkloadSummary
            documentSummary={dashboardData.documentSummary}
            evaluations={dashboardData.evaluations}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
