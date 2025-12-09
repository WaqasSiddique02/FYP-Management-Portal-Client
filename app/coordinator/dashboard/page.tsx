"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { coordinatorApi } from "@/lib/api/coordinator.api";
import { useAuthContext } from "@/lib/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  GraduationCap,
  UserCheck,
  UserX,
  UsersRound,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Award,
  AlertCircle,
  TrendingUp,
  Briefcase,
  BookOpen,
  Loader2,
  Megaphone,
} from "lucide-react";

interface DashboardData {
  usersSummary: {
    totalStudents: number;
    totalSupervisors: number;
    studentsRegisteredForFYP: number;
    studentsNotRegistered: number;
    facultyPerDepartment: Array<{
      count: number;
      department: string;
    }>;
  };
  groupProjectOverview: {
    totalGroups: number;
    groupsWithoutSupervisor: number;
    groupsWithSupervisor: number;
    projectSelectionsPendingApproval: number;
    projectSelectionsApproved: number;
  };
  schedulesAndPanels: {
    upcomingPresentationsCount: number;
    totalPanelsCreated: number;
    scheduleConflictsDetected: number;
    nextPresentationSlot: string | null;
  };
  proposalsAndDocuments: {
    proposalSummary: {
      proposalsSubmitted: number;
      proposalsApproved: number;
      proposalsRejected: number;
    };
    documentSummary: {
      documentsUploaded: number;
      documentsPendingReview: number;
    };
  };
  supervisorAvailability: {
    supervisors: Array<{
      id: string;
      name: string;
      department: string;
      assignedGroupsCount: number;
      availableSlots: number;
      isAvailable: boolean;
    }>;
  };
  announcements: {
    recent: Array<{
      id: string;
      title: string;
      content: string;
      createdBy: string;
      createdAt: string;
    }>;
  };
}

