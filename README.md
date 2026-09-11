# 🏢 HostelConnect

> A smart digital platform for modern hostel and campus residence management.

HostelConnect is a full-stack web application designed to simplify communication and daily operations between **students and hostel wardens**. It replaces traditional paper-based processes with a centralized, user-friendly digital platform.

## 🚀 Key Features

### 👨‍🎓 Student Portal

* Secure login with automatic role-based access
* Personalized student dashboard
* Digital leave and outing requests
* Leave status tracking
* Hostel maintenance and complaint submission
* Anonymous grievance reporting
* Daily and weekly mess menu
* Medical SOS emergency request
* Parcel and courier tracking
* Hostel AI Assistant for hostel-related queries
* Direct navigation to relevant services such as Leave Request and Complaints

### 🛡️ Warden Portal

* Dedicated warden dashboard
* Review and approve/reject leave requests
* Manage student complaints and maintenance requests
* Publish hostel announcements and notices
* Update and manage mess menus
* View student records
* Monitor emergency SOS requests
* Centralized hostel operations management

## 🤖 Hostel AI Assistant

The integrated Hostel AI Assistant helps students quickly access hostel information such as:

* Hostel rules and regulations
* Curfew timings
* Mess timings
* Visitor policies
* Leave procedures
* Emergency guidance

The assistant can also understand user intent and provide **direct navigation to relevant pages**, such as the Leave Request or Complaint page.

## 🔐 Authentication & Role Management

HostelConnect uses a unified authentication system with **role-based access control**.

Users are automatically directed to the appropriate portal:

* **Student → Student Dashboard**
* **Warden → Warden Dashboard**

First-time registration collects the required user information such as name, room number, institutional email, and password.

## 💾 Data Management

The platform supports persistent data storage using:

* Local JSON-based storage for self-hosted environments
* Supabase PostgreSQL for cloud database synchronization
* Persistent storage for users, announcements, leave requests, complaints, and other hostel data

## 🛠️ Technology Stack

| Category    | Technology                 |
| ----------- | -------------------------- |
| Frontend    | Next.js, React, TypeScript |
| Styling     | Tailwind CSS               |
| Backend     | Next.js API Routes         |
| Database    | Supabase PostgreSQL        |
| Storage     | JSON / Supabase            |
| Icons       | Lucide React               |
| AI          | Hostel AI Assistant        |
| Development | Node.js, npm               |

## 📂 Project Structure

```TECH EVENT PROJECT/
├── app/
│   ├── (auth)/                 # Authentication login & registration flows
│   ├── api/                    # RESTful Next.js Route Handlers
│   │   ├── ai/                 # AI Q&A inference endpoint
│   │   ├── announcements/      # Warden broadcast & notice creation
│   │   ├── auth/               # Session & profile verification
│   │   ├── complaints/         # Complaint ticket submissions & updates
│   │   ├── leave/              # Leave creation, approval, and rejection
│   │   ├── lost-found/         # Lost & found community posts
│   │   ├── medical/            # Medical & emergency assistance
│   │   ├── mess/               # Mess menu retrieval & meal feedback
│   │   ├── notifications/      # Real-time user alert streams
│   │   ├── parcels/            # Parcel arrivals & OTP collection verification
│   │   ├── requests/           # Universal multi-action request engine
│   │   └── stats/              # Warden administrative statistics
│   ├── student/                # Student Portal Pages
│   │   ├── ai/                 # Hostel AI chat assistant
│   │   ├── complaints/         # Maintenance ticket desk
│   │   ├── dashboard/          # Student home & daily status
│   │   ├── leave/              # Outpass application & digital passes
│   │   ├── lost-found/         # Lost & found board
│   │   ├── medical/            # Medical help & sick diet room requests
│   │   ├── mess/               # Saveetha weekly menu & reviews
│   │   ├── notifications/      # Noticeboard announcements
│   │   └── parcels/            # Courier tracker & OTP card
│   ├── warden/                 # Warden Control Tower Pages
│   │   ├── announcements/      # Broadcast composer & circular archive
│   │   ├── complaints/         # Maintenance triage & assignment
│   │   ├── dashboard/          # Command center with quick metrics & action bars
│   │   ├── leave/              # Outpass approval terminal
│   │   ├── lost-found/         # Moderated lost items registry
│   │   ├── medical/            # Medical triage & maid room delivery assignment
│   │   ├── parcels/            # Courier intake logger & OTP handover
│   │   └── students/           # Resident directory & room lookup
│   ├── globals.css             # Tailwind CSS tokens & color schemes
│   ├── layout.tsx              # Root HTML wrapper & fonts
│   └── page.tsx                # Landing & portal redirect hub
├── components/
│   ├── ai/                     # ChatWindow, ChatMessage, Quick prompts
│   ├── complaints/             # ComplaintCard, ComplaintForm, StatusBadge
│   ├── dashboard/              # MetricCards, ActivityFeed, QuickActions
│   ├── layout/                 # Navbar, Sidebar, RoleNav, Footer
│   ├── leave/                  # LeaveForm, LeaveStatusCard, DigitalGatePass
│   ├── mess/                   # MessTimings, DaySelector, MealCard
│   └── ui/                     # Button, Badge, Modal, Input primitives
├── lib/
│   ├── ai.ts                   # Hostel AI engine & meal remembrance algorithm
│   ├── auth.ts                 # Role-based session management
│   ├── messData.ts             # Saveetha Academic Hostel August 2026 cyclical menu
│   ├── permissions.ts          # RBAC enforcement logic
│   ├── utils.ts                # Date formatting, OTP generator, class merger
│   └── supabase/               # Supabase browser, server, and client configs
├── scratch/                    # Automated integration & verification test suites
│   ├── test-all-user-requirements.mjs
│   └── test-timings.mjs
├── supabase/
│   ├── schema.sql              # 14-table database schema with RLS & indexes
│   └── seed.sql                # Seed data for demo students, wardens, menus & rules
├── .env.example                # Template for environment configuration
├── package.json                # Project dependencies and npm scripts
├── tsconfig.json               # TypeScript compiler rules
└── README.md                   # Complete platform documentation
```

## ⚙️ Getting Started

### Prerequisites

* Node.js 18.17+
* npm 9+

### Installation

```bash
git clone https://github.com/manojkumarnatarajan477-creator/Hostel-Connect.git
cd Hostel-Connect
npm install
```

### Environment Setup

Create a `.env.local` file and configure your Supabase credentials if cloud database synchronization is required.

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Run the Application

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### Production Build

```bash
npm run build
npm run start
```

## 🔄 Core Workflow

```text
Student
   ↓
Login
   ↓
Student Dashboard
   ↓
Request Leave / Submit Complaint / View Mess Menu
   ↓
Warden Reviews Request
   ↓
Approve / Reject / Resolve
   ↓
Student Receives Updated Status
```

## 🎯 Problem We Solve

Traditional hostel management often relies on paper forms, registers, notice boards, and disconnected communication channels. HostelConnect brings these processes into one centralized platform, making hostel management **faster, more transparent, accessible, and organized**.

## 🌟 Future Scope

* Mobile application
* Push notifications
* Advanced AI capabilities
* QR-based gate verification
* Online fee management
* Parent communication portal
* Analytics and hostel performance reports
* Integration with college ERP systems

## 📄 License

This project is licensed under the **MIT License**.

---

### ❤️ Built For

**Students • Wardens • Hostel Administrators • Educational Institutions**

Built with ❤️ to make campus residential life smarter and simpler.
