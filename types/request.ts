export type RequestType = 'ROOM_CHANGE' | 'MAINTENANCE' | 'FURNITURE' | 'LOST_FOUND' | 'SPECIAL_PERMISSION';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESOLVED';

export interface StudentRequest {
  id: string;
  student_id: string;
  type: RequestType;
  title: string;
  description: string;
  status: RequestStatus;
  response?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LostFoundItem {
  id: string;
  user_id: string;
  title: string;
  description: string;
  item_type: 'LOST' | 'FOUND';
  category: string;
  location: string;
  image_url?: string | null;
  status: 'OPEN' | 'CLAIMED' | 'RESOLVED';
  contact_info: string;
  created_at: string;
  updated_at: string;
}
