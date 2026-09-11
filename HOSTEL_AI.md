# 🤖 HostelConnect AI Assistant Guide

This document outlines the architecture, capabilities, privacy protocols, and routing configuration for the HostelConnect 2.0 AI Resident Assistant module.

---

## 🏛️ Architecture Overview

The AI Assistant is built as an isolated, privacy-preserving residential guidance module:

- **UI Components**:
  - `components/ai/ChatWindow.tsx`: Interactive chat interface with message stream, suggestion chips, and responsive inputs.
  - `components/ai/ChatMessage.tsx`: Chat bubble rendering for resident and bot responses.
  - `components/ai/ChatWidget.tsx`: Floating residential assistant widget.
- **Frontend Page**:
  - `app/student/ai/page.tsx`: Full-page dedicated AI console for residents.
- **API Route Handler**:
  - `app/api/ai/route.ts`: Secure endpoint validating requests and returning structured guidance.
- **Core Intelligence & Rule Engine**:
  - `lib/ai.ts`: Contains knowledge base matching, navigation intent resolver, and privacy enforcement.

---

## 🔒 Privacy & Data Isolation Directive

The AI Assistant follows a strict zero-leakage security boundary:
1. **Public/General Knowledge Only**: The assistant only accesses verified general hostel guidelines from the `ai_knowledge` table / seed store (curfew rules, mess timings, medical emergency protocols, leave application procedures).
2. **No Access to Confidential Tables**: The AI engine is strictly barred from accessing:
   - Private student complaint records
   - Confidential medical requests / health logs
   - Personal student profile details
   - Disciplinary remarks
3. If a student queries restricted data, the assistant politely declines and instructs the resident to consult the Chief Warden's office directly.

---

## ⚡ Direct Navigation & Deep Links

When residents express actionable intent, the assistant returns one-click action buttons directly to the relevant platform module:

- **Leave Requests**: `"I want to apply for leave"` ➔ Links to `/student/leave`
- **Maintenance / Complaints**: `"The fan in my room is broken"` ➔ Links to `/student/complaints`
- **Emergency Medical Help**: `"I have severe chest pain"` ➔ Links to `/student/medical` with high-priority doctor dispatch alert
- **Mess Menu**: `"What is for dinner tonight?"` ➔ Links to `/student/mess`
- **Courier & Parcels**: `"Did my courier arrive?"` ➔ Links to `/student/parcels`
- **Official Circulars**: `"Any notices today?"` ➔ Links to `/student/dashboard#announcements`
