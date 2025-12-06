'use client';

import React, { useEffect, useState } from 'react';
import { dashboardAPI } from '@/lib/api/dashboard.api';
import StatsCards from './StatsCards';
import ProjectOverview from './ProjectOverview';
import GroupMembers from './GroupMembers';
import PerformanceChart from './PerformanceChart';
import RecentDocuments from './RecentDocuments';

interface DashboardData {
  student: any;
  group: any;
  supervisor: any;
  project: any;
  proposal: any;
  documents: any;
  feedback: any;
  schedule: any;
}

export default function StudentDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const data = await dashboardAPI.student.getDashboard();
        setDashboardData(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Failed to load dashboard'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {dashboardData.student?.name || 'Student'}!
        </h1>
        <p className="text-gray-600 mt-1">
          {dashboardData.student?.rollNumber || 'N/A'} • {dashboardData.student?.department || 'N/A'}
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards
        groupMembersCount={dashboardData.group?.groupMembers?.length || 0}
        documentsCount={dashboardData.documents?.documentsCount || 0}
        proposalStatus={dashboardData.proposal?.proposalStatus || 'pending'}
        totalMarks={dashboardData.feedback?.totalMarks || 0}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {dashboardData.project && dashboardData.supervisor && (
            <ProjectOverview 
              project={dashboardData.project} 
              supervisor={dashboardData.supervisor} 
            />
          )}
          
          {dashboardData.feedback && (
            <PerformanceChart feedback={dashboardData.feedback} />
          )}
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {dashboardData.group && (
            <GroupMembers group={dashboardData.group} />
          )}
          
          {dashboardData.documents && (
            <RecentDocuments documents={dashboardData.documents} />
          )}
        </div>
      </div>
    </div>
  );
}