import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export interface AIKnowledgeItem {
  id?: string;
  topic: string;
  category: string;
  content: string;
  tags?: string[];
}

export interface AIActionLink {
  label: string;
  href: string;
}

export interface AIResponse {
  answer: string;
  suggestions: string[];
  sources: string[];
  actionLink?: AIActionLink;
}

// System Prompt for Hostel AI Assistant
export const HOSTEL_AI_SYSTEM_PROMPT = `
You are the official HostelConnect AI Resident Assistant for campus students.
Your primary role is to provide quick, accurate, and empathetic assistance on hostel rules, mess schedules, medical emergency protocols, leave procedures, and direct page navigation.

CRITICAL PRIVACY DIRECTIVE:
You only read and respond using verified general hostel guidelines from the 'ai_knowledge' knowledge base.
You do NOT have access to private student databases, individual complaint tickets, medical logs, or personal records.
If a student asks about confidential records or other students' private info, politely clarify that such records are restricted and advise them to consult the Chief Warden office directly.
`;

// Seed knowledge base for reliable fallback when database tables are initializing
export const DEFAULT_AI_KNOWLEDGE: AIKnowledgeItem[] = [
  {
    topic: "Hostel Gate Curfew & Timings",
    category: "RULES",
    content:
      "Hostel main gates close at 10:00 PM sharp on weekdays and 10:30 PM on weekends. Late entry requires prior approval via a valid Outing Gate Pass approved by the Chief Warden. Unapproved late entries are logged at the security turnstiles.",
    tags: ["curfew", "timing", "gate", "night", "entry", "late"],
  },
  {
    topic: "Mess Timings & Schedule",
    category: "MESS",
    content:
      "Daily meal timings in Central Dining Hall: Breakfast (07:30 AM - 09:00 AM), Lunch (12:30 PM - 02:00 PM), Evening Snacks & Chai (05:00 PM - 06:00 PM), and Dinner (07:30 PM - 09:00 PM). Special Sunday Dum Biryani is served from 12:30 PM - 02:30 PM.",
    tags: ["mess", "food", "lunch", "dinner", "breakfast", "snacks", "menu", "timing"],
  },
  {
    topic: "Mess Rebate Policy",
    category: "MESS",
    content:
      "Students traveling away from campus for 3 consecutive days or more can claim a Mess Rebate by submitting an approved Leave Request at least 24 hours in advance through the portal.",
    tags: ["rebate", "mess rebate", "leave mess", "fee discount", "refund"],
  },
  {
    topic: "Medical Room & Health Protocol",
    category: "HEALTH",
    content:
      "The Hostel Dispensary is located on the Ground Floor of Block A (Admin Wing) and operates from 08:00 AM to 08:00 PM with Dr. R. Iyer on duty. For night emergencies, a 24/7 on-call nurse is stationed, and Campus Ambulance can be reached immediately at +91 99887 76655 or by tapping the emergency SOS in the Medical section.",
    tags: ["medical", "doctor", "emergency", "ambulance", "hospital", "dispensary", "sick", "fever"],
  },
  {
    topic: "Leave & Outing Gate Pass Procedure",
    category: "LEAVE",
    content:
      "All outings and home visits must be applied for through the 'Leave Requests' portal. Submissions must be made before 06:00 PM for same-day outing approvals. Once the Warden approves, your active digital Gate Pass is automatically validated at the security gate with QR verification.",
    tags: ["leave", "outing", "gate pass", "home visit", "permission", "vacation"],
  },
  {
    topic: "Electrical Appliances & Room Regulations",
    category: "RULES",
    content:
      "High-power electrical equipment including induction cookers, immersion heaters, heavy electric kettles, and electric irons are strictly prohibited in hostel rooms for fire safety. Mobile chargers, laptops, and study lamps are permitted.",
    tags: ["appliances", "heater", "rules", "kettle", "iron", "electricity", "safety"],
  },
  {
    topic: "Parcel Pickup & Security Counter",
    category: "PARCELS",
    content:
      "All courier deliveries (Amazon, Flipkart, BlueDart, India Post) are deposited at the Block A Security Gate reception. Students receive a notification with a unique 4-digit verification OTP. Show your OTP and student ID card at the desk to collect your package between 09:00 AM and 09:00 PM.",
    tags: ["parcel", "courier", "amazon", "delivery", "otp", "reception", "security"],
  },
  {
    topic: "Maintenance & Room Repairs SLA",
    category: "MAINTENANCE",
    content:
      "Routine electrical, plumbing, or carpentry issues submitted via the Complaints tab are attended within 24 to 48 hours by campus maintenance personnel. Emergency issues (sparking, pipe burst) are dispatched immediately with high priority.",
    tags: ["complaint", "repair", "plumber", "electrician", "maintenance", "wifi", "fan"],
  },
  {
    topic: "Guest Policy & Visitor Hours",
    category: "RULES",
    content:
      "Parents and guardians are permitted to visit between 10:00 AM and 06:30 PM in the Visitor Lounge. Overnight stay of unauthorized outside guests in student rooms is strictly prohibited. Campus Guest House rooms can be reserved in advance via the Warden office.",
    tags: ["guest", "parents", "visitors", "stay", "rules"],
  },
];

