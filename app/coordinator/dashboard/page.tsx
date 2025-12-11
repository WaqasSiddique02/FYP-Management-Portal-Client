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
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
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
      <div className="space-y-6 pb-8">
        {/* Header Section */}
        <div className="relative bg-indigo-600 rounded-2xl p-8 shadow-2xl overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-300 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/30">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
                    Coordinator Dashboard
                  </h1>
                  <p className="text-white/90 text-sm md:text-base font-medium">
                    Final Year Project Management System
                  </p>
                </div>
              </div>
              <p className="text-white/80 text-sm max-w-2xl">
                Comprehensive oversight and management of all FYP activities,
                groups, supervisors, and submissions
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/15 backdrop-blur-md px-5 py-4 rounded-xl border border-white/30 shadow-lg hover:bg-white/20 transition-all">
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-white/90" />
                  <div>
                    <p className="text-3xl font-bold text-white">
                      {data.usersSummary.totalStudents}
                    </p>
                    <p className="text-xs text-white/80 mt-0.5 font-medium">
                      Total Students
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white/15 backdrop-blur-md px-5 py-4 rounded-xl border border-white/30 shadow-lg hover:bg-white/20 transition-all">
                <div className="flex items-center gap-3">
                  <UsersRound className="h-6 w-6 text-white/90" />
                  <div>
                    <p className="text-3xl font-bold text-white">
                      {data.groupProjectOverview.totalGroups}
                    </p>
                    <p className="text-xs text-white/80 mt-0.5 font-medium">
                      Active Groups
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Students Registered */}
          <Card className="border-0 bg-linear-to-br from-blue-50 to-blue-100/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-blue-500 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                  <UserCheck className="h-7 w-7 text-white" />
                </div>
                <Badge className="bg-blue-100 text-blue-700 border-0 font-semibold px-3">
                  Active
                </Badge>
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-900/70 uppercase tracking-wide mb-2">
                  FYP Registered
                </p>
                <p className="text-4xl font-bold text-blue-900 mb-1">
                  {data.usersSummary.studentsRegisteredForFYP}
                </p>
                <p className="text-xs text-blue-700/80 font-medium">
                  of {data.usersSummary.totalStudents} total students enrolled
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Total Supervisors */}
          <Card className="border-0 bg-linear-to-br from-emerald-50 to-emerald-100/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-emerald-500 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                  <Briefcase className="h-7 w-7 text-white" />
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 border-0 font-semibold px-3">
                  Faculty
                </Badge>
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-900/70 uppercase tracking-wide mb-2">
                  Supervisors
                </p>
                <p className="text-4xl font-bold text-emerald-900 mb-1">
                  {data.usersSummary.totalSupervisors}
                </p>
                <p className="text-xs text-emerald-700/80 font-medium">
                  Active faculty members available
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Groups with Supervisor */}
          <Card className="border-0 bg-linear-to-br from-purple-50 to-purple-100/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-purple-500 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                  <UsersRound className="h-7 w-7 text-white" />
                </div>
                <Badge className="bg-purple-100 text-purple-700 border-0 font-semibold px-3">
                  Groups
                </Badge>
              </div>
              <div>
                <p className="text-sm font-semibold text-purple-900/70 uppercase tracking-wide mb-2">
                  Supervised Groups
                </p>
                <p className="text-4xl font-bold text-purple-900 mb-1">
                  {data.groupProjectOverview.groupsWithSupervisor}
                </p>
                <p className="text-xs text-purple-700/80 font-medium">
                  {data.groupProjectOverview.groupsWithoutSupervisor} groups
                  awaiting assignment
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Evaluation Panels */}
          <Card className="border-0 bg-linear-to-br from-amber-50 to-amber-100/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-amber-500 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                  <Award className="h-7 w-7 text-white" />
                </div>
                <Badge className="bg-amber-100 text-amber-700 border-0 font-semibold px-3">
                  Panels
                </Badge>
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-900/70 uppercase tracking-wide mb-2">
                  Evaluation Panels
                </p>
                <p className="text-4xl font-bold text-amber-900 mb-1">
                  {data.schedulesAndPanels.totalPanelsCreated}
                </p>
                <p className="text-xs text-amber-700/80 font-medium">
                  {data.schedulesAndPanels.upcomingPresentationsCount}{" "}
                  presentations scheduled
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student Registration Pie Chart */}
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader className="border-b bg-linear-to-r from-blue-50 to-indigo-50 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-3">
                  <div className="bg-blue-500 p-2 rounded-lg">
                    <GraduationCap className="h-5 w-5 text-white" />
                  </div>
                  Student Registration Status
                </CardTitle>
                <Badge className="bg-blue-100 text-blue-700 border-0 font-semibold">
                  Overview
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={280}>
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
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-linear-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 shadow-sm">
                  <UserCheck className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-900">
                    {data.usersSummary.studentsRegisteredForFYP}
                  </p>
                  <p className="text-xs text-blue-700 mt-1 font-semibold">
                    Registered
                  </p>
                </div>
                <div className="text-center p-4 bg-linear-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-slate-200 shadow-sm">
                  <UserX className="h-5 w-5 text-slate-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-slate-900">
                    {data.usersSummary.studentsNotRegistered}
                  </p>
                  <p className="text-xs text-slate-700 mt-1 font-semibold">
                    Not Registered
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Group Distribution Pie Chart */}
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader className="border-b bg-linear-to-r from-purple-50 to-pink-50 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-3">
                  <div className="bg-indigo-500 p-2 rounded-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  Group Distribution
                </CardTitle>
                <Badge className="bg-purple-100 text-indigo-700 border-0 font-semibold">
                  Analysis
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={280}>
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
                    dataKey="value"
                    fill="#FFA500"
                  >
                    {groupDistributionData.map((entry, index) => (
                      <Cell key={index} fill="#CC3F6E" />
                    ))}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-linear-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200 shadow-sm">
                  <CheckCircle2 className="h-5 w-5 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-900">
                    {data.groupProjectOverview.groupsWithSupervisor}
                  </p>
                  <p className="text-xs text-purple-700 mt-1 font-semibold">
                    With Supervisor
                  </p>
                </div>
                <div className="text-center p-4 bg-linear-to-br from-amber-50 to-amber-100 rounded-xl border-2 border-amber-200 shadow-sm">
                  <Clock className="h-5 w-5 text-amber-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-amber-900">
                    {data.groupProjectOverview.groupsWithoutSupervisor}
                  </p>
                  <p className="text-xs text-amber-700 mt-1 font-semibold">
                    Unassigned
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Proposals and Projects Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Proposal Status Bar Chart */}
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader className="border-b bg-linear-to-r from-emerald-50 to-teal-50 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-3">
                  <div className="bg-emerald-500 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  Proposal Status
                </CardTitle>
                <Badge className="bg-emerald-100 text-emerald-700 border-0 font-semibold">
                  Submissions
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={proposalStatusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    style={{ fontSize: "12px", fontWeight: "600" }}
                  />
                  <YAxis
                    stroke="#64748b"
                    style={{ fontSize: "12px", fontWeight: "600" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {proposalStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-linear-to-br from-green-50 to-emerald-100 rounded-xl border-2 border-green-200 shadow-sm">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-green-900">
                    {
                      data.proposalsAndDocuments.proposalSummary
                        .proposalsApproved
                    }
                  </p>
                  <p className="text-xs text-green-700 mt-1 font-semibold">
                    Approved
                  </p>
                </div>
                <div className="text-center p-3 bg-linear-to-br from-amber-50 to-orange-100 rounded-xl border-2 border-amber-200 shadow-sm">
                  <Clock className="h-5 w-5 text-amber-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-amber-900">
                    {
                      data.proposalsAndDocuments.proposalSummary
                        .proposalsSubmitted
                    }
                  </p>
                  <p className="text-xs text-amber-700 mt-1 font-semibold">
                    Pending
                  </p>
                </div>
                <div className="text-center p-3 bg-linear-to-br from-red-50 to-rose-100 rounded-xl border-2 border-red-200 shadow-sm">
                  <XCircle className="h-5 w-5 text-red-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-red-900">
                    {
                      data.proposalsAndDocuments.proposalSummary
                        .proposalsRejected
                    }
                  </p>
                  <p className="text-xs text-red-700 mt-1 font-semibold">
                    Rejected
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Selection Status */}
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader className="border-b bg-linear-to-r from-indigo-50 to-purple-50 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-3">
                  <div className="bg-indigo-500 p-2 rounded-lg">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  Project Selections
                </CardTitle>
                <Badge className="bg-indigo-100 text-indigo-700 border-0 font-semibold">
                  Progress
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={projectStatusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    style={{ fontSize: "12px", fontWeight: "600" }}
                  />
                  <YAxis
                    stroke="#64748b"
                    style={{ fontSize: "12px", fontWeight: "600" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-linear-to-br from-indigo-50 to-purple-100 rounded-xl border-2 border-indigo-200 shadow-sm">
                  <CheckCircle2 className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-indigo-900">
                    {data.groupProjectOverview.projectSelectionsApproved}
                  </p>
                  <p className="text-xs text-indigo-700 mt-1 font-semibold">
                    Approved Projects
                  </p>
                </div>
                <div className="text-center p-4 bg-linear-to-br from-amber-50 to-orange-100 rounded-xl border-2 border-amber-200 shadow-sm">
                  <Clock className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-amber-900">
                    {data.groupProjectOverview.projectSelectionsPendingApproval}
                  </p>
                  <p className="text-xs text-amber-700 mt-1 font-semibold">
                    Pending Approval
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents Summary Card */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="border-b bg-linear-to-r from-rose-50 to-pink-50 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-3">
                <div className="bg-rose-500 p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                Documents & Schedule Overview
              </CardTitle>
              <Badge className="bg-rose-100 text-rose-700 border-0 font-semibold">
                Summary
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="text-center p-5 bg-linear-to-br from-rose-50 to-red-100 rounded-xl border-2 border-rose-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-rose-500 p-3 rounded-xl w-fit mx-auto mb-3 shadow-md">
                  <FileText className="h-7 w-7 text-white" />
                </div>
                <p className="text-3xl font-bold text-rose-900 mb-1">
                  {data.proposalsAndDocuments.documentSummary.documentsUploaded}
                </p>
                <p className="text-xs text-rose-700 font-semibold uppercase tracking-wide">
                  Documents Uploaded
                </p>
              </div>
              <div className="text-center p-5 bg-linear-to-br from-amber-50 to-orange-100 rounded-xl border-2 border-amber-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-amber-500 p-3 rounded-xl w-fit mx-auto mb-3 shadow-md">
                  <Clock className="h-7 w-7 text-white" />
                </div>
                <p className="text-3xl font-bold text-amber-900 mb-1">
                  {
                    data.proposalsAndDocuments.documentSummary
                      .documentsPendingReview
                  }
                </p>
                <p className="text-xs text-amber-700 font-semibold uppercase tracking-wide">
                  Pending Review
                </p>
              </div>
              <div className="text-center p-5 bg-linear-to-br from-violet-50 to-purple-100 rounded-xl border-2 border-violet-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-violet-500 p-3 rounded-xl w-fit mx-auto mb-3 shadow-md">
                  <Calendar className="h-7 w-7 text-white" />
                </div>
                <p className="text-3xl font-bold text-violet-900 mb-1">
                  {data.schedulesAndPanels.upcomingPresentationsCount}
                </p>
                <p className="text-xs text-violet-700 font-semibold uppercase tracking-wide">
                  Upcoming Presentations
                </p>
              </div>
              <div className="text-center p-5 bg-linear-to-br from-slate-50 to-gray-100 rounded-xl border-2 border-slate-300 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-slate-600 p-3 rounded-xl w-fit mx-auto mb-3 shadow-md">
                  <AlertCircle className="h-7 w-7 text-white" />
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-1">
                  {data.schedulesAndPanels.scheduleConflictsDetected}
                </p>
                <p className="text-xs text-slate-700 font-semibold uppercase tracking-wide">
                  Schedule Conflicts
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Row - Supervisors and Announcements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Supervisor Availability */}
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader className="border-b bg-linear-to-r from-cyan-50 to-blue-50 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-3">
                  <div className="bg-cyan-500 p-2 rounded-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  Supervisor Availability
                </CardTitle>
                <Badge className="bg-cyan-100 text-cyan-700 border-0 font-semibold">
                  {data.supervisorAvailability.supervisors.length} Faculty
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-hidden rounded-b-xl">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-linear-to-r from-cyan-50 to-blue-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-5 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider border-b-2 border-cyan-200">
                          Supervisor Details
                        </th>
                        <th className="px-4 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider border-b-2 border-cyan-200">
                          Groups
                        </th>
                        <th className="px-4 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider border-b-2 border-cyan-200">
                          Available
                        </th>
                        <th className="px-4 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider border-b-2 border-cyan-200">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.supervisorAvailability.supervisors.map(
                        (supervisor, index) => (
                          <tr
                            key={supervisor.id}
                            className={`hover:bg-cyan-50/50 transition-colors ${
                              index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                            }`}
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="bg-linear-to-br from-cyan-500 to-blue-600 p-2 rounded-lg">
                                  <Briefcase className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-900 text-sm">
                                    {supervisor.name}
                                  </p>
                                  <p className="text-xs text-slate-600 mt-0.5">
                                    {supervisor.department}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <div className="inline-flex items-center justify-center bg-blue-100 text-blue-800 font-bold text-sm px-3 py-1.5 rounded-lg">
                                {supervisor.assignedGroupsCount}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <div className="inline-flex items-center justify-center bg-emerald-100 text-emerald-800 font-bold text-sm px-3 py-1.5 rounded-lg">
                                {supervisor.availableSlots}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center">
                              {supervisor.isAvailable ? (
                                <Badge className="bg-linear-to-r from-green-100 to-emerald-100 text-green-800 border-0 text-xs font-bold px-3 py-1 shadow-sm">
                                  ✓ Available
                                </Badge>
                              ) : (
                                <Badge className="bg-linear-to-r from-red-100 to-rose-100 text-red-800 border-0 text-xs font-bold px-3 py-1 shadow-sm">
                                  ✗ Full
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
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader className="border-b bg-linear-to-r from-orange-50 to-amber-50 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-3">
                  <div className="bg-orange-500 p-2 rounded-lg">
                    <Megaphone className="h-5 w-5 text-white" />
                  </div>
                  Recent Announcements
                </CardTitle>
                <Badge className="bg-orange-100 text-orange-700 border-0 font-semibold">
                  {data.announcements.recent.length} Updates
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {data.announcements.recent.length > 0 ? (
                <div className="max-h-96 overflow-y-auto rounded-b-xl">
                  <div className="divide-y divide-slate-100">
                    {data.announcements.recent.map((announcement, index) => (
                      <div
                        key={announcement.id}
                        className={`p-5 hover:bg-orange-50/50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="bg-linear-to-br from-orange-500 to-amber-600 p-2.5 rounded-lg shrink-0 mt-1">
                            <Megaphone className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <h4 className="font-bold text-slate-900 text-sm line-clamp-1">
                                {announcement.title}
                              </h4>
                              <span className="text-xs text-slate-500 whitespace-nowrap font-medium">
                                {formatDate(announcement.createdAt)}
                              </span>
                            </div>
                            <p className="text-xs text-slate-700 line-clamp-2 mb-2 leading-relaxed">
                              {announcement.content}
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-md font-semibold">
                                By {announcement.createdBy}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 px-6">
                  <div className="bg-linear-to-br from-orange-100 to-amber-100 p-5 rounded-full w-fit mx-auto mb-4">
                    <Megaphone className="h-10 w-10 text-orange-600" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600 mb-1">
                    No announcements yet
                  </p>
                  <p className="text-xs text-slate-500">
                    Check back later for updates
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
