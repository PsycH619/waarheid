import { Timestamp } from 'firebase/firestore';

export type UserRole = 'admin' | 'client';

export type ProjectStatus = 'pending' | 'in_progress' | 'on_hold' | 'completed';

export type AppointmentStatus = 'scheduled' | 'cancelled' | 'completed';

export type MessageSenderType = 'client' | 'admin' | 'ai' | 'system';

export type ActivityType =
  | 'status_change'
  | 'comment'
  | 'file_upload'
  | 'created'
  | 'updated'
  | 'deadline_changed'
  | 'budget_changed';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  phone?: string;
  company?: string;
  avatar?: string;
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

export interface Project {
  id: string;
  clientId: string;
  title: string;
  description: string;
  status: ProjectStatus;
  budget?: number;
  deadline?: Timestamp | Date;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  tags?: string[];
  files?: ProjectFile[];
}

export interface ProjectFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedBy: string;
  uploadedAt: Timestamp | Date;
}

export interface ProjectActivity {
  id: string;
  projectId: string;
  type: ActivityType;
  message: string;
  userId: string;
  userName?: string;
  metadata?: Record<string, any>;
  createdAt: Timestamp | Date;
}

export interface Conversation {
  id: string;
  clientId: string;
  projectId?: string;
  isClosed: boolean;
  lastMessage?: string;
  lastMessageAt?: Timestamp | Date;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderType: MessageSenderType;
  text: string;
  attachments?: MessageAttachment[];
  createdAt: Timestamp | Date;
  read?: boolean;
}

export interface MessageAttachment {
  name: string;
  url: string;
  type: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  adminId?: string;
  projectId?: string;
  projectTitle?: string;
  title: string;
  description?: string;
  startTime: Timestamp | Date;
  endTime: Timestamp | Date;
  googleMeetLink?: string;
  googleEventId?: string;
  status: AppointmentStatus;
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

export interface ContactFormSubmission {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  subject?: string;
  createdAt: Timestamp | Date;
  status?: 'new' | 'contacted' | 'converted';
}

export interface AIConversation {
  id: string;
  userId: string;
  messages: AIMessage[];
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Timestamp | Date;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  company?: string;
  phone?: string;
}

export interface ProjectFormData {
  title: string;
  description: string;
  clientId: string;
  status: ProjectStatus;
  budget?: number;
  deadline?: Date;
  tags?: string[];
}

export interface AppointmentFormData {
  title: string;
  description?: string;
  projectId?: string;
  startTime: Date;
  duration: number; // in minutes
}

// Stats & Analytics
export interface DashboardStats {
  totalClients?: number;
  activeProjects?: number;
  completedProjects?: number;
  upcomingAppointments?: number;
  projectsByStatus?: Record<ProjectStatus, number>;
}
