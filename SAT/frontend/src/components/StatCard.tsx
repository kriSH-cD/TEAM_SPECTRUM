import React from 'react'
import { cn, formatNumber, formatPercentage, getTrendColor } from '../lib/utils'
import { motion } from 'framer-motion'

interface StatCardProps {
    title: string
    value: number | string
    icon: React.ComponentType<{ className?: string }>
    trend?: number
    trendLabel?: string
    color?: 'primary' | 'success' | 'warning' | 'danger'
    className?: string
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon: Icon,
    trend,
    trendLabel,
    color = 'primary',
    className
}) => {
    const colorClasses = {
        primary: 'from-primary-500 to-primary-700',
        success: 'from-success-500 to-success-700',
        warning: 'from-warning-500 to-warning-700',
        danger: 'from-danger-500 to-danger-700',
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn('card group cursor-pointer', className)}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {typeof value === 'number' ? formatNumber(value) : value}
                    </h3>
                    {trend !== undefined && (
                        <div className="flex items-center space-x-1">
                            <span className={cn('text-sm font-medium', getTrendColor(trend))}>
                                {formatPercentage(trend)}
                            </span>
                            {trendLabel && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {trendLabel}
                                </span>
                            )}
                        </div>
                    )}
                </div>
                <div className={cn(
                    'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center transition-transform group-hover:scale-110',
                    colorClasses[color]
                )}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </motion.div>
    )
}

export default StatCard
