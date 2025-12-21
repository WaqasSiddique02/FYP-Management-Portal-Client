'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { coordinatorApi } from '@/lib/api/coordinator.api';
import { Announcement, CreateAnnouncementDto, UpdateAnnouncementDto } from '@/lib/types/coordinator.types';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Megaphone, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  User,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Bell
} from 'lucide-react';
import { useAuthContext } from '@/lib/contexts/AuthContext';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAudience, setFilterAudience] = useState<string>('all');
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<CreateAnnouncementDto>({
    title: '',
    content: '',
    targetAudience: 'general',
  });
  const [editFormData, setEditFormData] = useState<UpdateAnnouncementDto>({
    title: '',
    content: '',
    targetAudience: 'general',
  });
  
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuthContext();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await coordinatorApi.getAllAnnouncements();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching announcements:', error);
      setError(error?.response?.data?.message || error?.message || 'Failed to load announcements');
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!formData.title || !formData.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await coordinatorApi.createAnnouncement(formData);
      setCreateDialogOpen(false);
      setFormData({ title: '', content: '', targetAudience: 'general' });
      fetchAnnouncements();
    } catch (error: any) {
      console.error('Error creating announcement:', error);
      toast.error(error?.response?.data?.message || 'Failed to create announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateAnnouncement = async () => {
    if (!selectedAnnouncement || !editFormData.title || !editFormData.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await coordinatorApi.updateAnnouncement(selectedAnnouncement._id, editFormData);
      setEditDialogOpen(false);
      setSelectedAnnouncement(null);
      setEditFormData({ title: '', content: '', targetAudience: 'general' });
      fetchAnnouncements();
    } catch (error: any) {
      console.error('Error updating announcement:', error);
      toast.error(error?.response?.data?.message || 'Failed to update announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async () => {
    if (!selectedAnnouncement) return;

    try {
      setSubmitting(true);
      await coordinatorApi.deleteAnnouncement(selectedAnnouncement._id);
      setDeleteDialogOpen(false);
      setSelectedAnnouncement(null);
      fetchAnnouncements();
    } catch (error: any) {
      console.error('Error deleting announcement:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditDialog = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setEditFormData({
      title: announcement.title,
      content: announcement.content,
      targetAudience: announcement.targetAudience,
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setDeleteDialogOpen(true);
  };

  const openViewDialog = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setViewDialogOpen(true);
  };

  const filteredAnnouncements = (announcements || []).filter(announcement => {
    if (!announcement) return false;
    
    const matchesSearch = 
      announcement?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement?.content?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAudience = 
      filterAudience === 'all' || 
      announcement?.targetAudience === filterAudience;
    
    return matchesSearch && matchesAudience;
  });

  const stats = {
    total: (announcements || []).length,
    students: (announcements || []).filter(a => a?.targetAudience === 'students').length,
    supervisors: (announcements || []).filter(a => a?.targetAudience === 'supervisors').length,
    general: (announcements || []).filter(a => a?.targetAudience === 'general').length,
  };

  if (loading) {
    return (
      <DashboardLayout role="coordinator">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading announcements...</p>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Announcements</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={fetchAnnouncements} className="gap-2">
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
                <Megaphone className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Announcements</h1>
                <p className="text-indigo-100 mt-1">
                  Manage system-wide announcements for students and supervisors
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setCreateDialogOpen(true)}
              className="bg-white text-indigo-700 hover:bg-indigo-50 gap-2 font-semibold"
            >
              <Plus className="w-4 h-4" />
              New Announcement
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-l-4 border-l-indigo-600">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Megaphone className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">{stats.total}</div>
              <p className="text-xs text-gray-600 mt-1">All announcements</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-600">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <Bell className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.students}</div>
              <p className="text-xs text-gray-600 mt-1">For students</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-600">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Supervisors</CardTitle>
              <User className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.supervisors}</div>
              <p className="text-xs text-gray-600 mt-1">For supervisors</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-600">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">General</CardTitle>
              <Megaphone className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.general}</div>
              <p className="text-xs text-gray-600 mt-1">For everyone</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search announcements by title or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filterAudience}
                  onChange={(e) => setFilterAudience(e.target.value)}
                  className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Audiences</option>
                  <option value="students">Students</option>
                  <option value="supervisors">Supervisors</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Announcements List */}
        <div className="space-y-4">
          {filteredAnnouncements.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm 
                    ? 'Try adjusting your search criteria' 
                    : 'Create your first announcement to get started'}
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={() => setCreateDialogOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create Announcement
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            filteredAnnouncements.map((announcement) => (
              <Card key={announcement?._id} className="hover:shadow-md transition-shadow border-l-4 border-l-indigo-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <CardTitle className="text-xl">{announcement?.title || 'Untitled'}</CardTitle>
                        <Badge 
                          className={
                            announcement?.targetAudience === 'students' 
                              ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                              : announcement?.targetAudience === 'supervisors'
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                          }
                        >
                          {announcement?.targetAudience === 'students' ? 'Students' :
                           announcement?.targetAudience === 'supervisors' ? 'Supervisors' : 'General'}
                        </Badge>
                        <Badge variant="outline">
                          {announcement?.department || 'N/A'}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {announcement?.content || 'No content'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>
                          {announcement?.createdBy 
                            ? `${announcement.createdBy.firstName} ${announcement.createdBy.lastName}`
                            : 'Unknown'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {announcement?.createdAt 
                            ? new Date(announcement.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => openViewDialog(announcement)}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                      <Button
                        onClick={() => openEditDialog(announcement)}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => openDeleteDialog(announcement)}
                        variant="outline"
                        size="sm"
                        className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Create Announcement Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Megaphone className="w-6 h-6 text-indigo-600" />
                Create New Announcement
              </DialogTitle>
              <DialogDescription>
                Create a new announcement for students and supervisors
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter announcement title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Enter announcement content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  className="resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetAudience">Target Audience *</Label>
                <select
                  id="targetAudience"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="general">General (Students & Supervisors)</option>
                  <option value="students">Students Only</option>
                  <option value="supervisors">Supervisors Only</option>
                </select>
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
                onClick={handleCreateAnnouncement}
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {submitting ? 'Creating...' : 'Create Announcement'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Announcement Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Edit className="w-6 h-6 text-indigo-600" />
                Edit Announcement
              </DialogTitle>
              <DialogDescription>
                Update announcement details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  placeholder="Enter announcement title"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-content">Content *</Label>
                <Textarea
                  id="edit-content"
                  placeholder="Enter announcement content"
                  value={editFormData.content}
                  onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })}
                  rows={6}
                  className="resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-targetAudience">Target Audience *</Label>
                <select
                  id="edit-targetAudience"
                  value={editFormData.targetAudience}
                  onChange={(e) => setEditFormData({ ...editFormData, targetAudience: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="general">General (Students & Supervisors)</option>
                  <option value="students">Students Only</option>
                  <option value="supervisors">Supervisors Only</option>
                </select>
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
                onClick={handleUpdateAnnouncement}
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {submitting ? 'Updating...' : 'Update Announcement'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Announcement Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedAnnouncement?.title}</DialogTitle>
              <DialogDescription>
                Announcement details and information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4 flex-wrap">
                <Badge 
                  className={
                    selectedAnnouncement?.targetAudience === 'students' 
                      ? 'bg-blue-100 text-blue-800'
                      : selectedAnnouncement?.targetAudience === 'supervisors'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-purple-100 text-purple-800'
                  }
                >
                  {selectedAnnouncement?.targetAudience === 'students' ? 'Students' :
                   selectedAnnouncement?.targetAudience === 'supervisors' ? 'Supervisors' : 'General'}
                </Badge>
                <Badge variant="outline">
                  {selectedAnnouncement?.department}
                </Badge>
                <span className="text-sm text-gray-600">
                  {selectedAnnouncement?.createdAt &&
                    new Date(selectedAnnouncement.createdAt).toLocaleString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                </span>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold text-sm text-gray-500 mb-2">Content</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedAnnouncement?.content}</p>
              </div>
              <Separator />
              {selectedAnnouncement?.createdBy && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-sm text-gray-500 mb-2">Created By</h3>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">
                      {selectedAnnouncement.createdBy.fullName || 
                       `${selectedAnnouncement.createdBy.firstName} ${selectedAnnouncement.createdBy.lastName}`}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-sm text-gray-600">{selectedAnnouncement.createdBy.email}</span>
                  </div>
                </div>
              )}
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
                Delete Announcement
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this announcement? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="font-medium text-gray-900">{selectedAnnouncement?.title}</p>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{selectedAnnouncement?.content}</p>
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
                onClick={handleDeleteAnnouncement}
                disabled={submitting}
                className="bg-red-600 hover:bg-red-700"
              >
                {submitting ? 'Deleting...' : 'Delete Announcement'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
