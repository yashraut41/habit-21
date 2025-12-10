import React, { useEffect, useRef, useState } from 'react';

interface WeightPickerProps {
    initialWeight: number;
    onWeightChange: (weight: number) => void;
}

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5; // Must be odd

// Range configuration
const MIN_WEIGHT = 20;
const MAX_WEIGHT = 200;

export const WeightPicker: React.FC<WeightPickerProps> = ({ initialWeight, onWeightChange }) => {
    const safeInitial = Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT, initialWeight || 70.0));
    const initialInt = Math.floor(safeInitial);
    const initialDec = Math.round((safeInitial - initialInt) * 10);

    const [selectedInt, setSelectedInt] = useState(initialInt);
    const [selectedDec, setSelectedDec] = useState(initialDec);

    const intRef = useRef<HTMLDivElement>(null);
    const decRef = useRef<HTMLDivElement>(null);

    // Generate arrays
    const integers = Array.from({ length: MAX_WEIGHT - MIN_WEIGHT + 1 }, (_, i) => MIN_WEIGHT + i);
    const decimals = Array.from({ length: 10 }, (_, i) => i);

    // Handle Scroll
    const handleScroll = (
        e: React.UIEvent<HTMLDivElement>,
        items: number[],
        setFunc: (val: number) => void
    ) => {
        const container = e.currentTarget;
        const scrollTop = container.scrollTop;

        // Calculate index based on scroll position + half the container height (center)
        // Actually, because of spacer padding, scrollTop 0 aligns the first item.
        // The spacer padding puts the first item in the center.
        const index = Math.round(scrollTop / ITEM_HEIGHT);

        if (index >= 0 && index < items.length) {
            setFunc(items[index]);
        }
    };

    // Sync state to parent
    useEffect(() => {
        onWeightChange(selectedInt + selectedDec / 10);
    }, [selectedInt, selectedDec, onWeightChange]);

    // Initial Scroll Position
    useEffect(() => {
        if (intRef.current) {
            const idx = integers.indexOf(initialInt);
            if (idx !== -1) intRef.current.scrollTop = idx * ITEM_HEIGHT;
        }
        if (decRef.current) {
            const idx = decimals.indexOf(initialDec);
            if (idx !== -1) decRef.current.scrollTop = idx * ITEM_HEIGHT;
        }
    }, []); // Run once on mount

    // Helper for rendering columns
    const renderColumn = (
        items: number[],
        ref: React.RefObject<HTMLDivElement>,
        selectedValue: number,
        setFunc: (val: number) => void
    ) => {
        return (
            <div className="relative h-64 w-24 overflow-hidden bg-slate-800/50 rounded-xl border border-slate-700">
                {/* Selection Highlight / Magnifier */}
                <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[50px] bg-emerald-500/20 border-y border-emerald-500/50 pointer-events-none z-10" />

                <div
                    ref={ref}
                    onScroll={(e) => handleScroll(e, items, setFunc)}
                    className="h-full w-full overflow-y-auto snap-y snap-mandatory scroll-smooth no-scrollbar"
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                    }}
                >
                    {/* Spacers to allow top/bottom items to be centered */}
                    <div style={{ height: (ITEM_HEIGHT * (VISIBLE_ITEMS - 1)) / 2 }} />

                    {items.map((val) => (
                        <div
                            key={val}
                            className={`h-[50px] flex items-center justify-center text-xl font-medium snap-center transition-all duration-200 ${val === selectedValue ? 'text-white scale-110 font-bold' : 'text-slate-500 scale-90'
                                }`}
                        >
                            {val}
                        </div>
                    ))}

                    <div style={{ height: (ITEM_HEIGHT * (VISIBLE_ITEMS - 1)) / 2 }} />
                </div>
            </div>
        );
    };

    return (
        <div className="flex justify-center items-center gap-4 py-6">
            <style>{`
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
      `}</style>
            {renderColumn(integers, intRef, selectedInt, setSelectedInt)}
            <div className="text-2xl font-bold text-slate-400">.</div>
            {renderColumn(decimals, decRef, selectedDec, setSelectedDec)}
            <div className="text-xl font-bold text-slate-400 ml-2">KG</div>
        </div>
    );
};
