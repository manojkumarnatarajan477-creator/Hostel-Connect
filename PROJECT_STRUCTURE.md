# 🗺️ HostelConnect 2.0 - Complete Repository Map & Project Structure

This document provides a complete, gap-free directory tree and file-by-file catalog of the entire **HostelConnect 2.0** repository.

---

## 🌳 Complete Repository Tree

```
hostelconnect2.0/
├── .env.example                               # Environment variable template for Supabase cloud sync
├── .gitignore                                 # Git exclusions (node_modules, .next, .env*, CLAUDE.md)
├── AGENTS.md                                  # Next.js 16 agent rules & framework conventions
├── HOSTEL_AI.md                               # Comprehensive Hostel AI Assistant architecture & guide
├── PROJECT_STRUCTURE.md                       # Full repository map and structural catalog
├── README.md                                  # Main project documentation, concepts, and user guides
├── eslint.config.mjs                          # ESLint configuration
├── next.config.ts                             # Next.js configuration
├── package.json                               # Dependencies, devDependencies, and npm scripts
├── package-lock.json                          # Pinned dependency lockfile
├── postcss.config.mjs                         # PostCSS configuration for Tailwind CSS v4
├── tsconfig.json                              # TypeScript compiler configuration
│
├── app/                                       # Next.js App Router (Pages, Layouts, and API Endpoints)
│   ├── globals.css                            # Global CSS with Tailwind v4 and dark mode variant
│   ├── layout.tsx                             # Root layout with zero-flicker head theme script
│   ├── page.tsx                               # Index entry page redirecting to /login or dashboard
│   │
│   ├── (auth)/                                # Authentication Route Group
│   │   └── login/
│   │       └── page.tsx                       # Single login & dual-role registration page
│   │
│   ├── api/                                   # REST API Route Handlers
│   │   ├── ai/
│   │   │   └── route.ts                       # AI query endpoint with knowledge base filtering
│   │   ├── announcements/
│   │   │   └── route.ts                       # Announcements CRUD (GET, POST, DELETE with memory access)
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── route.ts                   # Credential verification & role detection
│   │   │   ├── me/
│   │   │   │   └── route.ts                   # Current authenticated session resolver
│   │   │   └── register/
│   │   │       └── route.ts                   # Dual-role user registration endpoint
│   │   ├── complaints/
│   │   │   └── route.ts                       # Maintenance complaints (GET, POST, PATCH status)
│   │   ├── leave/
│   │   │   └── route.ts                       # Outing & leave pass requests (GET, POST, PATCH)
│   │   ├── mess/
│   │   │   └── route.ts                       # Weekly mess dining schedule (GET, POST update)
│   │   ├── notifications/
│   │   │   └── route.ts                       # Real-time resident notifications feed
│   │   ├── parcels/
│   │   │   └── route.ts                       # Courier and package locker tracking
│   │   └── requests/
│   │       └── route.ts                       # Emergency medical SOS & miscellaneous requests
│   │
│   ├── student/                               # Student Resident Portal Pages
│   │   ├── layout.tsx                         # Student layout with Sidebar, Navbar, and RoleGuard
│   │   ├── ai/
│   │   │   └── page.tsx                       # Full-page interactive Hostel AI assistant console
│   │   ├── complaints/
│   │   │   └── page.tsx                       # Maintenance grievances lodging & anonymous reporting
│   │   ├── dashboard/
│   │   │   └── page.tsx                       # Resident home dashboard with live announcements & mess cards
│   │   ├── leave/
│   │   │   └── page.tsx                       # Outing & leave application & live approval history
│   │   ├── medical/
│   │   │   └── page.tsx                       # Emergency medical SOS trigger & doctor dispatch
│   │   ├── mess/
│   │   │   └── page.tsx                       # Day-by-day itemized dining menu viewer
│   │   ├── notifications/
│   │   │   └── page.tsx                       # Student activity and approval notifications
│   │   ├── parcels/
│   │   │   └── page.tsx                       # Incoming courier package tracker
│   │   └── requests/
│   │       └── page.tsx                       # General student administrative service requests
│   │
│   └── warden/                                # Warden Operations Console Pages
│       ├── layout.tsx                         # Warden layout with Sidebar, Navbar, and RoleGuard
│       ├── announcements/
│       │   └── page.tsx                       # Dedicated broadcast notices studio (publish, pin, delete)
│       ├── complaints/
│       │   └── page.tsx                       # Facility maintenance ticket dispatch & resolution
│       ├── dashboard/
│       │   └── page.tsx                       # Warden operations command center & leave action queue
│       ├── leave/
│       │   └── page.tsx                       # Outing pass approval and rejection console
│       ├── medical/
│       │   └── page.tsx                       # Resident emergency medical alerts log
│       ├── mess/
│       │   └── page.tsx                       # Weekly dining menu editor & schedule publisher
│       ├── parcels/
│       │   └── page.tsx                       # Courier locker reception & parcel logging desk
│       ├── requests/
│       │   └── page.tsx                       # Miscellaneous resident request approvals
│       └── students/
│           └── page.tsx                       # Searchable enrolled resident registry & room roster
│
├── components/                                # Reusable UI Components
│   ├── ai/                                    # AI Assistant Interface
│   │   ├── ChatMessage.tsx                    # Chat bubble for resident and AI responses
│   │   ├── ChatWidget.tsx                     # Floating residential assistant launcher
│   │   └── ChatWindow.tsx                     # Full chat container with input and suggestion chips
│   ├── auth/                                  # Authentication & Security
│   │   └── RoleGuard.tsx                      # Client-side guard enforcing STUDENT or WARDEN access
│   ├── complaints/                            # Maintenance & Grievances
│   │   ├── ComplaintCard.tsx                  # Maintenance ticket card preview
│   │   ├── ComplaintForm.tsx                  # New complaint submission form with anonymous toggle
│   │   └── ComplaintStatus.tsx                # Visual status progress badge for grievances
│   ├── dashboard/                             # Dashboard Widgets
│   │   ├── AnnouncementCard.tsx               # Official circulars display card
│   │   ├── QuickAction.tsx                    # Clickable shortcut tile
│   │   └── StatCard.tsx                       # Metric card with icons and trends
│   ├── layout/                                # Page Frame & Navigation
│   │   ├── MobileNav.tsx                      # Responsive drawer navigation for mobile devices
│   │   ├── Navbar.tsx                         # Header with user profile, room, notifications, theme toggle
│   │   └── Sidebar.tsx                        # Left navigation sidebar with institutional branding
│   ├── leave/                                 # Outing & Gate Passes
│   │   ├── LeaveForm.tsx                      # Outing pass application form
│   │   └── LeaveStatus.tsx                    # Stepper tracking pending, approved, or rejected passes
│   ├── mess/                                  # Dining & Catering
│   │   └── MenuCard.tsx                       # Scannable meal card with timings and culinary specials
│   └── ui/                                    # Design System Primitives
│       ├── Badge.tsx                          # Reusable status and category pill badge
│       ├── Button.tsx                         # Button component with loading spinner support
│       ├── Card.tsx                           # Surface container (Card, CardHeader, CardTitle, CardContent)
│       ├── Dropdown.tsx                       # Select dropdown menu
│       ├── Input.tsx                          # Form input field with icons and error states
│       ├── Modal.tsx                          # Accessible overlay dialog component
│       └── ThemeToggle.tsx                    # Light/Dark mode toggle button with Sun/Moon icons
│
├── data/                                      # Persistent Server-Side File Storage
│   ├── announcements.json                     # Persistent circulars and official broadcast records
│   └── users.json                             # Registered students and wardens with hashed credentials
│
├── hooks/                                     # Custom React Hooks
│   ├── useAuth.ts                             # Active session, logged-in user profile, and sign-out
│   ├── useNotifications.ts                    # Live unread notifications counter and list
│   └── useUser.ts                             # User profile state helper
│
├── lib/                                       # Core Utilities & Business Logic
│   ├── ai.ts                                  # AI assistant rule engine, prompt, and navigation intent matcher
│   ├── announcementsDb.ts                     # Persistent disk memory CRUD manager for announcements
│   ├── auth.ts                                # Client auth state, session cookies, and credentials verifier
│   ├── permissions.ts                         # Role permissions and route access policies
│   ├── usersDb.ts                             # Persistent disk memory CRUD manager for user accounts
│   ├── utils.ts                               # Class merging utility (clsx + tailwind-merge)
│   └── supabase/                              # Cloud Database Connectors
│       ├── client.ts                          # Client-side Supabase browser client
│       ├── middleware.ts                      # Supabase session refresher for Next.js middleware
│       └── server.ts                          # Server-side Supabase client for Server Components/APIs
│
├── scripts/                                   # Development & Testing Scripts
│   └── test_production_features.js            # Automated validation script for auth and menu
│
├── supabase/                                  # Database Schemas & Migrations
│   ├── schema.sql                             # Complete SQL table definitions, constraints, and RLS policies
│   └── seed.sql                               # Initial database seed records
│
└── types/                                     # TypeScript Contracts & Models
    ├── announcement.ts                        # AnnouncementItem and CreateAnnouncementInput
    ├── auth.ts                                # UserRole, UserProfile, and RegisteredUser
    ├── complaint.ts                           # Complaint, CreateComplaintInput, UpdateComplaintStatusInput
    ├── leave.ts                               # LeaveRequest, LeaveType, LeaveStatus
    ├── medical.ts                             # MedicalRequest and UrgencyLevel
    ├── mess.ts                                # WeeklyMenuData, DayMenuSchedule, MealTimings
    ├── parcel.ts                              # Parcel and ParcelStatus
    └── request.ts                             # GeneralRequest model
```

