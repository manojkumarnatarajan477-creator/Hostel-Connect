export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export type LeaveType = 'OUTING' | 'HOME_VISIT' | 'MEDICAL_LEAVE' | 'OTHER';

export interface LeaveRequest {
  id: string;
  student_id: string;
  user_id?: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  reason: string;
  destination: string;
  emergency_contact?: string;
  parent_consent?: boolean;
  status: LeaveStatus;
  approved_by?: string | null;
  remarks?: string | null;
  created_at?: string;
  updated_at?: string;
  // joined info
  student_name?: string;
  room_number?: string;
  block?: string;
  roll_number?: string;
}

export interface CreateLeaveInput {
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  reason: string;
  destination: string;
  emergency_contact?: string;
  parent_consent?: boolean;
}

export interface UpdateLeaveStatusInput {
  id: string;
  status: 'APPROVED' | 'REJECTED';
  remarks?: string;
}
