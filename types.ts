export interface Goal {
  id: string;
  name: string;
  targetDays: number;
  currentStreak: number;
  bestStreak: number;
  lastCheckInDate: string | null; // ISO Date String YYYY-MM-DD
  isActive: boolean;
  createdAt: string;
}

export interface GoalLog {
  goalId: string;
  date: string; // ISO Date String YYYY-MM-DD
  status: 'completed'; 
}

export type CalendarDayStatus = 'completed' | 'missed' | 'today-pending' | 'future' | 'neutral';

export interface DayData {
  date: string;
  status: CalendarDayStatus;
  isToday: boolean;
}