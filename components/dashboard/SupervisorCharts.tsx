import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { PendingWork, PersonalProjectIdeas, DocumentSummary, Evaluations } from '@/lib/types/supervisor.types';

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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Pending Work Bar Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Pending Work Overview</CardTitle>
          <p className="text-sm text-gray-500">Breakdown of pending tasks</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pendingWorkData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px'
                }}
              />
              <Bar dataKey="count" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Document Review Status Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Document Review Status</CardTitle>
          <p className="text-sm text-gray-500">Review completion rate</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
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
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Project Ideas Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Project Ideas Status</CardTitle>
          <p className="text-sm text-gray-500">Ideas selection rate</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={projectIdeasData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${percent !== undefined ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={80}
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
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {personalProjectIdeas.totalIdeasCreated}
            </p>
            <p className="text-xs text-gray-500">Total Ideas Created</p>
          </div>
        </CardContent>
      </Card>

      {/* Evaluation Status */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Evaluation Status</CardTitle>
          <p className="text-sm text-gray-500">Pending evaluations breakdown</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center p-6 bg-purple-50 rounded-xl border-2 border-purple-200">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {evaluations.projectsNeedingGitHubEvaluation}
              </div>
              <p className="text-sm font-medium text-gray-700">GitHub Evaluations</p>
              <p className="text-xs text-gray-500 mt-1">Projects pending review</p>
            </div>
            <div className="text-center p-6 bg-red-50 rounded-xl border-2 border-red-200">
              <div className="text-4xl font-bold text-red-600 mb-2">
                {evaluations.projectsNeedingFinalEvaluation}
              </div>
              <p className="text-sm font-medium text-gray-700">Final Evaluations</p>
              <p className="text-xs text-gray-500 mt-1">Projects awaiting final review</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
