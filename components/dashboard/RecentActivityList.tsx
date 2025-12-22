import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from '@/lib/types/supervisor.types';
import { FileText, Upload, CheckCircle, Lightbulb, Users, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RecentActivityListProps {
  activities: Activity[];
  maxItems?: number;
}

export default function RecentActivityList({ activities, maxItems = 5 }: RecentActivityListProps) {
  // Limit activities to maxItems
  const limitedActivities = activities.slice(0, maxItems);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'document_upload':
        return Upload;
      case 'proposal_submission':
        return FileText;
      case 'evaluation':
        return CheckCircle;
      case 'idea_submission':
        return Lightbulb;
      case 'group_formation':
        return Users;
      default:
        return FileText;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'document_upload':
        return 'bg-blue-100 text-blue-600';
      case 'proposal_submission':
        return 'bg-green-100 text-green-600';
      case 'evaluation':
        return 'bg-purple-100 text-purple-600';
      case 'idea_submission':
        return 'bg-yellow-100 text-yellow-600';
      case 'group_formation':
        return 'bg-indigo-100 text-indigo-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatActivityType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {limitedActivities.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent activity</p>
          ) : (
            limitedActivities.map((activity, index) => {
              const Icon = getActivityIcon(activity.type);
              const colorClass = getActivityColor(activity.type);

              return (
                <div
                  key={index}
                  className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${colorClass} h-fit`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-500 uppercase">
                        {formatActivityType(activity.type)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {activity.groupName}
                    </p>
                    {activity.studentName && (
                      <p className="text-xs text-gray-600 mb-1">
                        by {activity.studentName}
                      </p>
                    )}
                    <p className="text-xs text-gray-600 mb-2">
                      {activity.details}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(activity.timestamp), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
