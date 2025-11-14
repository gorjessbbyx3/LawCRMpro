import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertClientSchema, insertCaseSchema, insertTimeEntrySchema, 
  insertInvoiceSchema, insertDocumentSchema, insertCalendarEventSchema,
  insertMessageSchema, insertAiConversationSchema, insertUserSchema,
  insertRateTableSchema, insertActivityTemplateSchema, insertComplianceDeadlineSchema
} from "@shared/schema";
import { z } from "zod";
import { 
  hashPassword, comparePassword, generateToken, 
  authMiddleware, optionalAuthMiddleware, requireRole,
  type AuthRequest 
} from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication Routes (public)
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (!user.isActive) {
        return res.status(403).json({ error: "Account is inactive" });
      }

      const isValidPassword = await comparePassword(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = generateToken({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          barNumber: user.barNumber,
          phone: user.phone,
          avatar: user.avatar
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie('token');
    res.json({ message: "Logged out successfully" });
  });

  app.get("/api/auth/me", optionalAuthMiddleware, async (req: AuthRequest, res) => {
    if (!req.user) {
      return res.json(null);
    }

    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.json(null);
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        barNumber: user.barNumber,
        phone: user.phone,
        avatar: user.avatar
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.json(null);
    }
  });

  // Update own profile (any authenticated user)
  app.put("/api/auth/profile", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const updateData: any = { ...req.body };
      delete updateData.id;
      delete updateData.createdAt;
      delete updateData.updatedAt;
      delete updateData.role; // Users cannot change their own role
      delete updateData.isActive; // Users cannot activate/deactivate themselves
      delete updateData.password; // Use separate password change endpoint

      const user = await storage.updateUser(req.user!.id, updateData);
      
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        barNumber: user.barNumber,
        phone: user.phone,
        isActive: user.isActive
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Change own password (any authenticated user)
  app.put("/api/auth/password", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { password } = req.body;
      
      if (!password || typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }

      const hashedPassword = await hashPassword(password);
      await storage.updateUser(req.user!.id, { password: hashedPassword });
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ error: "Failed to change password" });
    }
  });

  // User Management (protected, admin only)
  app.get("/api/users", authMiddleware, requireRole('attorney', 'admin'), async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        firstName: u.firstName,
        lastName: u.lastName,
        barNumber: u.barNumber,
        phone: u.phone,
        isActive: u.isActive,
        createdAt: u.createdAt
      })));
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/users", authMiddleware, requireRole('attorney', 'admin'), async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const hashedPassword = await hashPassword(userData.password);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      res.status(201).json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid user data", errors: error.errors });
      }
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.put("/api/users/:id", authMiddleware, requireRole('attorney', 'admin'), async (req, res) => {
    try {
      const updateData: any = { ...req.body };
      delete updateData.id;
      delete updateData.createdAt;
      delete updateData.updatedAt;
      
      if (updateData.password) {
        if (typeof updateData.password === 'string' && updateData.password.length > 0) {
          updateData.password = await hashPassword(updateData.password);
        } else {
          delete updateData.password;
        }
      }

      const user = await storage.updateUser(req.params.id, updateData);
      
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", authMiddleware, requireRole('attorney', 'admin'), async (req, res) => {
    try {
      await storage.deleteUser(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // All routes below are protected
  app.use('/api', authMiddleware);

  // Dashboard
  app.get("/api/dashboard/metrics", async (req: AuthRequest, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Clients
  app.get("/api/clients", async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", async (req, res) => {
    try {
      const client = await storage.getClient(req.params.id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const clientData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(clientData);
      res.status(201).json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      console.error("Error creating client:", error);
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  app.put("/api/clients/:id", async (req, res) => {
    try {
      const clientData = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(req.params.id, clientData);
      res.json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      console.error("Error updating client:", error);
      res.status(500).json({ message: "Failed to update client" });
    }
  });

  app.delete("/api/clients/:id", async (req, res) => {
    try {
      await storage.deleteClient(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Cases
  app.get("/api/cases", async (req, res) => {
    try {
      const cases = await storage.getCases();
      res.json(cases);
    } catch (error) {
      console.error("Error fetching cases:", error);
      res.status(500).json({ message: "Failed to fetch cases" });
    }
  });

  app.get("/api/cases/:id", async (req, res) => {
    try {
      const caseRecord = await storage.getCase(req.params.id);
      if (!caseRecord) {
        return res.status(404).json({ message: "Case not found" });
      }
      res.json(caseRecord);
    } catch (error) {
      console.error("Error fetching case:", error);
      res.status(500).json({ message: "Failed to fetch case" });
    }
  });

  app.post("/api/cases", async (req, res) => {
    try {
      const caseData = insertCaseSchema.parse(req.body);
      const caseRecord = await storage.createCase(caseData);
      res.status(201).json(caseRecord);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid case data", errors: error.errors });
      }
      console.error("Error creating case:", error);
      res.status(500).json({ message: "Failed to create case" });
    }
  });

  app.put("/api/cases/:id", async (req, res) => {
    try {
      const caseData = insertCaseSchema.partial().parse(req.body);
      const caseRecord = await storage.updateCase(req.params.id, caseData);
      res.json(caseRecord);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid case data", errors: error.errors });
      }
      console.error("Error updating case:", error);
      res.status(500).json({ message: "Failed to update case" });
    }
  });

  app.delete("/api/cases/:id", async (req, res) => {
    try {
      await storage.deleteCase(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting case:", error);
      res.status(500).json({ message: "Failed to delete case" });
    }
  });

  // Time Entries
  app.get("/api/time-entries", async (req, res) => {
    try {
      const timeEntries = await storage.getTimeEntries();
      res.json(timeEntries);
    } catch (error) {
      console.error("Error fetching time entries:", error);
      res.status(500).json({ message: "Failed to fetch time entries" });
    }
  });

  app.get("/api/time-entries/active/:attorneyId", async (req, res) => {
    try {
      const activeEntry = await storage.getActiveTimeEntry(req.params.attorneyId);
      res.json(activeEntry);
    } catch (error) {
      console.error("Error fetching active time entry:", error);
      res.status(500).json({ message: "Failed to fetch active time entry" });
    }
  });

  app.post("/api/time-entries", async (req, res) => {
    try {
      const timeEntryData = insertTimeEntrySchema.parse(req.body);
      const timeEntry = await storage.createTimeEntry(timeEntryData);
      res.status(201).json(timeEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid time entry data", errors: error.errors });
      }
      console.error("Error creating time entry:", error);
      res.status(500).json({ message: "Failed to create time entry" });
    }
  });

  app.put("/api/time-entries/:id", async (req, res) => {
    try {
      const timeEntryData = insertTimeEntrySchema.partial().parse(req.body);
      const timeEntry = await storage.updateTimeEntry(req.params.id, timeEntryData);
      res.json(timeEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid time entry data", errors: error.errors });
      }
      console.error("Error updating time entry:", error);
      res.status(500).json({ message: "Failed to update time entry" });
    }
  });

  app.delete("/api/time-entries/:id", async (req, res) => {
    try {
      await storage.deleteTimeEntry(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting time entry:", error);
      res.status(500).json({ message: "Failed to delete time entry" });
    }
  });

  // Pause/Resume/Stop Timer
  app.patch("/api/time-entries/:id/pause", async (req, res) => {
    try {
      const timeEntry = await storage.pauseTimeEntry(req.params.id);
      res.json(timeEntry);
    } catch (error) {
      console.error("Error pausing timer:", error);
      res.status(500).json({ message: "Failed to pause timer" });
    }
  });

  app.patch("/api/time-entries/:id/resume", async (req, res) => {
    try {
      const timeEntry = await storage.resumeTimeEntry(req.params.id);
      res.json(timeEntry);
    } catch (error) {
      console.error("Error resuming timer:", error);
      res.status(500).json({ message: "Failed to resume timer" });
    }
  });

  app.patch("/api/time-entries/:id/stop", async (req, res) => {
    try {
      const timeEntry = await storage.stopTimeEntry(req.params.id);
      
      // Auto-create calendar event for this time entry
      if (timeEntry && timeEntry.startTime && timeEntry.endTime && timeEntry.caseId) {
        try {
          const eventType = getEventTypeFromActivity(timeEntry.activity);
          const calendarEvent = await storage.createCalendarEvent({
            title: `${timeEntry.activity}: ${timeEntry.description || 'Time tracked'}`.substring(0, 200),
            description: timeEntry.description || `Time tracking entry for ${timeEntry.activity}`,
            startTime: timeEntry.startTime,
            endTime: timeEntry.endTime,
            eventType,
            sourceType: 'time_entry',
            sourceId: timeEntry.id,
            caseId: timeEntry.caseId,
            isAllDay: false,
            reminderMinutes: 0, // No reminder for completed events
            status: 'completed',
          });
          
          // Link the calendar event back to the time entry
          if (calendarEvent) {
            await storage.updateTimeEntry(timeEntry.id, {
              calendarEventId: calendarEvent.id
            });
            console.log(`[AUTO-SYNC SUCCESS] Created calendar event ${calendarEvent.id} for time entry ${timeEntry.id}`);
          } else {
            const errorMsg = `Calendar event creation returned null for time entry ${timeEntry.id}`;
            console.error(`[AUTO-SYNC ERROR] ${errorMsg}`);
            return res.status(500).json({ 
              message: "Timer stopped but calendar sync failed", 
              timeEntry,
              syncError: errorMsg
            });
          }
        } catch (calendarError) {
          console.error("[AUTO-SYNC ERROR] Failed to create calendar event:", calendarError);
          console.error("Error details:", calendarError instanceof Error ? calendarError.message : String(calendarError));
          console.error("Time entry:", { id: timeEntry.id, activity: timeEntry.activity });
          return res.status(500).json({ 
            message: "Timer stopped but calendar sync failed",
            timeEntry,
            syncError: calendarError instanceof Error ? calendarError.message : String(calendarError)
          });
        }
      }
      
      res.json(timeEntry);
    } catch (error) {
      console.error("Error stopping timer:", error);
      res.status(500).json({ message: "Failed to stop timer" });
    }
  });

  // Helper function to map activity types to calendar event types
  function getEventTypeFromActivity(activity: string): string {
    const activityLower = activity.toLowerCase();
    if (activityLower.includes('court') || activityLower.includes('hearing')) {
      return 'court_date';
    } else if (activityLower.includes('meeting') || activityLower.includes('conference')) {
      return 'meeting';
    } else if (activityLower.includes('deadline') || activityLower.includes('filing')) {
      return 'deadline';
    } else if (activityLower.includes('consultation') || activityLower.includes('interview')) {
      return 'consultation';
    } else {
      return 'meeting'; // Default fallback
    }
  }

  // Batch Operations
  app.patch("/api/time-entries/batch", async (req, res) => {
    try {
      const batchSchema = z.object({
        ids: z.array(z.string()).min(1),
        updates: z.object({
          status: z.enum(['draft', 'ready_to_bill', 'invoiced', 'paid']).optional(),
          hourlyRate: z.string().optional(),
          isBillable: z.boolean().optional()
        })
      });
      
      const { ids, updates } = batchSchema.parse(req.body);
      const timeEntries = await storage.batchUpdateTimeEntries(ids, updates);
      res.json(timeEntries);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid batch update data", errors: error.errors });
      }
      console.error("Error batch updating time entries:", error);
      res.status(500).json({ message: "Failed to batch update time entries" });
    }
  });

  // Analytics
  app.get("/api/time-entries/analytics", async (req, res) => {
    try {
      const { attorneyId, startDate, endDate } = req.query;
      const analytics = await storage.getTimeEntryAnalytics(
        attorneyId as string,
        startDate as string,
        endDate as string
      );
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Rate Tables
  app.get("/api/rate-tables", async (req, res) => {
    try {
      const rateTables = await storage.getRateTables();
      res.json(rateTables);
    } catch (error) {
      console.error("Error fetching rate tables:", error);
      res.status(500).json({ message: "Failed to fetch rate tables" });
    }
  });

  app.post("/api/rate-tables", async (req, res) => {
    try {
      const rateTableData = insertRateTableSchema.parse(req.body);
      const rateTable = await storage.createRateTable(rateTableData);
      res.status(201).json(rateTable);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid rate table data", errors: error.errors });
      }
      console.error("Error creating rate table:", error);
      res.status(500).json({ message: "Failed to create rate table" });
    }
  });

  // Activity Templates
  app.get("/api/activity-templates", async (req, res) => {
    try {
      const templates = await storage.getActivityTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching activity templates:", error);
      res.status(500).json({ message: "Failed to fetch activity templates" });
    }
  });

  app.post("/api/activity-templates", async (req, res) => {
    try {
      const templateData = insertActivityTemplateSchema.parse(req.body);
      const template = await storage.createActivityTemplate(templateData);
      res.status(201).json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid activity template data", errors: error.errors });
      }
      console.error("Error creating activity template:", error);
      res.status(500).json({ message: "Failed to create activity template" });
    }
  });

  // Invoices
  app.get("/api/invoices", async (req, res) => {
    try {
      const invoices = await storage.getInvoices();
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      const invoiceData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(invoiceData);
      res.status(201).json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid invoice data", errors: error.errors });
      }
      console.error("Error creating invoice:", error);
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  // Generate invoice from time entries
  app.post("/api/invoices/generate", async (req, res) => {
    try {
      const generateInvoiceSchema = z.object({
        clientId: z.string().uuid(),
        caseId: z.string().uuid(),
        timeEntryIds: z.array(z.string().uuid()).min(1),
        dueInDays: z.number().int().positive().default(30)
      });
      
      const { clientId, caseId, timeEntryIds, dueInDays } = generateInvoiceSchema.parse(req.body);
      const invoice = await storage.generateInvoiceFromTimeEntries(
        clientId,
        caseId,
        timeEntryIds,
        dueInDays
      );
      res.status(201).json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid invoice generation data", errors: error.errors });
      }
      console.error("Error generating invoice:", error);
      res.status(500).json({ message: "Failed to generate invoice" });
    }
  });

  // Documents
  app.get("/api/documents", async (req, res) => {
    try {
      const documents = await storage.getDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post("/api/documents", async (req, res) => {
    try {
      const documentData = insertDocumentSchema.parse(req.body);
      const document = await storage.createDocument(documentData);
      res.status(201).json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid document data", errors: error.errors });
      }
      console.error("Error creating document:", error);
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  // Calendar Events
  app.get("/api/calendar/events", async (req, res) => {
    try {
      const events = await storage.getCalendarEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      res.status(500).json({ message: "Failed to fetch calendar events" });
    }
  });

  app.post("/api/calendar/events", async (req, res) => {
    try {
      const eventData = insertCalendarEventSchema.parse(req.body);
      const event = await storage.createCalendarEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      console.error("Error creating calendar event:", error);
      res.status(500).json({ message: "Failed to create calendar event" });
    }
  });

  // Messages
  app.get("/api/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.get("/api/messages/unread-count", async (req, res) => {
    try {
      const messages = await storage.getMessages();
      const unreadCount = messages.filter(msg => !msg.isRead).length;
      res.json({ count: unreadCount });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  // Compliance Deadlines
  app.get("/api/compliance/deadlines", async (req, res) => {
    try {
      const deadlines = await storage.getComplianceDeadlines();
      res.json(deadlines);
    } catch (error) {
      console.error("Error fetching compliance deadlines:", error);
      res.status(500).json({ message: "Failed to fetch compliance deadlines" });
    }
  });

  app.post("/api/compliance/deadlines", async (req, res) => {
    try {
      const deadlineData = insertComplianceDeadlineSchema.parse(req.body);
      const deadline = await storage.createComplianceDeadline(deadlineData);
      res.status(201).json(deadline);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid compliance deadline data", errors: error.errors });
      }
      console.error("Error creating compliance deadline:", error);
      res.status(500).json({ message: "Failed to create compliance deadline" });
    }
  });

  app.put("/api/compliance/deadlines/:id", async (req, res) => {
    try {
      const deadlineData = insertComplianceDeadlineSchema.partial().parse(req.body);
      const deadline = await storage.updateComplianceDeadline(req.params.id, deadlineData);
      res.json(deadline);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid compliance deadline data", errors: error.errors });
      }
      console.error("Error updating compliance deadline:", error);
      res.status(500).json({ message: "Failed to update compliance deadline" });
    }
  });

  app.patch("/api/compliance/deadlines/:id/complete", async (req, res) => {
    try {
      const deadline = await storage.getComplianceDeadline(req.params.id);
      if (!deadline) {
        return res.status(404).json({ message: "Compliance deadline not found" });
      }

      // Toggle completion status
      const isCompleted = deadline.status === "completed";
      const updatedDeadline = await storage.updateComplianceDeadline(req.params.id, {
        status: isCompleted ? "pending" : "completed",
        completedAt: isCompleted ? null : new Date()
      });
      
      res.json(updatedDeadline);
    } catch (error) {
      console.error("Error toggling compliance deadline:", error);
      res.status(500).json({ message: "Failed to toggle compliance deadline" });
    }
  });

  app.delete("/api/compliance/deadlines/:id", async (req, res) => {
    try {
      await storage.deleteComplianceDeadline(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting compliance deadline:", error);
      res.status(500).json({ message: "Failed to delete compliance deadline" });
    }
  });

  // Object Storage for Documents (protected file uploading)
  const { ObjectStorageService, ObjectNotFoundError } = await import("./objectStorage");
  const { ObjectPermission } = await import("./objectAcl");

  app.post("/api/objects/upload", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ message: "Failed to get upload URL" });
    }
  });

  app.get("/objects/*", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const objectStorageService = new ObjectStorageService();
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });
      
      if (!canAccess) {
        return res.sendStatus(401);
      }
      
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.put("/api/documents", authMiddleware, async (req: AuthRequest, res) => {
    try {
      if (!req.body.uploadURL) {
        return res.status(400).json({ error: "uploadURL is required" });
      }

      const userId = req.user!.id;
      const objectStorageService = new ObjectStorageService();
      
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.uploadURL,
        {
          owner: userId,
          visibility: "private",
        },
      );

      const documentData = {
        name: req.body.name,
        filename: req.body.filename,
        filePath: objectPath,
        fileSize: req.body.fileSize,
        mimeType: req.body.mimeType,
        caseId: req.body.caseId || null,
        clientId: req.body.clientId || null,
        uploadedById: userId,
        documentType: req.body.documentType || null,
        tags: req.body.tags || [],
      };

      const validatedData = insertDocumentSchema.parse(documentData);
      const document = await storage.createDocument(validatedData);
      
      res.status(200).json({
        objectPath: objectPath,
        document: document,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid document data", errors: error.errors });
      }
      console.error("Error setting document metadata:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // AI Assistant
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { query, caseId, userId } = req.body;
      
      if (!query) {
        return res.status(400).json({ message: "Query is required" });
      }

      // Call Groq AI API
      const groqApiKey = process.env.GROQ_API_KEY || process.env.GROQ_KEY || "";
      
      if (!groqApiKey) {
        return res.status(500).json({ message: "Groq API key not configured" });
      }

      const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            {
              role: "system",
              content: "You are a legal AI assistant for Hawaii attorneys. Provide helpful, accurate legal information while always reminding users to verify information and consult with qualified legal professionals. Focus on Hawaii law when applicable."
            },
            {
              role: "user",
              content: query
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!groqResponse.ok) {
        throw new Error(`Groq API error: ${groqResponse.status}`);
      }

      const groqData = await groqResponse.json();
      const response = groqData.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

      // Save conversation to database
      if (userId) {
        const conversationData = {
          userId,
          caseId: caseId || null,
          query,
          response,
          context: { model: "llama3-8b-8192" }
        };
        
        await storage.createAiConversation(conversationData);
      }

      res.json({ response });
    } catch (error) {
      console.error("Error in AI chat:", error);
      res.status(500).json({ message: "Failed to get AI response" });
    }
  });

  app.get("/api/ai/conversations/:userId", async (req, res) => {
    try {
      const conversations = await storage.getAiConversations(req.params.userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching AI conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
