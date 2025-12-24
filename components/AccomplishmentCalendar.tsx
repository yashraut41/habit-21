import React from 'react';
import { DayData } from '../types';

interface AccomplishmentCalendarProps {
    history: DayData[];
}

export const AccomplishmentCalendar: React.FC<AccomplishmentCalendarProps> = ({ history }) => {
    return (
        <div className="mt-4 p-4 bg-slate-900/40 rounded-xl border border-slate-700/50">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Last 30 Days Accomplishment</h4>
            <div className="grid grid-cols-10 gap-2">
                {history.map((day, i) => (
                    <div
                        key={i}
                        className={`
              aspect-square rounded-md flex items-center justify-center transition-all duration-300
              ${day.status === 'completed' ? 'bg-[#10b981] shadow-[0_0_10px_rgba(16,185,129,0.3)]' :
                                day.status === 'missed' ? 'bg-slate-800 border border-slate-700' :
                                    day.status === 'today-pending' ? 'bg-slate-700 animate-pulse' : 'bg-slate-800/50'}
            `}
                        title={`${day.date}: ${day.status}`}
                    >
                        {day.status === 'completed' && (
                            <svg className="w-3 h-3 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                        {day.status === 'missed' && (
                            <span className="text-slate-600 text-[10px]">×</span>
                        )}
                    </div>
                ))}
            </div>
            <div className="mt-3 flex justify-between items-center text-[10px] text-slate-500 font-medium uppercase tracking-tighter">
                <span>30 Days Ago</span>
                <span>Today</span>
            </div>
        </div>
    );
};
