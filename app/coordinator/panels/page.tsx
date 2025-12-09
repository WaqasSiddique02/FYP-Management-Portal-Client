'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { coordinatorApi } from '@/lib/api/coordinator.api';
import apiClient from '@/lib/api/axios';
import { EvaluationPanel, CreatePanelDto, UpdatePanelDto, PanelMember } from '@/lib/types/coordinator.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  User,
  AlertCircle,
  RefreshCw,
  Search,
  Eye,
  UserCheck,
  GraduationCap,
  Shield,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface Supervisor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  designation: string;
  department: string;
  specialization?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

export default function EvaluationPanelsPage() {
  const [panels, setPanels] = useState<EvaluationPanel[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState<EvaluationPanel | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<CreatePanelDto>({
    name: '',
    department: 'Computer Science',
    members: [],
    description: '',
  });
  const [editFormData, setEditFormData] = useState<UpdatePanelDto>({
    name: '',
    members: [],
    description: '',
  });
  
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPanels();
    fetchSupervisors();
  }, []);

  const fetchPanels = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await coordinatorApi.getAllPanels();
      setPanels(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching panels:', error);
      setError(error?.response?.data?.message || error?.message || 'Failed to load evaluation panels');
      setPanels([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupervisors = async () => {
    try {
      const response = await apiClient.get(`${API_BASE_URL}/coordinator/supervisors`);
      const data = response.data?.data || response.data;
      setSupervisors(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching supervisors:', error);
    }
  };

  const handleCreatePanel = async () => {
    if (!formData.name || formData.members.length === 0) {
      alert('Please fill in panel name and select at least one member');
      return;
    }

    try {
      setSubmitting(true);
      await coordinatorApi.createPanel(formData);
      setCreateDialogOpen(false);
      setFormData({ name: '', department: 'Computer Science', members: [], description: '' });
      fetchPanels();
    } catch (error: any) {
      console.error('Error creating panel:', error);
      alert(error?.response?.data?.message || 'Failed to create panel');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePanel = async () => {
    if (!selectedPanel || !editFormData.name || !editFormData.members || editFormData.members.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await coordinatorApi.updatePanel(selectedPanel._id, editFormData);
      setEditDialogOpen(false);
      setSelectedPanel(null);
      setEditFormData({ name: '', members: [], description: '' });
      fetchPanels();
    } catch (error: any) {
      console.error('Error updating panel:', error);
      alert(error?.response?.data?.message || 'Failed to update panel');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePanel = async () => {
    if (!selectedPanel) return;

    try {
      setSubmitting(true);
      await coordinatorApi.deletePanel(selectedPanel._id);
      setDeleteDialogOpen(false);
      setSelectedPanel(null);
      fetchPanels();
    } catch (error: any) {
      console.error('Error deleting panel:', error);
      alert(error?.response?.data?.message || 'Failed to delete panel');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditDialog = (panel: EvaluationPanel) => {
    setSelectedPanel(panel);
    setEditFormData({
      name: panel.name,
      members: panel.members.map(m => m._id),
      description: panel.description || '',
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (panel: EvaluationPanel) => {
    setSelectedPanel(panel);
    setDeleteDialogOpen(true);
  };

  const openViewDialog = (panel: EvaluationPanel) => {
    setSelectedPanel(panel);
    setViewDialogOpen(true);
  };

  const toggleMemberSelection = (supervisorId: string, isEdit: boolean = false) => {
    if (isEdit) {
      setEditFormData(prev => ({
        ...prev,
        members: prev.members?.includes(supervisorId)
          ? prev.members.filter(id => id !== supervisorId)
          : [...(prev.members || []), supervisorId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        members: prev.members.includes(supervisorId)
          ? prev.members.filter(id => id !== supervisorId)
          : [...prev.members, supervisorId]
      }));
    }
  };

  const filteredPanels = (panels || []).filter(panel => {
    if (!panel) return false;
    const matchesSearch = 
      panel?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      panel?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      panel?.members?.some(m => 
        `${m?.firstName} ${m?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesSearch;
  });

  const stats = {
    total: (panels || []).length,
    active: (panels || []).filter(p => p?.isActive).length,
    inactive: (panels || []).filter(p => !p?.isActive).length,
  };

  if (loading) {
    return (
      <DashboardLayout role="coordinator">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading evaluation panels...</p>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Panels</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={fetchPanels} className="gap-2">
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-600 p-3 rounded-xl">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Evaluation Panels</h1>
                <p className="text-indigo-100 mt-1">
                  Manage evaluation panels for project assessments
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setCreateDialogOpen(true)}
              className="bg-white text-indigo-700 hover:bg-indigo-50 gap-2 font-semibold"
            >
              <Plus className="w-4 h-4" />
              New Panel
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-l-4 border-l-indigo-600">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Panels</CardTitle>
              <Shield className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">{stats.total}</div>
              <p className="text-xs text-gray-600 mt-1">Evaluation panels</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-600">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Panels</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <p className="text-xs text-gray-600 mt-1">Currently active</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-gray-600">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Panels</CardTitle>
              <XCircle className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
              <p className="text-xs text-gray-600 mt-1">Not in use</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search panels by name, description, or members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Panels List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPanels.length === 0 ? (
            <Card className="col-span-full p-12">
              <div className="text-center">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No panels found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm 
                    ? 'Try adjusting your search criteria' 
                    : 'Create your first evaluation panel to get started'}
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={() => setCreateDialogOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create Panel
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            filteredPanels.map((panel) => (
              <Card key={panel?._id} className="hover:shadow-lg transition-shadow border-t-4 border-t-indigo-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{panel?.name || 'Untitled'}</CardTitle>
                        <Badge className={panel?.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {panel?.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      {panel?.description && (
                        <CardDescription className="line-clamp-2">
                          {panel.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Separator />
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Panel Members ({panel?.members?.length || 0})
                      </span>
                    </div>
                    <div className="space-y-2">
                      {(panel?.members || []).slice(0, 2).map((member) => (
                        <div key={member?._id} className="flex items-center gap-2 text-sm">
                          <GraduationCap className="w-3 h-3 text-indigo-600" />
                          <span className="text-gray-700">{member?.firstName} {member?.lastName}</span>
                          <span className="text-gray-500 text-xs">• {member?.designation}</span>
                        </div>
                      ))}
                      {(panel?.members?.length || 0) > 2 && (
                        <p className="text-xs text-indigo-600 font-medium">
                          +{panel.members.length - 2} more members
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {panel?.createdAt 
                          ? new Date(panel.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })
                          : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      onClick={() => openViewDialog(panel)}
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                    <Button
                      onClick={() => openEditDialog(panel)}
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => openDeleteDialog(panel)}
                      variant="outline"
                      size="sm"
                      className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Create Panel Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Shield className="w-6 h-6 text-indigo-600" />
                Create New Evaluation Panel
              </DialogTitle>
              <DialogDescription>
                Create a new panel with faculty members for project evaluations
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Panel Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Panel A, Morning Session Panel"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Optional description of the panel's purpose"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Input
                  id="department"
                  value={formData.department}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label>Panel Members * ({formData.members.length} selected)</Label>
                <div className="border rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
                  {supervisors.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No supervisors available</p>
                  ) : (
                    <div className="space-y-2">
                      {supervisors.map((supervisor) => (
                        <div
                          key={supervisor._id}
                          onClick={() => toggleMemberSelection(supervisor._id)}
                          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                            formData.members.includes(supervisor._id)
                              ? 'bg-indigo-100 border-2 border-indigo-500'
                              : 'bg-white border-2 border-transparent hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              formData.members.includes(supervisor._id)
                                ? 'bg-indigo-600 border-indigo-600'
                                : 'border-gray-300'
                            }`}>
                              {formData.members.includes(supervisor._id) && (
                                <CheckCircle2 className="w-4 h-4 text-white" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {supervisor.firstName} {supervisor.lastName}
                              </p>
                              <p className="text-sm text-gray-600">
                                {supervisor.designation} • {supervisor.email}
                              </p>
                              {supervisor.specialization && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Specialization: {supervisor.specialization}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreatePanel}
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {submitting ? 'Creating...' : 'Create Panel'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Panel Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Edit className="w-6 h-6 text-indigo-600" />
                Edit Evaluation Panel
              </DialogTitle>
              <DialogDescription>
                Update panel details and members
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Panel Name *</Label>
                <Input
                  id="edit-name"
                  placeholder="Panel name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Panel description"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  rows={3}
                  className="resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label>Panel Members * ({editFormData.members?.length || 0} selected)</Label>
                <div className="border rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
                  {supervisors.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No supervisors available</p>
                  ) : (
                    <div className="space-y-2">
                      {supervisors.map((supervisor) => (
                        <div
                          key={supervisor._id}
                          onClick={() => toggleMemberSelection(supervisor._id, true)}
                          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                            editFormData.members?.includes(supervisor._id)
                              ? 'bg-indigo-100 border-2 border-indigo-500'
                              : 'bg-white border-2 border-transparent hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              editFormData.members?.includes(supervisor._id)
                                ? 'bg-indigo-600 border-indigo-600'
                                : 'border-gray-300'
                            }`}>
                              {editFormData.members?.includes(supervisor._id) && (
                                <CheckCircle2 className="w-4 h-4 text-white" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {supervisor.firstName} {supervisor.lastName}
                              </p>
                              <p className="text-sm text-gray-600">
                                {supervisor.designation} • {supervisor.email}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdatePanel}
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {submitting ? 'Updating...' : 'Update Panel'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Panel Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedPanel?.name}</DialogTitle>
              <DialogDescription>
                Evaluation panel details and members
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <Badge className={selectedPanel?.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {selectedPanel?.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <Badge className="bg-indigo-100 text-indigo-800">
                  {selectedPanel?.department}
                </Badge>
              </div>

              {selectedPanel?.description && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold text-sm text-gray-500 mb-2">Description</h3>
                    <p className="text-gray-700">{selectedPanel.description}</p>
                  </div>
                </>
              )}

              <Separator />

              <div>
                <h3 className="font-semibold text-sm text-gray-500 mb-3">Panel Members ({selectedPanel?.members?.length || 0})</h3>
                <div className="space-y-3">
                  {(selectedPanel?.members || []).map((member) => (
                    <div key={member._id} className="bg-gray-50 rounded-lg p-4 border">
                      <div className="flex items-start gap-3">
                        <GraduationCap className="w-5 h-5 text-indigo-600 mt-1" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{member.designation}</p>
                          <p className="text-sm text-gray-600">{member.email}</p>
                          {member.specialization && (
                            <p className="text-sm text-gray-500 mt-1">
                              Specialization: {member.specialization}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-sm text-gray-500 mb-2">Created By</h3>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">
                    {selectedPanel?.createdBy?.firstName} {selectedPanel?.createdBy?.lastName}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-sm text-gray-600">{selectedPanel?.createdBy?.email}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Created on {selectedPanel?.createdAt && new Date(selectedPanel.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="w-5 h-5" />
                Delete Evaluation Panel
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this panel? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="font-medium text-gray-900">{selectedPanel?.name}</p>
              <p className="text-sm text-gray-600 mt-1">
                {selectedPanel?.members?.length || 0} members • Created {selectedPanel?.createdAt && new Date(selectedPanel.createdAt).toLocaleDateString()}
              </p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeletePanel}
                disabled={submitting}
                className="bg-red-600 hover:bg-red-700"
              >
                {submitting ? 'Deleting...' : 'Delete Panel'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
