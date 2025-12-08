import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, AlertCircle, FileCheck } from 'lucide-react';

interface SupervisorStatsCardsProps {
  assignedGroupsCount: number;
  totalDocumentsReceived: number;
  documentsAwaitingReview: number;
  pendingProposalsCount: number;
  pendingDocumentsCount: number;
  pendingFinalEvaluationsCount: number;
  totalIdeasCreated: number;
  ideasSelected: number;
}

export default function SupervisorStatsCards({
  assignedGroupsCount,
  totalDocumentsReceived,
  documentsAwaitingReview,
  pendingProposalsCount,
  pendingDocumentsCount,
  pendingFinalEvaluationsCount,
  totalIdeasCreated,
  ideasSelected,
}: SupervisorStatsCardsProps) {
  const totalPending = documentsAwaitingReview + pendingProposalsCount + pendingDocumentsCount + pendingFinalEvaluationsCount;
  
  const stats = [
    {
      title: 'Assigned Groups',
      value: assignedGroupsCount,
      subtitle: 'Active supervision',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      title: 'Pending Work',
      value: totalPending,
      subtitle: 'Reviews & Evaluations',
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
    {
      title: 'Documents Reviewed',
      value: totalDocumentsReceived - documentsAwaitingReview,
      subtitle: `${totalDocumentsReceived} total received`,
      icon: FileCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className={`hover:shadow-lg transition-all border-l-4 ${stat.borderColor}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="flex-1">
              <CardTitle className="text-sm font-medium text-gray-600 mb-1">
                {stat.title}
              </CardTitle>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <p className="text-xs text-gray-500">{stat.subtitle}</p>
            </div>
            <div className={`p-3 rounded-xl ${stat.bgColor}`}>
              <stat.icon className={`h-7 w-7 ${stat.color}`} />
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
