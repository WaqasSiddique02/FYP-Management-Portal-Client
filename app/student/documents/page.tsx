'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Upload,
  FileText,
  Github,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  User,
  Calendar,
  MessageSquare,
  File,
  ExternalLink,
} from 'lucide-react';
import { useAuthProtection } from '@/lib/hooks/useAuthProtection';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { documentAPI } from '@/lib/api/document.api';

interface Proposal {
  _id: string;
  fileName: string;
  filePath: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  uploadedBy?: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  reviewedAt?: string;
  supervisorFeedback?: string;
  version?: number;
  documentType?: string;
}

interface Document {
  _id: string;
  fileName: string;
  filePath: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedBy?: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
  supervisorFeedback?: string;
  documentType: string;
  description?: string;
  reviewedAt?: string;
}

interface GitHubSubmission {
  githubRepositoryUrl: string;
  githubMarks?: number;
  githubFeedback?: string;
  githubEvaluatedAt?: string;
  groupName?: string;
}

export default function DocumentsPage() {
  const { isChecking: authLoading } = useAuthProtection('STUDENT');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Proposal state
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [proposalFile, setProposalFile] = useState<File | null>(null);

  // Documents state
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('report');
  const [documentDescription, setDocumentDescription] = useState('');

  // GitHub state
  const [github, setGithub] = useState<GitHubSubmission | null>(null);
  const [githubUrl, setGithubUrl] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [documentsResponse, githubResponse] = await Promise.all([
        documentAPI.getMyDocuments().catch(() => ({ data: null })),
        documentAPI.getMyGithub().catch(() => ({ data: null })),
      ]);

      // Handle documents response
      const documentsData = documentsResponse.data?.data || documentsResponse.data || documentsResponse;
      const githubData = githubResponse.data?.github || githubResponse.github || githubResponse.data || null;

      console.log('Documents Response:', documentsData);
      console.log('GitHub Data:', githubData);

      // Separate proposal and documents
      let proposalDoc = null;
      let otherDocs: Document[] = [];

      if (documentsData) {
        if (Array.isArray(documentsData)) {
          proposalDoc = documentsData.find((doc: any) => doc.documentType === 'proposal') || null;
          otherDocs = documentsData.filter((doc: any) => doc.documentType !== 'proposal');
        } else if (documentsData.proposal) {
          proposalDoc = documentsData.proposal;
          otherDocs = documentsData.documents || [];
        }
      }

      setProposal(proposalDoc);
      setDocuments(otherDocs);
      setGithub(githubData);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleProposalUpload = async () => {
    if (!proposalFile) {
      setError('Please select a proposal file to upload');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      await documentAPI.uploadProposal(proposalFile);
      setSuccess('Proposal uploaded as draft. Click "Submit for Review" to send it to your supervisor.');
      setProposalFile(null);
      
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload proposal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProposalSubmit = async () => {
    if (!proposal?._id) {
      setError('No proposal found to submit');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      await documentAPI.submitProposal(proposal._id);
      setSuccess('Proposal submitted successfully! Your supervisor will review it soon.');
      
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit proposal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDocumentUpload = async () => {
    if (!documentFile) {
      setError('Please select a file');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      await documentAPI.uploadDocument(documentFile, documentType, documentDescription);
      setSuccess('Document uploaded successfully! Waiting for supervisor review.');
      setDocumentFile(null);
      setDocumentType('report');
      setDocumentDescription('');
      
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGithubSubmit = async () => {
    if (!githubUrl.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    if (!githubUrl.includes('github.com')) {
      setError('Please enter a valid GitHub URL');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      await documentAPI.submitGithub(githubUrl);
      setSuccess('GitHub repository submitted successfully!');
      setGithubUrl('');
      
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit GitHub URL');
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
      case 'submitted':
        return <Badge className="bg-blue-600 text-white"><Clock className="h-3 w-3 mr-1" />Submitted</Badge>;
      case 'pending':
      case 'draft':
      default:
        return <Badge className="bg-yellow-600 text-white"><Clock className="h-3 w-3 mr-1" />Pending Review</Badge>;
    }
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return 'N/A';
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return 'N/A';
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  const handleDownload = (filePath: string) => {
    const url = documentAPI.downloadFile(filePath);
    window.open(url, '_blank');
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

  const canUploadDocuments = proposal?.status === 'approved' || proposal?.status === 'submitted';

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Upload Documents</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Manage your proposal, documents, and GitHub repository
          </p>
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

        {/* Tabs */}
        <Tabs defaultValue="proposal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="proposal" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Proposal</span>
              <span className="sm:hidden">Proposal</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Documents</span>
              <span className="sm:hidden">Docs</span>
            </TabsTrigger>
            <TabsTrigger value="github" className="flex items-center gap-2">
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">GitHub</span>
              <span className="sm:hidden">GitHub</span>
            </TabsTrigger>
          </TabsList>

          {/* Proposal Tab */}
          <TabsContent value="proposal" className="space-y-6">
            {/* Existing Proposal */}
            {proposal && (
              <Card className={`border-2 shadow-md ${
                proposal.status === 'approved' ? 'border-green-500' :
                proposal.status === 'rejected' ? 'border-red-500' :
                proposal.status === 'submitted' ? 'border-blue-500' :
                'border-yellow-500'
              }`}>
                <CardHeader className={`border-b ${
                  proposal.status === 'approved' ? 'bg-green-50' :
                  proposal.status === 'rejected' ? 'bg-red-50' :
                  proposal.status === 'submitted' ? 'bg-blue-50' :
                  'bg-yellow-50'
                }`}>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Current Proposal {proposal.version && `(v${proposal.version})`}
                    </CardTitle>
                    {getStatusBadge(proposal.status)}
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs uppercase tracking-wider font-semibold text-gray-500">
                        File Name
                      </Label>
                      <p className="text-sm font-medium text-gray-900 mt-1">{proposal.fileName}</p>
                    </div>
                    {proposal.uploadedBy && (
                      <div>
                        <Label className="text-xs uppercase tracking-wider font-semibold text-gray-500">
                          Uploaded By
                        </Label>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {proposal.uploadedBy.firstName} {proposal.uploadedBy.lastName}
                        </p>
                      </div>
                    )}
                    <div>
                      <Label className="text-xs uppercase tracking-wider font-semibold text-gray-500">
                        Uploaded On
                      </Label>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {formatDate(proposal.createdAt)}
                      </p>
                    </div>
                    {proposal.submittedAt && (
                      <div>
                        <Label className="text-xs uppercase tracking-wider font-semibold text-gray-500">
                          Submitted On
                        </Label>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {formatDate(proposal.submittedAt)}
                        </p>
                      </div>
                    )}
                  </div>

                  {proposal.supervisorFeedback && (
                    <div className={`rounded-lg p-4 border ${
                      proposal.status === 'approved' ? 'bg-green-50 border-green-200' :
                      proposal.status === 'rejected' ? 'bg-red-50 border-red-200' :
                      'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 font-semibold" />
                        <Label className="text-sm font-semibold">
                          Supervisor Feedback
                        </Label>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{proposal.supervisorFeedback}</p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => handleDownload(proposal.filePath)}
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Proposal
                    </Button>
                    {proposal.status === 'draft' && (
                      <Button
                        onClick={handleProposalSubmit}
                        disabled={submitting}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Submit for Review
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {proposal?.status === 'draft' && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-900">
                        Proposal in Draft Mode
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Your proposal has been uploaded but not submitted yet. Click "Submit for Review" to send it to your supervisor.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upload New/Resubmit Proposal */}
            {(!proposal || proposal.status === 'rejected') && (
              <Card className="shadow-md">
                <CardHeader className="border-b bg-gray-50">
                  <CardTitle className="text-lg">
                    {proposal?.status === 'rejected' ? 'Resubmit Proposal' : 'Upload Proposal'}
                  </CardTitle>
                  <CardDescription>
                    {proposal?.status === 'rejected' 
                      ? 'Your proposal was rejected. Please review the feedback and upload an updated version.'
                      : 'Upload your FYP proposal document for supervisor review.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="proposal-file">Proposal Document (RAR only) *</Label>
                    <Input
                      id="proposal-file"
                      type="file"
                      accept=".rar"
                      onChange={(e) => setProposalFile(e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-gray-500">
                      Only RAR files are allowed (Max 10MB)
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      Important Guidelines
                    </h4>
                    <ul className="text-xs sm:text-sm text-blue-700 space-y-1 ml-6 list-disc">
                      <li>Your proposal will be reviewed by your supervisor</li>
                      <li>Include project objectives, methodology, and expected outcomes</li>
                      <li>Follow the standard proposal format provided by your department</li>
                      {proposal?.status === 'rejected' && (
                        <li className="font-semibold">Address all points mentioned in the supervisor's feedback</li>
                      )}
                    </ul>
                  </div>

                  <Button
                    onClick={handleProposalUpload}
                    disabled={!proposalFile || submitting}
                    className="w-full"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        {proposal?.status === 'rejected' ? 'Resubmit Proposal' : 'Upload Proposal'}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {proposal?.status === 'submitted' && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-blue-600 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">
                        Proposal Under Review
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Your proposal is currently being reviewed by your supervisor. You'll be notified once reviewed.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            {!canUploadDocuments ? (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="py-8 text-center">
                  <AlertCircle className="h-12 w-12 mx-auto text-yellow-600 mb-3" />
                  <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                    Proposal Approval Required
                  </h3>
                  <p className="text-sm text-yellow-700">
                    You need to get your proposal approved before uploading additional documents.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Upload Document Form */}
                <Card className="shadow-md">
                  <CardHeader className="border-b bg-gray-50">
                    <CardTitle className="text-lg">Upload Document</CardTitle>
                    <CardDescription>
                      Upload additional documents for your FYP project
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="doc-type">Document Type *</Label>
                      <select
                        id="doc-type"
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="presentation">Presentation</option>
                        <option value="report">Report</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="doc-description">Description (Optional)</Label>
                      <Textarea
                        id="doc-description"
                        placeholder="Brief description of the document"
                        value={documentDescription}
                        onChange={(e) => setDocumentDescription(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="doc-file">Document File (RAR only) *</Label>
                      <Input
                        id="doc-file"
                        type="file"
                        accept=".rar"
                        onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-gray-500">
                        Only RAR files are allowed (Max 10MB)
                      </p>
                    </div>

                    <Button
                      onClick={handleDocumentUpload}
                      disabled={!documentFile || submitting}
                      className="w-full"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Document
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Documents List */}
                {documents.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Uploaded Documents</h3>
                    {documents.map((doc) => (
                      <Card key={doc._id} className="shadow-md border-gray-200">
                        <CardHeader className="border-b bg-gray-50">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <CardTitle className="text-base flex items-center gap-2">
                                <File className="h-4 w-4" />
                                {doc.documentType.charAt(0).toUpperCase() + doc.documentType.slice(1)}
                              </CardTitle>
                              {doc.description && (
                                <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                              )}
                            </div>
                            {getStatusBadge(doc.status)}
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                          <div className="grid gap-3 sm:grid-cols-3 text-sm">
                            <div>
                              <Label className="text-xs uppercase tracking-wider font-semibold text-gray-500">
                                File Name
                              </Label>
                              <p className="text-sm font-medium text-gray-900 mt-1">{doc.fileName}</p>
                            </div>
                            {doc.uploadedBy && (
                              <div>
                                <Label className="text-xs uppercase tracking-wider font-semibold text-gray-500">
                                  Uploaded By
                                </Label>
                                <p className="text-sm font-medium text-gray-900 mt-1">
                                  {doc.uploadedBy.firstName} {doc.uploadedBy.lastName}
                                </p>
                              </div>
                            )}
                            <div>
                              <Label className="text-xs uppercase tracking-wider font-semibold text-gray-500">
                                Uploaded On
                              </Label>
                              <p className="text-sm font-medium text-gray-900 mt-1">
                                {formatDate(doc.createdAt)}
                              </p>
                            </div>
                          </div>

                          {doc.supervisorFeedback && (
                            <div className={`rounded-lg p-3 border ${
                              doc.status === 'approved' ? 'bg-green-50 border-green-200' :
                              'bg-red-50 border-red-200'
                            }`}>
                              <Label className="text-sm font-semibold mb-1 block items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Supervisor Feedback
                              </Label>
                              <p className="text-sm text-gray-700">{doc.supervisorFeedback}</p>
                            </div>
                          )}

                          <Button
                            onClick={() => handleDownload(doc.filePath)}
                            variant="outline"
                            size="sm"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {documents.length === 0 && (
                  <Card className="border-dashed border-2">
                    <CardContent className="py-12 text-center">
                      <File className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-600">No documents uploaded yet.</p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* GitHub Tab */}
          <TabsContent value="github" className="space-y-6">
            {/* Existing GitHub Submission */}
            {github && (
              <Card className="border-gray-200 shadow-md">
                <CardHeader className="border-b bg-gray-50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Github className="h-5 w-5" />
                    Submitted Repository
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <Label className="text-xs uppercase tracking-wider font-semibold text-gray-500">
                      Repository URL
                    </Label>
                    <div className="flex items-center gap-2 mt-2">
                      <a
                        href={github.githubRepositoryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 hover:underline font-medium text-sm break-all flex-1"
                      >
                        {github.githubRepositoryUrl}
                      </a>
                      <ExternalLink className="h-4 w-4 text-gray-400 shrink-0" />
                    </div>
                  </div>

                  {github.githubEvaluatedAt && (
                    <div>
                      <Label className="text-xs uppercase tracking-wider font-semibold text-gray-500">
                        Evaluated On
                      </Label>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {formatDate(github.githubEvaluatedAt)}
                      </p>
                    </div>
                  )}

                  {github.githubMarks !== undefined && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <Label className="text-sm font-semibold text-blue-900 mb-1 block">
                        Marks Awarded
                      </Label>
                      <p className="text-2xl font-bold text-blue-600">{github.githubMarks}/15</p>
                    </div>
                  )}

                  {github.githubFeedback && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <Label className="text-sm font-semibold mb-2 block items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Supervisor Feedback
                      </Label>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{github.githubFeedback}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Submit GitHub URL */}
            {!github && (
              <Card className="shadow-md">
                <CardHeader className="border-b bg-gray-50">
                  <CardTitle className="text-lg">Submit GitHub Repository</CardTitle>
                  <CardDescription>
                    Provide your project's GitHub repository URL for evaluation
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="github-url">GitHub Repository URL *</Label>
                    <Input
                      id="github-url"
                      type="url"
                      placeholder="https://github.com/username/repository"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      Make sure your repository is public or your supervisor has access
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      Repository Guidelines
                    </h4>
                    <ul className="text-xs sm:text-sm text-blue-700 space-y-1 ml-6 list-disc">
                      <li>Repository must be public or accessible to your supervisor</li>
                      <li>Include a comprehensive README.md file</li>
                      <li>Maintain regular commits showing development progress</li>
                      <li>Follow proper code organization and documentation standards</li>
                    </ul>
                  </div>

                  <Button
                    onClick={handleGithubSubmit}
                    disabled={!githubUrl.trim() || submitting}
                    className="w-full"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Github className="mr-2 h-4 w-4" />
                        Submit GitHub URL
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
