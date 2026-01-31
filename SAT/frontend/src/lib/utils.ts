import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
}

export function formatPercentage(value: number): string {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
}

export function getRiskColor(riskLevel: 'low' | 'medium' | 'high' | 'critical'): string {
    const colors = {
        low: 'text-success-600 bg-success-50 dark:bg-success-950/30',
        medium: 'text-warning-600 bg-warning-50 dark:bg-warning-950/30',
        high: 'text-danger-600 bg-danger-50 dark:bg-danger-950/30',
        critical: 'text-red-700 bg-red-100 dark:bg-red-950/50'
    }
    return colors[riskLevel] || colors.low
}

export function getTrendColor(trend: number): string {
    if (trend > 0) return 'text-danger-600'
    if (trend < 0) return 'text-success-600'
    return 'text-gray-600 dark:text-gray-400'
}