/**
 * Isolated knowledge retrieval that queries ONLY the `ai_knowledge` table.
 * Strictly guarantees no access to complaints, medical_requests, or user tables.
 */
export async function getKnowledgeFromDB(query: string): Promise<AIKnowledgeItem[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("ai_knowledge")
        .select("topic, category, content, tags")
        .limit(10);

      if (!error && data && data.length > 0) {
        const lower = query.toLowerCase();
        const matched = data.filter((item: AIKnowledgeItem) => {
          const textMatch =
            item.topic.toLowerCase().includes(lower) ||
            item.content.toLowerCase().includes(lower);
          const tagMatch = item.tags?.some((t) => lower.includes(t.toLowerCase()));
          return textMatch || tagMatch;
        });

        if (matched.length > 0) return matched;
        return data.slice(0, 3);
      }
    } catch (err) {
      console.warn("Using default knowledge base for AI query:", err);
    }
  }

  // Fallback to verified local knowledge base
  const lowerQuery = query.toLowerCase();
  const matched = DEFAULT_AI_KNOWLEDGE.filter((item) => {
    const textMatch =
      item.topic.toLowerCase().includes(lowerQuery) ||
      item.content.toLowerCase().includes(lowerQuery);
    const tagMatch = item.tags?.some((t) => lowerQuery.includes(t.toLowerCase()));
    return textMatch || tagMatch;
  });

  if (matched.length > 0) return matched;
  return DEFAULT_AI_KNOWLEDGE.slice(0, 3);
}

/**
 * Main AI generation logic with comprehensive Navigation Intent understanding
 */
