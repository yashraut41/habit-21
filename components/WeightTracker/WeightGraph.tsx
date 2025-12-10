import React, { useMemo } from 'react';
import { WeightLog } from '../../types';

interface WeightGraphProps {
    logs: WeightLog[];
    daysToShow?: number;
}

export const WeightGraph: React.FC<WeightGraphProps> = ({ logs, daysToShow = 7 }) => {
    // 1. Process Data
    const data = useMemo(() => {
        // Sort logs by date
        const sorted = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        // Take only relevant recent logs if needed, but for the graph we usually want to show the trend of what's *in* the last X days.
        // Actually, purely taking the last N logs might be confusing if they are far apart. 
        // Let's filter logs that are within the last `daysToShow` days from Today.

        // However, if the user has sparse data, an empty graph is ugly.
        // Let's just show the last N chronologically sorted logs if they exist, OR the last N days range.
        // User asked "show progress too for last 7 days".
        // Let's strictly plot the data points that fall within the last 14 days to give a bit more context than just 7.

        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - daysToShow);
        const cutoffStr = cutoff.toISOString().split('T')[0];

        return sorted.filter(l => l.date >= cutoffStr);
    }, [logs, daysToShow]);

    if (data.length < 2) {
        return (
            <div className="h-40 flex items-center justify-center text-slate-500 bg-slate-800/20 rounded-xl border border-dashed border-slate-700">
                <p className="text-sm">Not enough data for graph</p>
            </div>
        );
    }

    // 2. Calculate Scales
    const width = 600;
    const height = 200;
    const padding = 20;

    const weights = data.map(d => d.weight);
    const minWeight = Math.min(...weights) - 0.5;
    const maxWeight = Math.max(...weights) + 0.5;
    const weightRange = maxWeight - minWeight || 1;

    const dates = data.map(d => new Date(d.date).getTime());
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const dateRange = maxDate - minDate || 1;

    // Coordinate mappers
    const getX = (dateStr: string) => {
        const t = new Date(dateStr).getTime();
        return padding + ((t - minDate) / dateRange) * (width - padding * 2);
    };

    const getY = (w: number) => {
        return height - padding - ((w - minWeight) / weightRange) * (height - padding * 2);
    };

    // 3. Build Path
    const points = data.map(d => `${getX(d.date)},${getY(d.weight)}`).join(' ');
    const areaPath = `
    M ${getX(data[0].date)},${height} 
    L ${points.split(' ').join(' L ')} 
    L ${getX(data[data.length - 1].date)},${height} 
    Z
  `;

    return (
        <div className="w-full overflow-hidden rounded-xl bg-slate-800/40 p-4 border border-slate-700/50">
            <div className="mb-2 flex justify-between items-end px-2">
                <span className="text-xs text-slate-500 font-medium tracking-wider uppercase">Weight Trend</span>
            </div>

            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto drop-shadow-lg">
                {/* Gradient Definition */}
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Grid Lines (Horizontal) */}
                {[0, 0.5, 1].map(t => {
                    const y = padding + t * (height - padding * 2);
                    return (
                        <line
                            key={t}
                            x1={padding}
                            y1={y}
                            x2={width - padding}
                            y2={y}
                            stroke="#334155"
                            strokeWidth="1"
                            strokeDasharray="4"
                        />
                    );
                })}

                {/* Area Fill */}
                <path d={areaPath} fill="url(#chartGradient)" />

                {/* Main Line */}
                <path
                    d={`M ${points.replace(/ /g, ' L ')}`}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Data Points */}
                {data.map((d) => (
                    <g key={d.id}>
                        <circle
                            cx={getX(d.date)}
                            cy={getY(d.weight)}
                            r="4"
                            fill="#0f172a"
                            stroke="#10b981"
                            strokeWidth="2"
                        />
                        {/* Value Label (only for first, last, and min/max if needed, here just all for now but shifted) */}
                        <text
                            x={getX(d.date)}
                            y={getY(d.weight) - 10}
                            textAnchor="middle"
                            fill="white"
                            fontSize="12"
                            fontWeight="bold"
                        >
                            {d.weight}
                        </text>
                        {/* Date Label (simplified) */}
                        <text
                            x={getX(d.date)}
                            y={height - 2}
                            textAnchor="middle"
                            fill="#94a3b8"
                            fontSize="10"
                        >
                            {new Date(d.date).getDate()}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    );
};
