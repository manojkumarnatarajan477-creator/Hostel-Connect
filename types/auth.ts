export type UserRole = 'STUDENT' | 'WARDEN';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  room_number?: string;
  block?: string;
  phone?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RegisteredUser extends UserProfile {
  password_hash?: string;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  roll_number: string;
  room_number: string;
  block: string;
  course?: string;
  year?: number;
  parent_phone?: string;
  emergency_contact?: string;
  created_at?: string;
  user?: UserProfile;
}

export interface WardenProfile {
  id: string;
  user_id: string;
  staff_id: string;
  assigned_block: string;
  designation?: string;
  office_phone?: string;
  created_at?: string;
  user?: UserProfile;
}

export interface AuthState {
  user: UserProfile | null;
  student: StudentProfile | null;
  warden: WardenProfile | null;
  isLoading: boolean;
  error: string | null;
}
