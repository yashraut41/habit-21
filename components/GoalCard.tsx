import React from 'react';
import { Flame, Target } from 'lucide-react';
import { Goal, GoalLog } from '../types';
import { getLocalDateString, getLast7Days } from '../utils/dateUtils';

interface GoalCardProps {
  goal: Goal;
  logs: GoalLog[];
  onCheckIn: () => void;
  onDelete: () => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, logs, onCheckIn }) => {
  const todayStr = getLocalDateString(new Date());
  const isCheckedInToday = goal.lastCheckInDate === todayStr;
  const history = getLast7Days(goal, logs);

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
      <div className="flex gap-1 mb-6">
        {history.map((day, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${day.status === 'completed' ? 'bg-[#10b981]' :
              day.status === 'missed' ? 'bg-slate-700' : 'bg-slate-700' // Simplified for visual parity with design which just shows green dots or gray
              }`}
          />
        ))}
      </div>

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

      {/* Visual Calendar Strip */}
      <div className="bg-slate-900/50 rounded-lg p-3">
        <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
          <span>Last 7 Days</span>
          <span>Today</span>
        </div>
        <div className="flex justify-between gap-1 h-8">
          {history.map((day) => (
            <div
              key={day.date}
              className={`
                        flex-1 rounded-sm relative group cursor-default
                        ${day.status === 'completed' ? 'bg-emerald-500' : ''}
                        ${day.status === 'missed' ? 'bg-rose-500/30 border border-rose-500/50' : ''}
                        ${day.status === 'today-pending' ? 'bg-slate-700 animate-pulse border border-slate-600' : ''}
                        ${day.status === 'neutral' ? 'bg-slate-800' : ''}
                    `}
              title={`${day.date}: ${day.status}`}
            >
              {day.status === 'missed' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-rose-500 font-bold leading-none">×</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
