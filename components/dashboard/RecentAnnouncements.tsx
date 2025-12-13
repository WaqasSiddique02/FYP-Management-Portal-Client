'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StudentAnnouncement } from '@/lib/types/auth.types';
import { Megaphone, Calendar, User, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RecentAnnouncementsProps {
  announcements: StudentAnnouncement[];
}

export default function RecentAnnouncements({ announcements }: RecentAnnouncementsProps) {
  const router = useRouter();

  const getAudienceBadge = (audience: string) => {
    const colors = {
      students: 'bg-blue-100 text-blue-700 border-blue-200',
      supervisors: 'bg-green-100 text-green-700 border-green-200',
      general: 'bg-purple-100 text-purple-700 border-purple-200',
    };
    return colors[audience as keyof typeof colors] || colors.general;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  return (
    <Card className="shadow-lg border-blue-100">
      <CardHeader className="bg-linear-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">
              Latest Announcements
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/student/announcements')}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {announcements.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Megaphone className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No announcements yet</p>
            <p className="text-gray-400 text-sm mt-1">Check back later for updates</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {announcements.slice(0, 5).map((announcement, index) => (
              <div
                key={announcement._id}
                className="p-4 hover:bg-blue-50/50 transition-colors cursor-pointer group"
                onClick={() => router.push('/student/announcements')}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className={`${getAudienceBadge(announcement.targetAudience)} text-xs font-medium`}
                      >
                        {announcement.targetAudience.charAt(0).toUpperCase() + announcement.targetAudience.slice(1)}
                      </Badge>
                      {index === 0 && (
                        <Badge className="bg-red-500 text-white text-xs">New</Badge>
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {announcement.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {announcement.content}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{announcement.createdBy?.fullName || 'Coordinator'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(announcement.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
