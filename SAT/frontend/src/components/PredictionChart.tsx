import React from 'react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { ChartDataPoint } from '../types'
import { motion } from 'framer-motion'

interface PredictionChartProps {
    data: ChartDataPoint[]
    title: string
    type?: 'line' | 'area'
}

const PredictionChart: React.FC<PredictionChartProps> = ({ data, title, type = 'area' }) => {
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-dark-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-dark-700">
                    <p className="text-sm font-semibold mb-1">{payload[0].payload.date}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: <span className="font-bold">{entry.value}</span>
                        </p>
                    ))}
                </div>
            )
        }
        return null
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="card"
        >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {title}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                {type === 'area' ? (
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-dark-800" />
                        <XAxis
                            dataKey="date"
                            tick={{ fill: '#9ca3af' }}
                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis tick={{ fill: '#9ca3af' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="actual"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fill="url(#colorActual)"
                            name="Actual"
                        />
                        <Area
                            type="monotone"
                            dataKey="predicted"
                            stroke="#f97316"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            fill="url(#colorPredicted)"
                            name="Predicted"
                        />
                    </AreaChart>
                ) : (
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-dark-800" />
                        <XAxis
                            dataKey="date"
                            tick={{ fill: '#9ca3af' }}
                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis tick={{ fill: '#9ca3af' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="actual"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{ r: 4 }}
                            name="Actual"
                        />
                        <Line
                            type="monotone"
                            dataKey="predicted"
                            stroke="#f97316"
                            strokeWidth={3}
                            strokeDasharray="5 5"
                            dot={{ r: 4 }}
                            name="Predicted"
                        />
                    </LineChart>
                )}
            </ResponsiveContainer>
        </motion.div>
    )
}

export default PredictionChart
