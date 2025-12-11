# LegalCRM Pro - Hawaii Legal Practice Management System

## Overview
Enterprise-grade legal practice management system built for Hawaii attorneys with comprehensive case management, time tracking, billing, compliance, and AI-powered features.

## Current Status (December 11, 2025)

### ✅ Completed Features

#### Authentication & User Management (Tasks 1-4)
- **JWT-based authentication** with bcrypt password hashing and httpOnly cookies
- **Login system** with protected routes and automatic redirection
- **Role-based access control** (attorney, paralegal, secretary, admin)
- **Self-service profile management**: All users can update their own profile and password
- **Admin-only user management**: Attorneys and admins can create, edit, and delete staff accounts
- **Auto-update across platform**: Profile changes immediately propagate to topbar, sidebar, and all components

**Security Features:**
- Password hashing with bcrypt (10 salt rounds)
- JWT tokens with expiration
- HTTP-only cookies for token storage
- Password confirmation required for all password changes
- Users cannot change their own role or active status
- Separate endpoints for self-service vs admin operations

**Demo Account:**
- Username: `attorney`
- Password: `demo123`

#### Time Tracking & Invoicing (Phases 1-3)
- **Attorney-specific time tracking** with UTBMS codes, pause/resume functionality
- **Voice-to-text descriptions** for time entries using Web Speech API
- **Activity templates** for common legal tasks
- **Rate tables** with client-specific overrides
- **Time entry status workflow**: draft → submitted → approved → billed
- **Batch operations** for bulk approve/bill/delete
- **Invoice generation** with PDF export using @react-pdf/renderer
- **Analytics dashboard** with revenue tracking and time analysis

#### Documents Management (Phase 4)
- **Object storage integration** for secure file uploads/downloads
- **Access Control List (ACL)**: Private documents with owner-based access
- **Upload functionality** with ObjectUploader component and presigned URLs
- **Download/delete** operations with ownership verification
- **Search and filters** by case, client, document type, template status
- **Hawaii court forms** section with downloadable templates
- **Shared templates** accessible to all users while maintaining privacy for user documents

**Security Features:**
- Document listing filters by `uploadedById === userId OR isTemplate === true`
- Download ACL enforcement prevents unauthorized access
- Ownership verification on delete operations
- All routes protected with authMiddleware

#### Calendar & Events (Phase 5)
- **Full CRUD operations** for calendar events (create, read, update, delete)
- **Event associations** with cases and clients
- **Event types**: hearing, filing deadline, consultation, court appearance, meeting, deposition, other
- **Status tracking**: scheduled, confirmed, cancelled, completed
- **Filters** by case, client, event type, status, date range
- **Validation**: start time must be before end time
- **Reminders endpoint** for upcoming events (client-side polling)

#### Client Portal (Phase 6)
- **Separate authentication system** with JWT tokens (portal_token cookie) isolated from attorney auth
- **Portal user management**: portal_users table linked to clients with password hashing
- **Invitation flow**: Attorneys create 7-day expiring invitation tokens, clients accept and set password
- **Client dashboard**: View case counts, pending invoices, upcoming events at a glance
- **Cases viewer**: Read-only access to client's own cases with status tracking
- **Invoices viewer**: View and track invoice status and amounts
- **Calendar events**: View scheduled hearings, deadlines, and meetings
- **Messaging system**: portal_messages table for client-attorney communication per case
- **Profile management**: Update phone and change password with current password verification

**Security Features:**
- All portal routes scoped by clientId from authenticated portal user
- Case ownership validation before allowing message access
- Invitation tokens expire after 7 days and are cleared upon acceptance
- Single-use token enforcement - token set to null after account activation
- Separate middleware stack (portalAuthMiddleware) from attorney routes

**Portal Routes:**
- `POST /api/portal/auth/login` - Portal user login
- `POST /api/portal/auth/logout` - Clear portal session
- `GET /api/portal/auth/me` - Get current portal user
- `POST /api/portal/auth/accept-invitation` - Accept invitation and set password
- `GET /api/portal/auth/verify-invitation/:token` - Verify invitation token
- `GET /api/portal/dashboard` - Get client dashboard data
- `GET /api/portal/cases` - List client's cases
- `GET /api/portal/invoices` - List client's invoices
- `GET /api/portal/events` - List client's calendar events
- `GET/POST /api/portal/messages` - Read and send messages
- `GET/PATCH /api/portal/profile` - View and update profile
- `POST /api/portal/invitations` - Attorney creates invitation (attorney auth required)

### 🚧 In Progress

#### Clients CRUD Operations (Task 5)
- Basic UI exists, needs complete CRUD implementation
- Required: edit, delete, search, filter, export functionality

### 📋 Pending Features

1. **Cases Management** - Full CRUD with PDF export and case details
2. **Messages** - Email integration, threading, templates
3. **AI Assistant** - OpenAI integration for document analysis and legal research
4. **Reports** - Revenue analysis, time tracking reports, case statistics
5. **Hawaii Compliance** - CLE tracker, bar requirements, ethics deadlines
6. **ECourt Kokua** - iframe integration to Hawaii eCourt system
7. **Dashboard** - Wire up with real data and functionality

## Architecture