---

## 📊 Summary by Module

| Directory | Count | Purpose |
| :--- | :--- | :--- |
| `app/(auth)/login/` | 1 file | Single unified login & dual-role registration page |
| `app/api/` | 10 endpoints | REST API routes for AI, announcements, auth, complaints, leaves, mess, etc. |
| `app/student/` | 10 pages/layouts | Student portal views (dashboard, leave, complaints, medical, mess, etc.) |
| `app/warden/` | 10 pages/layouts | Warden management consoles (dashboard, broadcasts, leave queue, mess, etc.) |
| `components/` | 24 components | Modular UI building blocks, layout chrome, and feature cards |
| `data/` | 2 JSON files | Resilient disk memory (`users.json`, `announcements.json`) |
| `hooks/` | 3 hooks | Reactive state hooks for authentication, notifications, and user profiles |
| `lib/` | 9 modules | Core business logic, file database engines, AI rules, and Supabase client |
| `supabase/` | 2 SQL scripts | Database schema, foreign key constraints, indexes, and seed data |
| `types/` | 8 type files | Comprehensive TypeScript interfaces and domain types |
| Root configs | 9 files | Configs (`next.config.ts`, `tsconfig.json`, `package.json`, etc.) |
| **Total Tracked** | **94 files** | **Complete project with zero gaps** |
