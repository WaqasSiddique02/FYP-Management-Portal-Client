import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Group } from '@/lib/types/supervisor.types';
import { Users, User, Mail, FolderKanban } from 'lucide-react';

interface AssignedGroupsListProps {
  groups: Group[];
}

export default function AssignedGroupsList({ groups }: AssignedGroupsListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'On Hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Pending':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Assigned Groups
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {groups.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No groups assigned yet</p>
          ) : (
            groups.map((group) => (
              <div
                key={group.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{group.name}</h3>
                      <Badge className={getStatusColor(group.status)}>
                        {group.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <FolderKanban className="h-4 w-4" />
                      <span className="font-medium">{group.projectTitle}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span>Leader: {group.leader.name}</span>
                      <Mail className="h-3 w-3 ml-2" />
                      <span className="text-xs">{group.leader.email}</span>
                    </div>
                  </div>
                  <div className="border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-4">
                    <p className="text-sm font-medium text-gray-600 mb-2">
                      Members ({group.members.length})
                    </p>
                    <div className="space-y-1">
                      {group.members.map((member) => (
                        <div
                          key={member.id}
                          className="text-xs text-gray-600 flex items-center gap-1"
                        >
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                          <span>{member.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
