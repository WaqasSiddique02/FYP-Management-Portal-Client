'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { coordinatorApi } from '@/lib/api/coordinator.api';
import { Project } from '@/lib/types/coordinator.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  GraduationCap, 
  GitBranch, 
  FileText, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  XCircle,
  TrendingUp,
  Award,
  Eye,
  Github,
  AlertCircle,
  RefreshCw,
  FolderOpen
} from 'lucide-react';

export default function ProjectMonitoringPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await coordinatorApi.getAllProjects();
      
      if (!response || !response.data) {
        throw new Error('No data received from server');
      }
      
      // Ensure data is an array
      const projectsData = Array.isArray(response.data) ? response.data : [];
      setProjects(projectsData);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      setError(error?.response?.data?.message || error?.message || 'Failed to load projects. Please try again.');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project);
    setDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const filteredProjects = (projects || []).filter(project => {
    if (!project) return false;
    if (filter === 'all') return true;
    return project?.ideaStatus === filter;
  });

  const stats = {
    total: (projects || []).length,
    approved: (projects || []).filter(p => p?.ideaStatus === 'approved').length,
    pending: (projects || []).filter(p => p?.ideaStatus === 'pending').length,
    rejected: (projects || []).filter(p => p?.ideaStatus === 'rejected').length,
    evaluated: (projects || []).filter(p => p?.isEvaluationComplete).length,
  };

  if (loading) {
    return (
      <DashboardLayout role="coordinator">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="coordinator">
        <div className="flex items-center justify-center min-h-screen">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Projects</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={fetchProjects} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="coordinator">
      <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-indigo-700 border border-indigo-600 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-3 rounded-xl">
            <FolderOpen className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Project Monitoring</h1>
            <p className="text-indigo-100 mt-1">
              Overview and monitoring of all FYP projects in the department
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Active in system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">Ideas approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">Ideas rejected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Evaluated</CardTitle>
            <Award className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.evaluated}</div>
            <p className="text-xs text-muted-foreground">Complete evaluations</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Projects Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">
                    {project?.selectedIdea?.title || project?.customIdeaTitle || 'Untitled Project'}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {project?.group?.name || 'No Group'}
                  </CardDescription>
                </div>
                <Badge className={`${getStatusColor(project?.ideaStatus || '')} text-white ml-2`}>
                  <span className="flex items-center gap-1">
                    {getStatusIcon(project?.ideaStatus || '')}
                    {project?.ideaStatus || 'Unknown'}
                  </span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Group Information */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">
                    {project?.group?.members?.length || 0} Members
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">{project?.supervisor?.fullName || 'No Supervisor'}</span>
                </div>
              </div>

              <Separator />

              {/* Technologies */}
              <div>
                <p className="text-sm font-medium mb-2">Technologies:</p>
                <div className="flex flex-wrap gap-1">
                  {(project?.selectedIdea?.technologies || []).map((tech, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                  {(!project?.selectedIdea?.technologies || project.selectedIdea.technologies.length === 0) && (
                    <span className="text-xs text-gray-500">No technologies specified</span>
                  )}
                </div>
              </div>

              {/* Evaluation Status */}
              {project?.isEvaluationComplete && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">
                        Evaluated
                      </span>
                    </div>
                    <span className="text-lg font-bold text-green-700">
                      {project?.totalMarks || 0}/100
                    </span>
                  </div>
                </div>
              )}

              {/* GitHub Repository */}
              {project?.githubRepositoryUrl && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Github className="w-4 h-4" />
                  <a
                    href={project.githubRepositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline truncate"
                  >
                    Repository
                  </a>
                </div>
              )}

              {/* View Details Button */}
              <Button
                onClick={() => handleViewDetails(project)}
                className="w-full"
                variant="outline"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <Card className="p-12">
          <div className="text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? 'No projects available in the system.' 
                : `No ${filter} projects found.`}
            </p>
          </div>
        </Card>
      )}

      {/* Project Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {selectedProject?.selectedIdea?.title || selectedProject?.customIdeaTitle || 'Project Details'}
                </DialogTitle>
                <DialogDescription>
                  Detailed project information and evaluation
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Status Badge */}
                <div className="flex items-center gap-4">
                  <Badge className={`${getStatusColor(selectedProject?.ideaStatus || '')} text-white`}>
                    {selectedProject?.ideaStatus || 'Unknown'}
                  </Badge>
                  {selectedProject?.isEvaluationComplete && (
                    <Badge className="bg-blue-600 text-white">
                      Evaluation Complete
                    </Badge>
                  )}
                </div>

                {/* Project Description */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">Project Description</h3>
                  <p className="text-gray-700">{selectedProject?.selectedIdea?.description || selectedProject?.customIdeaDescription || 'No description available'}</p>
                </div>

                {/* Technologies */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {(selectedProject?.selectedIdea?.technologies || selectedProject?.customIdeaTechnologies || []).map((tech, index) => (
                      <Badge key={index} variant="secondary">
                        {tech}
                      </Badge>
                    ))}
                    {(!selectedProject?.selectedIdea?.technologies && !selectedProject?.customIdeaTechnologies) && (
                      <span className="text-sm text-gray-500">No technologies specified</span>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Group Details */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Group Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Group Name</p>
                      <p className="text-gray-900">{selectedProject?.group?.name || 'N/A'}</p>
                    </div>
                    {selectedProject?.group?.leader && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-2">Team Leader</p>
                        <div className="bg-white rounded p-3 border">
                          <p className="font-medium">{selectedProject.group.leader.fullName}</p>
                          <p className="text-sm text-gray-600">{selectedProject.group.leader.email}</p>
                          <p className="text-sm text-gray-600">Roll: {selectedProject.group.leader.rollNumber}</p>
                        </div>
                      </div>
                    )}
                    {selectedProject?.group?.members && selectedProject.group.members.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-2">Members</p>
                        <div className="space-y-2">
                          {selectedProject.group.members.map((member) => (
                            <div key={member?.id || Math.random()} className="bg-white rounded p-3 border">
                              <p className="font-medium">{member?.fullName || 'N/A'}</p>
                              <p className="text-sm text-gray-600">{member?.email || 'N/A'}</p>
                              <p className="text-sm text-gray-600">Roll: {member?.rollNumber || 'N/A'}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Supervisor Details */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Supervisor Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
                      <p className="text-gray-900">{selectedProject?.supervisor?.fullName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Designation</p>
                      <p className="text-gray-900">{selectedProject?.supervisor?.designation || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-gray-900">{selectedProject?.supervisor?.email || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Supervisor Feedback */}
                {selectedProject.supervisorFeedback && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Supervisor Feedback</h3>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-gray-700">{selectedProject.supervisorFeedback}</p>
                        {selectedProject.ideaApprovedAt && (
                          <p className="text-sm text-gray-500 mt-2">
                            Approved on {new Date(selectedProject.ideaApprovedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* GitHub Information */}
                {selectedProject?.githubRepositoryUrl && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <Github className="w-5 h-5" />
                        GitHub Repository
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Repository URL</p>
                          <a
                            href={selectedProject.githubRepositoryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline break-all"
                          >
                            {selectedProject.githubRepositoryUrl}
                          </a>
                        </div>
                        {selectedProject?.githubFeedback && (
                          <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">GitHub Feedback</p>
                            <p className="text-gray-700">{selectedProject.githubFeedback}</p>
                          </div>
                        )}
                        {selectedProject?.githubMarks !== undefined && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">GitHub Marks</p>
                            <p className="text-xl font-bold text-blue-600">{selectedProject.githubMarks}</p>
                          </div>
                        )}
                        {selectedProject?.githubEvaluatedAt && (
                          <p className="text-sm text-gray-500">
                            Evaluated on {new Date(selectedProject.githubEvaluatedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Evaluation Details */}
                {selectedProject?.isEvaluationComplete && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        Evaluation Breakdown
                      </h3>
                      <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white rounded p-3 border">
                            <p className="text-sm font-medium text-gray-500">Proposal</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {selectedProject?.proposalMarks || 0}
                            </p>
                          </div>
                          <div className="bg-white rounded p-3 border">
                            <p className="text-sm font-medium text-gray-500">Documentation</p>
                            <p className="text-2xl font-bold text-purple-600">
                              {selectedProject?.documentationMarks || 0}
                            </p>
                          </div>
                          <div className="bg-white rounded p-3 border">
                            <p className="text-sm font-medium text-gray-500">Implementation</p>
                            <p className="text-2xl font-bold text-green-600">
                              {selectedProject?.implementationMarks || 0}
                            </p>
                          </div>
                          <div className="bg-white rounded p-3 border">
                            <p className="text-sm font-medium text-gray-500">Presentation</p>
                            <p className="text-2xl font-bold text-orange-600">
                              {selectedProject?.presentationMarks || 0}
                            </p>
                          </div>
                          <div className="bg-white rounded p-3 border">
                            <p className="text-sm font-medium text-gray-500">Final GitHub</p>
                            <p className="text-2xl font-bold text-indigo-600">
                              {selectedProject?.finalGithubMarks || 0}
                            </p>
                          </div>
                          <div className="bg-green-600 text-white rounded p-3 border border-green-600">
                            <p className="text-sm font-medium">Total Marks</p>
                            <p className="text-3xl font-bold">
                              {selectedProject?.totalMarks || 0}/100
                            </p>
                          </div>
                        </div>

                        {selectedProject?.finalFeedback && (
                          <div className="bg-white rounded-lg p-4 border border-gray-200 mt-4">
                            <p className="text-sm font-medium text-gray-500 mb-2">Final Feedback</p>
                            <p className="text-gray-700">{selectedProject.finalFeedback}</p>
                          </div>
                        )}

                        {selectedProject?.evaluationCompletedAt && (
                          <p className="text-sm text-gray-600 text-center mt-2">
                            Evaluation completed on{' '}
                            {new Date(selectedProject.evaluationCompletedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <Separator />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </DashboardLayout>
  );
}
