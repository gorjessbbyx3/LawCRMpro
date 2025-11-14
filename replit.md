# LegalCRM Pro - Hawaii Legal Practice Management System

## Overview
Enterprise-grade legal practice management system built for Hawaii attorneys with comprehensive case management, time tracking, billing, compliance, and AI-powered features.

## Current Status (November 14, 2025)

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

### 🚧 In Progress

#### Clients CRUD Operations (Task 5)
- Basic UI exists, needs complete CRUD implementation
- Required: edit, delete, search, filter, export functionality

### 📋 Pending Features

1. **Cases Management** - Full CRUD with PDF export and case details
2. **Time Tracking** - Timer functionality, inter-island travel tracking, edit/delete/filter/export
3. **Invoicing** - Generate from time entries, PDF export, email, Hawaii GET tax calculator
4. **Documents** - Object storage integration, upload/download, Hawaii court forms
5. **Calendar** - Events CRUD, reminders, Hawaii court calendar integration
6. **Messages** - Email integration, threading, templates
7. **AI Assistant** - OpenAI integration for document analysis and legal research
8. **Reports** - Revenue analysis, time tracking reports, case statistics
9. **Hawaii Compliance** - CLE tracker, bar requirements, ethics deadlines
10. **ECourt Kokua** - iframe integration to Hawaii eCourt system
11. **Dashboard** - Wire up with real data and functionality

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

## Recent Changes (November 14, 2025)

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
