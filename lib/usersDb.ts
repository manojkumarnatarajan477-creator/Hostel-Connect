import fs from "fs";
import path from "path";
import crypto from "crypto";
import { RegisteredUser, UserRole } from "@/types/auth";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

// Default official staff account for campus administration
const INITIAL_USERS: RegisteredUser[] = [
  {
    id: "usr-warden-001",
    email: "warden@campus.edu",
    full_name: "Dr. K. Raman (Chief Warden)",
    room_number: "Warden Office A-G01",
    block: "Block A",
    role: "WARDEN",
    password_hash: hashPassword("campuspass2025"),
    created_at: new Date().toISOString(),
  },
];

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password.trim()).digest("hex");
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (e) {
      console.warn("Could not create data dir:", e);
    }
  }
}

export function loadUsers(): RegisteredUser[] {
  try {
    ensureDataDir();
    if (!fs.existsSync(USERS_FILE)) {
      saveUsers(INITIAL_USERS);
      return INITIAL_USERS;
    }
    const raw = fs.readFileSync(USERS_FILE, "utf-8");
    const parsed = JSON.parse(raw) as RegisteredUser[];
    return Array.isArray(parsed) ? parsed : INITIAL_USERS;
  } catch (err) {
    console.warn("Failed to load users from file, using initial:", err);
    return INITIAL_USERS;
  }
}

export function saveUsers(users: RegisteredUser[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to save users to file:", err);
  }
}

export function findUserByEmail(email: string): RegisteredUser | undefined {
  const users = loadUsers();
  const normalized = email.trim().toLowerCase();
  return users.find(
    (u) =>
      u.email.toLowerCase() === normalized ||
      u.id.toLowerCase() === normalized
  );
}

export function findUserById(id: string): RegisteredUser | undefined {
  const users = loadUsers();
  return users.find((u) => u.id === id);
}

export interface RegisterUserInput {
  full_name: string;
  room_number: string;
  email: string;
  password: string;
  role?: UserRole;
  block?: string;
}

export function registerUser(input: RegisterUserInput): RegisteredUser {
  const users = loadUsers();
  const cleanEmail = input.email.trim().toLowerCase();

  const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    throw new Error("An account with this email is already registered. Please sign in.");
  }

  // Determine role: Explicit role takes priority, otherwise check email patterns
  let role: UserRole = input.role === "WARDEN" ? "WARDEN" : "STUDENT";
  if (
    role !== "WARDEN" &&
    (cleanEmail.includes("warden") ||
     cleanEmail.includes("admin") ||
     cleanEmail.startsWith("w-"))
  ) {
    role = "WARDEN";
  }

  const newUser: RegisteredUser = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    email: cleanEmail,
    full_name: input.full_name.trim(),
    room_number: input.room_number.trim(),
    block: input.block || (input.room_number.toLowerCase().includes("b") ? "Block B" : "Block A"),
    role,
    password_hash: hashPassword(input.password),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);
  return newUser;
}

export function verifyCredentials(
  identifier: string,
  password: string
): { success: boolean; user?: RegisteredUser; error?: string } {
  const user = findUserByEmail(identifier);
  if (!user) {
    return {
      success: false,
      error: "No account found with this email or ID. Please register for first-time login.",
    };
  }

  const incomingHash = hashPassword(password);
  if (user.password_hash && user.password_hash !== incomingHash) {
    return {
      success: false,
      error: "Incorrect password. Please verify and try again.",
    };
  }

  return { success: true, user };
}
