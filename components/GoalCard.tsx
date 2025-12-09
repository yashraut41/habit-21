import React from 'react';
import { Trophy, CheckCircle, Trash2, Flame } from 'lucide-react';
import { Goal, GoalLog } from '../types';
import { getLocalDateString, getLast7Days } from '../utils/dateUtils';

interface GoalCardProps {
  goal: Goal;
  logs: GoalLog[];
  onCheckIn: () => void;
  onDelete: () => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, logs, onCheckIn, onDelete }) => {
  const todayStr = getLocalDateString(new Date());
  const isCheckedInToday = goal.lastCheckInDate === todayStr;
  const history = getLast7Days(goal, logs);

  // Calculate progress percentage
  const progressPercent = Math.min((goal.currentStreak / goal.targetDays) * 100, 100);

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 shadow-lg hover:border-slate-600 transition-colors group relative overflow-hidden">

      {/* Background Progress Bar (Subtle) */}
      <div
        className="absolute bottom-0 left-0 h-1 bg-emerald-500/20 transition-all duration-1000"
        style={{ width: `${progressPercent}%` }}
      ></div>

      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{goal.name}</h3>
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <div className="flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-yellow-500" />
              <span>Best: {goal.bestStreak}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <span>Target: {goal.targetDays} days</span>
            </div>
          </div>
        </div>

        <button
          onClick={onDelete}
          className="text-slate-600 hover:text-rose-500 transition-colors p-1"
          title="Delete Chain"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Stats Row */}
      <div className="flex justify-between items-end mb-6">
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Current Chain</span>
          <div className="flex items-baseline gap-1">
            <span className={`text-4xl font-extrabold ${goal.currentStreak > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
              {goal.currentStreak}
            </span>
            <span className="text-slate-500 text-sm">days</span>
          </div>
        </div>

        {/* Call to Action */}
        <div>
          {isCheckedInToday ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Done for today</span>
            </div>
          ) : (
            <button
              onClick={onCheckIn}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-900 font-bold rounded-lg shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Flame className="w-5 h-5" />
              CHECK IN
            </button>
          )}
        </div>
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
