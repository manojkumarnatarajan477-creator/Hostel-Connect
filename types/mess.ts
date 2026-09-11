export type MealType = 'BREAKFAST' | 'LUNCH' | 'SNACKS' | 'DINNER';

export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export interface DayMenuSchedule {
  day: DayOfWeek;
  breakfast: string;
  lunch: string;
  snacks: string;
  dinner: string;
  timings?: {
    breakfast: string;
    lunch: string;
    snacks: string;
    dinner: string;
  };
  specialNote?: string;
}

export interface WeeklyMenuData {
  id: string;
  title: string;
  updated_at: string;
  updated_by: string;
  source: 'PDF_UPLOAD' | 'IMAGE_UPLOAD' | 'MANUAL_ENTRY';
  attachment_url?: string;
  attachment_name?: string;
  notes?: string;
  days: DayMenuSchedule[];
}

export interface MessMenuItem {
  id: string;
  day_of_week: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  meal_type: MealType;
  items: string[];
  timing: string;
  is_special?: boolean;
}

export interface MessFeedback {
  id: string;
  user_id: string;
  meal_type: MealType;
  date: string;
  rating: number; // 1-5
  comment?: string;
  created_at: string;
}
