import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PersonalProjectIdeas } from '@/lib/types/supervisor.types';
import { Progress } from '@/components/ui/progress';
import { Lightbulb, CheckCircle, TrendingUp } from 'lucide-react';

interface ProjectIdeasSummaryProps {
  ideas: PersonalProjectIdeas;
}

export default function ProjectIdeasSummary({ ideas }: ProjectIdeasSummaryProps) {
  const selectionRate = ideas.totalIdeasCreated > 0 
    ? (ideas.ideasSelected / ideas.totalIdeasCreated) * 100 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Project Ideas Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg bg-blue-50">
            <div className="text-3xl font-bold text-blue-600">
              {ideas.totalIdeasCreated}
            </div>
            <div className="text-xs text-gray-600 mt-1">Total Ideas</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-green-50">
            <div className="text-3xl font-bold text-green-600">
              {ideas.activeIdeas}
            </div>
            <div className="text-xs text-gray-600 mt-1">Active Ideas</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-purple-50">
            <div className="text-3xl font-bold text-purple-600">
              {ideas.ideasSelected}
            </div>
            <div className="text-xs text-gray-600 mt-1">Selected</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Selection Rate
            </span>
            <span className="font-semibold text-gray-900">
              {selectionRate.toFixed(1)}%
            </span>
          </div>
          <Progress value={selectionRate} className="h-2" />
        </div>

        {ideas.totalIdeasCreated > 0 && (
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-sm text-green-800">
              {ideas.ideasSelected} out of {ideas.totalIdeasCreated} ideas have been selected by students
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
