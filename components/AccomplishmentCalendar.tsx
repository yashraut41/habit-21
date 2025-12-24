import React from 'react';
import { DayData } from '../types';

interface AccomplishmentCalendarProps {
    history: DayData[];
    monthName: string;
    year: number;
}

export const AccomplishmentCalendar: React.FC<AccomplishmentCalendarProps> = ({ history, monthName, year }) => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Calculate padding for the first day of the month
    const firstDayStr = history[0]?.date;
    const firstDay = firstDayStr ? new Date(firstDayStr).getDay() : 0;
    const padding = Array(firstDay).fill(null);

    return (
        <div className="mt-4 p-5 bg-[#151c2c] rounded-2xl border border-slate-800 shadow-inner">
            <div className="flex justify-between items-center mb-5">
                <h4 className="text-sm font-bold text-white uppercase tracking-widest">{monthName} {year}</h4>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 mb-2">
                {daysOfWeek.map(day => (
                    <div key={day} className="text-[10px] text-slate-500 font-bold text-center uppercase">
                        {day[0]}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {padding.map((_, i) => (
                    <div key={`pad-${i}`} className="aspect-square" />
                ))}

                {history.map((day) => {
                    const dateNum = new Date(day.date).getDate();

                    return (
                        <div
                            key={day.date}
                            className={`
                aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all duration-300
                ${day.status === 'completed' ? 'bg-[#10b981] text-slate-900 font-bold' :
                                    day.status === 'missed' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-500' :
                                        day.status === 'today-pending' ? 'bg-slate-800 border-2 border-[#10b981]/30 text-white animate-pulse' :
                                            day.status === 'future' ? 'bg-slate-800/30 text-slate-600' :
                                                'bg-slate-800/50 text-slate-500'}
              `}
                            title={`${day.date}: ${day.status}`}
                        >
                            <span className="text-[11px]">{dateNum}</span>
                            {day.status === 'completed' && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center shadow-sm">
                                    <svg className="w-2 h-2 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-5 flex items-center justify-center gap-4 text-[10px] text-slate-500 font-medium border-t border-slate-800 pt-4">
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 bg-[#10b981] rounded-sm" />
                    <span>Completed</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 bg-rose-500/20 border border-rose-500/30 rounded-sm" />
                    <span>Missed</span>
                </div>
            </div>
        </div>
    );
};
