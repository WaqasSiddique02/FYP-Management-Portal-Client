'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { supervisorApi } from '@/lib/api/supervisor.api';
import { useAuthContext } from '@/lib/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ClipboardCheck,
  Users,
  FileText,
  Download,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Loader2,
  Calendar,
  Award,
  ChevronRight,
  Save,
  Github,
  BookOpen,
} from 'lucide-react';

interface GroupProject {
  _id: string;
  group: {
    _id: string;
    name: string;
    leader: {
      _id: string;
      fullName: string;
    };
    members: Array<{
      _id: string;
      fullName: string;
      rollNumber: string;
    }>;
  };
  selectedIdea?: {
    title: string;
    description: string;
  };
  customIdea?: {
    title: string;
    description: string;
  };
  githubRepositoryUrl?: string;
  githubMarks?: number;
  githubFeedback?: string;
  proposalMarks?: number;
  implementationMarks?: number;
  documentationMarks?: number;
  presentationMarks?: number;
  finalGithubMarks?: number;
  totalMarks?: number;
  finalFeedback?: string;
  isEvaluationComplete?: boolean;
}

interface Document {
  createdAt: any;
  _id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  status: 'pending' | 'approved' | 'rejected';
  supervisorFeedback?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export default function EvaluationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthContext();
  
  // Projects List
  const [projects, setProjects] = useState<GroupProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<GroupProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Documents
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  
  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [documentAction, setDocumentAction] = useState<'approve' | 'reject' | 'feedback'>('approve');
  const [documentComment, setDocumentComment] = useState('');
  const [submittingDocument, setSubmittingDocument] = useState(false);
  
