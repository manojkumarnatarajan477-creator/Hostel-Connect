export type ComplaintCategory = 'ELECTRICAL' | 'PLUMBING' | 'CARPENTRY' | 'CLEANLINESS' | 'INTERNET' | 'OTHER';
export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
export type ComplaintStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface Complaint {
  id: string;
  student_id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  room_number: string;
  block: string;
  is_anonymous?: boolean;
  assigned_to?: string | null;
  resolution_notes?: string | null;
  resolved_at?: string | null;
  created_at?: string;
  updated_at?: string;
  student_name?: string;
}

export interface CreateComplaintInput {
  title: string;
  description: string;
  category: ComplaintCategory;
  priority?: ComplaintPriority;
  room_number?: string;
  block?: string;
  is_anonymous?: boolean;
}

export interface UpdateComplaintStatusInput {
  id: string;
  status: ComplaintStatus;
  assigned_to?: string;
  resolution_notes?: string;
}

export interface ComplaintUpdate {
  id: string;
  complaint_id: string;
  updated_by: string;
  message: string;
  status_change?: ComplaintStatus;
  created_at: string;
}
