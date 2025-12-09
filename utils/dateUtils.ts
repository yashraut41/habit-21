import { Goal, GoalLog, DayData } from '../types';

// Helper to get consistent YYYY-MM-DD from a Date object based on local time
export const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const isDateToday = (dateStr: string): boolean => {
  return dateStr === getLocalDateString(new Date());
};

// Returns date string for N days ago
export const getPastDate = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return getLocalDateString(d);
};

// Calculate if a goal needs a reset based on today's date
export const calculateStreaks = (goal: Goal, todayStr: string): { currentStreak: number, needsReset: boolean } => {
  if (!goal.lastCheckInDate) {
    return { currentStreak: 0, needsReset: false };
  }

  const lastCheckIn = new Date(goal.lastCheckInDate);
  const today = new Date(todayStr);

  // Calculate difference in days (ignoring time)
  // We reset time to midnight for accurate day diff
  const utc1 = Date.UTC(lastCheckIn.getFullYear(), lastCheckIn.getMonth(), lastCheckIn.getDate());
  const utc2 = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

  const diffDays = Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));

  // If checked in today (0) or yesterday (1), streak is alive.
  // If > 1, streak is broken.
  if (diffDays > 1) {
    return { currentStreak: 0, needsReset: true };
  }

  return { currentStreak: goal.currentStreak, needsReset: false };
};

export const getLast7Days = (goal: Goal, logs: GoalLog[]): DayData[] => {
  const days: DayData[] = [];
  const today = new Date();


  // We want to show 7 days: 6 past days + today
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = getLocalDateString(d);

    const isToday = i === 0;
    const hasLog = logs.some(l => l.date === dateStr);

    let status: DayData['status'] = 'neutral';

    if (hasLog) {
      status = 'completed';
    } else if (isToday) {
      status = 'today-pending';
    } else {
      // It's a past day with no log.
      // However, if the goal was created AFTER this date, it shouldn't be "missed", it should be neutral/grey.
      if (goal.createdAt > dateStr) {
        status = 'neutral';
      } else {
        status = 'missed';
      }
    }

    days.push({ date: dateStr, status, isToday });
  }
  return days;
};
