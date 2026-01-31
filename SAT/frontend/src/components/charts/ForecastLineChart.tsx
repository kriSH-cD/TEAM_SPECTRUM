import React from 'react';

interface ForecastLineChartProps {
    data: any[];
    title?: string;
    color?: string;
    height?: number;
}

const ForecastLineChart: React.FC<ForecastLineChartProps> = ({ title = "Forecast Chart" }) => {
    return (
        <div className="bg-white/90 dark:bg-dark-900/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 dark:border-gray-800 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                <p>Forecast data temporarily unavailable</p>
            </div>
        </div>
    );
};

export default ForecastLineChart;
