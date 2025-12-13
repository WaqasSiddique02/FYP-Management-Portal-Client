'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { supervisorApi } from '@/lib/api/supervisor.api';
import { StudentAnnouncement } from '@/lib/types/auth.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { 
  Megaphone, 
  Calendar,
  User,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Bell,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function SupervisorAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<StudentAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAudience, setFilterAudience] = useState<string>('all');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<StudentAnnouncement | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await supervisorApi.getAnnouncements();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching announcements:', error);
      setError(error?.response?.data?.message || error?.message || 'Failed to load announcements');
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const openViewDialog = (announcement: StudentAnnouncement) => {
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
    supervisors: (announcements || []).filter(a => a?.targetAudience === 'supervisors').length,
    general: (announcements || []).filter(a => a?.targetAudience === 'general').length,
  };

  const getAudienceBadge = (audience: string) => {
    const colors = {
      students: 'bg-blue-100 text-blue-700 border-blue-200',
      supervisors: 'bg-green-100 text-green-700 border-green-200',
      general: 'bg-purple-100 text-purple-700 border-purple-200',
    };
    return colors[audience as keyof typeof colors] || colors.general;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <DashboardLayout role="supervisor">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading announcements...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="supervisor">
        <div className="flex items-center justify-center min-h-screen">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Announcements</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={fetchAnnouncements} className="gap-2 bg-green-600 hover:bg-green-700">
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
    <DashboardLayout role="supervisor">
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="bg-linear-to-r from-green-600 to-emerald-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
                <Megaphone className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Announcements</h1>
                <p className="text-green-100 mt-1">Stay updated with the latest news and updates</p>
              </div>
            </div>
            <Button
              onClick={fetchAnnouncements}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 backdrop-blur-sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-linear-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Total Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-emerald-700 flex items-center gap-2">
                <User className="w-4 h-4" />
                For Supervisors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-900">{stats.supervisors}</div>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
                <Megaphone className="w-4 h-4" />
                General
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">{stats.general}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search announcements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterAudience} onValueChange={setFilterAudience}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Announcements</SelectItem>
                  <SelectItem value="supervisors">For Supervisors</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
        </Card>

        {/* Announcements List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-green-600" />
              All Announcements
              <Badge variant="outline" className="ml-2">{filteredAnnouncements.length}</Badge>
            </CardTitle>
            <CardDescription>View all announcements from your coordinator</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredAnnouncements.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Megaphone className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No announcements found</h3>
                <p className="text-gray-500">
                  {searchTerm || filterAudience !== 'all'
                    ? 'Try adjusting your search or filter'
                    : 'Check back later for updates'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAnnouncements.map((announcement, index) => (
                  <div
                    key={announcement._id}
                    className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all hover:border-green-300 cursor-pointer"
                    onClick={() => openViewDialog(announcement)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="outline"
                            className={`${getAudienceBadge(announcement.targetAudience)} text-xs font-medium`}
                          >
                            {announcement.targetAudience.charAt(0).toUpperCase() + announcement.targetAudience.slice(1)}
                          </Badge>
                          {index === 0 && (
                            <Badge className="bg-red-500 text-white text-xs">Latest</Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-green-600 transition-colors">
                          {announcement.title}
                        </h3>
                        <p className="text-gray-600 line-clamp-2 mb-3">
                          {announcement.content}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{announcement.createdBy?.fullName || 'Coordinator'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(announcement.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="outline"
                  className={`${getAudienceBadge(selectedAnnouncement?.targetAudience || 'general')} text-xs font-medium`}
                >
                  {selectedAnnouncement?.targetAudience 
                    ? selectedAnnouncement.targetAudience.charAt(0).toUpperCase() + selectedAnnouncement.targetAudience.slice(1)
                    : 'General'}
                </Badge>
              </div>
              <DialogTitle className="text-2xl">{selectedAnnouncement?.title}</DialogTitle>
              <DialogDescription className="flex items-center gap-4 text-sm pt-2">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {selectedAnnouncement?.createdBy?.fullName || 'Coordinator'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {selectedAnnouncement && formatDate(selectedAnnouncement.createdAt)}
                </span>
              </DialogDescription>
            </DialogHeader>
            <Separator />
            <div className="py-4">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {selectedAnnouncement?.content}
              </p>
            </div>
            <Separator />
            <div className="flex justify-end">
              <Button
                onClick={() => setViewDialogOpen(false)}
                className="bg-green-600 hover:bg-green-700"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
