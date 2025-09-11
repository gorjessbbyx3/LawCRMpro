// Shared type definitions for the Legal CRM application

// Base entity interface
export interface BaseEntity {
  id: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

// User/Attorney related types
export interface UserProfile extends BaseEntity {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  barNumber?: string;
  phone?: string;
  avatar?: string;
  role: "attorney" | "paralegal" | "admin";
}

// Dashboard metrics type
export interface DashboardMetrics {
  activeCases: number;
  monthlyRevenue: string | number;
  billableHours: number;
  upcomingCourtDates: number;
  newClients: number;
  overdueInvoices: number;
  totalRevenue: number;
  averageHourlyRate: number;
}

// Time tracking related types
export interface TimeEntryWithCase {
  id: string;
  activity: string;
  description?: string;
  startTime: Date | string;
  endTime?: Date | string;
  duration?: number; // in minutes
  hourlyRate?: number;
  isBillable: boolean;
  isInvoiced: boolean;
  case?: {
    id: string;
    title: string;
    caseNumber: string;
  };
  client?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

// Calendar event with relations
export interface CalendarEventWithRelations {
  id: string;
  title: string;
  description?: string;
  startTime: Date | string;
  endTime: Date | string;
  eventType: string;
  location?: string;
  isAllDay: boolean;
  reminderMinutes?: number;
  status: string;
  case?: {
    id: string;
    title: string;
    caseNumber: string;
  };
  client?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

// Invoice with line items
export interface InvoiceWithDetails {
  id: string;
  invoiceNumber: string;
  issueDate: Date | string;
  dueDate: Date | string;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  paidAt?: Date | string;
  notes?: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
  case?: {
    id: string;
    title: string;
    caseNumber: string;
  };
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
}

// Case with all relations
export interface CaseWithRelations {
  id: string;
  caseNumber: string;
  title: string;
  description?: string;
  caseType: string;
  status: string;
  priority: string;
  progress?: number;
  nextAction?: string;
  nextActionDue?: Date | string;
  courtLocation?: string;
  opposingParty?: string;
  opposingCounsel?: string;
  statuteOfLimitations?: Date | string;
  estimatedValue?: number;
  createdAt: Date | string;
  updatedAt?: Date | string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
  assignedAttorney?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  timeEntries: TimeEntryWithCase[];
  documents: Array<{
    id: string;
    name: string;
    documentType?: string;
    createdAt: Date | string;
  }>;
  calendarEvents: CalendarEventWithRelations[];
}

// Document with metadata
export interface DocumentWithMetadata {
  id: string;
  name: string;
  filename: string;
  filePath: string;
  fileSize?: number;
  mimeType?: string;
  documentType?: string;
  isTemplate: boolean;
  version: number;
  tags?: string[];
  createdAt: Date | string;
  uploadedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  case?: {
    id: string;
    title: string;
    caseNumber: string;
  };
  client?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

// Message with relations
export interface MessageWithDetails {
  id: string;
  subject?: string;
  content: string;
  messageType: string;
  status?: string;
  isRead: boolean;
  sentAt?: Date | string;
  readAt?: Date | string;
  recipientEmail?: string;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  case?: {
    id: string;
    title: string;
    caseNumber: string;
  };
}

// AI conversation with context
export interface AIConversationWithContext {
  id: string;
  query: string;
  response: string;
  context?: Record<string, any>;
  createdAt: Date | string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  case?: {
    id: string;
    title: string;
    caseNumber: string;
  };
}

// Form validation types
export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea" | "select" | "date" | "number" | "checkbox";
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

// Search and filter types
export interface SearchFilters {
  query?: string;
  status?: string;
  type?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  clientId?: string;
  caseId?: string;
  attorneyId?: string;
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Analytics and reporting types
export interface RevenueAnalytics {
  totalRevenue: number;
  pendingRevenue: number;
  overdueRevenue: number;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
  }>;
  revenueByCase: Array<{
    caseId: string;
    caseTitle: string;
    revenue: number;
  }>;
}

export interface TimeAnalytics {
  totalBillableHours: number;
  totalNonBillableHours: number;
  averageHourlyRate: number;
  timeByActivity: Array<{
    activity: string;
    hours: number;
    percentage: number;
  }>;
  timeByCase: Array<{
    caseId: string;
    caseTitle: string;
    hours: number;
  }>;
}

export interface CaseAnalytics {
  totalCases: number;
  activeCases: number;
  closedCases: number;
  casesByType: Array<{
    type: string;
    count: number;
  }>;
  casesByStatus: Array<{
    status: string;
    count: number;
  }>;
  averageCaseDuration: number; // in days
}

export interface ClientAnalytics {
  totalClients: number;
  activeClients: number;
  newClientsThisMonth: number;
  clientAcquisition: Array<{
    month: string;
    count: number;
  }>;
  topClients: Array<{
    clientId: string;
    clientName: string;
    revenue: number;
    cases: number;
  }>;
}

// Hawaii-specific compliance types
export interface ComplianceDeadline {
  id: string;
  title: string;
  description?: string;
  dueDate: Date | string;
  deadlineType: "bar_requirement" | "court_filing" | "ethics" | "continuing_education";
  status: "pending" | "completed" | "overdue";
  priority: "low" | "medium" | "high" | "urgent";
  caseId?: string;
  completedAt?: Date | string;
  createdAt: Date | string;
}

export interface ComplianceReport {
  overdueCount: number;
  pendingCount: number;
  completedCount: number;
  upcomingDeadlines: ComplianceDeadline[];
  barRequirements: ComplianceDeadline[];
  cleRequirements: ComplianceDeadline[];
  ethicsRequirements: ComplianceDeadline[];
}

// Notification types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  priority: "low" | "medium" | "high";
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date | string;
}

// API response types
export interface APIResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface APIError {
  message: string;
  code?: string;
  details?: any;
}

// Theme and UI types
export interface ThemeConfig {
  mode: "light" | "dark" | "system";
  primaryColor: string;
  accentColor: string;
  borderRadius: number;
  fontSize: "small" | "medium" | "large";
}

export interface UIState {
  sidebarOpen: boolean;
  activeSection: string;
  notifications: Notification[];
  theme: ThemeConfig;
}

// Export utility type helpers
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

// Status and option types from constants
export type CaseStatus = "active" | "pending" | "closed" | "archived";
export type ClientStatus = "active" | "inactive" | "archived";
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";
export type MessageStatus = "draft" | "sent" | "delivered" | "read";
export type CalendarEventStatus = "scheduled" | "confirmed" | "cancelled" | "completed";
export type Priority = "low" | "medium" | "high" | "urgent";
export type CaseType = keyof typeof import("./constants").CASE_TYPES;
export type ActivityType = keyof typeof import("./constants").ACTIVITY_TYPES;
export type DocumentType = keyof typeof import("./constants").DOCUMENT_TYPES;
export type EventType = keyof typeof import("./constants").EVENT_TYPES;
export type MessageType = keyof typeof import("./constants").MESSAGE_TYPES;
export type ComplianceDeadlineType = keyof typeof import("./constants").COMPLIANCE_DEADLINE_TYPES;
