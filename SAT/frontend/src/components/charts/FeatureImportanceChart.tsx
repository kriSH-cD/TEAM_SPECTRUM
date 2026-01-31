import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

interface FeatureImportanceChartProps {
    data: Array<{ feature: string; importance: number }>;
    height?: number;
    title?: string;
}

const FeatureImportanceChart: React.FC<FeatureImportanceChartProps> = ({
    data,
    height = 300,
    title = "What's Driving This Forecast?"
}) => {
    // Sort data by importance descending
    const sortedData = [...data].sort((a, b) => b.importance - a.importance);

    // Convert importance to percentage if it's 0-1
    const chartData = sortedData.map(d => ({
        ...d,
        importancePercent: d.importance > 1 ? d.importance : d.importance * 100
    }));

    const topFactor = chartData[0]?.feature || "Unknown factors";

    return (
        <div className="w-full h-full bg-white dark:bg-dark-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                    <span className="bg-purple-100 dark:bg-purple-900/30 p-1.5 rounded-lg mr-3">
                        <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </span>
                    {title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 ml-11">
                    The AI model relies most heavily on <span className="font-semibold text-purple-600 dark:text-purple-400">{topFactor}</span> to make its predictions.
                </p>
            </div>

            <div style={{ height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} horizontal={false} />
                        <XAxis type="number" hide domain={[0, 100]} />
                        <YAxis
                            dataKey="feature"
                            type="category"
                            stroke="#6B7280"
                            fontSize={12}
                            width={140}
                            tick={{ fill: '#6B7280' }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{
                                backgroundColor: '#1F2937',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '12px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                            formatter={(value: number) => [`${value.toFixed(1)}%`, 'Impact Score']}
                        />
                        <Bar dataKey="importancePercent" name="Impact" radius={[0, 4, 4, 0]} barSize={24}>
                            {chartData.map((_, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={index === 0 ? '#7C3AED' : '#A78BFA'}
                                    fillOpacity={1 - (index * 0.05)}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default FeatureImportanceChart;
