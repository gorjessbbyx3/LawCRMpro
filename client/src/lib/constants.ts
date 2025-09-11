// Application-wide constants
export const APP_CONFIG = {
  name: "LegalCRM Pro",
  tagline: "Hawaii Law Practice",
  version: "1.0.0",
  author: "Legal Tech Solutions",
} as const;

// Date and time formats
export const DATE_FORMATS = {
  short: "MMM d, yyyy",
  long: "MMMM d, yyyy",
  dateTime: "MMM d, yyyy 'at' h:mm a",
  time: "h:mm a",
  iso: "yyyy-MM-dd",
  fileTimestamp: "yyyyMMdd_HHmmss",
} as const;

// API endpoints
export const API_ENDPOINTS = {
  dashboard: "/api/dashboard/metrics",
  clients: "/api/clients",
  cases: "/api/cases", 
  timeEntries: "/api/time-entries",
  invoices: "/api/invoices",
  documents: "/api/documents",
  calendarEvents: "/api/calendar/events",
  messages: "/api/messages",
  aiChat: "/api/ai/chat",
  aiConversations: "/api/ai/conversations",
} as const;

// Status options for various entities
export const STATUS_OPTIONS = {
  case: {
    active: "Active",
    pending: "Pending",
    closed: "Closed",
    archived: "Archived",
  },
  client: {
    active: "Active", 
    inactive: "Inactive",
    archived: "Archived",
  },
  invoice: {
    draft: "Draft",
    sent: "Sent", 
    paid: "Paid",
    overdue: "Overdue",
    cancelled: "Cancelled",
  },
  message: {
    draft: "Draft",
    sent: "Sent",
    delivered: "Delivered", 
    read: "Read",
  },
  calendarEvent: {
    scheduled: "Scheduled",
    confirmed: "Confirmed",
    cancelled: "Cancelled",
    completed: "Completed",
  },
} as const;

// Priority levels
export const PRIORITY_OPTIONS = {
  low: "Low",
  medium: "Medium", 
  high: "High",
  urgent: "Urgent",
} as const;

// Case types common in Hawaii legal practice
export const CASE_TYPES = {
  personal_injury: "Personal Injury",
  business_law: "Business Law", 
  estate_planning: "Estate Planning",
  family_law: "Family Law",
  real_estate: "Real Estate",
  criminal_defense: "Criminal Defense",
  immigration: "Immigration",
  employment_law: "Employment Law",
  contract_disputes: "Contract Disputes",
  intellectual_property: "Intellectual Property",
} as const;

// Time tracking activity types
export const ACTIVITY_TYPES = {
  legal_research: "Legal Research",
  client_meeting: "Client Meeting",
  court_appearance: "Court Appearance", 
  document_review: "Document Review",
  phone_call: "Phone Call",
  administrative: "Administrative",
  case_preparation: "Case Preparation",
  correspondence: "Correspondence",
  travel_time: "Travel Time",
  consultation: "Consultation",
} as const;

// Document types
export const DOCUMENT_TYPES = {
  contract: "Contract",
  motion: "Motion",
  correspondence: "Correspondence",
  evidence: "Evidence", 
  brief: "Brief",
  pleading: "Pleading",
  discovery: "Discovery",
  settlement: "Settlement",
  court_order: "Court Order",
  template: "Template",
} as const;

// Calendar event types
export const EVENT_TYPES = {
  court_date: "Court Date",
  meeting: "Meeting",
  deadline: "Deadline",
  consultation: "Consultation",
  deposition: "Deposition", 
  mediation: "Mediation",
  conference: "Conference",
} as const;

// Message types
export const MESSAGE_TYPES = {
  email: "Email",
  sms: "SMS",
  internal: "Internal",
} as const;

// Hawaii-specific compliance deadline types
export const COMPLIANCE_DEADLINE_TYPES = {
  bar_requirement: "Bar Requirement",
  court_filing: "Court Filing",
  ethics: "Ethics Compliance",
  continuing_education: "Continuing Education",
} as const;

// Color schemes for different priorities and statuses
export const COLOR_SCHEMES = {
  status: {
    active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
    closed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100",
    completed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  },
  priority: {
    low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    medium: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100", 
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
    urgent: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
  },
} as const;

// Default pagination settings
export const PAGINATION = {
  defaultPageSize: 25,
  pageSizeOptions: [10, 25, 50, 100],
} as const;

// File upload constraints
export const FILE_UPLOAD = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    "application/pdf",
    "application/msword", 
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "image/jpeg",
    "image/png",
    "image/gif",
  ],
  maxFiles: 5,
} as const;

// Timer and time tracking constants
export const TIME_TRACKING = {
  defaultHourlyRate: 250, // Default hourly rate in dollars
  reminderInterval: 15, // Minutes between timer reminders
  autoSaveInterval: 60, // Seconds between auto-saves
  maxContinuousHours: 12, // Maximum continuous tracking hours
} as const;

// Hawaii-specific legal resources
export const HAWAII_RESOURCES = {
  courtSystem: "https://www.courts.state.hi.us",
  stateBar: "https://hsba.org",
  ethics: "https://hsba.org/Ethics",
  cle: "https://hsba.org/CLE", 
  statutes: "https://www.capitol.hawaii.gov/hrscurrent/",
  rules: "https://www.courts.state.hi.us/courts/rules",
} as const;

// Export all constants as a single object for easy importing
export const CONSTANTS = {
  APP_CONFIG,
  DATE_FORMATS,
  API_ENDPOINTS,
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  CASE_TYPES,
  ACTIVITY_TYPES,
  DOCUMENT_TYPES,
  EVENT_TYPES,
  MESSAGE_TYPES,
  COMPLIANCE_DEADLINE_TYPES,
  COLOR_SCHEMES,
  PAGINATION,
  FILE_UPLOAD,
  TIME_TRACKING,
  HAWAII_RESOURCES,
} as const;
