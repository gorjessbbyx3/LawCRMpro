import { sql } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  integer, 
  timestamp, 
  decimal, 
  boolean, 
  jsonb,
  uuid,
  date
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Users/Attorneys table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().default("attorney"), // attorney, secretary, paralegal, admin
  barNumber: text("bar_number"),
  phone: text("phone"),
  avatar: text("avatar"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Clients table
export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  dateOfBirth: date("date_of_birth"),
  notes: text("notes"),
  status: text("status").notNull().default("active"), // active, inactive, archived
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Cases table
export const cases = pgTable("cases", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  caseNumber: text("case_number").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  caseType: text("case_type").notNull(), // personal_injury, business_law, estate_planning, etc.
  status: text("status").notNull().default("active"), // active, pending, closed, archived
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  clientId: uuid("client_id").references(() => clients.id),
  assignedAttorneyId: uuid("assigned_attorney_id").references(() => users.id),
  courtLocation: text("court_location"),
  opposingParty: text("opposing_party"),
  opposingCounsel: text("opposing_counsel"),
  statuteOfLimitations: date("statute_of_limitations"),
  estimatedValue: decimal("estimated_value", { precision: 10, scale: 2 }),
  progress: integer("progress").default(0), // 0-100
  nextAction: text("next_action"),
  nextActionDue: date("next_action_due"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Time entries table
export const timeEntries = pgTable("time_entries", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  caseId: uuid("case_id").references(() => cases.id),
  attorneyId: uuid("attorney_id").references(() => users.id),
  activity: text("activity").notNull(), // research, client_call, court_time, document_review, etc.
  utbmsCode: text("utbms_code"), // UTBMS codes: L110, L120, L310, etc.
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  pausedAt: timestamp("paused_at"), // When timer was paused
  pausedDuration: integer("paused_duration").default(0), // Total minutes paused
  isPaused: boolean("is_paused").default(false), // Current pause state
  duration: integer("duration"), // in minutes
  roundedDuration: integer("rounded_duration"), // Duration after 6-minute rounding
  hourlyRate: decimal("hourly_rate", { precision: 8, scale: 2 }),
  isBillable: boolean("is_billable").default(true),
  status: text("status").default("draft"), // draft, ready_to_bill, invoiced, paid
  invoiceId: uuid("invoice_id").references(() => invoices.id),
  calendarEventId: uuid("calendar_event_id").references(() => calendarEvents.id, { onDelete: "set null" }), // Linked calendar event
  isInvoiced: boolean("is_invoiced").default(false),
  editHistory: jsonb("edit_history"), // Audit trail for compliance
  createdAt: timestamp("created_at").defaultNow()
});

// Invoices table
export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNumber: text("invoice_number").notNull().unique(),
  clientId: uuid("client_id").references(() => clients.id),
  caseId: uuid("case_id").references(() => cases.id),
  issueDate: date("issue_date").notNull(),
  dueDate: date("due_date").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("draft"), // draft, sent, paid, overdue, cancelled
  paidAt: timestamp("paid_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});

// Invoice line items
export const invoiceItems = pgTable("invoice_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: uuid("invoice_id").references(() => invoices.id),
  timeEntryId: uuid("time_entry_id").references(() => timeEntries.id),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 8, scale: 2 }).default("1"),
  rate: decimal("rate", { precision: 8, scale: 2 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull()
});

// Documents table
export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  filename: text("filename").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  caseId: uuid("case_id").references(() => cases.id),
  clientId: uuid("client_id").references(() => clients.id),
  uploadedById: uuid("uploaded_by_id").references(() => users.id),
  documentType: text("document_type"), // contract, motion, correspondence, evidence, etc.
  isTemplate: boolean("is_template").default(false),
  version: integer("version").default(1),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow()
});

// Calendar events
// Note: Indexes for event source tracking are applied via db/migrations/001_calendar_event_indexes.sql
export const calendarEvents = pgTable("calendar_events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  eventType: text("event_type").notNull(), // court_date, meeting, deadline, consultation
  sourceType: text("source_type"), // manual, time_entry, case_milestone, ai_suggested
  sourceId: uuid("source_id"), // Foreign key to source record
  caseId: uuid("case_id").references(() => cases.id),
  clientId: uuid("client_id").references(() => clients.id),
  attendeeIds: uuid("attendee_ids").array(),
  location: text("location"),
  isAllDay: boolean("is_all_day").default(false),
  reminderMinutes: integer("reminder_minutes").default(15),
  status: text("status").default("scheduled"), // scheduled, confirmed, cancelled, completed
  createdAt: timestamp("created_at").defaultNow()
});

// Messages/Communications
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  subject: text("subject"),
  content: text("content").notNull(),
  senderId: uuid("sender_id").references(() => users.id),
  recipientId: uuid("recipient_id"),
  recipientEmail: text("recipient_email"),
  caseId: uuid("case_id").references(() => cases.id),
  messageType: text("message_type").notNull(), // email, sms, internal
  status: text("status").default("sent"), // draft, sent, delivered, read
  isRead: boolean("is_read").default(false),
  sentAt: timestamp("sent_at").defaultNow(),
  readAt: timestamp("read_at")
});

// AI Assistant conversations
export const aiConversations = pgTable("ai_conversations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id),
  caseId: uuid("case_id").references(() => cases.id),
  query: text("query").notNull(),
  response: text("response").notNull(),
  context: jsonb("context"), // Additional context data
  createdAt: timestamp("created_at").defaultNow()
});

