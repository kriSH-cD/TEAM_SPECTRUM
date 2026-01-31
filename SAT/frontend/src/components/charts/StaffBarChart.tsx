import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface StaffBarChartProps {
    data: any[];
    xKey?: string;
    yKey?: string;
    height?: number;
    title?: string;
}

const StaffBarChart: React.FC<StaffBarChartProps> = ({
    data,
    xKey = 'date',
    yKey = 'staff_needed',
    height = 300,
    title = "Staffing Requirements"
}) => {
    return (
        <div className="w-full h-full bg-white dark:bg-dark-900 rounded-xl shadow-sm p-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                {title}
            </h3>
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
                        <YAxis stroke="#9CA3AF" fontSize={12} allowDecimals={false} />
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
                        <Bar dataKey={yKey} name="Staff Needed" radius={[4, 4, 0, 0]} fill="#8B5CF6" barSize={30} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default StaffBarChart;