export async function processHostelAIQuery(query: string): Promise<AIResponse> {
  const lower = query.toLowerCase().trim();

  // Guardrail check against private student data requests
  const privacyKeywords = [
    "private complaints",
    "complaint of",
    "complaints of",
    "who filed complaint",
    "medical history",
    "medical record",
    "private details",
    "other student",
    "student phone",
    "roommate phone",
    "confidential",
  ];

  if (privacyKeywords.some((pk) => lower.includes(pk))) {
    return {
      answer:
        "For student privacy and regulatory compliance, the Hostel AI assistant cannot access private records, other students' complaints, or confidential health logs. Please visit the Chief Warden office for administrative inquiries.",
      suggestions: [
        "What are the mess timings?",
        "How do I apply for leave?",
        "Dispensary doctor timings",
      ],
      sources: ["Campus Privacy Policy Art. 7"],
    };
  }

  // Retrieve matching knowledge strictly from ai_knowledge
  const knowledgeItems = await getKnowledgeFromDB(query);

  let answer = "";
  let suggestions: string[] = [];
  let actionLink: AIActionLink | undefined;
  const sources = knowledgeItems.map((k) => k.topic);

  // 1. LEAVE & OUTING GATE PASS (Navigation & Info)
  if (
    lower.includes("leave") ||
    lower.includes("outing") ||
    lower.includes("gate pass") ||
    lower.includes("vacation") ||
    lower.includes("permission to go") ||
    lower.includes("night out") ||
    lower.includes("home visit")
  ) {
    const leaveInfo = knowledgeItems.find((k) => k.category === "LEAVE") || DEFAULT_AI_KNOWLEDGE[4];
    answer = `To travel outside campus or visit home, you must submit a digital Leave Request. Specify your leave type, start and return dates, destination, reason, and emergency contact. Once reviewed and approved by the Warden office, your electronic Gate Pass QR is validated at the security gates.\n\n${leaveInfo.content}`;
    suggestions = [
      "How long does warden approval take?",
      "What is the gate curfew time?",
      "How do I claim a mess rebate during leave?",
    ];
    actionLink = {
      label: "Open Leave Request Page →",
      href: "/student/leave",
    };
  }
  // 2. COMPLAINTS & ROOM MAINTENANCE (Navigation & Info)
  else if (
    lower.includes("complaint") ||
    lower.includes("maintenance") ||
    lower.includes("repair") ||
    lower.includes("leak") ||
    lower.includes("plumber") ||
    lower.includes("electrician") ||
    lower.includes("carpenter") ||
    lower.includes("broken") ||
    lower.includes("not working") ||
    lower.includes("switchboard")
  ) {
    const maintInfo = knowledgeItems.find((k) => k.category === "MAINTENANCE") || DEFAULT_AI_KNOWLEDGE[7];
    answer = `You can submit maintenance requests directly to the campus engineering desk. Select your issue category (Electrical, Plumbing, Carpentry, Wi-Fi, or Cleanliness), room number, and urgency. You can also file anonymously if preferred. Routine issues are attended to within 24 to 48 hours.\n\n${maintInfo.content}`;
    suggestions = [
      "What is the repair SLA?",
      "Can I report an issue anonymously?",
      "Electrical appliance rules",
    ];
    actionLink = {
      label: "File a Maintenance Complaint →",
      href: "/student/complaints",
    };
  }
  // 3. MESS MENU & TIMETABLE (Navigation & Info)
  else if (
    lower.includes("mess") ||
    lower.includes("food") ||
    lower.includes("lunch") ||
    lower.includes("dinner") ||
    lower.includes("breakfast") ||
    lower.includes("snack") ||
    lower.includes("menu") ||
    lower.includes("eat") ||
    lower.includes("meal")
  ) {
    const messInfo = knowledgeItems.find((k) => k.category === "MESS") || DEFAULT_AI_KNOWLEDGE[1];
    answer = `Central Dining Hall serves fresh meals daily: Breakfast (07:30 - 09:00 AM), Lunch (12:30 - 02:00 PM), Evening Snacks (05:00 - 06:00 PM), and Dinner (07:30 - 09:00 PM). Special Sunday Dum Biryani is served from 12:30 PM.\n\n${messInfo.content}`;
    suggestions = [
      "What are today's lunch items?",
      "How do I claim a mess rebate?",
      "Who manages today's mess catering?",
    ];
    actionLink = {
      label: "View Weekly Mess Timetable →",
      href: "/student/mess",
    };
  }
  // 4. PARCELS & DELIVERIES (Navigation & Info)
  else if (
    lower.includes("parcel") ||
    lower.includes("courier") ||
    lower.includes("amazon") ||
    lower.includes("flipkart") ||
    lower.includes("delivery") ||
    lower.includes("otp") ||
    lower.includes("package")
  ) {
    const parcelInfo = knowledgeItems.find((k) => k.category === "PARCELS") || DEFAULT_AI_KNOWLEDGE[6];
    answer = `All incoming deliveries are logged by security at the Block A Reception Desk. When a parcel arrives for your room, you will receive an alert with a unique 4-digit pickup OTP. Present this OTP along with your ID card to collect your package between 09:00 AM and 09:00 PM.\n\n${parcelInfo.content}`;
    suggestions = [
      "Where do I collect my courier?",
      "What if I did not receive an OTP?",
      "Reception counter hours",
    ];
    actionLink = {
      label: "View Parcel Deliveries & OTP →",
      href: "/student/parcels",
    };
  }
  // 5. MEDICAL ROOM, DOCTOR & HEALTH EMERGENCY (Navigation & Info)
  else if (
    lower.includes("medical") ||
    lower.includes("doctor") ||
    lower.includes("fever") ||
    lower.includes("sick") ||
    lower.includes("emergency") ||
    lower.includes("ambulance") ||
    lower.includes("hospital") ||
    lower.includes("dispensary") ||
    lower.includes("health") ||
    lower.includes("sos")
  ) {
    const healthInfo = knowledgeItems.find((k) => k.category === "HEALTH") || DEFAULT_AI_KNOWLEDGE[3];
    answer = `The Campus Dispensary is located on the Ground Floor of Block A (Admin Wing) and operates from 08:00 AM to 08:00 PM with medical staff on duty. A 24/7 on-call nurse is stationed for night emergencies. For immediate life-safety emergencies, the Campus Ambulance can be reached at +91 99887 76655.\n\n${healthInfo.content}`;
    suggestions = [
      "What is the ambulance hotline number?",
      "Where is the Block A dispensary?",
      "How do I trigger an emergency SOS?",
    ];
    actionLink = {
      label: "Open Medical Services & SOS →",
      href: "/student/medical",
    };
  }
  // 6. LOST & FOUND (Navigation & Info)
  else if (
    lower.includes("lost") ||
    lower.includes("found") ||
    lower.includes("missing") ||
    lower.includes("wallet") ||
    lower.includes("key")
  ) {
    answer = "You can report misplaced belongings or list items you've found in common hostel areas on our digital Lost & Found bulletin board. Other residents and security staff monitor this board to facilitate quick item returns.";
    suggestions = [
      "How to report a lost ID card?",
      "Where is the security desk?",
      "File a room maintenance complaint",
    ];
    actionLink = {
      label: "Open Lost & Found Board →",
      href: "/student/requests",
    };
  }
  // 7. NOTICES & ANNOUNCEMENTS (Navigation & Info)
  else if (
    lower.includes("notice") ||
    lower.includes("announcement") ||
    lower.includes("circular") ||
    lower.includes("update") ||
    lower.includes("broadcast")
  ) {
    answer = "Official warden circulars, maintenance alerts, holiday gate curfew schedules, and hostel committee updates are broadcast on your resident dashboard.";
    suggestions = [
      "Hostel gate curfew hours",
      "Today's mess timetable",
      "Visitor lounge timings",
    ];
    actionLink = {
      label: "View Official Announcements →",
      href: "/student/dashboard#announcements",
    };
  }
  // 8. RESIDENT PROFILE & ROOM DETAILS (Navigation & Info)
  else if (
    lower.includes("profile") ||
    lower.includes("my room") ||
    lower.includes("room number") ||
    lower.includes("my account")
  ) {
    answer = "Your resident registration details, assigned hostel block, room number, and institutional email are linked to your profile and displayed on your resident dashboard header.";
    suggestions = [
      "Apply for leave",
      "File a complaint for my room",
      "Check active parcels",
    ];
    actionLink = {
      label: "View Resident Profile →",
      href: "/student/dashboard",
    };
  }
  // 9. GATE CURFEW & TIMINGS
  else if (
    lower.includes("curfew") ||
    lower.includes("timing") ||
    lower.includes("gate") ||
    lower.includes("late")
  ) {
    const curfewInfo = knowledgeItems.find((k) => k.tags?.includes("curfew")) || DEFAULT_AI_KNOWLEDGE[0];
    answer = curfewInfo.content;
    suggestions = [
      "How do I apply for late night outing?",
      "Are parents allowed to visit?",
      "What are the visitor lounge timings?",
    ];
    actionLink = {
      label: "Apply for Outing Gate Pass →",
      href: "/student/leave",
    };
  }
  // 10. ELECTRICAL APPLIANCES RULES
  else if (
    lower.includes("heater") ||
    lower.includes("kettle") ||
    lower.includes("appliance") ||
    lower.includes("electric") ||
    lower.includes("iron")
  ) {
    const applianceInfo = knowledgeItems.find((k) => k.tags?.includes("appliances")) || DEFAULT_AI_KNOWLEDGE[5];
    answer = applianceInfo.content;
    suggestions = [
      "Can I use an electric iron in room?",
      "How to report a burnt switchboard?",
      "Hostel fire safety guidelines",
    ];
    actionLink = {
      label: "Report Electrical Issue →",
      href: "/student/complaints",
    };
  }
  // 11. GENERAL SYNTHESIS
  else {
    answer = knowledgeItems
      .slice(0, 2)
      .map((k) => `• **${k.topic}**: ${k.content}`)
      .join("\n\n");
    suggestions = [
      "How do I apply for leave?",
      "Today's mess timetable",
      "Report a room maintenance issue",
    ];
  }

  return {
    answer,
    suggestions: suggestions.slice(0, 3),
    sources: sources.slice(0, 2),
    actionLink,
  };
}
