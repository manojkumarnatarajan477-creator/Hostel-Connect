# 🏢 HostelConnect 2.0 - Campus Residence & Life Management Platform

HostelConnect 2.0 is a modern, responsive, and full-featured campus residence management platform designed for universities and academic institutions. It bridges the gap between student residents and hostel administration (Chief Warden & Staff) with real-time operations, persistent data storage, and modern web UX.

---

## ✨ Key Features

### 1. 🔐 Unified Authentication & Dual-Role Registration
- **Single Sign-In Form**: Automatically detects whether an authenticated user is a **Student Resident** or **Hostel Warden** and seamlessly routes them to the appropriate portal.
- **First-Time Registration**:
  - **Student Resident**: Collects Full Name, Assigned Room Number, Institutional Email, and Password.
  - **Hostel Warden**: Collects Warden Name, Office Location / Assigned Block, Staff Email, and Password.
- **Role Isolation & Guards**: Protected routes via `RoleGuard` to ensure student privacy and administrative security.

### 2. 📢 Persistent Announcements & Broadcast Console ("Memory Access")
- **Warden Broadcast Console**: Wardens can publish announcements directly from their dashboard or the dedicated `/warden/announcements` console with categories, target blocks, and pinning options.
- **Persistent Disk & Memory Storage**: Announcements are persistently saved in server storage (`data/announcements.json`) and synchronized with Supabase `announcements` table if configured.
- **Real-Time Student Feed**: Student dashboards poll live updates so new circulars appear instantly without requiring page reloads.

### 3. 🌓 Light & Dark Theme Switcher
- Built using **Tailwind CSS v4** with `@custom-variant dark`.
- Easily accessible toggle in the universal `Navbar` and the `/login` screen.
- Persists user preferences in `localStorage` (`hc_theme`) with a zero-flicker head initialization script.

### 4. 🛡️ Warden Operations Console
- **Emergency Medical Alerts**: Prominent real-time SOS alerts with 1-click doctor/first-responder dispatch.
- **Action Queue**: Inline 1-click **Approve** and **Reject** (with reason modal) for student leave applications.
- **Maintenance & Complaints Tracker**: Live status updates across plumbing, electrical, carpentry, and general grievances.
- **Parcel & Courier Management**: Log student courier arrivals and update delivery statuses.

### 5. 🍽️ Itemized Mess Menu Management
- Clean day-wise view of meals (Breakfast, Lunch, Snacks, Dinner) with meal timings and daily specials.
- Warden capability to update schedules or upload new menus, automatically reflected on student dashboards.

### 6. 🤖 Hostel AI Assistant
- Integrated AI residential guide capable of understanding student questions and providing direct deep-link navigation buttons to relevant forms (leaves, complaints, medical SOS, mess menus).

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org) with Turbopack
- **Language**: TypeScript 5
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com)
- **Icons**: [Lucide React](https://lucide.dev)
- **Database & Sync**: Persistent File/JSON Store + [Supabase](https://supabase.com) (PostgreSQL & Realtime)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18.x or later
- npm or yarn

### 2. Installation
```bash
git clone https://github.com/manojkumarnatarajan477-creator/hostelconnect2.0.git
cd hostelconnect2.0
npm install
```

### 3. Environment Variables (Optional)
Copy `.env.example` to `.env.local` if connecting to Supabase:
```bash
cp .env.example .env.local
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build
```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```
hostelconnect2.0/
├── app/
│   ├── (auth)/login/       # Unified login & first-time registration
│   ├── api/                # API routes (announcements, leave, complaints, mess, auth, etc.)
│   ├── student/            # Student portal pages (dashboard, leave, complaints, mess, ai, etc.)
│   └── warden/             # Warden operations console (dashboard, announcements, mess, etc.)
├── components/
│   ├── auth/               # RoleGuard and auth components
│   ├── layout/             # Sidebar, Navbar, MobileNav
│   └── ui/                 # Reusable UI library (Card, Button, Modal, Badge, ThemeToggle)
├── data/                   # Persistent local storage (users.json, announcements.json)
├── hooks/                  # Custom React hooks (useAuth, useNotifications, etc.)
├── lib/                    # Core utilities (announcementsDb, usersDb, supabase, ai)
├── supabase/               # Database SQL schema & migration scripts
└── types/                  # TypeScript interface definitions
```

---

## 📄 License
This project is licensed under the MIT License.
