import React, { useState, useMemo } from 'react';
import { Plus, X, Settings } from 'lucide-react';
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
    const [pickerWeight, setPickerWeight] = useState(75.5); // Default start

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

    // Generate last 7 days history pill status
    // Design shows dots under the weight. 
    // Let's implement that "Dots" look (Green for success, Gray for empty).
    const historyPills = useMemo(() => {
        const days = [];
        // Show last 7 days
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dStr = getLocalDateString(d);
            const log = logs.find(l => l.date === dStr);
            days.push({
                date: dStr,
                hasLog: !!log,
                isToday: dStr === todayStr
            });
        }
        return days;
    }, [logs, todayStr]);

    return (
        <div className="bg-[#151c2c] rounded-3xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden group">

            {/* Header */}
            <div className="flex justify-between items-start z-10 relative">
                <h2 className="text-xl font-bold text-white tracking-wide">Weight Tracking</h2>
                <button
                    onClick={handleOpenPicker}
                    className="p-2 rounded-full text-slate-500 hover:text-white hover:bg-slate-700 transition-all"
                >
                    <Settings className="w-5 h-5" />
                </button>
            </div>

            {/* Hero Stat - Centered */}
            <div className="flex flex-col items-center mt-6 mb-8 z-10 relative">
                <div className="flex items-baseline gap-1" >
                    <span className="text-6xl font-extrabold text-[#10b981] tracking-tight">
                        {latestLog ? latestLog.weight : '--.-'}
                    </span>
                    <span className="text-xl font-medium text-slate-400">kg</span>
                </div>

                {/* History Dots (Pills) */}
                <div className="flex gap-2 mt-4">
                    {historyPills.map((day) => (
                        <div
                            key={day.date}
                            className={`
                                w-3 h-3 rounded-full transition-all duration-300
                                ${day.hasLog ? 'bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}
                                ${day.isToday && !day.hasLog ? 'animate-pulse bg-slate-600' : ''}
                            `}
                            title={day.date}
                        />
                    ))}
                </div>
            </div>

            {/* Graph */}
            <div className="relative -mx-4">
                {/* Subtle grid lines extension? */}
                <WeightGraph logs={logs} />

                {/* Add Button Floating Action (Design shows a button at bottom right of graph? Or just check in?)
            The User's design has a "+" button at the bottom right of the graph area. 
        */}
                <button
                    onClick={handleOpenPicker}
                    className="absolute bottom-6 right-8 w-12 h-12 bg-[#10b981] hover:bg-[#059669] text-slate-900 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all"
                    title="Log Weight"
                >
                    <Plus className="w-6 h-6" />
                </button>
            </div>

            {/* Picker Modal */}
            <Modal isOpen={isPickerOpen} onClose={() => setIsPickerOpen(false)}>
                <div className="p-8 bg-[#151c2c] border border-slate-700 rounded-3xl">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-2xl font-bold text-white">Log Weight</h3>
                        <button onClick={() => setIsPickerOpen(false)} className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <WeightPicker
                        initialWeight={pickerWeight}
                        onWeightChange={setPickerWeight}
                    />

                    <button
                        onClick={handleSave}
                        className="w-full mt-8 py-4 px-6 rounded-xl bg-[#10b981] hover:bg-[#059669] text-slate-900 font-bold text-lg shadow-lg shadow-emerald-900/20 transition-all active:scale-[0.98]"
                    >
                        Update Weight
                    </button>
                </div>
            </Modal>
        </div>
    );
};
