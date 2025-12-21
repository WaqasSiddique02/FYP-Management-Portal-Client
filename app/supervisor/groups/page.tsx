'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { supervisorApi } from '@/lib/api/supervisor.api';
import { GroupDetails } from '@/lib/types/supervisor.types';
import { useAuthContext } from '@/lib/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Loader2, 
  Users, 
  Search, 
  User, 
  Mail,
  FolderKanban,
  Lightbulb,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronDown,
  ChevronUp,
  Crown,
  Calendar,
  FileText
} from 'lucide-react';

export default function SupervisorGroupsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthContext();
  const [groups, setGroups] = useState<GroupDetails[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<GroupDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [expandedGroupDetails, setExpandedGroupDetails] = useState<GroupDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
      fetchGroups();
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    filterGroups();
  }, [searchQuery, statusFilter, groups]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await supervisorApi.getAssignedGroups();
      setGroups(data);
      setFilteredGroups(data);
    } catch (err: any) {
      console.error('Error fetching groups:', err);
      setError(err.response?.data?.message || 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const filterGroups = () => {
    let filtered = [...groups];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (group) =>
          group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          group.leader.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          group.projectTitle.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        (group) => group.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredGroups(filtered);
  };

  const handleGroupClick = async (group: GroupDetails) => {
    if (expandedGroupId === group.id) {
      // Collapse if already expanded
      setExpandedGroupId(null);
      setExpandedGroupDetails(null);
      setComment('');
      return;
    }

    // Expand and fetch details
    setExpandedGroupId(group.id);
    setLoadingDetails(true);
    try {
      const details = await supervisorApi.getAssignedGroupById(group.id);
      setExpandedGroupDetails(details);
    } catch (err: any) {
      console.error('Error fetching group details:', err);
      setExpandedGroupDetails(group); // Fallback to basic data
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleApprove = async () => {
    if (!expandedGroupDetails?.projectIdea) return;

    try {
      setSubmitting(true);

      if (expandedGroupDetails.projectIdea.isCustomIdea) {
        await supervisorApi.approveCustomIdea(expandedGroupDetails.projectIdea.id || expandedGroupDetails.id, {});
      } else {
        await supervisorApi.approveSelectedIdea(expandedGroupDetails.projectIdea.id || expandedGroupDetails.id, {});
      }

      toast.success('Project idea approved successfully');
      setComment('');
      setExpandedGroupId(null);
      setExpandedGroupDetails(null);
      fetchGroups();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve idea');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!expandedGroupDetails?.projectIdea || !comment.trim()) {
      toast.error('Comment is required to reject an idea');
      return;
    }

    try {
      setSubmitting(true);
      const payload = { comment };

      if (expandedGroupDetails.projectIdea.isCustomIdea) {
        await supervisorApi.rejectCustomIdea(expandedGroupDetails.projectIdea.id || expandedGroupDetails.id, payload);
      } else {
        await supervisorApi.rejectSelectedIdea(expandedGroupDetails.projectIdea.id || expandedGroupDetails.id, payload);
      }

      toast.success('Project idea rejected');
      setComment('');
      setExpandedGroupId(null);
      setExpandedGroupDetails(null);
      fetchGroups();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject idea');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in progress':
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'on hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending':
      case 'pending approval':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const statuses = ['all', 'pending', 'active', 'in progress', 'completed', 'on hold'];

  if (authLoading || loading) {
    return (
      <DashboardLayout role="supervisor">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading groups...</p>
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
            <div className="text-red-600 mb-4">
              <svg
                className="h-12 w-12 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-gray-900 font-semibold mb-2">Error Loading Groups</p>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchGroups}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="supervisor">
      <div className="space-y-6">
        {/* Modern Header with Stats */}
        <div className="bg-linear-to-r bg-green-600 rounded-2xl p-6 md:p-8 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">My Groups</h1>
              <p className="text-blue-100 text-sm md:text-base">
                Manage and oversee your assigned student groups
              </p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white/20 backdrop-blur-sm px-6 py-4 rounded-xl border border-white/30">
                <p className="text-3xl font-bold">{groups.length}</p>
                <p className="text-xs text-blue-100 mt-1">Total Groups</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-6 py-4 rounded-xl border border-white/30">
                <p className="text-3xl font-bold">
                  {groups.filter(g => g.projectIdea?.ideaStatus === 'pending').length}
                </p>
                <p className="text-xs text-blue-100 mt-1">Pending</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search groups, leaders, or projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="md:w-56">
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Groups Table/List */}
        {filteredGroups.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="p-4 bg-gray-100 rounded-full mb-4">
                <Users className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Groups Found</h3>
              <p className="text-gray-500 text-center max-w-sm">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'No groups have been assigned to you yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            {/* Table Header - Hidden on mobile */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b font-semibold text-sm text-gray-700">
              <div className="col-span-3">Group Details</div>
              <div className="col-span-3">Leader</div>
              <div className="col-span-4">Project</div>
              <div className="col-span-2 text-center">Action</div>
            </div>

            {/* Table Body */}
            <div className="divide-y">
              {filteredGroups.map((group, index) => (
                <React.Fragment key={group.id}>
                  {/* Main Row */}
                  <div
                    className={`grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 hover:bg-slate-50 transition-colors ${
                      expandedGroupId === group.id ? 'bg-slate-50' : ''
                    }`}
                  >
                  {/* Group Details */}
                  <div className="md:col-span-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg mt-1">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 truncate">
                          {group.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                        </p>
                        <div className="mt-2">
                          <Badge className={`${getStatusColor(group.status)} text-xs`}>
                            {group.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Leader */}
                  <div className="md:col-span-3">
                    <div className="md:mt-2">
                      <p className="text-sm font-medium text-gray-900 mb-1 flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400 md:hidden" />
                        {group.leader.name}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {group.leader.email}
                      </p>
                    </div>
                  </div>

                  {/* Project */}
                  <div className="md:col-span-4">
                    <div className="md:mt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <FolderKanban className="h-4 w-4 text-gray-400" />
                        <p className="text-sm font-medium text-gray-900 line-clamp-1" title={group.projectTitle}>
                          {group.projectTitle}
                        </p>
                      </div>
                      {group.projectIdea && (
                        <div className="space-y-2">
                          {/* Description Preview */}
                          {(group.projectIdea.customIdeaDescription || group.projectIdea.description) && (
                            <p className="text-xs text-slate-600 line-clamp-2" title={group.projectIdea.customIdeaDescription || group.projectIdea.description}>
                              {group.projectIdea.customIdeaDescription || group.projectIdea.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs">
                            {group.projectIdea.isCustomIdea ? 'Custom' : 'From List'}
                          </Badge>
                          {group.projectIdea.ideaStatus === 'pending' && (
                            <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Needs Review
                            </Badge>
                          )}
                          {group.projectIdea.ideaStatus === 'approved' && (
                            <Badge className="bg-green-100 text-green-700 border-green-200 text-xs flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Approved
                            </Badge>
                          )}
                          {group.projectIdea.ideaStatus === 'rejected' && (
                            <Badge className="bg-red-100 text-red-700 border-red-200 text-xs flex items-center gap-1">
                              <XCircle className="h-3 w-3" />
                              Rejected
                            </Badge>
                          )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="md:col-span-2 flex items-center justify-end md:justify-center">
                    <Button
                      onClick={() => handleGroupClick(group)}
                      className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      {expandedGroupId === group.id ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-2" />
                          Hide Details
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-2" />
                          View Details
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Expandable Details Section */}
                {expandedGroupId === group.id && (
                  <div className="bg-linear-to-br from-slate-50 to-white border-t border-slate-200">
                    {loadingDetails ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                      </div>
                    ) : expandedGroupDetails ? (
                      <div className="p-6 space-y-6">
                        {/* Team Members Section */}
                        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                              <Users className="h-5 w-5 text-green-600" />
                              Team Members
                            </h3>
                            <Badge variant="outline" className="text-slate-700">
                              {expandedGroupDetails.members.length} {expandedGroupDetails.members.length === 1 ? 'Member' : 'Members'}
                            </Badge>
                          </div>
                          
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b border-slate-200">
                                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Name</th>
                                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Roll Number</th>
                                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Email</th>
                                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Role</th>
                                </tr>
                              </thead>
                              <tbody>
                                {/* Leader First */}
                                <tr className="border-b border-slate-100 bg-green-50">
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                        {expandedGroupDetails.leader.name.charAt(0)}
                                      </div>
                                      <span className="font-medium text-slate-900">{expandedGroupDetails.leader.name}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-slate-700">{expandedGroupDetails.leader.rollNumber}</td>
                                  <td className="py-3 px-4 text-slate-600 text-sm">{expandedGroupDetails.leader.email}</td>
                                  <td className="py-3 px-4 text-center">
                                    <Badge className="bg-green-600 text-white flex items-center gap-1 w-fit mx-auto">
                                      <Crown className="h-3 w-3" />
                                      Leader
                                    </Badge>
                                  </td>
                                </tr>
                                {/* Other Members */}
                                {expandedGroupDetails.members.filter(m => m.id !== expandedGroupDetails.leader.id).map((member) => (
                                  <tr key={member.id} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="py-3 px-4">
                                      <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                          {member.name.charAt(0)}
                                        </div>
                                        <span className="font-medium text-slate-900">{member.name}</span>
                                      </div>
                                    </td>
                                    <td className="py-3 px-4 text-slate-700">{member.rollNumber}</td>
                                    <td className="py-3 px-4 text-slate-600 text-sm">{member.email}</td>
                                    <td className="py-3 px-4 text-center">
                                      <Badge variant="outline" className="text-slate-600">Member</Badge>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Project Idea Section */}
                        {expandedGroupDetails.projectIdea && (
                          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                            <div className="bg-linear-to-r from-slate-700 to-slate-600 p-5 text-white">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="p-2.5 bg-green-600 rounded-lg">
                                    <Lightbulb className="h-6 w-6" />
                                  </div>
                                  <div>
                                    <h3 className="text-xl font-bold">Project Idea Details</h3>
                                    <div className="flex items-center gap-2 mt-2">
                                      <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 text-xs">
                                        {expandedGroupDetails.projectIdea.isCustomIdea ? '📝 Custom Idea' : '📋 From Supervisor List'}
                                      </Badge>
                                      <Badge className={`${getStatusColor(expandedGroupDetails.projectIdea.ideaStatus)} capitalize text-xs`}>
                                        {expandedGroupDetails.projectIdea.ideaStatus}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="p-6 space-y-5">
                              {/* Project Title */}
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <FolderKanban className="h-4 w-4 text-green-600" />
                                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Project Title</p>
                                </div>
                                <p className="text-xl font-bold text-slate-900">{expandedGroupDetails.projectIdea.title}</p>
                              </div>

                              {/* Description */}
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <FileText className="h-4 w-4 text-green-600" />
                                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                                    {expandedGroupDetails.projectIdea.description || 'No description provided'}
                                  </p>
                                </div>
                              </div>

                              {/* Supervisor Comment */}
                              {expandedGroupDetails.projectIdea.supervisorComment && (
                                <div className="bg-linear-to-br from-green-50 to-white border-l-4 border-green-600 rounded-r-lg p-4">
                                  <div className="flex items-start gap-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                      <FileText className="h-4 w-4 text-green-700" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-green-900 uppercase tracking-wide mb-1">Supervisor Feedback</p>
                                      <p className="text-slate-700">{expandedGroupDetails.projectIdea.supervisorComment}</p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Approval Section */}
                              {expandedGroupDetails.projectIdea.ideaStatus === 'pending' && (
                                <div className="border-t-2 border-dashed border-slate-300 pt-5 mt-4">
                                  <div className="flex items-center gap-2 mb-4">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    <h4 className="text-lg font-bold text-slate-900">Review & Approval</h4>
                                  </div>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        💬 Feedback Comments
                                        <span className="text-red-500 ml-1">*</span>
                                        <span className="text-slate-500 font-normal ml-1">(Required for rejection)</span>
                                      </label>
                                      <Textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Provide detailed feedback about the project idea..."
                                        rows={4}
                                        className="w-full border-slate-300 focus:border-green-500 focus:ring-green-500 rounded-lg"
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <Button
                                        onClick={handleApprove}
                                        disabled={submitting}
                                        className="h-12 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg"
                                      >
                                        {submitting ? (
                                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                        ) : (
                                          <CheckCircle2 className="h-5 w-5 mr-2" />
                                        )}
                                        ✓ Approve Idea
                                      </Button>
                                      <Button
                                        onClick={handleReject}
                                        disabled={submitting || !comment.trim()}
                                        className="h-12 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-lg"
                                      >
                                        {submitting ? (
                                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                        ) : (
                                          <XCircle className="h-5 w-5 mr-2" />
                                        )}
                                        ✗ Reject with Feedback
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}
              </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
