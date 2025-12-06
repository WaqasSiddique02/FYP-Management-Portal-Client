'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';

interface GroupMembersProps {
  group: {
    groupName: string;
    groupStatus: string;
    groupMembers: Array<{
      name: string;
      email: string;
      rollNo: string;
    }>;
    leader: {
      name: string;
      email: string;
      rollNo: string;
    };
  };
}

export default function GroupMembers({ group }: GroupMembersProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'supervisor-assigned':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Group Members</CardTitle>
          <Badge className={getStatusColor(group.groupStatus)}>
            {group.groupStatus.replace('-', ' ')}
          </Badge>
        </div>
        <p className="text-sm text-gray-600 mt-1">{group.groupName}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {group.groupMembers.map((member, index) => {
            const isLeader = member.email === group.leader.email;
            return (
              <div 
                key={index} 
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 truncate">{member.name}</p>
                    {isLeader && (
                      <Crown className="h-4 w-4 text-amber-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{member.email}</p>
                  <p className="text-xs text-gray-400">{member.rollNo}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}