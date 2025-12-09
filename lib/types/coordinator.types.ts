export interface ProjectMonitoringData {
  statusCode: number;
  message: string;
  data: Project[];
  timestamp: string;
}

export interface Project {
  _id: string;
  group: ProjectGroup;
  supervisor: ProjectSupervisor;
  ideaStatus: 'pending' | 'approved' | 'rejected';
  isEvaluationComplete: boolean;
  department: string;
  createdAt: string;
  updatedAt: string;
  ideaApprovedAt?: string;
  supervisorFeedback?: string;
  githubRepositoryUrl?: string;
  githubEvaluatedAt?: string;
  githubFeedback?: string;
  githubMarks?: number;
  documentationMarks?: number;
  finalGithubMarks?: number;
  implementationMarks?: number;
  presentationMarks?: number;
  proposalMarks?: number;
  totalMarks?: number;
  finalFeedback?: string;
  evaluationCompletedAt?: string;
  selectedIdea: SelectedIdea;
  id: string;
}

export interface ProjectGroup {
  _id: string;
  name: string;
  leader: Student;
  members: Student[];
  department: string;
  createdAt: string;
  updatedAt: string;
  assignedSupervisor: string;
  id: string;
}

export interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  rollNumber: string;
  department: string;
  fullName: string;
  id: string;
}

export interface ProjectSupervisor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  designation: string;
  fullName: string;
  availableSlots: number | null;
  id: string;
}

export interface SelectedIdea {
  _id: string;
  title: string;
  description: string;
  technologies: string[];
  supervisor: string;
  department: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  id: string;
}

export interface ProjectDetailData {
  statusCode: number;
  message: string;
  data: Project;
  timestamp: string;
}
