import React, { useState } from 'react';
import { Flame, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { Goal, GoalLog } from '../types';
import { getLocalDateString, getHistory } from '../utils/dateUtils';
import { AccomplishmentCalendar } from './AccomplishmentCalendar';

interface GoalCardProps {
  goal: Goal;
  logs: GoalLog[];
  onCheckIn: () => void;
  onDelete: () => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, logs, onCheckIn }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const todayStr = getLocalDateString(new Date());
  const isCheckedInToday = goal.lastCheckInDate === todayStr;
  const history7 = getHistory(goal, logs, 7);
  const history30 = getHistory(goal, logs, 30);

  // Calculate progress percentage
  const progressPercent = Math.min((goal.currentStreak / goal.targetDays) * 100, 100);

  // Calculate dynamic Target Completion Date
  const daysRemaining = goal.targetDays - goal.currentStreak;
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysRemaining);
  const targetDateStr = targetDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: targetDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  });

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 shadow-lg hover:border-slate-600 transition-colors group relative overflow-hidden">

      {/* Background Progress Bar (Subtle) */}
      <div
        className="absolute bottom-0 left-0 h-1 bg-emerald-500/20 transition-all duration-1000"
        style={{ width: `${progressPercent}%` }}
      ></div>

      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-white mb-2 leading-tight">{goal.name}</h3>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-400 font-medium">Best Streak: {goal.bestStreak} days</span>
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
              <Target className="w-3 h-3" />
              <span>{daysRemaining} days left → {targetDateStr}</span>
            </div>
          </div>
        </div>

        {/* Streak Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#10b981] text-slate-900 rounded-full shadow-lg shadow-emerald-900/20">
          <Flame className="w-3 h-3 fill-current" />
          <span className="text-xs font-bold">Streak: {goal.currentStreak}</span>
        </div>
      </div>

      {/* Visual Calendar Row (Moved up/integrated) - Actually in design it's dots. Let's keep the dots idea. */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-1">
          {history7.map((day, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${day.status === 'completed' ? 'bg-[#10b981]' :
                day.status === 'missed' ? 'bg-slate-700' : 'bg-slate-700' // Simplified for visual parity with design which just shows green dots or gray
                }`}
            />
          ))}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1 hover:text-slate-300 transition-colors"
        >
          {isExpanded ? 'Hide History' : 'View 30 Days'}
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Expanded Section: 30-Day Accomplishment Calendar */}
      {isExpanded && (
        <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <AccomplishmentCalendar history={history30} />
        </div>
      )}

      {/* Action Area */}
      <div className="flex justify-between items-center border-t border-slate-700/50 pt-4">
        {isCheckedInToday ? (
          // Checked In State - Success Message
          <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/15 text-emerald-400 rounded-xl border border-emerald-500/30 w-full justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-semibold text-sm">Checked in for today!</span>
          </div>
        ) : (
          // Check In Button - Modern style
          <button
            onClick={onCheckIn}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-900 font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Flame className="w-5 h-5" />
            CHECK IN
          </button>
        )}
      </div>

      {/* Removed the old bottom status strip as we now have the toggleable 30-day view */}
    </div>
  );
};
