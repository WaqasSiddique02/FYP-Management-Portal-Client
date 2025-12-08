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
  Lightbulb,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  FileText,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
} from 'lucide-react';

interface ProjectIdea {
  _id: string;
  title: string;
  description: string;
  technologies?: string[];
  requirements?: string;
  supervisor: string;
  createdAt: string;
  updatedAt: string;
}

interface CustomIdea {
  _id: string;
  groupId: {
    _id: string;
    name: string;
  };
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  supervisorComment?: string;
  submittedAt: string;
}

export default function ProjectIdeasPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthContext();
  const [activeTab, setActiveTab] = useState<'own' | 'custom'>('own');
  
  // Own Projects State
  const [ownProjects, setOwnProjects] = useState<ProjectIdea[]>([]);
  const [filteredOwnProjects, setFilteredOwnProjects] = useState<ProjectIdea[]>([]);
  const [loadingOwn, setLoadingOwn] = useState(false);
  
  // Custom Projects State
  const [customProjects, setCustomProjects] = useState<CustomIdea[]>([]);
  const [filteredCustomProjects, setFilteredCustomProjects] = useState<CustomIdea[]>([]);
  const [loadingCustom, setLoadingCustom] = useState(false);
  
  // Search
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedProject, setSelectedProject] = useState<ProjectIdea | null>(null);
  const [selectedCustomIdea, setSelectedCustomIdea] = useState<CustomIdea | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technologies: '',
    requirements: '',
  });
  const [submitting, setSubmitting] = useState(false);
  
  // Review State
  const [reviewComment, setReviewComment] = useState('');
  const [reviewing, setReviewing] = useState(false);

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
      fetchOwnProjects();
      fetchCustomProjects();
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (activeTab === 'own') {
      filterOwnProjects();
    } else {
      filterCustomProjects();
    }
  }, [searchQuery, ownProjects, customProjects, activeTab]);

  const fetchOwnProjects = async () => {
    try {
      setLoadingOwn(true);
      const response = await supervisorApi.getOwnProjectIdeas();
      // Handle different response formats
      const data = Array.isArray(response) 
        ? response 
        : response?.data 
        ? Array.isArray(response.data) ? response.data : []
        : [];
      setOwnProjects(data);
      setFilteredOwnProjects(data);
    } catch (error: any) {
      console.error('Error fetching own projects:', error);
      setOwnProjects([]);
      setFilteredOwnProjects([]);
    } finally {
      setLoadingOwn(false);
    }
  };

  const fetchCustomProjects = async () => {
    try {
      setLoadingCustom(true);
      const response = await supervisorApi.getCustomIdeas();
      // Handle different response formats
      const data = Array.isArray(response) 
        ? response 
        : response?.data 
        ? Array.isArray(response.data) ? response.data : []
        : [];
      setCustomProjects(data);
      setFilteredCustomProjects(data);
    } catch (error: any) {
      console.error('Error fetching custom projects:', error);
      setCustomProjects([]);
      setFilteredCustomProjects([]);
    } finally {
      setLoadingCustom(false);
    }
  };

  const filterOwnProjects = () => {
    if (!searchQuery) {
      setFilteredOwnProjects(ownProjects);
      return;
    }
    
    const filtered = ownProjects.filter(
      (project) =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredOwnProjects(filtered);
  };

  const filterCustomProjects = () => {
    if (!searchQuery) {
      setFilteredCustomProjects(customProjects);
      return;
    }
    
    const filtered = customProjects.filter(
      (project) =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.groupId.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCustomProjects(filtered);
  };

  const handleCreateNew = () => {
    setDialogMode('create');
    setSelectedProject(null);
    setFormData({ title: '', description: '', technologies: '', requirements: '' });
    setIsDialogOpen(true);
  };

  const handleEdit = (project: ProjectIdea) => {
    setDialogMode('edit');
    setSelectedProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      technologies: project.technologies?.join(', ') || '',
      requirements: project.requirements || '',
    });
    setIsDialogOpen(true);
  };

  const handleViewCustomIdea = (idea: CustomIdea) => {
    setDialogMode('view');
    setSelectedCustomIdea(idea);
    setReviewComment('');
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      alert('Title and description are required');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: formData.title,
        description: formData.description,
        technologies: formData.technologies
          ? formData.technologies.split(',').map((t) => t.trim())
          : undefined,
        requirements: formData.requirements || undefined,
      };

      if (dialogMode === 'create') {
        await supervisorApi.createProjectIdea(payload);
        alert('Project idea created successfully');
      } else if (dialogMode === 'edit' && selectedProject) {
        await supervisorApi.updateProjectIdea(selectedProject._id, payload);
        alert('Project idea updated successfully');
      }

      setIsDialogOpen(false);
      fetchOwnProjects();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save project idea');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project idea?')) {
      return;
    }

    try {
      await supervisorApi.deleteProjectIdea(projectId);
      alert('Project idea deleted successfully');
      fetchOwnProjects();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete project idea');
    }
  };

  const handleApproveCustomIdea = async () => {
    if (!selectedCustomIdea) return;

    try {
      setReviewing(true);
      await supervisorApi.approveCustomIdea(selectedCustomIdea._id, {
        comment: reviewComment || undefined,
      });
      alert('Custom idea approved successfully');
      setIsDialogOpen(false);
      fetchCustomProjects();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to approve idea');
    } finally {
      setReviewing(false);
    }
  };

  const handleRejectCustomIdea = async () => {
    if (!selectedCustomIdea || !reviewComment.trim()) {
      alert('Comment is required to reject an idea');
      return;
    }

    try {
      setReviewing(true);
      await supervisorApi.rejectCustomIdea(selectedCustomIdea._id, {
        comment: reviewComment,
      });
      alert('Custom idea rejected');
      setIsDialogOpen(false);
      fetchCustomProjects();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to reject idea');
    } finally {
      setReviewing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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

  if (authLoading) {
    return (
      <DashboardLayout role="supervisor">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loader2 className="h-12 w-12 animate-spin text-green-600" />
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
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Project Ideas</h1>
              <p className="text-green-100 text-sm md:text-base">
                Manage your project ideas and review student submissions
              </p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white/20 backdrop-blur-sm px-6 py-4 rounded-xl border border-white/30">
                <p className="text-3xl font-bold">{ownProjects.length}</p>
                <p className="text-xs text-green-100 mt-1">My Ideas</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-6 py-4 rounded-xl border border-white/30">
                <p className="text-3xl font-bold">
                  {customProjects.filter((p) => p.status === 'pending').length}
                </p>
                <p className="text-xs text-green-100 mt-1">Pending Review</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search project ideas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 border-slate-200 focus:border-green-500 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'own' | 'custom')} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="own" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                <Lightbulb className="h-4 w-4 mr-2" />
                My Project Ideas
              </TabsTrigger>
              <TabsTrigger value="custom" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                <Users className="h-4 w-4 mr-2" />
                Student Custom Ideas
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Own Projects Tab */}
          <TabsContent value="own" className="space-y-4">
            <div className="flex justify-end">
              <Button
                onClick={handleCreateNew}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Idea
              </Button>
            </div>

            {loadingOwn ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-12 w-12 animate-spin text-green-600" />
              </div>
            ) : filteredOwnProjects.length === 0 ? (
              <Card className="border-2 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Lightbulb className="h-12 w-12 text-slate-400 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No Project Ideas</h3>
                  <p className="text-slate-500 text-center max-w-sm mb-4">
                    {searchQuery ? 'No ideas match your search' : 'Start by adding your first project idea'}
                  </p>
                  {!searchQuery && (
                    <Button onClick={handleCreateNew} className="bg-green-600 hover:bg-green-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Idea
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOwnProjects.map((project) => (
                  <Card key={project._id} className="hover:shadow-lg transition-shadow border-slate-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-bold text-slate-900 line-clamp-2">
                            {project.title}
                          </CardTitle>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(project)}
                            className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(project._id)}
                            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-slate-600 line-clamp-3">{project.description}</p>
                      
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {project.technologies.slice(0, 3).map((tech, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                          {project.technologies.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{project.technologies.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t">
                        <Calendar className="h-3 w-3" />
                        {new Date(project.createdAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Custom Projects Tab */}
          <TabsContent value="custom" className="space-y-4">
            {loadingCustom ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-12 w-12 animate-spin text-green-600" />
              </div>
            ) : filteredCustomProjects.length === 0 ? (
              <Card className="border-2 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Users className="h-12 w-12 text-slate-400 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No Custom Ideas</h3>
                  <p className="text-slate-500 text-center max-w-sm">
                    {searchQuery ? 'No ideas match your search' : 'No custom ideas submitted by students yet'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredCustomProjects.map((idea) => (
                  <Card key={idea._id} className="hover:shadow-lg transition-shadow border-slate-200">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-slate-900 mb-1">{idea.title}</h3>
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Users className="h-4 w-4" />
                                {idea.groupId.name}
                              </div>
                            </div>
                            <Badge className={getStatusColor(idea.status)}>
                              {idea.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                              {idea.status === 'approved' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                              {idea.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                              {idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}
                            </Badge>
                          </div>
                          
                          <p className="text-slate-600 line-clamp-2">{idea.description}</p>
                          
                          {idea.supervisorComment && (
                            <div className="bg-green-50 border-l-4 border-green-600 p-3 rounded-r">
                              <p className="text-xs font-semibold text-green-900 mb-1">Your Feedback</p>
                              <p className="text-sm text-slate-700">{idea.supervisorComment}</p>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t">
                            <Calendar className="h-3 w-3" />
                            Submitted {new Date(idea.submittedAt).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="flex md:flex-col gap-2">
                          <Button
                            onClick={() => handleViewCustomIdea(idea)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            size="sm"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View & Review
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Dialog for Create/Edit/View */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {dialogMode === 'create' && 'Add New Project Idea'}
                {dialogMode === 'edit' && 'Edit Project Idea'}
                {dialogMode === 'view' && 'Review Custom Idea'}
              </DialogTitle>
              <DialogDescription>
                {dialogMode === 'create' && 'Create a new project idea for students to select'}
                {dialogMode === 'edit' && 'Update your project idea details'}
                {dialogMode === 'view' && 'Review and provide feedback on student custom idea'}
              </DialogDescription>
            </DialogHeader>

            {dialogMode === 'view' && selectedCustomIdea ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Group</label>
                  <p className="text-slate-900 mt-1">{selectedCustomIdea.groupId.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-slate-700">Project Title</label>
                  <p className="text-slate-900 mt-1">{selectedCustomIdea.title}</p>
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-slate-700">Description</label>
                  <p className="text-slate-700 mt-1 whitespace-pre-wrap">{selectedCustomIdea.description}</p>
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-slate-700">Status</label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(selectedCustomIdea.status)}>
                      {selectedCustomIdea.status.charAt(0).toUpperCase() + selectedCustomIdea.status.slice(1)}
                    </Badge>
                  </div>
                </div>

                {selectedCustomIdea.status === 'pending' && (
                  <>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">
                        Your Feedback
                        <span className="text-slate-500 font-normal ml-1">(Required for rejection)</span>
                      </label>
                      <Textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Provide your feedback..."
                        rows={4}
                        className="border-slate-300 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={handleApproveCustomIdea}
                        disabled={reviewing}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {reviewing ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                        )}
                        Approve
                      </Button>
                      <Button
                        onClick={handleRejectCustomIdea}
                        disabled={reviewing || !reviewComment.trim()}
                        className="bg-slate-700 hover:bg-slate-800 text-white"
                      >
                        {reviewing ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-2" />
                        )}
                        Reject
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Project Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter project title"
                    className="border-slate-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the project idea in detail"
                    rows={5}
                    className="border-slate-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Technologies
                    <span className="text-slate-500 font-normal ml-1">(comma-separated)</span>
                  </label>
                  <Input
                    value={formData.technologies}
                    onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                    placeholder="e.g., React, Node.js, MongoDB"
                    className="border-slate-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Requirements
                  </label>
                  <Textarea
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    placeholder="Prerequisites or requirements for students"
                    rows={3}
                    className="border-slate-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>
            )}

            {(dialogMode === 'create' || dialogMode === 'edit') && (
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {dialogMode === 'create' ? 'Create' : 'Update'}
                    </>
                  )}
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
