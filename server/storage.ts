import { 
  users, clients, cases, timeEntries, invoices, invoiceItems, 
  documents, calendarEvents, messages, aiConversations, complianceDeadlines,
  rateTables, activityTemplates,
  type User, type InsertUser, type Client, type InsertClient,
  type Case, type InsertCase, type TimeEntry, type InsertTimeEntry,
  type Invoice, type InsertInvoice, type Document, type InsertDocument,
  type CalendarEvent, type InsertCalendarEvent, type Message, type InsertMessage,
  type AiConversation, type InsertAiConversation,
  type RateTable, type InsertRateTable, type ActivityTemplate, type InsertActivityTemplate
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, like, or, sql, isNull, inArray } from "drizzle-orm";
import { roundToIncrement } from "@shared/utbmsCodes";

export interface IStorage {
  // Users
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  deleteUser(id: string): Promise<void>;

  // Clients
  getClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client>;
  deleteClient(id: string): Promise<void>;

  // Cases
  getCases(): Promise<Case[]>;
  getCase(id: string): Promise<Case | undefined>;
  getCasesByClient(clientId: string): Promise<Case[]>;
  createCase(caseData: InsertCase): Promise<Case>;
  updateCase(id: string, caseData: Partial<InsertCase>): Promise<Case>;
  deleteCase(id: string): Promise<void>;

  // Time Entries
  getTimeEntries(): Promise<TimeEntry[]>;
  getTimeEntry(id: string): Promise<TimeEntry | undefined>;
  getTimeEntriesByCase(caseId: string): Promise<TimeEntry[]>;
  getActiveTimeEntry(attorneyId: string): Promise<TimeEntry | undefined>;
  createTimeEntry(timeEntry: InsertTimeEntry): Promise<TimeEntry>;
  updateTimeEntry(id: string, timeEntry: Partial<InsertTimeEntry>): Promise<TimeEntry>;
  deleteTimeEntry(id: string): Promise<void>;