// Compliance deadlines (Hawaii-specific)
export const complianceDeadlines = pgTable("compliance_deadlines", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: date("due_date").notNull(),
  deadlineType: text("deadline_type").notNull(), // bar_requirement, court_filing, ethics, continuing_education
  caseId: uuid("case_id").references(() => cases.id),
  status: text("status").default("pending"), // pending, completed, overdue
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow()
});

// Rate tables - Different rates by attorney, activity, or client
export const rateTables = pgTable("rate_tables", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // e.g., "Senior Partner Rate", "Court Appearance Rate"
  attorneyId: uuid("attorney_id").references(() => users.id), // Attorney-specific rate
  clientId: uuid("client_id").references(() => clients.id), // Client-specific rate
  activityType: text("activity_type"), // Activity-specific rate
  utbmsCode: text("utbms_code"), // UTBMS code-specific rate
  hourlyRate: decimal("hourly_rate", { precision: 8, scale: 2 }).notNull(),
  isDefault: boolean("is_default").default(false),
  effectiveDate: date("effective_date").notNull(),
  expirationDate: date("expiration_date"),
  createdAt: timestamp("created_at").defaultNow()
});

// Activity templates - Pre-configured time entry templates
export const activityTemplates = pgTable("activity_templates", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // e.g., "Client Phone Call"
  activityType: text("activity_type").notNull(),
  utbmsCode: text("utbms_code"), // Default UTBMS code
  description: text("description"), // Default description template
  defaultDuration: integer("default_duration"), // Default duration in minutes
  defaultRate: decimal("default_rate", { precision: 8, scale: 2 }),
  isBillable: boolean("is_billable").default(true),
  attorneyId: uuid("attorney_id").references(() => users.id), // Template owner (null = shared)
  isShared: boolean("is_shared").default(false), // Available to all attorneys
  createdAt: timestamp("created_at").defaultNow()
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  cases: many(cases),
  timeEntries: many(timeEntries),
  documents: many(documents),
  sentMessages: many(messages),
  aiConversations: many(aiConversations)
}));

export const clientsRelations = relations(clients, ({ many }) => ({
  cases: many(cases),
  invoices: many(invoices),
  documents: many(documents),
  calendarEvents: many(calendarEvents)
}));

export const casesRelations = relations(cases, ({ one, many }) => ({
  client: one(clients, {
    fields: [cases.clientId],
    references: [clients.id]
  }),
  assignedAttorney: one(users, {
    fields: [cases.assignedAttorneyId],
    references: [users.id]
  }),
  timeEntries: many(timeEntries),
  invoices: many(invoices),
  documents: many(documents),
  calendarEvents: many(calendarEvents),
  messages: many(messages),
  complianceDeadlines: many(complianceDeadlines)
}));

export const timeEntriesRelations = relations(timeEntries, ({ one }) => ({
  case: one(cases, {
    fields: [timeEntries.caseId],
    references: [cases.id]
  }),
  attorney: one(users, {
    fields: [timeEntries.attorneyId],
    references: [users.id]
  }),
  invoice: one(invoices, {
    fields: [timeEntries.invoiceId],
    references: [invoices.id]
  })
}));

export const rateTablesRelations = relations(rateTables, ({ one }) => ({
  attorney: one(users, {
    fields: [rateTables.attorneyId],
    references: [users.id]
  }),
  client: one(clients, {
    fields: [rateTables.clientId],
    references: [clients.id]
  })
}));

export const activityTemplatesRelations = relations(activityTemplates, ({ one }) => ({
  attorney: one(users, {
    fields: [activityTemplates.attorneyId],
    references: [users.id]
  })
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  client: one(clients, {
    fields: [invoices.clientId],
    references: [clients.id]
  }),
  case: one(cases, {
    fields: [invoices.caseId],
    references: [cases.id]
  }),
  items: many(invoiceItems)
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id]
  }),
  timeEntry: one(timeEntries, {
    fields: [invoiceItems.timeEntryId],
    references: [timeEntries.id]
  })
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertCaseSchema = createInsertSchema(cases).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertTimeEntrySchema = createInsertSchema(timeEntries).omit({
  id: true,
  createdAt: true
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true
});

export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({
  id: true,
  createdAt: true
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  sentAt: true
});

export const insertAiConversationSchema = createInsertSchema(aiConversations).omit({
  id: true,
  createdAt: true
});

export const insertRateTableSchema = createInsertSchema(rateTables).omit({
  id: true,
  createdAt: true
});

export const insertActivityTemplateSchema = createInsertSchema(activityTemplates).omit({
  id: true,
  createdAt: true
});

export const insertInvoiceItemSchema = createInsertSchema(invoiceItems).omit({
  id: true
});

export const insertComplianceDeadlineSchema = createInsertSchema(complianceDeadlines).omit({
  id: true,
  createdAt: true
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Case = typeof cases.$inferSelect;
export type InsertCase = z.infer<typeof insertCaseSchema>;

export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = z.infer<typeof insertTimeEntrySchema>;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type AiConversation = typeof aiConversations.$inferSelect;
export type InsertAiConversation = z.infer<typeof insertAiConversationSchema>;

export type RateTable = typeof rateTables.$inferSelect;
export type InsertRateTable = z.infer<typeof insertRateTableSchema>;

export type ActivityTemplate = typeof activityTemplates.$inferSelect;
export type InsertActivityTemplate = z.infer<typeof insertActivityTemplateSchema>;

export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;

export type ComplianceDeadline = typeof complianceDeadlines.$inferSelect;
export type InsertComplianceDeadline = z.infer<typeof insertComplianceDeadlineSchema>;
