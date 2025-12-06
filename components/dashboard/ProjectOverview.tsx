'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Clock, XCircle, User } from 'lucide-react';

interface ProjectOverviewProps {
  project: {
    title: string;
    ideaType: string;
    ideaStatus: string;
    customIdeaDescription: string;
    supervisorFeedback: string | null;
    rejectionReason?: string | null;
  };
  supervisor: {
    name: string;
    email: string;
    designation: string;
  };
}

export default function ProjectOverview({ project, supervisor }: ProjectOverviewProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      approved: 'default',
      pending: 'secondary',
      rejected: 'destructive',
    };
    
    return (
      <Badge variant={variants[status] || 'secondary'} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Project Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">{project.title}</h3>
            {getStatusBadge(project.ideaStatus)}
          </div>
          <p className="text-sm text-gray-600">{project.customIdeaDescription}</p>
        </div>

        <Separator />

        <div>
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Supervisor</span>
          </div>
          <div className="ml-6">
            <p className="font-medium text-gray-900">{supervisor.name}</p>
            <p className="text-sm text-gray-600">{supervisor.designation}</p>
            <p className="text-xs text-gray-500 mt-1">{supervisor.email}</p>
          </div>
        </div>

        {project.ideaStatus?.toLowerCase() === 'rejected' && project.rejectionReason && (
          <>
            <Separator />
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <p className="text-sm font-semibold text-red-900">Rejection Reason</p>
              </div>
              <p className="text-sm text-red-700 ml-7">{project.rejectionReason}</p>
              <p className="text-xs text-red-600 mt-2 ml-7">Action Required: Please address the feedback and resubmit your idea.</p>
            </div>
          </>
        )}

        {project.supervisorFeedback && (
          <>
            <Separator />
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs font-medium text-blue-900 mb-1">Supervisor Feedback</p>
              <p className="text-sm text-blue-700">{project.supervisorFeedback}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}