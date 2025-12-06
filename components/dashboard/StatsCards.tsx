'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, FileText, CheckCircle, Trophy } from 'lucide-react';

interface StatsCardsProps {
  groupMembersCount: number;
  documentsCount: number;
  proposalStatus: string;
  totalMarks: number;
}

export default function StatsCards({ 
  groupMembersCount, 
  documentsCount, 
  proposalStatus,
  totalMarks 
}: StatsCardsProps) {
  const stats = [
    {
      title: 'Group Members',
      value: groupMembersCount,
      icon: Users,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Documents',
      value: documentsCount,
      icon: FileText,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Proposal Status',
      value: proposalStatus === 'approved' ? 'Approved' : proposalStatus === 'submitted' ? 'Submitted' : 'Pending',
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'Total Marks',
      value: `${totalMarks}/100`,
      icon: Trophy,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-2">{stat.value}</h3>
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
  );
}