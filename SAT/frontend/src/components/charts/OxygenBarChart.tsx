import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface OxygenBarChartProps {
    data: any[];
    xKey?: string;
    yKey?: string;
    stockLimit?: number;
    height?: number;
    title?: string;
}

const OxygenBarChart: React.FC<OxygenBarChartProps> = ({
    data,
    xKey = 'date',
    yKey = 'oxygen_units',
    stockLimit = 1000,
    height = 300,
    title = "Oxygen Demand Forecast"
}) => {
    return (
        <div className="w-full h-full bg-white dark:bg-dark-900 rounded-xl shadow-sm p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {title}
                </h3>
                <span className="text-xs font-medium px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded text-blue-600 dark:text-blue-400">
                    Stock: {stockLimit} Units
                </span>
            </div>
            <div style={{ height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorOxygen" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                        <XAxis
                            dataKey={xKey}
                            stroke="#9CA3AF"
                            fontSize={12}
                            tickFormatter={(val) => {
                                const d = new Date(val);
                                return isNaN(d.getTime()) ? val : d.toLocaleDateString('en-US', { weekday: 'short' });
                            }}
                        />
                        <YAxis stroke="#9CA3AF" fontSize={12} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1F2937',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '12px'
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey={yKey}
                            stroke="#06B6D4"
                            strokeWidth={2}
                            fill="url(#colorOxygen)"
                            name="Oxygen Units"
                        />
                        {/* Threshold Line could be added here as a ReferenceLine if needed */}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default OxygenBarChart;
