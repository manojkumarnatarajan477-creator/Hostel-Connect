export type ParcelStatus = 'RECEIVED' | 'NOTIFIED' | 'COLLECTED' | 'RETURNED';

export interface Parcel {
  id: string;
  student_id: string;
  tracking_number?: string;
  courier_service: string;
  recipient_name: string;
  room_number: string;
  block: string;
  status: ParcelStatus;
  received_at: string;
  collected_at?: string | null;
  security_staff_id?: string;
  otp_code?: string;
}
