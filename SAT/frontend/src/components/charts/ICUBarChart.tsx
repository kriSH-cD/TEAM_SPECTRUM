import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

interface ICUBarChartProps {
    data: any[];
    xKey?: string;
    yKey?: string;
    capacity?: number;
    height?: number;
    title?: string;
}

const ICUBarChart: React.FC<ICUBarChartProps> = ({
    data,
    xKey = 'date',
    yKey = 'icu_demand',
    capacity = 50,
    height = 300,
    title = "ICU Bed Demand Forecast"
}) => {
    return (
        <div className="w-full h-full bg-white dark:bg-dark-900 rounded-xl shadow-sm p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {title}
                </h3>
                <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-dark-800 rounded text-gray-600 dark:text-gray-400">
                    Capacity: {capacity} Beds
                </span>
            </div>
            <div style={{ height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} vertical={false} />
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
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{
                                backgroundColor: '#1F2937',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '12px'
                            }}
                        />
                        <Bar dataKey={yKey} name="ICU Beds Needed" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry[yKey] > capacity ? '#EF4444' : entry[yKey] > capacity * 0.8 ? '#F59E0B' : '#3B82F6'}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ICUBarChart;
