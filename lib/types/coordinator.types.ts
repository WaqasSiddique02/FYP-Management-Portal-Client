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

// Announcement Types
export interface Announcement {
  _id: string;
  title: string;
  content: string;
  department: string;
  createdBy: AnnouncementCreator;
  createdAt: string;
  updatedAt: string;
  id: string;
}

export interface AnnouncementCreator {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface CreateAnnouncementDto {
  title: string;
  content: string;
  department: string;
}

export interface UpdateAnnouncementDto {
  title?: string;
  content?: string;
}

export interface AnnouncementResponse {
  message: string;
  announcement: Announcement;
}

export interface DeleteAnnouncementResponse {
  message: string;
}

// Evaluation Panel Types
export interface EvaluationPanel {
  _id: string;
  name: string;
  department: string;
  members: PanelMember[];
  createdBy: AnnouncementCreator;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  id: string;
}

export interface PanelMember {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  designation: string;
  department: string;
  specialization?: string;
}

export interface CreatePanelDto {
  name: string;
  department: string;
  members: string[];
  description?: string;
}

export interface UpdatePanelDto {
  name?: string;
  members?: string[];
  description?: string;
  isActive?: boolean;
}

export interface PanelResponse {
  message: string;
  panel: EvaluationPanel;
}

export interface DeletePanelResponse {
  message: string;
}

// Presentation Schedule Types
export interface PresentationSchedule {
  _id: string;
  group: ScheduleGroup;
  panel: SchedulePanel;
  date: string;
  timeSlot: string;
  room: string;
  department: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  id: string;
}

export interface ScheduleGroup {
  _id: string;
  name: string;
  leader: Student;
  members: Student[];
  department: string;
  id: string;
}

export interface SchedulePanel {
  _id: string;
  name: string;
  members: PanelMember[];
  id: string;
}

export interface CreateScheduleDto {
  groupId: string;
  panelId: string;
  date: string;
  timeSlot: string;
  room: string;
  department: string;
  notes?: string;
}

export interface UpdateScheduleDto {
  panelId?: string;
  date?: string;
  timeSlot?: string;
  room?: string;
  notes?: string;
}

export interface AutoScheduleDto {
  date: string;
  room: string;
  department: string;
  panelId: string;
}

export interface SwapScheduleDto {
  scheduleId1: string;
  scheduleId2: string;
}

export interface ScheduleResponse {
  message: string;
  schedule: PresentationSchedule;
}

export interface AutoScheduleResponse {
  message: string;
  totalGroupsScheduled: number;
  remainingGroups: number;
  schedules: PresentationSchedule[];
}

export interface SwapScheduleResponse {
  message: string;
  schedules: [PresentationSchedule, PresentationSchedule];
}

export interface DeleteScheduleResponse {
  message: string;
}

// Coordinator Profile Types
export interface CoordinatorProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phoneNumber: string;
  coordinatorId: string;
  department: CoordinatorDepartment;
  officeAddress: string;
  designation: string;
  createdAt: string;
  updatedAt: string;
  fullName: string;
  id: string;
}

export interface CoordinatorDepartment {
  _id: string;
  name: string;
  code: string;
  description: string;
  facultyList: string[];
  totalFaculty: number;
  totalStudents: number;
  createdAt: string;
  updatedAt: string;
  coordinator: string;
  id: string;
}

export interface CoordinatorProfileResponse {
  statusCode: number;
  message: string;
  data: CoordinatorProfile;
  timestamp: string;
}
