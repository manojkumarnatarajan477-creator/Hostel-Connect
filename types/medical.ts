export type MedicalUrgency = 'ROUTINE' | 'MODERATE' | 'CRITICAL_EMERGENCY';
export type MedicalStatus = 'PENDING' | 'ATTENDED' | 'HOSPITALIZED' | 'RESOLVED';

export interface MedicalRequest {
  id: string;
  student_id: string;
  student_name: string;
  room_number: string;
  block: string;
  symptoms: string;
  urgency: MedicalUrgency;
  status: MedicalStatus;
  notes?: string | null;
  attended_by?: string | null;
  created_at: string;
  resolved_at?: string | null;
}
