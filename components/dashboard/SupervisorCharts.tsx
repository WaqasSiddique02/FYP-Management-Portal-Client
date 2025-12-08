import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { PendingWork, PersonalProjectIdeas, DocumentSummary, Evaluations } from '@/lib/types/supervisor.types';
import { BarChart as BarChartIcon, PieChart as PieChartIcon } from 'lucide-react';

interface SupervisorChartsProps {
  pendingWork: PendingWork;
  personalProjectIdeas: PersonalProjectIdeas;
  documentSummary: DocumentSummary;
  evaluations: Evaluations;
}

export default function SupervisorCharts({
  pendingWork,
  personalProjectIdeas,
  documentSummary,
  evaluations,
}: SupervisorChartsProps) {
  // Pending Work Data for Bar Chart
  const pendingWorkData = [
    { name: 'Proposals', count: pendingWork.pendingProposalsCount },
    { name: 'Documents', count: pendingWork.pendingDocumentsCount },
    { name: 'Custom Ideas', count: pendingWork.pendingCustomIdeasCount },
    { name: 'Selected Ideas', count: pendingWork.pendingSelectedIdeasCount },
    { name: 'Evaluations', count: pendingWork.pendingFinalEvaluationsCount },
  ];

  // Document Status for Pie Chart
  const documentStatusData = [
    { name: 'Reviewed', value: documentSummary.totalDocumentsReceived - documentSummary.documentsAwaitingReview },
    { name: 'Pending Review', value: documentSummary.documentsAwaitingReview },
  ];

  // Project Ideas for Pie Chart
  const projectIdeasData = [
    { name: 'Selected', value: personalProjectIdeas.ideasSelected },
    { name: 'Available', value: personalProjectIdeas.activeIdeas - personalProjectIdeas.ideasSelected },
  ];

  const COLORS = {
    primary: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
    pie1: ['#10B981', '#F59E0B'],
    pie2: ['#3B82F6', '#94A3B8'],
  };

  return (
    <div className="space-y-6">
      {/* Top Row: Pending Work and Document Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Work Bar Chart */}
        <Card className="lg:col-span-2 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-blue-50 rounded-lg">
                <BarChartIcon className="h-5 w-5 text-blue-600" />
              </div>
              Pending Work Overview
            </CardTitle>
            <p className="text-sm text-gray-500">Tasks requiring attention</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={pendingWorkData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-15}
                  textAnchor="end"
                  height={70}
                />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Document Review Status Pie Chart */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-green-50 rounded-lg">
                <PieChartIcon className="h-5 w-5 text-green-600" />
              </div>
              Document Status
            </CardTitle>
            <p className="text-sm text-gray-500">Review completion</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={documentStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${percent !== undefined ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {documentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.pie1[index % COLORS.pie1.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 text-center border-t pt-3">
              <p className="text-2xl font-bold text-gray-900">
                {documentSummary.totalDocumentsReceived}
              </p>
              <p className="text-xs text-gray-500">Total Documents</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Evaluations and Project Ideas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evaluation Status - Horizontal Bar Chart */}
        <Card className="lg:col-span-2 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-purple-50 rounded-lg">
                <BarChartIcon className="h-5 w-5 text-purple-600" />
              </div>
              Evaluation Status
            </CardTitle>
            <p className="text-sm text-gray-500">Pending evaluations breakdown</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart 
                data={[
                  { name: 'GitHub Evaluations', count: evaluations.projectsNeedingGitHubEvaluation },
                  { name: 'Final Evaluations', count: evaluations.projectsNeedingFinalEvaluation },
                ]}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={150} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="count" fill="#8B5CF6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Project Ideas Pie Chart */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <PieChartIcon className="h-5 w-5 text-indigo-600" />
              </div>
              Project Ideas
            </CardTitle>
            <p className="text-sm text-gray-500">Selection rate</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={projectIdeasData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percent }) => `${percent !== undefined ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {projectIdeasData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.pie2[index % COLORS.pie2.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  <span className="text-gray-600">Selected</span>
                </div>
                <span className="font-semibold">{personalProjectIdeas.ideasSelected}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  <span className="text-gray-600">Available</span>
                </div>
                <span className="font-semibold">{personalProjectIdeas.activeIdeas - personalProjectIdeas.ideasSelected}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Total Created</span>
                  <span className="text-lg font-bold text-indigo-600">
                    {personalProjectIdeas.totalIdeasCreated}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