export default function CoordinatorDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthContext();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      fetchDashboard();
    }
  }, [authLoading, user]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardData = await coordinatorApi.getDashboard();
      setData(dashboardData);
    } catch (error: any) {
      console.error("Error fetching dashboard:", error);
      setError(error.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout role="coordinator">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-slate-600">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout role="coordinator">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Card className="border-red-200 bg-red-50 max-w-md">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <p className="text-red-900 font-medium mb-4">
                {error || "Failed to load dashboard"}
              </p>
              <button
                onClick={fetchDashboard}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Try Again
              </button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Prepare chart data
  const studentRegistrationData = [
    {
      name: "Registered",
      value: data.usersSummary.studentsRegisteredForFYP,
      color: "#9333ea",
    },
    {
      name: "Not Registered",
      value: data.usersSummary.studentsNotRegistered,
      color: "#e9d5ff",
    },
  ];

  const groupDistributionData = [
    {
      name: "With Supervisor",
      value: data.groupProjectOverview.groupsWithSupervisor,
      color: "#9333ea",
    },
    {
      name: "Without Supervisor",
      value: data.groupProjectOverview.groupsWithoutSupervisor,
      color: "#fbbf24",
    },
  ];

  const proposalStatusData = [
    {
      name: "Approved",
      value: data.proposalsAndDocuments.proposalSummary.proposalsApproved,
      color: "#10b981",
    },
    {
      name: "Pending",
      value: data.proposalsAndDocuments.proposalSummary.proposalsSubmitted,
      color: "#f59e0b",
    },
    {
      name: "Rejected",
      value: data.proposalsAndDocuments.proposalSummary.proposalsRejected,
      color: "#ef4444",
    },
  ];

  const projectStatusData = [
    {
      name: "Approved",
      value: data.groupProjectOverview.projectSelectionsApproved,
    },
    {
      name: "Pending",
      value: data.groupProjectOverview.projectSelectionsPendingApproval,
    },
  ];

  return (
    <DashboardLayout role="coordinator">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-purple-600 rounded-2xl p-6 md:p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Coordinator Dashboard
              </h1>
              <p className="text-purple-100 text-sm md:text-base">
                Complete overview of FYP management system
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm px-6 py-4 rounded-xl border border-white/30">
                <p className="text-3xl font-bold">
                  {data.usersSummary.totalStudents}
                </p>
                <p className="text-xs text-purple-100 mt-1">Total Students</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-6 py-4 rounded-xl border border-white/30">
                <p className="text-3xl font-bold">
                  {data.groupProjectOverview.totalGroups}
                </p>
                <p className="text-xs text-purple-100 mt-1">Total Groups</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Students Registered */}
          <Card className="border-purple-200 bg-purple-50 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-purple-600 uppercase tracking-wide">
                    FYP Registered
                  </p>
                  <p className="text-3xl font-bold text-purple-900 mt-2">
                    {data.usersSummary.studentsRegisteredForFYP}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    of {data.usersSummary.totalStudents} students
                  </p>
                </div>
                <div className="bg-purple-200 p-4 rounded-xl">
                  <UserCheck className="h-8 w-8 text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Supervisors */}
          <Card className="border-purple-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">
                    Supervisors
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {data.usersSummary.totalSupervisors}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Active faculty</p>
                </div>
                <div className="bg-purple-100 p-4 rounded-xl">
                  <Briefcase className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Groups with Supervisor */}
          <Card className="border-purple-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">
                    Supervised Groups
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {data.groupProjectOverview.groupsWithSupervisor}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {data.groupProjectOverview.groupsWithoutSupervisor}{" "}
                    unassigned
                  </p>
                </div>
                <div className="bg-purple-100 p-4 rounded-xl">
                  <UsersRound className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evaluation Panels */}
          <Card className="border-purple-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">
                    Evaluation Panels
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {data.schedulesAndPanels.totalPanelsCreated}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {data.schedulesAndPanels.upcomingPresentationsCount}{" "}
                    upcoming
                  </p>
                </div>
                <div className="bg-purple-100 p-4 rounded-xl">
                  <Award className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student Registration Pie Chart */}
          <Card className="border-purple-200">
            <CardHeader className="border-b border-purple-100 bg-purple-50">
              <CardTitle className="text-lg font-bold text-purple-900 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-purple-600" />
                Student Registration Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={studentRegistrationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) =>
                      `${name}: ${value} (${((percent ?? 0) * 100).toFixed(
                        0
                      )}%)`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {studentRegistrationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-2xl font-bold text-purple-900">
                    {data.usersSummary.studentsRegisteredForFYP}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">Registered</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-2xl font-bold text-slate-900">
                    {data.usersSummary.studentsNotRegistered}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">Not Registered</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Group Distribution Pie Chart */}
          <Card className="border-purple-200">
            <CardHeader className="border-b border-purple-100 bg-purple-50">
              <CardTitle className="text-lg font-bold text-purple-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Group Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={groupDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) =>
                      `${name}: ${value} (${((percent ?? 0) * 100).toFixed(
                        0
                      )}%)`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {groupDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-2xl font-bold text-purple-900">
                    {data.groupProjectOverview.groupsWithSupervisor}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    With Supervisor
                  </p>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-2xl font-bold text-amber-900">
                    {data.groupProjectOverview.groupsWithoutSupervisor}
                  </p>
                  <p className="text-xs text-amber-600 mt-1">Unassigned</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Proposals and Projects Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Proposal Status Bar Chart */}
          <Card className="border-purple-200">
            <CardHeader className="border-b border-purple-100 bg-purple-50">
              <CardTitle className="text-lg font-bold text-purple-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                Proposal Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={proposalStatusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" />
                  <XAxis dataKey="name" stroke="#7c3aed" />
                  <YAxis stroke="#7c3aed" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e9d5ff",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="value" fill="#9333ea" radius={[8, 8, 0, 0]}>
                    {proposalStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="text-center p-2 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xl font-bold text-green-900">
                    {
                      data.proposalsAndDocuments.proposalSummary
                        .proposalsApproved
                    }
                  </p>
                  <p className="text-xs text-green-600 mt-1">Approved</p>
                </div>
                <div className="text-center p-2 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-xl font-bold text-amber-900">
                    {
                      data.proposalsAndDocuments.proposalSummary
                        .proposalsSubmitted
                    }
                  </p>
                  <p className="text-xs text-amber-600 mt-1">Pending</p>
                </div>
                <div className="text-center p-2 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-xl font-bold text-red-900">
                    {
                      data.proposalsAndDocuments.proposalSummary
                        .proposalsRejected
                    }
                  </p>
                  <p className="text-xs text-red-600 mt-1">Rejected</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Selection Status */}
          <Card className="border-purple-200">
            <CardHeader className="border-b border-purple-100 bg-purple-50">
              <CardTitle className="text-lg font-bold text-purple-900 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-600" />
                Project Selections
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={projectStatusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" />
                  <XAxis dataKey="name" stroke="#7c3aed" />
                  <YAxis stroke="#7c3aed" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e9d5ff",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="value" fill="#9333ea" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <CheckCircle2 className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-900">
                    {data.groupProjectOverview.projectSelectionsApproved}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">Approved</p>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <Clock className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-amber-900">
                    {data.groupProjectOverview.projectSelectionsPendingApproval}
                  </p>
                  <p className="text-xs text-amber-600 mt-1">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents Summary Card */}
        <Card className="border-purple-200">
          <CardHeader className="border-b border-purple-100 bg-purple-50">
            <CardTitle className="text-lg font-bold text-purple-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Documents Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-900">
                  {data.proposalsAndDocuments.documentSummary.documentsUploaded}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  Documents Uploaded
                </p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-200">
                <Clock className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-amber-900">
                  {
                    data.proposalsAndDocuments.documentSummary
                      .documentsPendingReview
                  }
                </p>
                <p className="text-xs text-amber-600 mt-1">Pending Review</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-900">
                  {data.schedulesAndPanels.upcomingPresentationsCount}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  Upcoming Presentations
                </p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                <AlertCircle className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-slate-900">
                  {data.schedulesAndPanels.scheduleConflictsDetected}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Schedule Conflicts
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Row - Supervisors and Announcements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Supervisor Availability */}
          <Card className="border-purple-200">
            <CardHeader className="border-b border-purple-100 bg-purple-50">
              <CardTitle className="text-lg font-bold text-purple-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Supervisor Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <div className="max-h-80 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-purple-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-purple-900 uppercase tracking-wider border-b border-purple-200">
                          Supervisor
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-purple-900 uppercase tracking-wider border-b border-purple-200">
                          Groups
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-purple-900 uppercase tracking-wider border-b border-purple-200">
                          Available
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-purple-900 uppercase tracking-wider border-b border-purple-200">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {data.supervisorAvailability.supervisors.map(
                        (supervisor) => (
                          <tr
                            key={supervisor.id}
                            className="hover:bg-purple-50/50 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium text-slate-900 text-sm">
                                  {supervisor.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {supervisor.department}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-sm font-semibold text-slate-900">
                                {supervisor.assignedGroupsCount}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-sm font-semibold text-purple-600">
                                {supervisor.availableSlots}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {supervisor.isAvailable ? (
                                <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                                  Available
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                                  Full
                                </Badge>
                              )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Announcements */}
          <Card className="border-purple-200">
            <CardHeader className="border-b border-purple-100 bg-purple-50">
              <CardTitle className="text-lg font-bold text-purple-900 flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-purple-600" />
                Recent Announcements
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {data.announcements.recent.length > 0 ? (
                <div className="max-h-80 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-purple-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-purple-900 uppercase tracking-wider border-b border-purple-200">
                          Title
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-purple-900 uppercase tracking-wider border-b border-purple-200">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {data.announcements.recent.map((announcement) => (
                        <tr
                          key={announcement.id}
                          className="hover:bg-purple-50/50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-slate-900 text-sm line-clamp-1">
                                {announcement.title}
                              </p>
                              <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                                {announcement.content}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                By {announcement.createdBy}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-xs text-slate-500 whitespace-nowrap">
                              {formatDate(announcement.createdAt)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Megaphone className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No announcements yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