  // Invoices
  getInvoices(): Promise<Invoice[]>;
  getInvoice(id: string): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, invoice: Partial<InsertInvoice>): Promise<Invoice>;

  // Documents
  getDocuments(): Promise<Document[]>;
  getDocument(id: string): Promise<Document | undefined>;
  getDocumentsByCase(caseId: string): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: string): Promise<void>;

  // Calendar Events
  getCalendarEvents(): Promise<CalendarEvent[]>;
  getCalendarEvent(id: string): Promise<CalendarEvent | undefined>;
  getCalendarEventsByDateRange(startDate: Date, endDate: Date): Promise<CalendarEvent[]>;
  createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
  updateCalendarEvent(id: string, event: Partial<InsertCalendarEvent>): Promise<CalendarEvent>;
  deleteCalendarEvent(id: string): Promise<void>;

  // Messages
  getMessages(): Promise<Message[]>;
  getMessage(id: string): Promise<Message | undefined>;
  getMessagesByCase(caseId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: string): Promise<void>;

  // AI Conversations
  getAiConversations(userId: string): Promise<AiConversation[]>;
  createAiConversation(conversation: InsertAiConversation): Promise<AiConversation>;

  // Dashboard metrics
  getDashboardMetrics(): Promise<{
    activeCases: number;
    monthlyRevenue: string;
    billableHours: number;
    upcomingCourtDates: number;
  }>;

  // Enhanced Time Entry methods
  pauseTimeEntry(id: string): Promise<TimeEntry>;
  resumeTimeEntry(id: string): Promise<TimeEntry>;
  stopTimeEntry(id: string): Promise<TimeEntry>;
  batchUpdateTimeEntries(ids: string[], updates: { status?: string; hourlyRate?: string; isBillable?: boolean }): Promise<TimeEntry[]>;
  getTimeEntryAnalytics(attorneyId: string, startDate: string, endDate: string): Promise<any>;

  // Rate Tables
  getRateTables(): Promise<RateTable[]>;
  createRateTable(rateTable: InsertRateTable): Promise<RateTable>;

  // Activity Templates
  getActivityTemplates(): Promise<ActivityTemplate[]>;
  createActivityTemplate(template: InsertActivityTemplate): Promise<ActivityTemplate>;

  // Invoice Generation
  generateInvoiceFromTimeEntries(clientId: string, caseId: string, timeEntryIds: string[], dueInDays: number): Promise<Invoice>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updateData: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Clients
  async getClients(): Promise<Client[]> {
    return await db.select().from(clients).orderBy(desc(clients.createdAt));
  }

  async getClient(id: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await db.insert(clients).values(client).returning();
    return newClient;
  }

  async updateClient(id: string, client: Partial<InsertClient>): Promise<Client> {
    const [updatedClient] = await db
      .update(clients)
      .set({ ...client, updatedAt: new Date() })
      .where(eq(clients.id, id))
      .returning();
    return updatedClient;
  }

  async deleteClient(id: string): Promise<void> {
    await db.delete(clients).where(eq(clients.id, id));
  }

  // Cases
  async getCases(): Promise<Case[]> {
    return await db.select().from(cases).orderBy(desc(cases.createdAt));
  }

  async getCase(id: string): Promise<Case | undefined> {
    const [caseRecord] = await db.select().from(cases).where(eq(cases.id, id));
    return caseRecord || undefined;
  }

  async getCasesByClient(clientId: string): Promise<Case[]> {
    return await db.select().from(cases).where(eq(cases.clientId, clientId));
  }

  async createCase(caseData: InsertCase): Promise<Case> {
    const [newCase] = await db.insert(cases).values(caseData).returning();
    return newCase;
  }

  async updateCase(id: string, caseData: Partial<InsertCase>): Promise<Case> {
    const [updatedCase] = await db
      .update(cases)
      .set({ ...caseData, updatedAt: new Date() })
      .where(eq(cases.id, id))
      .returning();
    return updatedCase;
  }

  async deleteCase(id: string): Promise<void> {
    await db.delete(cases).where(eq(cases.id, id));
  }

  // Time Entries
  async getTimeEntries(): Promise<TimeEntry[]> {
    return await db.select().from(timeEntries).orderBy(desc(timeEntries.createdAt));
  }

  async getTimeEntry(id: string): Promise<TimeEntry | undefined> {
    const [timeEntry] = await db.select().from(timeEntries).where(eq(timeEntries.id, id));
    return timeEntry || undefined;
  }

  async getTimeEntriesByCase(caseId: string): Promise<TimeEntry[]> {
    return await db.select().from(timeEntries).where(eq(timeEntries.caseId, caseId));
  }

  async getActiveTimeEntry(attorneyId: string): Promise<TimeEntry | undefined> {
    const [activeEntry] = await db
      .select()
      .from(timeEntries)
      .where(and(eq(timeEntries.attorneyId, attorneyId), isNull(timeEntries.endTime)))
      .orderBy(desc(timeEntries.startTime));
    return activeEntry || undefined;
  }

  async createTimeEntry(timeEntry: InsertTimeEntry): Promise<TimeEntry> {
    const [newTimeEntry] = await db.insert(timeEntries).values(timeEntry).returning();
    return newTimeEntry;
  }

  async updateTimeEntry(id: string, timeEntry: Partial<InsertTimeEntry>): Promise<TimeEntry> {
    const [updatedTimeEntry] = await db
      .update(timeEntries)
      .set(timeEntry)
      .where(eq(timeEntries.id, id))
      .returning();
    return updatedTimeEntry;
  }

  async deleteTimeEntry(id: string): Promise<void> {
    await db.delete(timeEntries).where(eq(timeEntries.id, id));
  }

  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    return await db.select().from(invoices).orderBy(desc(invoices.createdAt));
  }

  async getInvoice(id: string): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice || undefined;
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db.insert(invoices).values(invoice).returning();
    return newInvoice;
  }

  async updateInvoice(id: string, invoice: Partial<InsertInvoice>): Promise<Invoice> {
    const [updatedInvoice] = await db
      .update(invoices)
      .set(invoice)
      .where(eq(invoices.id, id))
      .returning();
    return updatedInvoice;
  }

  // Documents
  async getDocuments(): Promise<Document[]> {
    return await db.select().from(documents).orderBy(desc(documents.createdAt));
  }

  async getDocument(id: string): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || undefined;
  }

  async getDocumentsByCase(caseId: string): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.caseId, caseId));
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }

  async deleteDocument(id: string): Promise<void> {
    await db.delete(documents).where(eq(documents.id, id));
  }

  // Calendar Events
  async getCalendarEvents(): Promise<CalendarEvent[]> {
    return await db.select().from(calendarEvents).orderBy(desc(calendarEvents.startTime));
  }

  async getCalendarEvent(id: string): Promise<CalendarEvent | undefined> {
    const [event] = await db.select().from(calendarEvents).where(eq(calendarEvents.id, id));
    return event || undefined;
  }

  async getCalendarEventsByDateRange(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    return await db
      .select()
      .from(calendarEvents)
      .where(and(gte(calendarEvents.startTime, startDate), lte(calendarEvents.startTime, endDate)))
      .orderBy(calendarEvents.startTime);
  }

  async createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent> {
    const [newEvent] = await db.insert(calendarEvents).values(event).returning();
    return newEvent;
  }

  async updateCalendarEvent(id: string, event: Partial<InsertCalendarEvent>): Promise<CalendarEvent> {
    const [updatedEvent] = await db
      .update(calendarEvents)
      .set(event)
      .where(eq(calendarEvents.id, id))
      .returning();
    return updatedEvent;
  }

  async deleteCalendarEvent(id: string): Promise<void> {
    await db.delete(calendarEvents).where(eq(calendarEvents.id, id));
  }

  // Messages
  async getMessages(): Promise<Message[]> {
    return await db.select().from(messages).orderBy(desc(messages.sentAt));
  }

  async getMessage(id: string): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message || undefined;
  }

  async getMessagesByCase(caseId: string): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.caseId, caseId));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async markMessageAsRead(id: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(messages.id, id));
  }

  // AI Conversations
  async getAiConversations(userId: string): Promise<AiConversation[]> {
    return await db
      .select()
      .from(aiConversations)
      .where(eq(aiConversations.userId, userId))
      .orderBy(desc(aiConversations.createdAt));
  }

  async createAiConversation(conversation: InsertAiConversation): Promise<AiConversation> {
    const [newConversation] = await db.insert(aiConversations).values(conversation).returning();
    return newConversation;
  }

  // Dashboard metrics
  async getDashboardMetrics(): Promise<{
    activeCases: number;
    monthlyRevenue: string;
    billableHours: number;
    upcomingCourtDates: number;
  }> {
    const activeCasesResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(cases)
      .where(eq(cases.status, "active"));

    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthlyRevenueResult = await db
      .select({ total: sql<string>`COALESCE(SUM(total), 0)` })
      .from(invoices)
      .where(and(
        eq(invoices.status, "paid"),
        gte(invoices.paidAt, currentMonth)
      ));

    const billableHoursResult = await db
      .select({ total: sql<number>`COALESCE(SUM(duration), 0)` })
      .from(timeEntries)
      .where(and(
        eq(timeEntries.isBillable, true),
        gte(timeEntries.startTime, currentMonth)
      ));

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingCourtDatesResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(calendarEvents)
      .where(and(
        eq(calendarEvents.eventType, "court_date"),
        lte(calendarEvents.startTime, nextWeek)
      ));

    return {
      activeCases: activeCasesResult[0]?.count || 0,
      monthlyRevenue: monthlyRevenueResult[0]?.total || "0",
      billableHours: Math.round((billableHoursResult[0]?.total || 0) / 60 * 10) / 10,
      upcomingCourtDates: upcomingCourtDatesResult[0]?.count || 0
    };
  }

  // Enhanced Time Entry Methods
  async pauseTimeEntry(id: string): Promise<TimeEntry> {
    const [entry] = await db.select().from(timeEntries).where(eq(timeEntries.id, id));
    if (!entry) throw new Error("Time entry not found");
    if (entry.isPaused) throw new Error("Timer is already paused");
    if (entry.endTime) throw new Error("Cannot pause a completed timer");

    const [updated] = await db
      .update(timeEntries)
      .set({
        isPaused: true,
        pausedAt: new Date()
      })
      .where(eq(timeEntries.id, id))
      .returning();
    return updated;
  }

  async resumeTimeEntry(id: string): Promise<TimeEntry> {
    const [entry] = await db.select().from(timeEntries).where(eq(timeEntries.id, id));
    if (!entry) throw new Error("Time entry not found");
    if (!entry.isPaused) throw new Error("Timer is not paused");
    if (entry.endTime) throw new Error("Cannot resume a completed timer");

    const pausedDuration = entry.pausedDuration || 0;
    const additionalPause = entry.pausedAt 
      ? Math.floor((Date.now() - new Date(entry.pausedAt).getTime()) / 60000)
      : 0;

    const [updated] = await db
      .update(timeEntries)
      .set({
        isPaused: false,
        pausedAt: null,
        pausedDuration: pausedDuration + additionalPause
      })
      .where(eq(timeEntries.id, id))
      .returning();
    return updated;
  }

  async stopTimeEntry(id: string): Promise<TimeEntry> {
    const [entry] = await db.select().from(timeEntries).where(eq(timeEntries.id, id));
    if (!entry) throw new Error("Time entry not found");
    if (entry.endTime) throw new Error("Timer is already stopped");

    const endTime = new Date();
    const totalMinutes = Math.floor((endTime.getTime() - new Date(entry.startTime).getTime()) / 60000);
    const pausedMinutes = entry.pausedDuration || 0;
    const actualMinutes = totalMinutes - pausedMinutes;
    const roundedMinutes = roundToIncrement(actualMinutes);

    const [updated] = await db
      .update(timeEntries)
      .set({
        endTime,
        duration: actualMinutes,
        roundedDuration: roundedMinutes,
        isPaused: false,
        pausedAt: null
      })
      .where(eq(timeEntries.id, id))
      .returning();
    return updated;
  }

  async batchUpdateTimeEntries(ids: string[], updates: { status?: string; hourlyRate?: string; isBillable?: boolean }): Promise<TimeEntry[]> {
    const updatedEntries = await db
      .update(timeEntries)
      .set(updates)
      .where(inArray(timeEntries.id, ids))
      .returning();
    return updatedEntries;
  }

  async getTimeEntryAnalytics(attorneyId: string, startDate: string, endDate: string): Promise<any> {
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();

    const entries = await db
      .select()
      .from(timeEntries)
      .where(and(
        eq(timeEntries.attorneyId, attorneyId),
        gte(timeEntries.startTime, start),
        lte(timeEntries.startTime, end)
      ));

    const billableEntries = entries.filter(e => e.isBillable);
    const nonBillableEntries = entries.filter(e => !e.isBillable);

    const totalBillableMinutes = billableEntries.reduce((sum, e) => sum + (e.duration || 0), 0);
    const totalNonBillableMinutes = nonBillableEntries.reduce((sum, e) => sum + (e.duration || 0), 0);
    const totalRevenue = billableEntries.reduce((sum, e) => {
      const hours = (e.duration || 0) / 60;
      const rate = parseFloat(e.hourlyRate?.toString() || "0");
      return sum + (hours * rate);
    }, 0);

    const byStatus = entries.reduce((acc, e) => {
      const status = e.status || 'draft';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byActivity = entries.reduce((acc, e) => {
      const activity = e.activity || 'unknown';
      acc[activity] = (acc[activity] || 0) + (e.duration || 0);
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEntries: entries.length,
      billableEntries: billableEntries.length,
      nonBillableEntries: nonBillableEntries.length,
      totalBillableHours: Math.round(totalBillableMinutes / 60 * 10) / 10,
      totalNonBillableHours: Math.round(totalNonBillableMinutes / 60 * 10) / 10,
      totalRevenue: totalRevenue.toFixed(2),
      utilizationRate: totalBillableMinutes + totalNonBillableMinutes > 0
        ? Math.round((totalBillableMinutes / (totalBillableMinutes + totalNonBillableMinutes)) * 100)
        : 0,
      byStatus,
      byActivity,
      entries: entries.map(e => ({
        id: e.id,
        date: e.startTime,
        activity: e.activity,
        duration: e.duration,
        billableAmount: e.isBillable && e.hourlyRate 
          ? ((e.duration || 0) / 60) * parseFloat(e.hourlyRate.toString())
          : 0
      }))
    };
  }

  // Rate Tables
  async getRateTables(): Promise<RateTable[]> {
    return await db.select().from(rateTables).orderBy(desc(rateTables.createdAt));
  }

  async createRateTable(rateTable: InsertRateTable): Promise<RateTable> {
    const [created] = await db.insert(rateTables).values(rateTable).returning();
    return created;
  }

  // Activity Templates
  async getActivityTemplates(): Promise<ActivityTemplate[]> {
    return await db.select().from(activityTemplates).orderBy(desc(activityTemplates.createdAt));
  }

  async createActivityTemplate(template: InsertActivityTemplate): Promise<ActivityTemplate> {
    const [created] = await db.insert(activityTemplates).values(template).returning();
    return created;
  }

  // Invoice Generation
  async generateInvoiceFromTimeEntries(
    clientId: string,
    caseId: string,
    timeEntryIds: string[],
    dueInDays: number
  ): Promise<Invoice> {
    // Get the time entries
    const entries = await db
      .select()
      .from(timeEntries)
      .where(inArray(timeEntries.id, timeEntryIds));

    if (entries.length === 0) {
      throw new Error("No time entries found");
    }

    // Calculate totals
    let subtotal = 0;
    entries.forEach(entry => {
      if (entry.isBillable && entry.duration && entry.hourlyRate) {
        const hours = entry.duration / 60;
        const rate = parseFloat(entry.hourlyRate.toString());
        subtotal += hours * rate;
      }
    });

    // Generate invoice number
    const invoiceCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(invoices);
    const invoiceNumber = `INV-${String(invoiceCount[0].count + 1).padStart(5, '0')}`;

    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + dueInDays);

    // Create invoice
    const [invoice] = await db
      .insert(invoices)
      .values({
        invoiceNumber,
        clientId,
        caseId,
        issueDate: issueDate.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        subtotal: subtotal.toFixed(2),
        tax: "0.00",
        total: subtotal.toFixed(2),
        status: "draft"
      })
      .returning();

    // Create invoice items from time entries
    const invoiceItemsData = entries.map(entry => {
      const hours = (entry.duration || 0) / 60;
      const rate = parseFloat(entry.hourlyRate?.toString() || "0");
      const amount = hours * rate;

      return {
        invoiceId: invoice.id,
        timeEntryId: entry.id,
        description: `${entry.activity}: ${entry.description || 'Legal services'}`,
        quantity: hours.toFixed(2),
        rate: rate.toFixed(2),
        amount: amount.toFixed(2)
      };
    });

    await db.insert(invoiceItems).values(invoiceItemsData);

    // Mark time entries as invoiced
    await db
      .update(timeEntries)
      .set({ 
        isInvoiced: true,
        status: 'invoiced',
        invoiceId: invoice.id
      })
      .where(inArray(timeEntries.id, timeEntryIds));

    return invoice;
  }
}

export const storage = new DatabaseStorage();
