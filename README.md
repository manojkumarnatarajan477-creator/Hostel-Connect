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

```text
HostelConnect/
├── app/
│   ├── (auth)/
│   ├── api/
│   ├── student/
│   └── warden/
├── components/
├── data/
├── hooks/
├── lib/
├── supabase/
└── types/
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
