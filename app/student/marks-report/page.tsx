'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useAuthProtection } from '@/lib/hooks/useAuthProtection';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  FileText,
  Github,
  Presentation,
  Code,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
} from 'lucide-react';
import apiClient from '@/lib/api/axios';
import { Button } from '@/components/ui/button';
import CircularProgress from '@/components/ui/circular-progress';

interface MarksData {
  proposalMarks: number;
  implementationMarks: number;
  documentationMarks: number;
  presentationMarks: number;
  githubMarks: number;
  totalMarks: number;
  isEvaluationComplete: boolean;
  finalFeedback: string | null;
  githubFeedback: string | null;
}

interface ProjectData {
  title: string;
  ideaStatus: string;
  supervisorFeedback: string | null;
}

interface GroupData {
  groupName: string;
  groupMembers: Array<{
    name: string;
    email: string;
    rollNo: string;
  }>;
  leader: {
    name: string;
    email: string;
    rollNo: string;
  } | null;
}

interface SupervisorData {
  name: string;
  email: string;
  designation: string;
}

interface DashboardResponse {
  group: GroupData | null;
  supervisor: SupervisorData | null;
  project: ProjectData | null;
  feedback: MarksData;
}

export default function MarksReportPage() {
  useAuthProtection('STUDENT');
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardResponse | null>(null);

  useEffect(() => {
    fetchMarksData();
  }, []);

  const fetchMarksData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/dashboard/student');
      setData(response.data.data.dashboard);
    } catch (error) {
      console.error('Error fetching marks data:', error);
    } finally {
      setLoading(false);
    }
  };

  const marksBreakdown = data?.feedback ? [
    {
      label: 'Proposal',
      marks: data.feedback.proposalMarks || 0,
      maxMarks: 20,
      icon: FileText,
      color: 'bg-blue-500',
      hexColor: '#3b82f6',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      label: 'Implementation',
      marks: data.feedback.implementationMarks || 0,
      maxMarks: 30,
      icon: Code,
      color: 'bg-green-500',
      hexColor: '#22c55e',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
    },
    {
      label: 'Documentation',
      marks: data.feedback.documentationMarks || 0,
      maxMarks: 20,
      icon: FileText,
      color: 'bg-purple-500',
      hexColor: '#a855f7',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
    },
    {
      label: 'Presentation',
      marks: data.feedback.presentationMarks || 0,
      maxMarks: 15,
      icon: Presentation,
      color: 'bg-orange-500',
      hexColor: '#f97316',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
    },
    {
      label: 'GitHub',
      marks: data.feedback.githubMarks || 0,
      maxMarks: 15,
      icon: Github,
      color: 'bg-gray-700',
      hexColor: '#374151',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
    },
  ] : [];

  const totalMaxMarks = 100;
  const totalObtainedMarks = data?.feedback?.totalMarks || 0;
  const percentage = (totalObtainedMarks / totalMaxMarks) * 100;

  const getGrade = (percentage: number) => {
    if (percentage >= 85) return { grade: 'A+', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (percentage >= 80) return { grade: 'A', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (percentage >= 75) return { grade: 'A-', color: 'text-green-500', bgColor: 'bg-green-50' };
    if (percentage >= 70) return { grade: 'B+', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (percentage >= 65) return { grade: 'B', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (percentage >= 60) return { grade: 'B-', color: 'text-blue-500', bgColor: 'bg-blue-50' };
    if (percentage >= 55) return { grade: 'C+', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    if (percentage >= 50) return { grade: 'C', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { grade: 'F', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const gradeInfo = getGrade(percentage);

  const handleDownloadReport = () => {
    window.print();
  };

  if (loading) {
    return (
      <DashboardLayout role="student">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading marks data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!data?.group) {
    return (
      <DashboardLayout role="student">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Group Found</h3>
              <p className="text-gray-600">You need to join or create a group first to view marks.</p>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Marks Report</h1>
            <p className="text-gray-600 mt-1">Comprehensive evaluation and performance analysis</p>
          </div>
          <Button onClick={handleDownloadReport} variant="outline" className="print:hidden">
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>

        {/* Evaluation Status Banner */}
        {data.feedback.isEvaluationComplete ? (
          <Card className="border-green-500 bg-green-50">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 shrink-0" />
                <div>
                  <p className="font-semibold text-green-900">Evaluation Completed</p>
                  <p className="text-sm text-green-700">Your final project evaluation has been completed by your supervisor.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-blue-500 bg-blue-50">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-blue-600 shrink-0" />
                <div>
                  <p className="font-semibold text-blue-900">Evaluation In Progress</p>
                  <p className="text-sm text-blue-700">Your project is currently being evaluated. Marks will be updated as evaluation progresses.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Project & Group Information */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Project Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Project Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 mb-1">Project Title</p>
                <p className="font-semibold text-gray-900">{data.project?.title || 'Not Set'}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-gray-500 mb-1">Supervisor</p>
                <p className="font-semibold text-gray-900">{data.supervisor?.name || 'Not Assigned'}</p>
                {data.supervisor && (
                  <p className="text-xs text-gray-600">{data.supervisor.designation}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Group Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Group Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 mb-1">Group Name</p>
                <p className="font-semibold text-gray-900">{data.group.groupName}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-gray-500 mb-2">Members ({data.group.groupMembers.length})</p>
                <div className="space-y-1">
                  {data.group.groupMembers.map((member, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                      <p className="text-sm text-gray-700">
                        {member.name}
                        {data.group?.leader?.email === member.email && (
                          <Badge variant="outline" className="ml-2 text-xs">Leader</Badge>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overall Performance Card */}
        <Card className="border-2 border-blue-500">
          <CardHeader className="bg-linear-to-r from-blue-50 to-purple-50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Award className="h-6 w-6 text-blue-600" />
                  Overall Performance
                </CardTitle>
                <CardDescription className="mt-1">Total marks obtained out of {totalMaxMarks}</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-3xl sm:text-4xl font-bold text-blue-600">{totalObtainedMarks}</p>
                  <p className="text-sm text-gray-600">out of {totalMaxMarks}</p>
                </div>
                <Separator orientation="vertical" className="h-12 hidden sm:block" />
                <div className={`px-6 py-3 rounded-lg ${gradeInfo.bgColor}`}>
                  <p className="text-xs text-gray-600 mb-1">Grade</p>
                  <p className={`text-3xl font-bold ${gradeInfo.color}`}>{gradeInfo.grade}</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-semibold text-gray-900">{percentage.toFixed(1)}%</span>
              </div>
              <Progress value={percentage} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Marks Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Marks Breakdown
            </CardTitle>
            <CardDescription>Detailed evaluation across different components</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {marksBreakdown.map((item, index) => {
                const Icon = item.icon;
                const itemPercentage = (item.marks / item.maxMarks) * 100;

                return (
                  <Card key={index} className="border-2">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-lg ${item.bgColor}`}>
                          <Icon className={`h-6 w-6 ${item.textColor}`} />
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">{item.marks}</p>
                          <p className="text-xs text-gray-500">/ {item.maxMarks}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="font-semibold text-gray-900">{item.label}</p>
                        <Progress value={itemPercentage} className="h-2" />
                        <p className="text-xs text-gray-600 text-right">{itemPercentage.toFixed(0)}%</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Visual Graph - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Performance Visualization
            </CardTitle>
            <CardDescription>Comparative analysis of marks across components</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Circular Progress Charts */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 mb-8 pb-8 border-b">
              {marksBreakdown.map((item, index) => {
                const itemPercentage = (item.marks / item.maxMarks) * 100;
                const Icon = item.icon;
                
                return (
                  <div key={index} className="flex flex-col items-center gap-3">
                    <CircularProgress
                      percentage={itemPercentage}
                      size={100}
                      strokeWidth={8}
                      color={item.hexColor}
                    />
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Icon className="h-4 w-4 text-gray-600" />
                        <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                      </div>
                      <p className="text-xs text-gray-600">{item.marks} / {item.maxMarks} marks</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bar Chart */}
            <div className="space-y-4">
              {marksBreakdown.map((item, index) => {
                const itemPercentage = (item.marks / item.maxMarks) * 100;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full ${item.color}`}></div>
                        <span className="text-sm font-medium text-gray-700">{item.label}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{item.marks} / {item.maxMarks}</span>
                    </div>
                    <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                      <div
                        className={`h-full ${item.color} transition-all duration-500 flex items-center justify-end pr-3`}
                        style={{ width: `${itemPercentage}%` }}
                      >
                        {itemPercentage > 15 && (
                          <span className="text-xs font-semibold text-white">{itemPercentage.toFixed(0)}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Feedback Section */}
        {(data.feedback.finalFeedback || data.feedback.githubFeedback) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Supervisor Feedback
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.feedback.finalFeedback && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-semibold text-blue-900 mb-2">Final Evaluation Feedback</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.feedback.finalFeedback}</p>
                </div>
              )}
              {data.feedback.githubFeedback && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    GitHub Evaluation Feedback
                  </p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.feedback.githubFeedback}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Print Footer */}
        <div className="hidden print:block text-center text-sm text-gray-500 mt-8 pt-4 border-t">
          <p>Generated on {new Date().toLocaleDateString()} | FYP Management System</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
