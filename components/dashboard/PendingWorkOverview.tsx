import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PendingWork } from '@/lib/types/supervisor.types';
import { FileText, File, Lightbulb, GitBranch, CheckSquare } from 'lucide-react';

interface PendingWorkOverviewProps {
  pendingWork: PendingWork;
}

export default function PendingWorkOverview({ pendingWork }: PendingWorkOverviewProps) {
  const pendingItems = [
    {
      label: 'Pending Proposals',
      value: pendingWork.pendingProposalsCount,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Pending Documents',
      value: pendingWork.pendingDocumentsCount,
      icon: File,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Custom Ideas',
      value: pendingWork.pendingCustomIdeasCount,
      icon: Lightbulb,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      label: 'Selected Ideas',
      value: pendingWork.pendingSelectedIdeasCount,
      icon: GitBranch,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Final Evaluations',
      value: pendingWork.pendingFinalEvaluationsCount,
      icon: CheckSquare,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  const totalPending = Object.values(pendingWork).reduce((sum, val) => sum + val, 0);

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Pending Work</span>
          <span className="text-2xl font-bold text-orange-600">{totalPending}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pendingItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${item.bgColor}`}>
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {item.label}
                </span>
              </div>
              <span className={`text-lg font-bold ${item.color}`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
