import React from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle } from 'lucide-react';

interface RiskMeterProps {
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    score?: number; // 0-100
    label?: string;
    showIcon?: boolean;
}

const RiskMeter: React.FC<RiskMeterProps> = ({
    riskLevel,
    score,
    label = "Risk Level",
    showIcon = true
}) => {

    const getColor = (level: string) => {
        switch (level) {
            case 'CRITICAL': return 'red';
            case 'HIGH': return 'orange';
            case 'MEDIUM': return 'yellow';
            case 'LOW': return 'green';
            default: return 'gray';
        }
    };

    const color = getColor(riskLevel);

    // Map Tailwind color classes
    const bgClass = {
        red: 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800',
        orange: 'bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800',
        yellow: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800',
        green: 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800',
        gray: 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }[color];

    const textClass = {
        red: 'text-red-800 dark:text-red-300',
        orange: 'text-orange-800 dark:text-orange-300',
        yellow: 'text-yellow-800 dark:text-yellow-300',
        green: 'text-green-800 dark:text-green-300',
        gray: 'text-gray-800 dark:text-gray-300'
    }[color];

    const iconColorClass = {
        red: 'text-red-600 dark:text-red-400',
        orange: 'text-orange-600 dark:text-orange-400',
        yellow: 'text-yellow-600 dark:text-yellow-400',
        green: 'text-green-600 dark:text-green-400',
        gray: 'text-gray-600 dark:text-gray-400'
    }[color];

    const Icon = {
        'CRITICAL': AlertTriangle,
        'HIGH': AlertTriangle,
        'MEDIUM': AlertCircle,
        'LOW': ShieldCheck
    }[riskLevel] || ShieldCheck;

    return (
        <div className={`border rounded-xl p-4 flex items-center justify-between ${bgClass}`}>
            <div className="flex items-center space-x-3">
                {showIcon && (
                    <div className={`p-2 rounded-full bg-white/50 dark:bg-black/20`}>
                        <Icon className={`w-6 h-6 ${iconColorClass}`} />
                    </div>
                )}
                <div>
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        {label}
                    </h4>
                    <div className={`text-xl font-bold ${textClass}`}>
                        {riskLevel}
                    </div>
                </div>
            </div>

            {score !== undefined && (
                <div className="flex flex-col items-end">
                    <div className={`text-2xl font-bold ${textClass}`}>
                        {score}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        / 100
                    </div>
                </div>
            )}
        </div>
    );
};

export default RiskMeter;