### Tech Stack
- **Frontend**: React + TypeScript + Vite + Wouter (routing)
- **Backend**: Express + Node.js
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Authentication**: JWT tokens + bcrypt
- **UI**: Shadcn components + Tailwind CSS
- **State Management**: TanStack Query (React Query v5)

### API Routes Structure

#### Authentication
- `POST /api/auth/login` - Login with username/password
- `POST /api/auth/logout` - Clear session
- `GET /api/auth/me` - Get current user (optional auth)
- `PUT /api/auth/profile` - Update own profile (any user)
- `PUT /api/auth/password` - Change own password (any user)

#### User Management (Admin Only)
- `GET /api/users` - List all users (attorney/admin)
- `POST /api/users` - Create new user (attorney/admin)
- `PUT /api/users/:id` - Update user (attorney/admin)
- `DELETE /api/users/:id` - Delete user (attorney/admin)

#### Documents (Phase 4)
- `GET /api/documents` - List documents (user's own + templates)
- `PUT /api/documents` - Complete upload with metadata
- `DELETE /api/documents/:id` - Delete document (owner only)
- `POST /api/objects/upload` - Generate presigned upload URL
- `GET /objects/*` - Download document (ACL enforced)

#### Calendar (Phase 5)
- `GET /api/calendar/events` - List events with filters
- `POST /api/calendar/events` - Create new event
- `PUT /api/calendar/events/:id` - Update event
- `DELETE /api/calendar/events/:id` - Delete event
- `GET /api/calendar/reminders` - Get upcoming events

### Database Schema

#### Users Table
- Authentication and user profile information
- Roles: attorney, paralegal, secretary, admin
- Password stored as bcrypt hash

#### Clients, Cases, Time Entries, Invoices, Documents, Calendar Events, Messages, Compliance
- Schema defined in `shared/schema.ts`
- Sample data seeded for demo purposes

## Development Guidelines

### Code Conventions
- **Type Safety**: All data models defined in `shared/schema.ts` first
- **API Structure**: Routes in `server/routes.ts`, storage interface in `server/storage.ts`
- **Frontend Patterns**: React Query for all data fetching, Shadcn components for UI
- **Authentication**: All API routes (except login/logout) protected with `authMiddleware`
- **Form Handling**: react-hook-form + zod validation for all forms
- **Test IDs**: All interactive elements have `data-testid` attributes

### User Preferences
- **No public signup**: Admin-controlled user management only
- **Enterprise-grade quality**: All features must be fully functional, not just UI mockups
- **Hawaii-specific features**: CLE tracking, statutes, court resources, inter-island travel
- **Auto-updates**: User profile changes propagate immediately across entire platform

## Recent Changes (December 11, 2025)

### Phase 6 Complete - Client Portal (Latest)
- **Portal database schema**: Created portal_users and portal_messages tables with proper relationships
- **Separate authentication**: Portal uses portal_token cookie with isolated JWT system from attorney auth
- **Invitation system**: 7-day expiring tokens, single-use enforcement, token cleared upon acceptance
- **Portal dashboard**: Client sees case counts, pending invoices, upcoming events at a glance
- **Read-only viewers**: Cases, invoices, and calendar events with proper client scoping
- **Messaging**: Client-attorney communication with case association and ownership validation
- **Profile management**: Phone updates and password changes with current password verification
- **Frontend pages**: Login, accept invitation, dashboard, cases, invoices, events, messages, profile

### Phase 4 & 5 Complete - Documents and Calendar
- **Documents backend**: Full CRUD with object storage integration and ACL enforcement
- **Documents ACL security fix**: Listing now filters by `uploadedById === userId OR isTemplate === true`
- **Documents frontend**: Fixed 7 LSP errors, upload UI with ObjectUploader, Hawaii court forms section
- **Calendar backend**: Full CRUD with validation (start < end time), filters by case/client/type/status/dates
- **Calendar frontend**: Event management with reminders endpoint
- **Security**: All routes auth-protected, ownership verification on deletes, ACL on downloads

### User Management Auto-Update Feature
- Added `refetchUser()` calls after profile updates
- Profile changes now immediately update topbar, sidebar, and all components
- Admin updates to current user also trigger auto-refresh
- No page refresh needed for user information updates

### Security Fixes
- Fixed password hashing on user updates (was storing plaintext)
- Added JWT_SECRET environment variable warning
- Changed `/api/auth/me` to return null for unauthenticated (not 401)
- Separated self-service profile routes from admin routes
- Added password confirmation for all password changes
- Document ACL prevents cross-user metadata disclosure

## Next Steps

1. Complete Clients CRUD operations (edit, delete, search, filter, export)
2. Implement remaining feature modules in priority order
3. Set up integrations: Object Storage (documents), OpenAI (AI assistant), Email (messages)
4. Add comprehensive error handling and validation
5. Implement Hawaii-specific features (CLE, court calendars, tax calculator)
6. Create ECourt Kokua iframe page
7. Wire up Dashboard with live data
8. Final testing and quality assurance

## Notes

- All features must be enterprise-grade and fully functional
- Database already seeded with demo data for testing
- Authentication system is production-ready and secure
- Frontend uses modern React patterns with proper TypeScript typing
