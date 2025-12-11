import type { Express } from "express";
import { storage } from "./storage";
import { 
  hashPassword, 
  comparePassword, 
  generatePortalToken, 
  portalAuthMiddleware, 
  optionalPortalAuthMiddleware,
  generateInvitationToken,
  PortalAuthRequest 
} from "./portalAuth";
import { authMiddleware, AuthRequest } from "./auth";

export function registerPortalRoutes(app: Express) {
  // Portal Authentication Routes
  
  // Portal login
  app.post("/api/portal/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      const portalUser = await storage.getPortalUserByEmail(email);
      
      if (!portalUser) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (!portalUser.isActive) {
        return res.status(403).json({ error: "Account is not activated. Please check your email for the invitation link." });
      }

      if (!portalUser.password) {
        return res.status(403).json({ error: "Please complete your account setup using the invitation link." });
      }

      const isValidPassword = await comparePassword(password, portalUser.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Update last login
      await storage.updatePortalUser(portalUser.id, { lastLoginAt: new Date() });

      const token = generatePortalToken({
        id: portalUser.id,
        clientId: portalUser.clientId,
        email: portalUser.email,
        firstName: portalUser.firstName,
        lastName: portalUser.lastName
      });

      res.cookie('portal_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.json({
        user: {
          id: portalUser.id,
          clientId: portalUser.clientId,
          email: portalUser.email,
          firstName: portalUser.firstName,
          lastName: portalUser.lastName,
          phone: portalUser.phone
        }
      });
    } catch (error) {
      console.error("Portal login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Portal logout
  app.post("/api/portal/auth/logout", (req, res) => {
    res.clearCookie('portal_token');
    res.json({ message: "Logged out successfully" });
  });

  // Get current portal user
  app.get("/api/portal/auth/me", optionalPortalAuthMiddleware, async (req: PortalAuthRequest, res) => {
    if (!req.portalUser) {
      return res.json(null);
    }

    try {
      const portalUser = await storage.getPortalUser(req.portalUser.id);
      if (!portalUser) {
        return res.json(null);
      }

      res.json({
        id: portalUser.id,
        clientId: portalUser.clientId,
        email: portalUser.email,
        firstName: portalUser.firstName,
        lastName: portalUser.lastName,
        phone: portalUser.phone
      });
    } catch (error) {
      console.error("Error fetching portal user:", error);
      res.json(null);
    }
  });

  // Accept invitation and set password
  app.post("/api/portal/auth/accept-invitation", async (req, res) => {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({ error: "Token and password required" });
      }

      const portalUser = await storage.getPortalUserByInvitationToken(token);
      
      if (!portalUser) {
        return res.status(400).json({ error: "Invalid or expired invitation token" });
      }

      if (portalUser.invitationExpiresAt && new Date(portalUser.invitationExpiresAt) < new Date()) {
        return res.status(400).json({ error: "Invitation has expired. Please contact your attorney for a new invitation." });
      }

      const hashedPassword = await hashPassword(password);

      await storage.updatePortalUser(portalUser.id, {
        password: hashedPassword,
        isActive: true,
        invitationToken: null,
        invitationExpiresAt: null
      });

      res.json({ message: "Account activated successfully. You can now log in." });
    } catch (error) {
      console.error("Accept invitation error:", error);
      res.status(500).json({ error: "Failed to activate account" });
    }
  });

  // Verify invitation token
  app.get("/api/portal/auth/verify-invitation/:token", async (req, res) => {
    try {
      const { token } = req.params;

      const portalUser = await storage.getPortalUserByInvitationToken(token);
      
      if (!portalUser) {
        return res.status(400).json({ valid: false, error: "Invalid invitation token" });
      }

      if (portalUser.invitationExpiresAt && new Date(portalUser.invitationExpiresAt) < new Date()) {
        return res.status(400).json({ valid: false, error: "Invitation has expired" });
      }

      const client = await storage.getClient(portalUser.clientId);

      res.json({ 
        valid: true, 
        email: portalUser.email,
        firstName: portalUser.firstName,
        lastName: portalUser.lastName,
        clientName: client ? `${client.firstName} ${client.lastName}` : undefined
      });
    } catch (error) {
      console.error("Verify invitation error:", error);
      res.status(500).json({ valid: false, error: "Verification failed" });
    }
  });

  // Attorney routes for managing portal users
  
  // Send invitation to client
  app.post("/api/portal/invitations", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { clientId, email, firstName, lastName, phone } = req.body;

      if (!clientId || !email || !firstName || !lastName) {
        return res.status(400).json({ error: "Client ID, email, first name, and last name are required" });
      }

      // Check if client exists
      const client = await storage.getClient(clientId);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      // Check if portal user already exists for this client
      const existingPortalUser = await storage.getPortalUserByClientId(clientId);
      if (existingPortalUser) {
        return res.status(400).json({ error: "Portal access already exists for this client" });
      }

      // Check if email is already in use
      const existingEmail = await storage.getPortalUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email is already in use" });
      }

      const invitationToken = generateInvitationToken();
      const invitationExpiresAt = new Date();
      invitationExpiresAt.setDate(invitationExpiresAt.getDate() + 7); // 7 days expiry

      const portalUser = await storage.createPortalUser({
        clientId,
        email,
        firstName,
        lastName,
        phone,
        invitationToken,
        invitationExpiresAt,
        invitedById: req.user!.id,
        isActive: false
      });

      res.json({ 
        portalUser,
        invitationLink: `/portal/accept-invitation?token=${invitationToken}`
      });
    } catch (error) {
      console.error("Create portal invitation error:", error);
      res.status(500).json({ error: "Failed to create invitation" });
    }
  });

  // Get all portal users for the attorney
  app.get("/api/portal/users", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const portalUsersList = await storage.getPortalUsersByAttorney(req.user!.id);
      res.json(portalUsersList);
    } catch (error) {
      console.error("Get portal users error:", error);
      res.status(500).json({ error: "Failed to fetch portal users" });
    }
  });

  // Delete portal user (attorney only)
  app.delete("/api/portal/users/:id", authMiddleware, async (req: AuthRequest, res) => {
    try {
      await storage.deletePortalUser(req.params.id);
      res.json({ message: "Portal user deleted successfully" });
    } catch (error) {
      console.error("Delete portal user error:", error);
      res.status(500).json({ error: "Failed to delete portal user" });
    }
  });

  // Portal User Routes (protected by portal auth)

  // Get portal dashboard data
  app.get("/api/portal/dashboard", portalAuthMiddleware, async (req: PortalAuthRequest, res) => {
    try {
      const clientId = req.portalUser!.clientId;

      const [cases, invoicesList, events] = await Promise.all([
        storage.getClientCases(clientId),
        storage.getClientInvoices(clientId),
        storage.getClientCalendarEvents(clientId)
      ]);

      const activeCases = cases.filter(c => c.status === 'active');
      const pendingInvoices = invoicesList.filter(i => i.status === 'sent' || i.status === 'overdue');
      const upcomingEvents = events.filter(e => new Date(e.startTime) > new Date());

      res.json({
        activeCasesCount: activeCases.length,
        pendingInvoicesCount: pendingInvoices.length,
        upcomingEventsCount: upcomingEvents.length,
        recentCases: activeCases.slice(0, 5),
        upcomingEvents: upcomingEvents.slice(0, 5),
        pendingInvoices: pendingInvoices.slice(0, 5)
      });
    } catch (error) {
      console.error("Portal dashboard error:", error);
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  });

  // Get client's cases
  app.get("/api/portal/cases", portalAuthMiddleware, async (req: PortalAuthRequest, res) => {
    try {
      const cases = await storage.getClientCases(req.portalUser!.clientId);
      res.json(cases);
    } catch (error) {
      console.error("Portal cases error:", error);
      res.status(500).json({ error: "Failed to fetch cases" });
    }
  });

  // Get single case details
  app.get("/api/portal/cases/:id", portalAuthMiddleware, async (req: PortalAuthRequest, res) => {
    try {
      const caseData = await storage.getCase(req.params.id);
      
      if (!caseData) {
        return res.status(404).json({ error: "Case not found" });
      }

      // Verify client owns this case
      if (caseData.clientId !== req.portalUser!.clientId) {
        return res.status(403).json({ error: "Access denied" });
      }

      res.json(caseData);
    } catch (error) {
      console.error("Portal case detail error:", error);
      res.status(500).json({ error: "Failed to fetch case" });
    }
  });

  // Get client's invoices
  app.get("/api/portal/invoices", portalAuthMiddleware, async (req: PortalAuthRequest, res) => {
    try {
      const invoicesList = await storage.getClientInvoices(req.portalUser!.clientId);
      res.json(invoicesList);
    } catch (error) {
      console.error("Portal invoices error:", error);
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  // Get single invoice details
  app.get("/api/portal/invoices/:id", portalAuthMiddleware, async (req: PortalAuthRequest, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      // Verify client owns this invoice
      if (invoice.clientId !== req.portalUser!.clientId) {
        return res.status(403).json({ error: "Access denied" });
      }

      res.json(invoice);
    } catch (error) {
      console.error("Portal invoice detail error:", error);
      res.status(500).json({ error: "Failed to fetch invoice" });
    }
  });

  // Get client's calendar events
  app.get("/api/portal/events", portalAuthMiddleware, async (req: PortalAuthRequest, res) => {
    try {
      const events = await storage.getClientCalendarEvents(req.portalUser!.clientId);
      res.json(events);
    } catch (error) {
      console.error("Portal events error:", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  // Get messages for a case
  app.get("/api/portal/messages", portalAuthMiddleware, async (req: PortalAuthRequest, res) => {
    try {
      const { caseId } = req.query;
      
      if (caseId) {
        // Verify client owns this case
        const caseData = await storage.getCase(caseId as string);
        if (!caseData || caseData.clientId !== req.portalUser!.clientId) {
          return res.status(403).json({ error: "Access denied" });
        }
        
        const messagesList = await storage.getPortalMessagesByCase(caseId as string);
        return res.json(messagesList);
      }

      // Get all messages for client's cases
      const cases = await storage.getClientCases(req.portalUser!.clientId);
      const allMessages = [];
      
      for (const c of cases) {
        const caseMessages = await storage.getPortalMessagesByCase(c.id);
        allMessages.push(...caseMessages);
      }

      allMessages.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
      res.json(allMessages);
    } catch (error) {
      console.error("Portal messages error:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Send a message
  app.post("/api/portal/messages", portalAuthMiddleware, async (req: PortalAuthRequest, res) => {
    try {
      const { caseId, subject, content } = req.body;

      if (!content) {
        return res.status(400).json({ error: "Message content is required" });
      }

      // Verify client owns this case if caseId provided
      if (caseId) {
        const caseData = await storage.getCase(caseId);
        if (!caseData || caseData.clientId !== req.portalUser!.clientId) {
          return res.status(403).json({ error: "Access denied" });
        }
      }

      const portalUser = await storage.getPortalUser(req.portalUser!.id);
      
      const message = await storage.createPortalMessage({
        caseId,
        subject,
        content,
        senderType: 'client',
        senderPortalUserId: req.portalUser!.id
      });

      res.json(message);
    } catch (error) {
      console.error("Send portal message error:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // Get client profile
  app.get("/api/portal/profile", portalAuthMiddleware, async (req: PortalAuthRequest, res) => {
    try {
      const portalUser = await storage.getPortalUser(req.portalUser!.id);
      const client = await storage.getClient(req.portalUser!.clientId);

      if (!portalUser || !client) {
        return res.status(404).json({ error: "Profile not found" });
      }

      res.json({
        portalUser: {
          id: portalUser.id,
          email: portalUser.email,
          firstName: portalUser.firstName,
          lastName: portalUser.lastName,
          phone: portalUser.phone
        },
        client: {
          id: client.id,
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          phone: client.phone,
          address: client.address,
          city: client.city,
          state: client.state,
          zipCode: client.zipCode
        }
      });
    } catch (error) {
      console.error("Portal profile error:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  // Update portal user profile
  app.patch("/api/portal/profile", portalAuthMiddleware, async (req: PortalAuthRequest, res) => {
    try {
      const { phone, password, currentPassword } = req.body;

      const portalUser = await storage.getPortalUser(req.portalUser!.id);
      if (!portalUser) {
        return res.status(404).json({ error: "User not found" });
      }

      const updates: any = {};

      if (phone !== undefined) {
        updates.phone = phone;
      }

      if (password) {
        if (!currentPassword) {
          return res.status(400).json({ error: "Current password is required to change password" });
        }

        const isValidPassword = await comparePassword(currentPassword, portalUser.password!);
        if (!isValidPassword) {
          return res.status(401).json({ error: "Current password is incorrect" });
        }

        updates.password = await hashPassword(password);
      }

      const updatedUser = await storage.updatePortalUser(req.portalUser!.id, updates);

      res.json({
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phone: updatedUser.phone
      });
    } catch (error) {
      console.error("Update portal profile error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Attorney route: Send message to client
  app.post("/api/portal/messages/attorney", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { caseId, subject, content } = req.body;

      if (!content || !caseId) {
        return res.status(400).json({ error: "Case ID and message content are required" });
      }

      const message = await storage.createPortalMessage({
        caseId,
        subject,
        content,
        senderType: 'attorney',
        senderUserId: req.user!.id
      });

      res.json(message);
    } catch (error) {
      console.error("Send attorney message error:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // Attorney route: Get messages for a case
  app.get("/api/portal/messages/case/:caseId", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const messagesList = await storage.getPortalMessagesByCase(req.params.caseId);
      res.json(messagesList);
    } catch (error) {
      console.error("Get case messages error:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });
}
