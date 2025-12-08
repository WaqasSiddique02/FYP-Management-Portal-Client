export interface SupervisorDashboardData {
  assignedGroups: AssignedGroups;
  pendingWork: PendingWork;
  recentActivity: RecentActivity;
  documentSummary: DocumentSummary;
  evaluations: Evaluations;
  personalProjectIdeas: PersonalProjectIdeas;
}

export interface AssignedGroups {
  assignedGroupsCount: number;
  groups: Group[];
}

export interface Group {
  id: string;
  name: string;
  leader: GroupMember;
  members: GroupMember[];
  projectTitle: string;
  status: 'Active' | 'Completed' | 'On Hold' | 'Pending';
}

export interface GroupMember {
  id: string;
  name: string;
  email: string;
  rollNumber?: string;
}

export interface PendingWork {
  pendingProposalsCount: number;
  pendingDocumentsCount: number;
  pendingCustomIdeasCount: number;
  pendingSelectedIdeasCount: number;
  pendingFinalEvaluationsCount: number;
}

export interface RecentActivity {
  activities: Activity[];
}

export interface Activity {
  type: 'document_upload' | 'proposal_submission' | 'evaluation' | 'idea_submission' | 'group_formation';
  groupName: string;
  studentName?: string;
  details: string;
  timestamp: string;
}

export interface DocumentSummary {
  totalDocumentsReceived: number;
  documentsAwaitingReview: number;
}

export interface Evaluations {
  projectsNeedingGitHubEvaluation: number;
  projectsNeedingFinalEvaluation: number;
}

export interface PersonalProjectIdeas {
  totalIdeasCreated: number;
  activeIdeas: number;
  ideasSelected: number;
}

export interface SupervisorDashboardResponse {
  statusCode: number;
  message: string;
  data: SupervisorDashboardData;
  timestamp: string;
}

// Extended Group Details
export interface GroupDetails {
  id: string;
  name: string;
  leader: GroupMember;
  members: GroupMember[];
  projectTitle: string;
  projectIdea?: ProjectIdea;
  status: string;
  createdAt: string;
}

export interface ProjectIdea {
  id?: string;
  title: string;
  description: string;
  isCustomIdea: boolean;
  ideaStatus: 'pending' | 'approved' | 'rejected';
  supervisorComment?: string;
  customIdeaTitle?: string;
  customIdeaDescription?: string;
  selectedIdeaId?: string;
}

export interface ApproveIdeaPayload {
  comment?: string;
}

export interface RejectIdeaPayload {
  comment: string;
}

export interface GroupsListResponse {
  statusCode: number;
  message: string;
  data: {
    groups: GroupDetails[];
    total: number;
  };
  timestamp: string;
}

