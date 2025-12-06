'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, FileText, Lightbulb, UserCheck, XCircle } from 'lucide-react';

interface StatsCardsProps {
  scheduleTime: string | null;
  proposalStatus: string;
  ideaStatus: string;
  supervisorName: string;
  rejectionReason?: string | null;
}

export default function StatsCards({ 
  scheduleTime, 
  proposalStatus,
  ideaStatus,
  supervisorName,
  rejectionReason 
}: StatsCardsProps) {
  const formatScheduleTime = (time: string | null) => {
    if (!time) return 'Not Scheduled';
    const date = new Date(time);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusDisplay = (status: string) => {
    if (!status) return 'Pending';
    return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
  };

  const isRejected = ideaStatus?.toLowerCase() === 'rejected';

  const stats = [
    {
      title: 'Demo Schedule',
      value: formatScheduleTime(scheduleTime),
      icon: Calendar,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Proposal Status',
      value: getStatusDisplay(proposalStatus),
      icon: FileText,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Idea Status',
      value: getStatusDisplay(ideaStatus),
      icon: isRejected ? XCircle : Lightbulb,
      bgColor: isRejected ? 'bg-red-50' : 'bg-green-50',
      iconColor: isRejected ? 'text-red-600' : 'text-green-600',
    },
    {
      title: 'Assigned Supervisor',
      value: supervisorName || 'Not Assigned',
      icon: UserCheck,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <h3 className="text-md font-bold mt-2">{stat.value}</h3>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {isRejected && rejectionReason && (
        <Card className="border-red-200 shadow-sm bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="bg-red-100 p-2 rounded-lg mt-0.5">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-red-900 mb-1">Project Idea Rejected</h4>
                <p className="text-sm text-red-700">{rejectionReason}</p>
                <p className="text-xs text-red-600 mt-2">Please revise your idea and resubmit for supervisor approval.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}