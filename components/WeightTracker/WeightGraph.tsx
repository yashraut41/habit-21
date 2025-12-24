import React, { useMemo } from 'react';
import { WeightLog } from '../../types';

interface WeightGraphProps {
    logs: WeightLog[];
    daysToShow?: number;
}

// Cubic Bezier smoothing helper
const smoothing = 0.2;
const line = (pointA: number[], pointB: number[]) => {
    const lengthX = pointB[0] - pointA[0];
    const lengthY = pointB[1] - pointA[1];
    return {
        length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
        angle: Math.atan2(lengthY, lengthX)
    };
};

const controlPoint = (current: number[], previous: number[], next: number[], reverse?: boolean) => {
    const p = previous || current;
    const n = next || current;
    const o = line(p, n);
    const angle = o.angle + (reverse ? Math.PI : 0);
    const length = o.length * smoothing;
    const x = current[0] + Math.cos(angle) * length;
    const y = current[1] + Math.sin(angle) * length;
    return [x, y];
};

const bezierCommand = (point: number[], i: number, a: number[][]) => {
    const [cpsX, cpsY] = controlPoint(a[i - 1], a[i - 2], point);
    const [cpeX, cpeY] = controlPoint(point, a[i - 1], a[i + 1], true);
    return `C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point[0]},${point[1]}`;
};

const svgPath = (points: number[][], command: (point: number[], i: number, a: number[][]) => string) => {
    if (points.length === 0) return '';
    const d = points.reduce((acc, point, i, a) => i === 0
        ? `M ${point[0]},${point[1]}`
        : `${acc} ${command(point, i, a)}`
        , '');
    return d;
};


export const WeightGraph: React.FC<WeightGraphProps> = ({ logs }) => {
    // 1. Process Data
    const data = useMemo(() => {
        const sorted = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Show last 14 days or enough to make a line
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 14); // Extended slightly to show more trend
        const cutoffStr = cutoff.toISOString().split('T')[0];

        const filtered = sorted.filter(l => l.date >= cutoffStr);

        // If we have less than 2 points, we can't draw a line, but we might want to show dots.
        return filtered;
    }, [logs]);

    if (data.length < 2) {
        return (
            <div className="h-40 flex flex-col items-center justify-center text-slate-500 bg-slate-800/20 rounded-xl border border-dashed border-slate-700">
                <p className="text-sm font-medium">Not enough data</p>
                <p className="text-xs mt-1">Log at least 2 days to see the trend</p>
            </div>
        );
    }

    // 2. Calculate Scales
    const width = 800;
    const height = 250;
    const paddingX = 40;
    const paddingY = 40;

    const weights = data.map(d => d.weight);
    const minWeight = Math.min(...weights) - 0.5;
    const maxWeight = Math.max(...weights) + 0.5;
    const weightRange = maxWeight - minWeight || 1;

    const dates = data.map(d => new Date(d.date).getTime());
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const dateRange = maxDate - minDate || 1;

    const getX = (dateStr: string) => {
        const t = new Date(dateStr).getTime();
        return paddingX + ((t - minDate) / dateRange) * (width - paddingX * 2);
    };

    const getY = (w: number) => {
        return height - paddingY - ((w - minWeight) / weightRange) * (height - paddingY * 2);
    };

    // 3. Build Smooth Path
    const points = data.map(d => [getX(d.date), getY(d.weight)]);
    const linePath = svgPath(points, bezierCommand);

    // Close the area path for gradient
    const areaPath = `
    ${linePath}
    L ${points[points.length - 1][0]},${height}
    L ${points[0][0]},${height}
    Z
  `;

    return (
        <div className="w-full">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto drop-shadow-lg filter">
                {/* Gradient */}
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                    {/* Shadow Filter */}
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Dashed Grid Lines */}
                {[0, 0.33, 0.66, 1].map(t => {
                    const y = height - paddingY - (t * (height - paddingY * 2));
                    // Don't draw if out of bounds
                    if (y < 0 || y > height) return null;

                    return (
                        <line
                            key={t}
                            x1={paddingX}
                            y1={y}
                            x2={width - paddingX}
                            y2={y}
                            stroke="#334155"
                            strokeWidth="1"
                            strokeDasharray="4 6"
                            strokeOpacity="0.5"
                        />
                    );
                })}

                {/* Area Fill */}
                <path d={areaPath} fill="url(#chartGradient)" />

                {/* The Smooth Line */}
                <path
                    d={linePath}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                />

                {/* Data Points - Active indicator for last point? Or all points? Design shows dots. */}
                {data.map((d, i) => {
                    const isLast = i === data.length - 1;
                    const cx = getX(d.date);
                    const cy = getY(d.weight);

                    return (
                        <g key={d.id}>
                            {/* Pulsing effect for last item */}
                            {isLast && (
                                <circle
                                    cx={cx}
                                    cy={cy}
                                    r="8"
                                    fill="#10b981"
                                    className="animate-pulse"
                                    opacity="0.5"
                                />
                            )}
                            <circle
                                cx={cx}
                                cy={cy}
                                r={isLast ? 5 : 3.5}
                                fill="#0f172a"
                                stroke="#10b981"
                                strokeWidth={isLast ? 3 : 2}
                            />
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};
