import React, { useState, useMemo } from 'react';
import { Plus, X, CalendarCheck, CalendarX } from 'lucide-react';
import { WeightLog } from '../../types';
import { getLocalDateString } from '../../utils/dateUtils';
import { Modal } from '../Modal';
import { WeightPicker } from './WeightPicker';
import { WeightGraph } from './WeightGraph';

interface WeightTrackerProps {
    logs: WeightLog[];
    onAddLog: (weight: number, date: string) => void;
}

export const WeightTracker: React.FC<WeightTrackerProps> = ({ logs, onAddLog }) => {
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [pickerWeight, setPickerWeight] = useState(70.0);

    const todayStr = getLocalDateString(new Date());

    // Get Latest Weight
    const latestLog = useMemo(() => {
        if (logs.length === 0) return null;
        return logs.reduce((prev, current) =>
            (new Date(prev.date) > new Date(current.date)) ? prev : current
        );
    }, [logs]);

    // Initial picker value
    const handleOpenPicker = () => {
        if (latestLog) {
            setPickerWeight(latestLog.weight);
        }
        setIsPickerOpen(true);
    };

    const handleSave = () => {
        onAddLog(pickerWeight, todayStr);
        setIsPickerOpen(false);
    };

    // Generate last 7 days history
    const historyDays = useMemo(() => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dStr = getLocalDateString(d);

            const log = logs.find(l => l.date === dStr);
            days.push({
                date: dStr,
                dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
                hasLog: !!log,
                isToday: dStr === todayStr
            });
        }
        return days;
    }, [logs, todayStr]);

    return (
        <div className="bg-slate-800/60 rounded-2xl p-6 border border-emerald-500/20 shadow-xl backdrop-blur-sm">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        Weight Tracker
                        {latestLog && (
                            <span className="text-emerald-400 text-2xl ml-2 font-mono">
                                {latestLog.weight} <span className="text-sm text-emerald-500/70">KG</span>
                            </span>
                        )}
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        {latestLog ? `Last updated: ${latestLog.date === todayStr ? 'Today' : latestLog.date}` : 'Start tracking your journey'}
                    </p>
                </div>

                <button
                    onClick={handleOpenPicker}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-emerald-900/20"
                >
                    <Plus className="w-4 h-4" />
                    {latestLog?.date === todayStr ? 'Update' : 'Log Weight'}
                </button>
            </div>

            {/* Graph */}
            <div className="mb-8">
                <WeightGraph logs={logs} />
            </div>

            {/* 7-Day History Pills */}
            <div className="flex justify-between items-center gap-2">
                {historyDays.map((day) => (
                    <div key={day.date} className="flex flex-col items-center gap-2 flex-1">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${day.hasLog
                                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                    : 'bg-slate-800 border-slate-700 text-slate-600'
                                } ${day.isToday ? 'ring-2 ring-emerald-500/30' : ''}`}
                        >
                            {day.hasLog ? <CalendarCheck className="w-5 h-5" /> : <CalendarX className="w-4 h-4" />}
                        </div>
                        <span className={`text-xs font-medium ${day.isToday ? 'text-white' : 'text-slate-500'}`}>
                            {day.dayName}
                        </span>
                    </div>
                ))}
            </div>

            {/* Picker Modal */}
            <Modal isOpen={isPickerOpen} onClose={() => setIsPickerOpen(false)}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white">Log Today's Weight</h3>
                        <button onClick={() => setIsPickerOpen(false)} className="text-slate-400 hover:text-white">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <WeightPicker
                        initialWeight={pickerWeight}
                        onWeightChange={setPickerWeight}
                    />

                    <div className="mt-8 flex gap-3">
                        <button
                            onClick={() => setIsPickerOpen(false)}
                            className="flex-1 py-3 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-900/20 transition-all hover:scale-[1.02]"
                        >
                            Save Weight
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
