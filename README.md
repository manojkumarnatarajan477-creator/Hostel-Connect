# 🏢 HostelConnect 2.0 - Campus Residence & Life Management Platform

> **A modern, real-time, privacy-first campus residence platform bridging students and hostel administration.**

HostelConnect 2.0 is an enterprise-grade web application tailored for universities, colleges, and academic institutions to manage all residential life operations in one unified digital ecosystem. It completely replaces paper-based gate passes, lost maintenance complaints, unstructured notice boards, and disconnected mess schedules with a real-time, interactive, and automated platform.

---

## 📑 Table of Contents

1. [System Concept & Philosophy](#-system-concept--philosophy)
2. [Platform Experience: Student Portal](#-platform-experience-student-portal)
3. [Platform Experience: Warden Operations Console](#-platform-experience-warden-operations-console)
4. [How We Built It: Technical Implementation](#-how-we-built-it-technical-implementation)
5. [End-to-End Workflows](#-end-to-end-workflows)
6. [Data Persistence & "Memory Access" Architecture](#-data-persistence--memory-access-architecture)
7. [Light & Dark Theme System](#-light--dark-theme-system)
8. [Technology Stack](#-technology-stack)
9. [Getting Started & Installation](#-getting-started--installation)
10. [Project Directory Layout](#-project-directory-layout)

---

## 💡 System Concept & Philosophy

Traditional campus hostels struggle with fragmented communication channels:
- **Paper Leave Slips**: Long queues at the warden's office, delayed approvals, and lost records.
- **Lost Complaints**: Grievances written in register notebooks with zero tracking of plumber or electrician assignments.
- **Emergency Delays**: Lack of an instant medical SOS channel when students fall critically ill late at night.
- **Static Notice Boards**: Physical circulars that residents miss or that get outdated quickly.
- **Unclear Mess Menus**: Paragraph-style notices leading to confusion over meal timings and food options.

### The HostelConnect Solution
HostelConnect 2.0 establishes a **single source of truth** for campus life:
1. **Zero-Friction Single Sign-In**: Both students and staff authenticate from one unified login screen with automatic role detection and dedicated dashboards.
2. **Real-Time Two-Way Sync**: Actions taken by wardens (e.g., approving a leave or publishing a notice) update on student screens in real time without requiring manual page reloads.
3. **Resilient Memory Persistence**: Every registered user, leave request, maintenance complaint, and official notice is stored permanently in server memory and disk storage (`data/`), surviving restarts and syncable with Supabase.
4. **Resident Privacy & Security**: Role guards prevent unauthorized access, while an anonymous grievance feature allows students to safely report sensitive matters.

---

## 🎓 Platform Experience: Student Portal

The Student Portal (`/student/*`) is designed for maximum clarity, mobile responsiveness, and rapid self-service.

```
+-------------------------------------------------------------------------+
|                              STUDENT PORTAL                             |
+-------------------+-----------------------------------------------------+
| SIDEBAR           | HEADER: Block A • Room 204 | Hostel AI | Theme | Profile|
| - Dashboard       +-----------------------------------------------------+
| - Leave Pass      | 📢 Hostel Official Announcements (Live Circulars)   |
| - Complaints      +-----------------------------------------------------+
| - Mess Menu       | 🍽️ Today's Itemized Mess Menu (Day-by-Day Selector)  |
| - Medical SOS     +-----------------------------------------------------+
| - Parcels         | 🛫 My Outing/Leave Passes | 🔧 Maintenance Tracker  |
| - Hostel AI       +-----------------------------------------------------+
+-------------------+-----------------------------------------------------+
```

### 1. Unified Student Dashboard (`/student/dashboard`)
- **Live Circulars Banner**: Prominently highlights official announcements broadcasted by the Chief Warden Desk, complete with `PINNED` indicators, category badges, and relative timestamps ("Just now", "2 hours ago").
- **Itemized Mess Schedule**: Displays today's meals (Breakfast, Lunch, Snacks, Dinner) in scannable cards with exact dining hours and daily culinary specials. Students can toggle between Monday–Sunday to view upcoming meals.
- **Quick Status Trackers**: Provides instant visibility into active leave passes, logged maintenance requests, and courier parcels ready for collection.

### 2. Digital Outing & Leave Pass (`/student/leave`)
- **Interactive Application Form**: Students enter leave type (Home Visit, Weekend Outing, Academic Conference, Medical Leave), departure/return dates, destination address, and emergency contact details.
- **Live Status Feed**: Visual stepper displaying approval progress: `PENDING` ➔ `APPROVED` (with digital gate clearance) or `REJECTED` (with the warden's recorded reason).

### 3. Maintenance & Grievance Lodging (`/student/complaints`)
- **Categorized Issue Reporting**: Report issues across Electrical, Plumbing, Carpentry, Wi-Fi / LAN, Cleanliness, and Appliances.
- **Anonymous Reporting Mode**: Students can check *"File as Anonymous Complaint"* to hide their name and room number for sensitive campus grievances.
- **Real-Time Progression**: Tracks tickets from `OPEN` to `IN_PROGRESS` to `RESOLVED`.

### 4. Emergency Medical SOS (`/student/medical`)
- **Critical Care Trigger**: High-priority alert form allowing students to report severe symptoms, room location, and urgency (`Mild`, `Moderate`, `Critical Emergency`).
- **Instant Escalation**: Instantly triggers a pulsing red emergency alert banner across the Warden Operations Console with direct doctor dispatching.

### 5. Smart Courier & Parcel Tracker (`/student/parcels`)
- Notifies students when Amazon, Flipkart, or postal packages are received at the hostel security desk.
- Displays carrier name, tracking code, arrival time, and security handover status (`READY_FOR_PICKUP` or `COLLECTED`).

### 6. Hostel AI Resident Assistant (`/student/ai`)
- Conversational residential companion that answers questions about hostel rules, curfews, mess timings, fee rebates, and visitor policies.
- **Direct Navigation Deep-Links**: Automatically detects resident intent and offers 1-click action buttons (e.g., asking *"I need to go home this weekend"* provides a direct link to `Apply for Leave →`).

---

## 🛡️ Platform Experience: Warden Operations Console

The Warden Console (`/warden/*`) equips the Chief Warden and residential staff with an administrative command center to supervise hundreds of residents effortlessly.

```
+-------------------------------------------------------------------------+
|                        WARDEN OPERATIONS CONSOLE                        |
+-------------------+-----------------------------------------------------+
| SIDEBAR           | HEADER: Dr. K. Raman (Chief Warden) | Theme | Sign Out  |
| - Dashboard       +-----------------------------------------------------+
| - Broadcasts      | 🚨 EMERGENCY SOS ALERT: Student in B-304 (Dr. Dispatch)|
| - Leave Approvals +-----------------------------------------------------+
| - Complaints Hub  | STATS: 420 Students | 5 Pending Leaves | 3 Complaints |
| - Mess Manager    +-----------------------------------------------------+
| - Parcels Desk    | ACTION QUEUE: 1-Click Leave Approvals & Rejections  |
| - Student Records +-----------------------------------------------------+
+-------------------+-----------------------------------------------------+
```

### 1. Operations Command Center (`/warden/dashboard`)
- **Real-Time Operational Metrics**:
  - Total Enrolled Residents (e.g., 420 students)
  - Active Leave Applications Pending Review
  - Open Maintenance & Grievance Tickets
  - Live Circulars Published
  - Active Mess Schedule with timestamp of last warden update
- **Emergency Medical Alert Banner**: Real-time high-visibility notification whenever a student triggers a medical emergency, including room number and 1-click first-responder dispatching.
- **Quick Action Toolbar**: 1-click shortcuts to *Upload Mess Menu*, *Broadcast Announcement*, *Manage Complaints*, and *Review Students*.

### 2. Streamlined Leave Management
- **1-Click Approvals**: Wardens can review student destination, dates, and parent contacts, then immediately click **Approve** to issue digital clearance.
- **Reasoned Rejection Modal**: Clicking **Reject** prompts the warden to select or enter a structured justification (e.g., *"Curfew restrictions in effect"*, *"Parent confirmation missing"*). The decision and explanation are immediately delivered to the student's portal.

### 3. Persistent Broadcast Announcements Console (`/warden/announcements`)
- **Full Interactive Broadcast Studio**:
  - Publish official circulars with custom Title, Category (*General Notice, Maintenance, Curfew & Security, Mess Committee, Health & Medical, Academic & Events*), and Target Block (*All Blocks, Block A, Block B*).
  - **Pin to Top**: Keeps urgent notifications at the top of every resident's dashboard.
  - **Disk & Memory Storage**: Immediately writes notices to `data/announcements.json` so they are never lost on server reboots.
  - **Notice Management**: Search circulars by keyword, filter by category, and delete obsolete circulars with 1 click.

### 4. Complaints & Facilities Hub (`/warden/complaints`)
- Full administrative overview of all student maintenance requests.
- Filter tickets by category or urgency.
- Assign technicians, add resolution notes, and mark tickets as `RESOLVED`.

### 5. Mess Menu Management (`/warden/mess`)
- View and update the official campus dining menu.
- Wardens can update meal items day by day or upload updated weekly PDF/image schedules.
- Changes propagate immediately to all student portals.

### 6. Student Resident Directory (`/warden/students`)
- Searchable registry of all enrolled residents, room numbers, assigned blocks, emergency contacts, and active statuses.

---

## ⚙️ How We Built It: Technical Implementation

### 1. Unified Authentication & Role-Based Routing
- **Single Sign-In Form**: Designed in [`app/(auth)/login/page.tsx`](file:///d:/HOSTEL%20CONNECT/hostelconnect2.0/app/(auth)/login/page.tsx) to accept any student email, student ID, or warden staff email.
- **Automated Role Detection**: The server checks the user's stored account credentials and determines whether they are a `STUDENT` or `WARDEN`.
- **Automatic Redirection**:
  - `STUDENT` ➔ `/student/dashboard`
  - `WARDEN` ➔ `/warden/dashboard`
- **First-Time Registration**:
  - Toggle between **Student Resident** (collects Full Name, Assigned Room Number, Institutional Email, and Password) and **Hostel Warden** (collects Warden Name, Office Location / Assigned Block, Staff Email, and Password).
- **Route Guard Protection ([`components/auth/RoleGuard.tsx`](file:///d:/HOSTEL%20CONNECT/hostelconnect2.0/components/auth/RoleGuard.tsx))**: Client-side and middleware guards prevent students from accessing administrative pages and redirect wardens away from student-only views.

### 2. Persistent Announcements ("Memory Access")
- **Persistent DB Manager ([`lib/announcementsDb.ts`](file:///d:/HOSTEL%20CONNECT/hostelconnect2.0/lib/announcementsDb.ts))**:
  - Handles JSON serialization to [`data/announcements.json`](file:///d:/HOSTEL%20CONNECT/hostelconnect2.0/data/announcements.json).
  - Generates unique IDs, handles pinned ordering, and computes human-readable relative time strings (*"Just now"*, *"3 hours ago"*, *"Yesterday"*).
  - Synchronizes asynchronously with Supabase `announcements` table if cloud database credentials are provided.
- **REST API ([`app/api/announcements/route.ts`](file:///d:/HOSTEL%20CONNECT/hostelconnect2.0/app/api/announcements/route.ts))**:
  - `GET`: Returns announcements ordered by pinned status and timestamp. Supports `category` and `block` filters.
  - `POST`: Validates payload, saves to persistent storage, and returns the newly broadcasted notice.
  - `DELETE`: Removes the notice by ID from both disk storage and database.
- **Reactive Polling**: The student dashboard polls `/api/announcements` on an interval, ensuring newly broadcasted notices pop up dynamically.

### 3. Light & Dark Theme Engine
- **Tailwind CSS v4 Integration**: Configured `@custom-variant dark (&:where(.dark, .dark *));` in [`app/globals.css`](file:///d:/HOSTEL%20CONNECT/hostelconnect2.0/app/globals.css) to support class-based theme switching across all components.
- **Zero-Flicker Script**: An inline hydration script in [`app/layout.tsx`](file:///d:/HOSTEL%20CONNECT/hostelconnect2.0/app/layout.tsx) checks `localStorage.getItem("hc_theme")` and system color preference before the DOM paints, eliminating theme flash on reload.
- **ThemeToggle Component ([`components/ui/ThemeToggle.tsx`](file:///d:/HOSTEL%20CONNECT/hostelconnect2.0/components/ui/ThemeToggle.tsx))**: Smooth animated Sun/Moon toggle button mounted in the global `Navbar` and the `/login` screen.

### 4. Residential AI Guide Architecture
- **Knowledge Isolation**: The assistant operates strictly from `ai_knowledge` seed rules (curfews, meal schedules, emergency procedures). It has zero access to private student records, complaint logs, or medical histories.
- **Deep-Link Resolution**: Natural language parsing in [`lib/ai.ts`](file:///d:/HOSTEL%20CONNECT/hostelconnect2.0/lib/ai.ts) detects keywords like *"leave"*, *"complaint"*, *"food"*, *"doctor"* and injects structured navigation buttons directly into the chat response.

---

## 🔄 End-to-End Workflows

### Workflow 1: The Outing & Leave Pass Cycle
```
[Student fills Leave Form] 
       │
       ▼
[POST /api/leave] ──► Saved with status: PENDING
       │
       ▼
[Warden Dashboard] ──► Real-time badge alerts warden of new leave request
       │
       ▼
[Warden clicks "Approve" or "Reject"]
       │
       ▼
[PATCH /api/leave] ──► Updated status + rejection reason saved
       │
       ▼
[Student Dashboard] ──► Status badge shifts to APPROVED / REJECTED in real time
```

### Workflow 2: Warden Circular Broadcast
```
[Warden clicks "+ New" in Broadcast Notices]
       │
       ▼
[Fills Title, Category, Target Block, "Pin to Top", Content]
       │
       ▼
[POST /api/announcements] ──► Stored in data/announcements.json + Supabase
       │
       ▼
[Student Dashboard] ──► Live polling fetches updated circular within seconds
       │
       ▼
[Student sees notice with PINNED badge and category tag]
```

### Workflow 3: Emergency Medical Alert
```
[Student clicks "Medical SOS" & submits symptoms]
       │
       ▼
[POST /api/requests?type=medical] ──► Tagged: CRITICAL_EMERGENCY
       │
       ▼
[Warden Console] ──► Pulsing Red Alert Banner activates with room number
       │
       ▼
[Warden clicks "Dispatch Doctor / Ambulance"] ──► Assistance coordinated immediately
```

---

## 💾 Data Persistence & "Memory Access" Architecture

All application data is maintained with **dual-layer resilience**:

1. **Local Persistent File Storage (`data/*.json`)**:
   - `data/users.json`: Stores registered students and wardens with hashed credentials, assigned room numbers, and contact information.
   - `data/announcements.json`: Stores all broadcasted circulars, author information, target blocks, and pinned flags.
   - **Advantage**: The application functions completely offline or in self-hosted campus environments without requiring external third-party database subscriptions.

2. **Cloud Database Sync (Supabase PostgreSQL)**:
   - When Supabase credentials (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`) are set in `.env.local`, the platform automatically mirrors users, complaints, leaves, notifications, and announcements to Supabase.
   - Realtime publication subscriptions (`supabase_realtime`) enable instant event pushing across connected browser tabs.

---

## 🌓 Light & Dark Theme System

HostelConnect 2.0 provides native, ergonomic dark and light viewing modes tailored for late-night study sessions and bright campus daylight:

| Mode | Visual Style | Intended Usage |
| :--- | :--- | :--- |
| **Dark Mode (Default)** | Deep slate backgrounds (`#020617`), glowing indigo accents, muted borders | Nighttime study, reduced eye strain, battery saving |
| **Light Mode** | Crisp clean white cards (`#ffffff`), soft slate surfaces (`#f8fafc`), high contrast text | Daylight campus administration, bright office environments |

- **State Persistence**: The active theme is stored in `localStorage` under key `"hc_theme"`.
- **Accessibility**: Includes high-contrast text, clear border delimiters, and accessible ARIA attributes.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend Framework** | [Next.js 16 (App Router)](https://nextjs.org) with Turbopack |
| **UI Library & Language** | React 19, TypeScript 5 |
| **CSS Styling Engine** | [Tailwind CSS v4](https://tailwindcss.com) (`@import "tailwindcss"`, `@custom-variant dark`) |
| **Iconography** | [Lucide React](https://lucide.dev) |
| **State & Networking** | React Hooks (`useState`, `useEffect`, `useCallback`), native Fetch API |
| **Storage & Persistence** | Resilient Node.js File System (`data/*.json`) + [Supabase](https://supabase.com) (PostgreSQL & Realtime) |

---

## 🚀 Getting Started & Installation

### Prerequisites
- **Node.js**: v18.17.0 or later
- **npm**: v9.0.0 or later

### 1. Clone the Repository
```bash
git clone https://github.com/manojkumarnatarajan477-creator/Hostel-Connect.git
cd Hostel-Connect
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables (Optional)
If you wish to synchronize data with a Supabase cloud project, copy the example environment file:
```bash
cp .env.example .env.local
```
Add your Supabase project credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```
*(Note: If omitted, the platform will automatically run in local persistent file storage mode without errors!)*

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm run start
```

---

## 📁 Project Directory Layout

```
hostelconnect2.0/
├── app/
│   ├── (auth)/
│   │   └── login/             # Unified single login & dual-role registration
│   ├── api/                   # REST API routes
│   │   ├── ai/                # AI assistant prompt & knowledge handler
│   │   ├── announcements/     # Broadcast circulars CRUD (Memory Access)
│   │   ├── auth/              # Registration, login, and session validation
│   │   ├── complaints/        # Maintenance grievances endpoint
│   │   ├── leave/             # Outing & leave pass applications
│   │   ├── mess/              # Weekly dining schedule endpoint
│   │   ├── notifications/     # User notifications API
│   │   ├── parcels/           # Courier tracking endpoint
│   │   └── requests/          # Medical emergency & miscellaneous requests
│   ├── student/               # Resident Portal pages
│   │   ├── ai/                # Dedicated Hostel AI chat page
│   │   ├── complaints/        # Maintenance request lodging
│   │   ├── dashboard/         # Resident home dashboard & live circulars
│   │   ├── leave/             # Outing pass application & history
│   │   ├── medical/           # Medical SOS room request
│   │   ├── mess/              # Itemized dining menu
│   │   └── parcels/           # Courier locker tracker
│   └── warden/                # Warden Operations Console
│       ├── announcements/     # Broadcast circulars management console
│       ├── complaints/        # Facility maintenance ticket dispatch
│       ├── dashboard/         # Warden overview, SOS alerts, & action queue
│       ├── leave/             # Leave pass approval & rejection console
│       ├── mess/              # Mess menu management & schedule update
│       └── students/          # Enrolled resident directory
├── components/
│   ├── ai/                    # ChatWindow, ChatMessage, ChatWidget
│   ├── auth/                  # RoleGuard component
│   ├── complaints/            # ComplaintCard, ComplaintForm, ComplaintStatus
│   ├── dashboard/             # StatCard, QuickAction, AnnouncementCard
│   ├── layout/                # Navbar, Sidebar, MobileNav
│   ├── leave/                 # LeaveForm, LeaveStatus
│   ├── mess/                  # MenuCard component
│   └── ui/                    # Reusable UI (Badge, Button, Card, Input, Modal, ThemeToggle)
├── data/                      # Persistent disk memory (users.json, announcements.json)
├── hooks/                     # Custom React hooks (useAuth, useNotifications, useUser)
├── lib/                       # Core logic (announcementsDb, usersDb, supabase, ai, auth)
├── supabase/                  # PostgreSQL schema and seed data
└── types/                     # TypeScript data contracts (announcement, auth, leave, etc.)
```

---

## 📄 License & Credits

Developed with ❤️ for academic institutions and student communities.  
Licensed under the [MIT License](LICENSE).