  // Marks
  const [marks, setMarks] = useState({
    proposalMarks: 0,
    implementationMarks: 0,
    documentationMarks: 0,
    presentationMarks: 0,
    githubMarks: 0,
    totalMarks: 0,
  });
  const [finalFeedback, setFinalFeedback] = useState('');
  const [savingMarks, setSavingMarks] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/supervisor/login');
      return;
    }

    if (user && user.role.toLowerCase() !== 'supervisor') {
      router.push(`/${user.role.toLowerCase()}/dashboard`);
      return;
    }

    if (user) {
      fetchProjects();
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (selectedProject) {
      setMarks({
        proposalMarks: selectedProject.proposalMarks || 0,
        implementationMarks: selectedProject.implementationMarks || 0,
        documentationMarks: selectedProject.documentationMarks || 0,
        presentationMarks: selectedProject.presentationMarks || 0,
        githubMarks: selectedProject.finalGithubMarks || selectedProject.githubMarks || 0,
        totalMarks: selectedProject.totalMarks || 0,
      });
      setFinalFeedback(selectedProject.finalFeedback || '');
      fetchDocuments(selectedProject._id);
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await supervisorApi.getFinalEvaluations();
      setProjects(data);
      if (data.length > 0) {
        setSelectedProject(data[0]);
      }
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.response?.data?.message || 'Failed to load projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async (projectId: string) => {
    try {
      setLoadingDocuments(true);
      const data = await supervisorApi.getDocuments();
      // Filter documents for the selected project
      const projectDocs = data.filter((doc: any) => doc.project?._id === projectId);
      setDocuments(projectDocs);
    } catch (err: any) {
      console.error('Error fetching documents:', err);
      setDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleDownloadDocument = async (document: Document) => {
    try {
      await supervisorApi.downloadDocument(document._id);
      // The download will be triggered by the browser
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to download document');
    }
  };

  const handleDocumentAction = (document: Document, action: 'approve' | 'reject' | 'feedback') => {
    setSelectedDocument(document);
    setDocumentAction(action);
    setDocumentComment('');
    setDocumentDialogOpen(true);
  };

  const handleSubmitDocumentAction = async () => {
    if (!selectedDocument) return;

    try {
      setSubmittingDocument(true);
      
      if (documentAction === 'approve') {
        await supervisorApi.approveDocument(selectedDocument._id, { comments: documentComment || undefined });
        alert('Document approved successfully');
      } else if (documentAction === 'reject') {
        if (!documentComment.trim()) {
          alert('Reason is required to reject a document');
          return;
        }
        await supervisorApi.rejectDocument(selectedDocument._id, { reason: documentComment });
        alert('Document rejected');
      } else if (documentAction === 'feedback') {
        if (!documentComment.trim()) {
          alert('Feedback cannot be empty');
          return;
        }
        await supervisorApi.addDocumentFeedback(selectedDocument._id, { feedback: documentComment });
        alert('Feedback added successfully');
      }

      setDocumentDialogOpen(false);
      setDocumentComment('');
      if (selectedProject) {
        fetchDocuments(selectedProject._id);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to submit action');
    } finally {
      setSubmittingDocument(false);
    }
  };

  const calculateTotal = () => {
    const total = 
      (Number(marks.proposalMarks) || 0) +
      (Number(marks.implementationMarks) || 0) +
      (Number(marks.documentationMarks) || 0) +
      (Number(marks.presentationMarks) || 0) +
      (Number(marks.githubMarks) || 0);
    setMarks({ ...marks, totalMarks: total });
  };

  const handleSaveMarks = async () => {
    if (!selectedProject) return;

    try {
      setSavingMarks(true);
      await supervisorApi.addFinalMarks(selectedProject._id, marks);
      alert('Marks saved successfully');
      fetchProjects();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save marks');
    } finally {
      setSavingMarks(false);
    }
  };

  const handleSaveFeedback = async () => {
    if (!selectedProject || !finalFeedback.trim()) {
      alert('Feedback cannot be empty');
      return;
    }

    try {
      setSavingMarks(true);
      await supervisorApi.addFinalFeedback(selectedProject._id, { feedback: finalFeedback });
      alert('Feedback saved successfully');
      fetchProjects();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save feedback');
    } finally {
      setSavingMarks(false);
    }
  };

  const handleCompleteEvaluation = async () => {
    if (!selectedProject) return;

    if (!confirm('Are you sure you want to mark this evaluation as complete? This action cannot be undone.')) {
      return;
    }

    try {
      setSavingMarks(true);
      await supervisorApi.completeEvaluation(selectedProject._id);
      alert('Evaluation marked as complete');
      fetchProjects();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to complete evaluation');
    } finally {
      setSavingMarks(false);
    }
  };

  const getProjectTitle = (project: GroupProject) => {
    return project.selectedIdea?.title || project.customIdea?.title || 'No Title';
  };

  const filteredProjects = projects.filter((project) => {
    const searchLower = searchQuery.toLowerCase();
    const groupName = project.group.name.toLowerCase();
    const projectTitle = getProjectTitle(project).toLowerCase();
    const leaderName = project.group.leader.fullName.toLowerCase();
    
    return (
      groupName.includes(searchLower) ||
      projectTitle.includes(searchLower) ||
      leaderName.includes(searchLower)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout role="supervisor">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-slate-600">Loading evaluations...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="supervisor">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <p className="text-slate-900 font-semibold mb-2">Error Loading Evaluations</p>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button onClick={fetchProjects} className="bg-green-600 hover:bg-green-700 text-white">
              Try Again
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="supervisor">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-green-600 rounded-2xl p-6 md:p-8 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Evaluations</h1>
              <p className="text-green-100 text-sm md:text-base">
                Evaluate projects, review documents, and assign final marks
              </p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white/20 backdrop-blur-sm px-6 py-4 rounded-xl border border-white/30">
                <p className="text-3xl font-bold">{projects.length}</p>
                <p className="text-xs text-green-100 mt-1">Total Projects</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-6 py-4 rounded-xl border border-white/30">
                <p className="text-3xl font-bold">
                  {projects.filter((p) => p.isEvaluationComplete).length}
                </p>
                <p className="text-xs text-green-100 mt-1">Completed</p>
              </div>
            </div>
          </div>
        </div>

        {projects.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ClipboardCheck className="h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Projects for Evaluation</h3>
              <p className="text-slate-500 text-center max-w-sm">
                No projects have been assigned for evaluation yet
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Groups List */}
            <div className="lg:col-span-1">
              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold">Groups</CardTitle>
                  <div className="mt-3">
                    <Input
                      type="text"
                      placeholder="Search groups..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1 max-h-[600px] overflow-y-auto">
                    {filteredProjects.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <p className="text-sm text-slate-500">No groups found</p>
                      </div>
                    ) : (
                      filteredProjects.map((project) => (
                      <button
                        key={project._id}
                        onClick={() => setSelectedProject(project)}
                        className={`w-full text-left px-4 py-3 border-l-4 transition-all ${
                          selectedProject?._id === project._id
                            ? 'bg-green-50 border-green-600'
                            : 'border-transparent hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-slate-900 truncate">
                              {project.group.name}
                            </p>
                            <p className="text-xs text-slate-600 truncate mt-0.5">
                              {getProjectTitle(project)}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <Users className="h-3 w-3 text-slate-400" />
                              <span className="text-xs text-slate-500">
                                {project.group.members.length} members
                              </span>
                            </div>
                          </div>
                          {project.isEvaluationComplete && (
                            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                          )}
                        </div>
                      </button>
                    )))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Evaluation Details */}
            {selectedProject && (
              <div className="lg:col-span-3 space-y-6">
                {/* Project Info Card */}
                <Card className="border-slate-200">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold text-slate-900 mb-2">
                            {getProjectTitle(selectedProject)}
                          </h2>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Users className="h-4 w-4" />
                            <span className="font-medium">{selectedProject.group.name}</span>
                          </div>
                        </div>
                        {selectedProject.isEvaluationComplete && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Evaluation Complete
                          </Badge>
                        )}
                      </div>

                      {/* Group Members */}
                      <div className="bg-slate-50 rounded-lg p-4">
                        <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Team Members ({selectedProject.group.members.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {selectedProject.group.members.map((member) => (
                            <div key={member._id} className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 rounded-full bg-green-600"></div>
                              <span className="text-slate-700">{member.fullName}</span>
                              <span className="text-slate-500">({member.rollNumber})</span>
                              {selectedProject.group.leader._id === member._id && (
                                <Badge variant="outline" className="text-xs ml-auto">Leader</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tabs for Documents and Marks */}
                <Tabs defaultValue="documents" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="documents" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                      <FileText className="h-4 w-4 mr-2" />
                      Documents
                    </TabsTrigger>
                    <TabsTrigger value="marks" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                      <Award className="h-4 w-4 mr-2" />
                      Marks & Evaluation
                    </TabsTrigger>
                  </TabsList>

                  {/* Documents Tab */}
                  <TabsContent value="documents" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Project Documents</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {loadingDocuments ? (
                          <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                          </div>
                        ) : documents.length === 0 ? (
                          <div className="text-center py-12">
                            <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600">No documents uploaded yet</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {documents.map((doc) => (
                              <div
                                key={doc._id}
                                className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                      <FileText className="h-4 w-4 text-green-600 shrink-0" />
                                      <h4 className="font-semibold text-slate-900 truncate">
                                        {doc.fileName}
                                      </h4>
                                      <Badge className={getStatusColor(doc.status)}>
                                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                                      </Badge>
                                    </div>
                                    
                                    {doc.createdAt && (
                                      <div className="text-xs text-slate-500 mb-2">
                                        <Calendar className="h-3 w-3 inline mr-1" />
                                        Submitted {new Date(doc.createdAt).toLocaleDateString()}
                                      </div>
                                    )}

                                    {doc.supervisorFeedback && (
                                      <div className="bg-green-50 border-l-4 border-green-600 p-2 rounded-r mt-2">
                                        <p className="text-xs font-semibold text-green-900 mb-1">Your Feedback</p>
                                        <p className="text-sm text-slate-700">{doc.supervisorFeedback}</p>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex flex-col gap-2 shrink-0">
                                    <Button
                                      onClick={() => handleDownloadDocument(doc)}
                                      variant="outline"
                                      size="sm"
                                      className="border-green-600 text-green-600 hover:bg-green-50"
                                    >
                                      <Download className="h-4 w-4 mr-2" />
                                      Download
                                    </Button>
                                    
                                    {doc.status === 'pending' && (
                                      <div className="grid grid-cols-3 gap-1">
                                        <Button
                                          onClick={() => handleDocumentAction(doc, 'approve')}
                                          size="sm"
                                          className="bg-green-600 hover:bg-green-700 text-white p-2"
                                          title="Approve"
                                        >
                                          <CheckCircle2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          onClick={() => handleDocumentAction(doc, 'reject')}
                                          size="sm"
                                          className="bg-red-600 hover:bg-red-700 text-white p-2"
                                          title="Reject"
                                        >
                                          <XCircle className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          onClick={() => handleDocumentAction(doc, 'feedback')}
                                          size="sm"
                                          className="bg-yellow-600 hover:bg-yellow-700 text-white p-2"
                                          title="Add Feedback"
                                        >
                                          <MessageSquare className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Marks Tab */}
                  <TabsContent value="marks" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Evaluation Sheet</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Excel-like Table */}
                          <div className="border border-slate-300 rounded-lg overflow-hidden">
                            <table className="w-full">
                              <thead className="bg-slate-100">
                                <tr>
                                  <th className="px-4 py-3 text-left text-sm font-bold text-slate-700 border-b border-r border-slate-300">
                                    Evaluation Component
                                  </th>
                                  <th className="px-4 py-3 text-center text-sm font-bold text-slate-700 border-b border-r border-slate-300">
                                    Max Marks
                                  </th>
                                  <th className="px-4 py-3 text-center text-sm font-bold text-slate-700 border-b border-slate-300">
                                    Obtained Marks
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white">
                                <tr className="hover:bg-slate-50">
                                  <td className="px-4 py-3 text-sm font-medium text-slate-900 border-b border-r border-slate-200">
                                    <BookOpen className="h-4 w-4 inline mr-2 text-blue-600" />
                                    Proposal
                                  </td>
                                  <td className="px-4 py-3 text-center text-sm text-slate-600 border-b border-r border-slate-200">
                                    20
                                  </td>
                                  <td className="px-4 py-3 border-b border-slate-200">
                                    <Input
                                      type="number"
                                      min="0"
                                      max="20"
                                      value={marks.proposalMarks}
                                      onChange={(e) => setMarks({ ...marks, proposalMarks: Number(e.target.value) })}
                                      onBlur={calculateTotal}
                                      className="text-center font-semibold"
                                      disabled={selectedProject.isEvaluationComplete}
                                    />
                                  </td>
                                </tr>
                                
                                <tr className="hover:bg-slate-50">
                                  <td className="px-4 py-3 text-sm font-medium text-slate-900 border-b border-r border-slate-200">
                                    <FileText className="h-4 w-4 inline mr-2 text-purple-600" />
                                    Implementation
                                  </td>
                                  <td className="px-4 py-3 text-center text-sm text-slate-600 border-b border-r border-slate-200">
                                    30
                                  </td>
                                  <td className="px-4 py-3 border-b border-slate-200">
                                    <Input
                                      type="number"
                                      min="0"
                                      max="30"
                                      value={marks.implementationMarks}
                                      onChange={(e) => setMarks({ ...marks, implementationMarks: Number(e.target.value) })}
                                      onBlur={calculateTotal}
                                      className="text-center font-semibold"
                                      disabled={selectedProject.isEvaluationComplete}
                                    />
                                  </td>
                                </tr>

                                <tr className="hover:bg-slate-50">
                                  <td className="px-4 py-3 text-sm font-medium text-slate-900 border-b border-r border-slate-200">
                                    <FileText className="h-4 w-4 inline mr-2 text-orange-600" />
                                    Documentation
                                  </td>
                                  <td className="px-4 py-3 text-center text-sm text-slate-600 border-b border-r border-slate-200">
                                    20
                                  </td>
                                  <td className="px-4 py-3 border-b border-slate-200">
                                    <Input
                                      type="number"
                                      min="0"
                                      max="20"
                                      value={marks.documentationMarks}
                                      onChange={(e) => setMarks({ ...marks, documentationMarks: Number(e.target.value) })}
                                      onBlur={calculateTotal}
                                      className="text-center font-semibold"
                                      disabled={selectedProject.isEvaluationComplete}
                                    />
                                  </td>
                                </tr>

                                <tr className="hover:bg-slate-50">
                                  <td className="px-4 py-3 text-sm font-medium text-slate-900 border-b border-r border-slate-200">
                                    <Award className="h-4 w-4 inline mr-2 text-yellow-600" />
                                    Presentation
                                  </td>
                                  <td className="px-4 py-3 text-center text-sm text-slate-600 border-b border-r border-slate-200">
                                    15
                                  </td>
                                  <td className="px-4 py-3 border-b border-slate-200">
                                    <Input
                                      type="number"
                                      min="0"
                                      max="15"
                                      value={marks.presentationMarks}
                                      onChange={(e) => setMarks({ ...marks, presentationMarks: Number(e.target.value) })}
                                      onBlur={calculateTotal}
                                      className="text-center font-semibold"
                                      disabled={selectedProject.isEvaluationComplete}
                                    />
                                  </td>
                                </tr>

                                <tr className="hover:bg-slate-50">
                                  <td className="px-4 py-3 text-sm font-medium text-slate-900 border-b border-r border-slate-200">
                                    <Github className="h-4 w-4 inline mr-2 text-slate-600" />
                                    GitHub Repository
                                  </td>
                                  <td className="px-4 py-3 text-center text-sm text-slate-600 border-b border-r border-slate-200">
                                    15
                                  </td>
                                  <td className="px-4 py-3 border-b border-slate-200">
                                    <Input
                                      type="number"
                                      min="0"
                                      max="15"
                                      value={marks.githubMarks}
                                      onChange={(e) => setMarks({ ...marks, githubMarks: Number(e.target.value) })}
                                      onBlur={calculateTotal}
                                      className="text-center font-semibold"
                                      disabled={selectedProject.isEvaluationComplete}
                                    />
                                  </td>
                                </tr>

                                <tr className="bg-green-50">
                                  <td className="px-4 py-4 text-base font-bold text-slate-900 border-r border-slate-300">
                                    TOTAL MARKS
                                  </td>
                                  <td className="px-4 py-4 text-center text-base font-bold text-slate-900 border-r border-slate-300">
                                    100
                                  </td>
                                  <td className="px-4 py-4">
                                    <div className="text-center text-2xl font-bold text-green-700">
                                      {marks.totalMarks}
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          {!selectedProject.isEvaluationComplete && (
                            <div className="flex justify-end">
                              <Button
                                onClick={handleSaveMarks}
                                disabled={savingMarks}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                {savingMarks ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                  <Save className="h-4 w-4 mr-2" />
                                )}
                                Save Marks
                              </Button>
                            </div>
                          )}

                          {/* Final Feedback */}
                          <div className="border-t pt-4 mt-4">
                            <label className="block text-sm font-bold text-slate-900 mb-2">
                              Final Feedback
                            </label>
                            <Textarea
                              value={finalFeedback}
                              onChange={(e) => setFinalFeedback(e.target.value)}
                              placeholder="Provide overall feedback for the project..."
                              rows={4}
                              className="mb-3"
                              disabled={selectedProject.isEvaluationComplete}
                            />
                            {!selectedProject.isEvaluationComplete && (
                              <div className="flex gap-3 justify-end">
                                <Button
                                  onClick={handleSaveFeedback}
                                  disabled={savingMarks || !finalFeedback.trim()}
                                  variant="outline"
                                  className="border-green-600 text-green-600"
                                >
                                  <Save className="h-4 w-4 mr-2" />
                                  Save Feedback
                                </Button>
                                <Button
                                  onClick={handleCompleteEvaluation}
                                  disabled={savingMarks}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Complete Evaluation
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        )}

        {/* Document Action Dialog */}
        <Dialog open={documentDialogOpen} onOpenChange={setDocumentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {documentAction === 'approve' && 'Approve Document'}
                {documentAction === 'reject' && 'Reject Document'}
                {documentAction === 'feedback' && 'Add Feedback'}
              </DialogTitle>
              <DialogDescription>
                {selectedDocument?.fileName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                  {documentAction === 'approve' && 'Approval Comments (Optional)'}
                  {documentAction === 'reject' && 'Rejection Reason *'}
                  {documentAction === 'feedback' && 'Your Feedback *'}
                </label>
                <Textarea
                  value={documentComment}
                  onChange={(e) => setDocumentComment(e.target.value)}
                  placeholder={`Enter your ${documentAction === 'approve' ? 'comments' : documentAction === 'reject' ? 'reason' : 'feedback'}...`}
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDocumentDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitDocumentAction}
                disabled={submittingDocument || (documentAction !== 'approve' && !documentComment.trim())}
                className={
                  documentAction === 'approve'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : documentAction === 'reject'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                }
              >
                {submittingDocument ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {documentAction === 'approve' && 'Approve'}
                {documentAction === 'reject' && 'Reject'}
                {documentAction === 'feedback' && 'Submit Feedback'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
