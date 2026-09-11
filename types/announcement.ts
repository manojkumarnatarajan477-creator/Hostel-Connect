export type AnnouncementCategory =
  | "General Notice"
  | "Maintenance"
  | "Curfew & Security"
  | "Mess Committee"
  | "Emergency"
  | "Academic & Events";

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  category: string;
  is_pinned?: boolean;
  target_block?: string;
  author_id?: string;
  author_name?: string;
  created_at: string;
  time?: string;
}

export interface CreateAnnouncementInput {
  title: string;
  content: string;
  category?: string;
  is_pinned?: boolean;
  target_block?: string;
  author_id?: string;
  author_name?: string;
}
