'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen,
  Lightbulb,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  FileText,
  User,
} from 'lucide-react';
import { useAuthProtection } from '@/lib/hooks/useAuthProtection';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { projectAPI } from '@/lib/api/project.api';

interface Supervisor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  designation: string;
}

interface ProjectIdea {
  _id: string;
  title: string;
  description: string;
  technologies: string[];
  supervisor: Supervisor;
  department: string;
  isAvailable: boolean;
}

interface Project {
  _id: string;
  selectedIdea?: ProjectIdea;
  customIdeaTitle?: string;
  customIdeaDescription?: string;
  ideaStatus: 'pending' | 'approved' | 'rejected';
  supervisorFeedback?: string;
  rejectionReason?: string;
  supervisor?: Supervisor;
  ideaApprovedAt?: string;
  group?: {
    _id: string;
    name: string;
    department: string;
  };
}

export default function SelectProjectPage() {
  const { isChecking: authLoading } = useAuthProtection('STUDENT');
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ideas, setIdeas] = useState<ProjectIdea[]>([]);
  const [myProject, setMyProject] = useState<Project | null>(null);
  const [supervisor, setSupervisor] = useState<Supervisor | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Custom idea form
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [showCustomDialog, setShowCustomDialog] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch both supervisor ideas and existing project
      const [ideasResponse, projectResponse] = await Promise.all([
        projectAPI.getSupervisorIdeas().catch(() => ({ data: { ideas: [], supervisor: null } })),
        projectAPI.getMyProject().catch(() => ({ data: null })),
      ]);

      // Handle nested response structure (data.data or data)
      const ideasData = ideasResponse.data?.data || ideasResponse.data || ideasResponse;
      const projectData = projectResponse.data?.data || projectResponse.data || projectResponse;

      console.log('Project Data:', projectData); // Debug log

      setIdeas(ideasData.ideas || []);
      setSupervisor(ideasData.supervisor || projectData?.supervisor || null);
      
      // Only set project if it has valid data:
      // - Must have _id (exists in DB)
      // - Must have either selectedIdea OR customIdeaTitle (actual project selection made)
      if (projectData && projectData._id && (projectData.selectedIdea || projectData.customIdeaTitle)) {
        setMyProject(projectData);
      } else {
        setMyProject(null);
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectIdea = async (ideaId: string) => {
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      await projectAPI.selectIdea(ideaId);
      setSuccess('Project idea selected successfully! Waiting for supervisor approval.');
      
      // Refresh data
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to select project idea');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitCustomIdea = async () => {
    if (!customTitle.trim() || !customDescription.trim()) {
      setError('Please provide both title and description for your custom idea');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      await projectAPI.requestCustomIdea(customTitle, customDescription);
      setSuccess('Custom project idea submitted successfully! Waiting for supervisor approval.');
      
      setShowCustomDialog(false);
      setCustomTitle('');
      setCustomDescription('');
      
      // Refresh data
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit custom idea');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600 text-white"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-600 text-white"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-600 text-white"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout role="student">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Select Project</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Choose a project idea from your supervisor or propose your own
            </p>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-4">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {success && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="py-4">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5 shrink-0" />
                <p className="text-sm">{success}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Project Status - Show when project exists */}
        {myProject && myProject.ideaStatus === 'approved' && (
          <div className="space-y-6">
            {/* Success Banner */}
            <div className="relative overflow-hidden bg-white border-l-4 border-green-600 rounded-lg shadow-md">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center ring-4 ring-green-50">
                      <CheckCircle className="h-8 w-8 text-green-600" strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                          Project Approved
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                          Congratulations! Your project has been approved by your supervisor. You may now proceed with development.
                        </p>
                      </div>
                      <div className="shrink-0">
                        {getStatusBadge(myProject.ideaStatus)}
                      </div>
                    </div>
                    {myProject.ideaApprovedAt && (
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-xs sm:text-sm text-gray-500 font-medium">
                          Approved on {new Date(myProject.ideaApprovedAt).toLocaleDateString('en-US', { 
                            weekday: 'long',
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Project Details - Takes 2 columns */}
              <div className="lg:col-span-2 space-y-6">
                {/* Project Information */}
                <Card className="border-gray-200 shadow-md overflow-hidden">
                  <div className="bg-white border-b border-gray-100 px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Project Details</h3>
                    </div>
                  </div>
                  <CardContent className="p-6 space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs uppercase tracking-wider font-semibold text-gray-500">
                          Project Title
                        </Label>
                        {myProject.customIdeaTitle && (
                          <Badge variant="outline" className="text-xs border-purple-200 text-purple-700 bg-purple-50">
                            Custom Proposal
                          </Badge>
                        )}
                      </div>
                      <h4 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                        {myProject.selectedIdea?.title || myProject.customIdeaTitle || 'N/A'}
                      </h4>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider font-semibold text-gray-500">
                        Description
                      </Label>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {myProject.selectedIdea?.description || myProject.customIdeaDescription || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Technologies */}
                    {myProject.selectedIdea?.technologies && myProject.selectedIdea.technologies.length > 0 && (
                      <div className="space-y-3">
                        <Label className="text-xs uppercase tracking-wider font-semibold text-gray-500">
                          Technology Stack
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {myProject.selectedIdea.technologies.map((tech, index) => (
                            <Badge 
                              key={index} 
                              className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 border-0"
                            >
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Supervisor Feedback */}
                {myProject.supervisorFeedback && (
                  <Card className="border-green-200 shadow-md overflow-hidden bg-linear-to-br from-green-50 to-white">
                    <div className="bg-green-100 border-b border-green-200 px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-green-200 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-green-700" />
                        </div>
                        <h3 className="text-lg font-bold text-green-900">Supervisor Feedback</h3>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="relative">
                        <div className="absolute -left-2 top-0 bottom-0 w-1 bg-green-400 rounded-full"></div>
                        <p className="text-sm sm:text-base text-gray-700 leading-relaxed pl-4 italic">
                          "{myProject.supervisorFeedback}"
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar - Supervisor Info */}
              <div className="lg:col-span-1">
                {myProject.supervisor && (
                  <Card className="border-gray-200 shadow-md overflow-hidden sticky top-6">
                    <div className="bg-gray-900 text-white px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="text-lg font-bold">Supervisor</h3>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="space-y-5">
                        {/* Avatar/Initial */}
                        <div className="flex justify-center">
                          <div className="h-20 w-20 rounded-full bg-gray-900 flex items-center justify-center ring-4 ring-gray-100">
                            <span className="text-2xl font-bold text-white">
                              {myProject.supervisor.firstName.charAt(0)}{myProject.supervisor.lastName.charAt(0)}
                            </span>
                          </div>
                        </div>

                        {/* Name */}
                        <div className="text-center space-y-1">
                          <h4 className="text-lg sm:text-xl font-bold text-gray-900">
                            {myProject.supervisor.firstName} {myProject.supervisor.lastName}
                          </h4>
                          <p className="text-sm text-gray-600 font-medium">
                            {myProject.supervisor.designation}
                          </p>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-200"></div>

                        {/* Contact Info */}
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="shrink-0 mt-0.5">
                              <div className="h-7 w-7 rounded bg-gray-100 flex items-center justify-center">
                                <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <Label className="text-xs uppercase tracking-wider font-semibold text-gray-500 block mb-1">
                                Email
                              </Label>
                              <a 
                                href={`mailto:${myProject.supervisor.email}`}
                                className="text-sm text-blue-600 hover:text-blue-700 hover:underline break-all font-medium"
                              >
                                {myProject.supervisor.email}
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Other States (Pending/Rejected) */}
        {myProject && myProject.ideaStatus !== 'approved' && (
          <Card className={`shadow-lg ${
            myProject.ideaStatus === 'rejected' ? 'border-red-500' : 'border-blue-200'
          }`}>
            <CardHeader className={`border-b ${
              myProject.ideaStatus === 'rejected' ? 'bg-red-50' : 'bg-blue-50'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {myProject.ideaStatus === 'rejected' ? 'Rejected Project' : 'Pending Project'}
                </CardTitle>
                {getStatusBadge(myProject.ideaStatus)}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Project Title */}
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Project Title</Label>
                  <p className="text-base sm:text-lg font-bold text-gray-900 mt-1">
                    {myProject.selectedIdea?.title || myProject.customIdeaTitle || 'N/A'}
                  </p>
                  {myProject.customIdeaTitle && (
                    <Badge variant="outline" className="mt-2 text-xs">Custom Idea</Badge>
                  )}
                </div>

                {/* Project Description */}
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Description</Label>
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                    {myProject.selectedIdea?.description || myProject.customIdeaDescription || 'N/A'}
                  </p>
                </div>

                {/* Technologies */}
                {myProject.selectedIdea?.technologies && myProject.selectedIdea.technologies.length > 0 && (
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">Technologies</Label>
                    <div className="flex flex-wrap gap-2">
                      {myProject.selectedIdea.technologies.map((tech, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Supervisor Info */}
                {myProject.supervisor && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">Supervisor Information</Label>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-900 font-medium">
                        {myProject.supervisor.firstName} {myProject.supervisor.lastName}
                      </p>
                      <p className="text-xs text-gray-600">{myProject.supervisor.designation}</p>
                      <p className="text-xs text-gray-600">{myProject.supervisor.email}</p>
                    </div>
                  </div>
                )}

                {/* Group Info */}
                {myProject.group && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">Group Information</Label>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-900 font-medium">{myProject.group.name}</p>
                      <p className="text-xs text-gray-600">Department: {myProject.group.department}</p>
                    </div>
                  </div>
                )}

                {/* Rejected State */}
                {myProject.ideaStatus === 'rejected' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <Label className="text-sm font-semibold text-red-900 mb-1 block">
                          Project Rejected
                        </Label>
                        <p className="text-sm text-red-700 mb-2">
                          Your project idea was not approved. Please select a different idea or submit a new custom proposal.
                        </p>
                        {myProject.rejectionReason && (
                          <div className="mt-3 pt-3 border-t border-red-200">
                            <Label className="text-xs font-semibold text-red-900 mb-1 block">
                              Rejection Reason
                            </Label>
                            <p className="text-sm text-red-700">{myProject.rejectionReason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Pending State */}
                {myProject.ideaStatus === 'pending' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <Label className="text-sm font-semibold text-yellow-900 mb-1 block">
                          Awaiting Approval
                        </Label>
                        <p className="text-sm text-yellow-800">
                          Your project idea is pending approval from your supervisor. You will be notified once they review it.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Supervisor Assigned - Only show if no project and no supervisor */}
        {!supervisor && !myProject && (
          <Card className="border-dashed border-2">
            <CardContent className="py-12 text-center">
              <User className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Supervisor Assigned</h3>
              <p className="text-sm text-gray-600">
                You need to have a supervisor assigned to your group before you can select a project.
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Please contact your coordinator or wait for assignment.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Project Selection - Only show if:
            1. Supervisor exists (from project data or ideas data)
            2. No project exists OR project is rejected
        */}
        {(supervisor || myProject?.supervisor) && (!myProject || myProject.ideaStatus === 'rejected') && (
          <Tabs defaultValue="supervisor-ideas" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="supervisor-ideas" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Supervisor Ideas</span>
                <span className="sm:hidden">Ideas</span>
              </TabsTrigger>
              <TabsTrigger value="custom-idea" className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                <span className="hidden sm:inline">Custom Idea</span>
                <span className="sm:hidden">Custom</span>
              </TabsTrigger>
            </TabsList>

            {/* Supervisor Ideas Tab */}
            <TabsContent value="supervisor-ideas" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Available Project Ideas</CardTitle>
                  <CardDescription>
                    Select a project idea proposed by {supervisor?.firstName || myProject?.supervisor?.firstName} {supervisor?.lastName || myProject?.supervisor?.lastName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {ideas.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-600">No project ideas available from your supervisor yet.</p>
                      <p className="text-sm text-gray-500 mt-2">You can submit a custom idea instead.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {ideas.map((idea) => (
                        <Card key={idea._id} className="border-2 hover:border-blue-300 transition-all">
                          <CardHeader>
                            <CardTitle className="text-base sm:text-lg">{idea.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <p className="text-xs sm:text-sm text-gray-700 line-clamp-3">
                              {idea.description}
                            </p>
                            
                            {idea.technologies && idea.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {idea.technologies.map((tech, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tech}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            <Button
                              onClick={() => handleSelectIdea(idea._id)}
                              disabled={submitting}
                              className="w-full text-sm"
                              size="sm"
                            >
                              {submitting ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Selecting...
                                </>
                              ) : (
                                <>
                                  Select This Idea
                                  <ChevronRight className="ml-2 h-4 w-4" />
                                </>
                              )}
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Custom Idea Tab */}
            <TabsContent value="custom-idea" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Propose Your Own Idea</CardTitle>
                  <CardDescription>
                    Submit a custom project idea for your supervisor's approval
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="custom-title">Project Title *</Label>
                    <Input
                      id="custom-title"
                      placeholder="Enter project title"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="text-sm sm:text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custom-description">Project Description *</Label>
                    <Textarea
                      id="custom-description"
                      placeholder="Describe your project idea, objectives, and expected outcomes..."
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      rows={8}
                      className="text-sm sm:text-base resize-none"
                    />
                    <p className="text-xs text-gray-500">
                      Provide a detailed description to help your supervisor understand your idea
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      Important Notes
                    </h4>
                    <ul className="text-xs sm:text-sm text-blue-700 space-y-1 ml-6 list-disc">
                      <li>Your custom idea will be sent to your supervisor for review</li>
                      <li>Supervisor may approve, reject, or request modifications</li>
                      <li>Make sure your idea is relevant to your field of study</li>
                    </ul>
                  </div>

                  <Button
                    onClick={handleSubmitCustomIdea}
                    disabled={submitting || !customTitle.trim() || !customDescription.trim()}
                    className="w-full"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Custom Idea
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}
