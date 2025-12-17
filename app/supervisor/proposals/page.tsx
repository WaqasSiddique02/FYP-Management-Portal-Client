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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileText,
  Download,
  Search,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Loader2,
  Calendar,
  Users,
  Eye,
  FileDown,
  Clock,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface Proposal {
  _id: string;
  project?: {
    _id: string;
    group?: {
      _id: string;
      name: string;
      leader: any;
      members: any[];
    };
  };
  group?: string;
  fileName: string;
  filePath: string;
  fileSize?: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  supervisorFeedback?: string;
  submittedAt: string;
  reviewedAt?: string;
  uploadedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    fullName: string;
  };
}

export default function ProposalsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthContext();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [filteredProposals, setFilteredProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'view' | 'approve' | 'reject' | 'comment'>('view');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
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
      fetchProposals();
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    filterProposals();
  }, [searchQuery, statusFilter, proposals]);

  const getGroupName = (proposal: Proposal): string => {
    return proposal.project?.group?.name || 'Unknown Group';
  };

  const getProposalTitle = (proposal: Proposal): string => {
    return proposal.project?.group?.name ? `${proposal.project.group.name} - Proposal` : proposal.fileName;
  };

  const fetchProposals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await supervisorApi.getProposals();
      setProposals(data);
      setFilteredProposals(data);
    } catch (err: any) {
      console.error('Error fetching proposals:', err);
      setError(err.response?.data?.message || 'Failed to load proposals');
      setProposals([]);
      setFilteredProposals([]);
    } finally {
      setLoading(false);
    }
  };

  const filterProposals = () => {
    let filtered = [...proposals];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (proposal) => {
          const groupName = proposal.project?.group?.name || '';
          const title = getProposalTitle(proposal);
          return (
            title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            proposal.fileName.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        (proposal) => proposal.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredProposals(filtered);
  };

  const handleViewProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setDialogMode('view');
    setComment('');
    setIsDialogOpen(true);
  };

  const handleDownload = async (proposal: Proposal) => {
    try {
      // Construct the correct file URL
      const fileUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'}/${proposal.filePath.replace(/\\/g, '/')}`;
      
      // Create a link and trigger download
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = proposal.fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download proposal');
    }
  };

  const handleApprove = async () => {
    if (!selectedProposal) return;

    try {
      setSubmitting(true);
      const payload = comment ? { comments: comment } : {};
      await supervisorApi.approveProposal(selectedProposal._id, payload);
      alert('Proposal approved successfully');
      setIsDialogOpen(false);
      setComment('');
      fetchProposals();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to approve proposal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedProposal || !comment.trim()) {
      alert('Reason is required to reject a proposal');
      return;
    }

    try {
      setSubmitting(true);
      await supervisorApi.rejectProposal(selectedProposal._id, { reason: comment });
      alert('Proposal rejected');
      setIsDialogOpen(false);
      setComment('');
      fetchProposals();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to reject proposal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async () => {
    if (!selectedProposal || !comment.trim()) {
      alert('Comment cannot be empty');
      return;
    }

    try {
      setSubmitting(true);
      await supervisorApi.addProposalComment(selectedProposal._id, { comment });
      alert('Comment added successfully');
      setIsDialogOpen(false);
      setComment('');
      fetchProposals();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'draft':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <CheckCircle2 className="h-3 w-3" />;
      case 'rejected':
        return <XCircle className="h-3 w-3" />;
      case 'submitted':
        return <Clock className="h-3 w-3" />;
      case 'draft':
        return <FileText className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const statuses = ['all', 'submitted', 'approved', 'rejected'];

  if (authLoading || loading) {
    return (
      <DashboardLayout role="supervisor">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-slate-600">Loading proposals...</p>
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
            <p className="text-slate-900 font-semibold mb-2">Error Loading Proposals</p>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button
              onClick={fetchProposals}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
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
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Proposals</h1>
              <p className="text-green-100 text-sm md:text-base">
                Review and manage student group proposals
              </p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white/20 backdrop-blur-sm px-6 py-4 rounded-xl border border-white/30">
                <p className="text-3xl font-bold">{proposals.length}</p>
                <p className="text-xs text-green-100 mt-1">Total Proposals</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-6 py-4 rounded-xl border border-white/30">
                <p className="text-3xl font-bold">
                  {proposals.filter((p) => p.status === 'submitted').length}
                </p>
                <p className="text-xs text-green-100 mt-1">Awaiting Review</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search by title, group name, or file name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 border-slate-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="md:w-56">
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status === 'all' ? 'All Status' : getStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Proposals Grid */}
        {filteredProposals.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Proposals Found</h3>
              <p className="text-slate-500 text-center max-w-sm">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'No proposals have been submitted yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProposals.map((proposal) => (
              <Card key={proposal._id} className="hover:shadow-xl transition-all duration-300 border-slate-200 overflow-hidden group">
                <div className="bg-linear-to-br from-green-50 to-slate-50 p-3 border-b border-slate-200">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-slate-900 line-clamp-2 mb-1">
                        {getProposalTitle(proposal)}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Users className="h-3 w-3" />
                        <span className="font-medium">{getGroupName(proposal)}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(proposal.status)} flex items-center gap-1 w-fit`}>
                    {getStatusIcon(proposal.status)}
                    {getStatusLabel(proposal.status)}
                  </Badge>
                </div>

                <CardContent className="p-3 space-y-3">
                  {/* File Info */}
                  <div className="bg-slate-50 rounded-lg p-2 border border-slate-200">
                    <div className="flex items-center gap-1 mb-1">
                      <FileText className="h-3 w-3 text-green-600" />
                      <p className="text-xs font-semibold text-slate-700">File Name</p>
                    </div>
                    <p className="text-sm text-slate-900 truncate" title={proposal.fileName}>
                      {proposal.fileName}
                    </p>
                  </div>

                  {/* Submission Date */}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="h-3 w-3" />
                    Submitted {new Date(proposal.submittedAt).toLocaleDateString()}
                  </div>

                  {/* Supervisor Comment */}
                  {proposal.supervisorFeedback && (
                    <div className="bg-green-50 border-l-4 border-green-600 p-3 rounded-r">
                      <p className="text-xs font-semibold text-green-900 mb-1">Your Feedback</p>
                      <p className="text-sm text-slate-700 line-clamp-2">{proposal.supervisorFeedback}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button
                      onClick={() => handleDownload(proposal)}
                      variant="outline"
                      className="w-full border-green-600 text-green-600 hover:bg-green-50"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      onClick={() => handleViewProposal(proposal)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Review Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900">
                Review Proposal
              </DialogTitle>
              <DialogDescription>
                Review and provide feedback on this proposal submission
              </DialogDescription>
            </DialogHeader>

            {selectedProposal && (
              <div className="space-y-5">
                {/* Proposal Info */}
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Group Name
                      </label>
                      <p className="text-lg font-bold text-slate-900 mt-1">
                        {getGroupName(selectedProposal)}
                      </p>
                    </div>
                    
                    {selectedProposal.project?.group?.members && selectedProposal.project.group.members.length > 0 && (
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Group Members ({selectedProposal.project.group.members.length})
                        </label>
                        <ul className="mt-1 space-y-1">
                          {selectedProposal.project.group.members.map((member: any, index: number) => (
                            <li key={member._id || index} className="flex items-center gap-2 text-sm text-slate-700">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-600 shrink-0"></div>
                              <span>{member.fullName || `${member.firstName} ${member.lastName}`}</span>
                              {selectedProposal.project?.group?.leader?._id === member._id && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Leader</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Proposal Title
                    </label>
                    <p className="text-lg font-bold text-slate-900 mt-1">
                      {getProposalTitle(selectedProposal)}
                    </p>
                  </div>

                  {selectedProposal.uploadedBy && (
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Uploaded By
                      </label>
                      <p className="text-slate-900 mt-1">
                        {selectedProposal.uploadedBy.fullName}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Status
                      </label>
                      <div className="mt-1">
                        <Badge className={getStatusColor(selectedProposal.status)}>
                          {getStatusIcon(selectedProposal.status)}
                          <span className="ml-1">{getStatusLabel(selectedProposal.status)}</span>
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Submitted
                      </label>
                      <p className="text-slate-900 mt-1">
                        {new Date(selectedProposal.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      File Name
                    </label>
                    <p className="text-slate-900 mt-1 break-all">{selectedProposal.fileName}</p>
                  </div>
                </div>

                {/* Download Button */}
                <Button
                  onClick={() => handleDownload(selectedProposal)}
                  className="w-full bg-slate-700 hover:bg-slate-800 text-white h-12"
                >
                  <FileDown className="h-5 w-5 mr-2" />
                  Download Proposal Document
                </Button>

                {/* Previous Feedback */}
                {selectedProposal.supervisorFeedback && (
                  <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-r">
                    <p className="text-sm font-bold text-green-900 mb-2">Previous Feedback</p>
                    <p className="text-slate-700">{selectedProposal.supervisorFeedback}</p>
                  </div>
                )}

                {/* Action Section */}
                {dialogMode === 'view' && (
                  <div className="space-y-3 border-t pt-4">
                    <h4 className="font-bold text-slate-900 mb-3">Actions</h4>
                    
                    {selectedProposal.status === 'submitted' ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Button
                          onClick={() => setDialogMode('approve')}
                          className="bg-green-600 hover:bg-green-700 text-white h-12 flex items-center justify-center"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2 shrink-0" />
                          <span>Approve</span>
                        </Button>
                        <Button
                          onClick={() => setDialogMode('reject')}
                          className="bg-red-600 hover:bg-red-700 text-white h-12 flex items-center justify-center"
                        >
                          <XCircle className="h-4 w-4 mr-2 shrink-0" />
                          <span>Reject</span>
                        </Button>
                        <Button
                          onClick={() => setDialogMode('comment')}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white h-12 flex items-center justify-center whitespace-nowrap"
                        >
                          <MessageSquare className="h-4 w-4 mr-2 shrink-0" />
                          <span className="truncate">Request Revision</span>
                        </Button>
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                        <p className="text-slate-600 font-medium">This proposal has already been {selectedProposal.status.replace('_', ' ')}.</p>
                        <p className="text-sm text-slate-500 mt-1">No further actions available.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Approve Mode */}
                {dialogMode === 'approve' && (
                  <div className="space-y-4 bg-green-50 p-4 rounded-lg border-2 border-green-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                      <h4 className="font-bold text-green-900 text-lg">Approve Proposal</h4>
                    </div>
                    
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">
                        Approval Comments
                        <span className="text-slate-500 font-normal ml-1">(Optional)</span>
                      </label>
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add positive feedback or approval comments..."
                        rows={4}
                        className="border-green-300 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={handleApprove}
                        disabled={submitting}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12"
                      >
                        {submitting ? (
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5 mr-2" />
                        )}
                        Confirm Approval
                      </Button>
                      <Button
                        onClick={() => {
                          setDialogMode('view');
                          setComment('');
                        }}
                        variant="outline"
                        className="px-6"
                        disabled={submitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Reject Mode */}
                {dialogMode === 'reject' && (
                  <div className="space-y-4 bg-red-50 p-4 rounded-lg border-2 border-red-200">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-6 w-6 text-red-600" />
                      <h4 className="font-bold text-red-900 text-lg">Reject Proposal</h4>
                    </div>
                    
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">
                        Rejection Reason
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Provide detailed reasons for rejection..."
                        rows={4}
                        className="border-red-300 focus:border-red-500 focus:ring-red-500"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={handleReject}
                        disabled={submitting || !comment.trim()}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white h-12"
                      >
                        {submitting ? (
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        ) : (
                          <XCircle className="h-5 w-5 mr-2" />
                        )}
                        Confirm Rejection
                      </Button>
                      <Button
                        onClick={() => {
                          setDialogMode('view');
                          setComment('');
                        }}
                        variant="outline"
                        className="px-6"
                        disabled={submitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Comment Mode */}
                {dialogMode === 'comment' && (
                  <div className="space-y-4 bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-6 w-6 text-yellow-600" />
                      <h4 className="font-bold text-yellow-900 text-lg">Request Revision</h4>
                    </div>
                    
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">
                        Revision Comments
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Specify what needs to be revised or improved..."
                        rows={4}
                        className="border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={handleAddComment}
                        disabled={submitting || !comment.trim()}
                        className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white h-12"
                      >
                        {submitting ? (
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        ) : (
                          <MessageSquare className="h-5 w-5 mr-2" />
                        )}
                        Send Revision Request
                      </Button>
                      <Button
                        onClick={() => {
                          setDialogMode('view');
                          setComment('');
                        }}
                        variant="outline"
                        className="px-6"
                        disabled={submitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
