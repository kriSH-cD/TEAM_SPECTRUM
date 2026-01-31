import React from 'react'
import type { Alert as AlertType } from '../types'
import { cn } from '../lib/utils'
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface AlertCardProps {
    alert: AlertType
    onDismiss?: (id: string) => void
    onMarkRead?: (id: string) => void
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, onDismiss, onMarkRead }) => {
    const icons = {
        info: Info,
        warning: AlertTriangle,
        danger: XCircle,
        success: CheckCircle,
    }

    const colors = {
        info: 'border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-950/30',
        warning: 'border-warning-200 dark:border-warning-800 bg-warning-50 dark:bg-warning-950/30',
        danger: 'border-danger-200 dark:border-danger-800 bg-danger-50 dark:bg-danger-950/30',
        success: 'border-success-200 dark:border-success-800 bg-success-50 dark:bg-success-950/30',
    }

    const iconColors = {
        info: 'text-primary-600 dark:text-primary-400',
        warning: 'text-warning-600 dark:text-warning-400',
        danger: 'text-danger-600 dark:text-danger-400',
        success: 'text-success-600 dark:text-success-400',
    }

    const Icon = icons[alert.type]

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        return `${diffDays}d ago`
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={cn(
                'p-4 rounded-lg border-l-4 transition-all duration-200',
                colors[alert.type],
                !alert.read && 'shadow-md'
            )}
        >
            <div className="flex items-start space-x-3">
                <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', iconColors[alert.type])} />
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                        <h4 className={cn(
                            'font-semibold text-sm',
                            iconColors[alert.type]
                        )}>
                            {alert.title}
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            {formatTimestamp(alert.timestamp)}
                        </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        {alert.message}
                    </p>
                    <div className="flex items-center space-x-3">
                        {!alert.read && onMarkRead && (
                            <button
                                onClick={() => onMarkRead(alert.id)}
                                className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                            >
                                Mark as read
                            </button>
                        )}
                        {onDismiss && (
                            <button
                                onClick={() => onDismiss(alert.id)}
                                className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                Dismiss
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default AlertCard
