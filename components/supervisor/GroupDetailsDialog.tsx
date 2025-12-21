'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  User, 
  Mail, 
  CheckCircle, 
  XCircle, 
  Lightbulb,
  FileText,
  ChevronDown,
  ChevronUp,
  Loader2,
  FolderKanban,
  Crown
} from 'lucide-react';
import { GroupDetails } from '@/lib/types/supervisor.types';
import { supervisorApi } from '@/lib/api/supervisor.api';

interface GroupDetailsDialogProps {
  group: GroupDetails | null;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function GroupDetailsDialog({
  group,
  open,
  onClose,
  onUpdate,
}: GroupDetailsDialogProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  if (!group) return null;

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleApprove = async () => {
    if (!group.projectIdea) return;

    try {
      setLoading(true);
      const payload = comment ? { comment } : {};

      if (group.projectIdea.isCustomIdea) {
        await supervisorApi.approveCustomIdea(group.projectIdea.id || group.id, payload);
        toast.success('Custom idea approved successfully');
      } else {
        await supervisorApi.approveSelectedIdea(group.projectIdea.id || group.id, payload);
        toast.success('Project idea approved successfully');
      }

      setComment('');
      onUpdate();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve idea');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!group.projectIdea || !comment.trim()) {
      toast.error('Comment is required to reject an idea');
      return;
    }

    try {
      setLoading(true);
      const payload = { comment };

      if (group.projectIdea.isCustomIdea) {
        await supervisorApi.rejectCustomIdea(group.projectIdea.id || group.id, payload);
        toast.success('Custom idea rejected');
      } else {
        await supervisorApi.rejectSelectedIdea(group.projectIdea.id || group.id, payload);
        toast.success('Project idea rejected');
      }

      setComment('');
      onUpdate();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject idea');
    } finally {
      setLoading(false);
    }
  };

  // Get description from either custom idea or selected idea
  const description = group.projectIdea?.customIdeaDescription || group.projectIdea?.description || 'No description available';
  const truncatedDescription = description.length > 200 ? description.substring(0, 200) + '...' : description;

  // Get title from either custom idea or selected idea
  const projectTitle = group.projectIdea?.customIdeaTitle || group.projectIdea?.title || 'Untitled Project';
  
  // Debug log
  console.log('Project Idea Data:', {
    projectIdea: group.projectIdea,
    description,
    projectTitle,
    customIdeaDescription: group.projectIdea?.customIdeaDescription,
    regularDescription: group.projectIdea?.description
  });
  
  const isPending = group.projectIdea?.ideaStatus === 'pending';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-50">
        <DialogHeader className="border-b border-slate-200 pb-6 bg-white -mx-6 -mt-6 px-8 pt-6">
          <div className="flex items-start justify-between">
            <DialogTitle className="text-3xl font-bold flex items-center gap-4 text-slate-900">
              <div className="p-3 bg-green-50 rounded-xl">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  {group.name}
                </div>
                <p className="text-sm font-normal text-slate-500 mt-2">Complete group overview and project information</p>
              </div>
            </DialogTitle>
            <Badge className={`${getStatusColor(group.status)} text-sm px-4 py-2`}>
              {group.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6 px-2">
          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-linear-to-br from-slate-50 to-white rounded-xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-slate-100 rounded-lg">
                  <User className="h-5 w-5 text-slate-700" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900">{group.members.length}</p>
              <p className="text-sm text-slate-600 mt-1">Team Members</p>
            </div>
            <div className="bg-linear-to-br from-green-50 to-white rounded-xl p-5 border border-green-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-green-100 rounded-lg">
                  <FolderKanban className="h-5 w-5 text-green-700" />
                </div>
              </div>
              <p className="text-lg font-bold text-slate-900 truncate">{group.status}</p>
              <p className="text-sm text-slate-600 mt-1">Group Status</p>
            </div>
            <div className="bg-linear-to-br from-green-50 to-white rounded-xl p-5 border border-green-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-green-100 rounded-lg">
                  <Lightbulb className="h-5 w-5 text-green-700" />
                </div>
              </div>
              <p className="text-lg font-bold text-slate-900 truncate capitalize">
                {group.projectIdea?.ideaStatus || 'Not Submitted'}
              </p>
              <p className="text-sm text-slate-600 mt-1">Idea Status</p>
            </div>
            <div className="bg-linear-to-br from-slate-50 to-white rounded-xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-slate-100 rounded-lg">
                  <FileText className="h-5 w-5 text-slate-700" />
                </div>
              </div>
              <p className="text-lg font-bold text-slate-900 truncate">{group.projectIdea?.isCustomIdea ? 'Custom' : 'From List'}</p>
              <p className="text-sm text-slate-600 mt-1">Idea Type</p>
            </div>
          </div>

          {/* Team Information */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Users className="h-6 w-6 text-green-600" />
                Team Members
              </h3>
              <Badge variant="outline" className="text-slate-700">
                {group.members.length} {group.members.length === 1 ? 'Member' : 'Members'}
              </Badge>
            </div>
            
            {/* All Members List */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Leader First */}
              <div className="flex items-center gap-4 p-4 bg-linear-to-br from-green-50 to-slate-50 rounded-xl border-2 border-green-200 shadow-sm">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {group.leader.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-slate-900 truncate">{group.leader.name}</p>
                    <div className="flex items-center" title="Group Leader">
                      <Crown className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-500" />
                    <p className="text-sm text-slate-600 truncate">{group.leader.email}</p>
                  </div>
                </div>
              </div>
              
              {/* Other Members */}
              {group.members.filter(m => m.id !== group.leader.id).map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-green-300 hover:shadow-sm transition-all"
                >
                  <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
                    {member.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate mb-1">{member.name}</p>
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-slate-500" />
                      <p className="text-sm text-slate-600 truncate">{member.email}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Project Idea */}
          {group.projectIdea && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              {/* Idea Header */}
              <div className="bg-linear-to-r from-slate-700 to-slate-600 p-6 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-600 rounded-xl shadow-lg">
                      <Lightbulb className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-1">Project Idea Details</h3>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 text-sm">
                          {group.projectIdea.isCustomIdea ? '📝 Custom Idea' : '📋 From Supervisor List'}
                        </Badge>
                        <Badge className={`${getStatusColor(group.projectIdea.ideaStatus)} capitalize text-sm px-3 py-1`}>
                          {group.projectIdea.ideaStatus || 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Idea Content */}
              <div className="p-8 space-y-6">
                <div>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-green-50 rounded-lg mt-1">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Project Title</p>
                      <h4 className="text-2xl font-bold text-slate-900">
                        {projectTitle}
                      </h4>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-1 w-1 bg-green-600 rounded-full"></div>
                      <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Description</p>
                    </div>
                    <div className="bg-linear-to-br from-slate-50 to-white p-6 rounded-xl border-2 border-slate-200">
                      <p className="text-slate-700 leading-relaxed text-base whitespace-pre-wrap">
                        {showFullDescription ? description : truncatedDescription}
                      </p>
                      {!description || description === 'No description available' ? (
                        <p className="text-slate-400 italic text-center py-4">No description provided yet</p>
                      ) : null}
                    </div>
                    {description && description !== 'No description available' && description.length > 200 && (
                      <button
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        className="mt-4 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 font-semibold rounded-lg flex items-center gap-2 transition-all border border-green-200"
                      >
                        {showFullDescription ? (
                          <>
                            <ChevronUp className="h-4 w-4" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4" />
                            Read Full Description
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Supervisor Comment */}
                {group.projectIdea.supervisorComment && (
                  <div className="bg-linear-to-br from-green-50 to-white border-l-4 border-green-600 rounded-r-xl p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FileText className="h-5 w-5 text-green-700" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-green-900 mb-2 uppercase tracking-wide">Supervisor Feedback</p>
                        <p className="text-base text-slate-700 leading-relaxed">{group.projectIdea.supervisorComment}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Approval Section */}
                {isPending && (
                  <div className="border-t-2 border-dashed border-slate-300 pt-8 mt-6 space-y-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <h4 className="text-xl font-bold text-slate-900">Review & Approval</h4>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">
                        💬 Feedback Comments
                        <span className="text-red-500 ml-1" title="Required for rejection">*</span>
                        <span className="text-slate-500 font-normal ml-1">(Required for rejection)</span>
                      </label>
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Provide detailed feedback about the project idea, suggestions for improvement, or reasons for rejection..."
                        rows={5}
                        className="w-full border-slate-300 focus:border-green-500 focus:ring-green-500 rounded-xl text-base"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-5 pt-2">
                      <Button
                        onClick={handleApprove}
                        disabled={loading}
                        className="h-14 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all text-base"
                      >
                        {loading ? (
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        ) : (
                          <CheckCircle className="h-5 w-5 mr-2" />
                        )}
                        ✓ Approve Project Idea
                      </Button>
                      <Button
                        onClick={handleReject}
                        disabled={loading || !comment.trim()}
                        className="h-14 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all text-base bg-slate-700 hover:bg-slate-800 text-white"
                      >
                        {loading ? (
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        ) : (
                          <XCircle className="h-5 w-5 mr-2" />
                        )}
                        Reject with Feedback
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}
