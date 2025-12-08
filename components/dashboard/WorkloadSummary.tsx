import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DocumentSummary, Evaluations } from '@/lib/types/supervisor.types';
import { FileCheck, GitBranch, ClipboardCheck } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface WorkloadSummaryProps {
  documentSummary: DocumentSummary;
  evaluations: Evaluations;
}

export default function WorkloadSummary({ documentSummary, evaluations }: WorkloadSummaryProps) {
  const reviewProgress = documentSummary.totalDocumentsReceived > 0
    ? ((documentSummary.totalDocumentsReceived - documentSummary.documentsAwaitingReview) / 
       documentSummary.totalDocumentsReceived) * 100
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5" />
          Workload Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Document Review Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">Document Reviews</span>
            </div>
            <span className="text-sm text-gray-600">
              {documentSummary.totalDocumentsReceived - documentSummary.documentsAwaitingReview} / {documentSummary.totalDocumentsReceived}
            </span>
          </div>
          <Progress value={reviewProgress} className="h-2" />
          {documentSummary.documentsAwaitingReview > 0 && (
            <p className="text-xs text-orange-600">
              {documentSummary.documentsAwaitingReview} documents awaiting review
            </p>
          )}
        </div>

        {/* Evaluation Status */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="text-sm font-semibold text-gray-700">Pending Evaluations</h4>
          
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-gray-700">GitHub Evaluations</span>
            </div>
            <span className="text-lg font-bold text-purple-600">
              {evaluations.projectsNeedingGitHubEvaluation}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-red-600" />
              <span className="text-sm text-gray-700">Final Evaluations</span>
            </div>
            <span className="text-lg font-bold text-red-600">
              {evaluations.projectsNeedingFinalEvaluation}
            </span>
          </div>
        </div>

        {/* Summary */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Total Pending Tasks
            </span>
            <span className="text-2xl font-bold text-gray-900">
              {documentSummary.documentsAwaitingReview + 
               evaluations.projectsNeedingGitHubEvaluation + 
               evaluations.projectsNeedingFinalEvaluation}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
