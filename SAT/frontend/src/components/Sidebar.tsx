import React from 'react'
import { NavLink } from 'react-router-dom'
import {
    LayoutDashboard,
    Bell,
    Hospital,
    Settings,
    Activity,
    X,
    Brain
} from 'lucide-react'
import { cn } from '../lib/utils'

interface SidebarProps {
    isOpen?: boolean
    onClose?: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
    const [dashboardPath, setDashboardPath] = React.useState('/');

    React.useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            switch (user.role) {
                case 'hospital_staff':
                    setDashboardPath('/dashboard/hospital');
                    break;
                case 'admin':
                    setDashboardPath('/dashboard/admin');
                    break;
                default:
                    setDashboardPath('/dashboard/hospital');
            }
        }
    }, []);

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: dashboardPath },
        { icon: Brain, label: 'Agent Control', path: '/agent-control' },
        { icon: Bell, label: 'Alerts', path: '/alerts' },
        { icon: Hospital, label: 'Hospitals', path: '/hospitals' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ]

    return (
        <aside
            className={cn(
                'fixed left-0 top-0 h-full bg-white dark:bg-dark-900 border-r border-gray-200 dark:border-dark-800 transition-all duration-300 z-40 shadow-xl md:shadow-none',
                // Mobile: Slide in/out
                'transform md:transform-none',
                isOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-20'
            )}
        >
            {/* Logo Section */}
            <div className="h-16 flex items-center justify-between md:justify-center border-b border-gray-200 dark:border-dark-800 px-4">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                        <Activity className="w-6 h-6 text-white" />
                    </div>
                    {isOpen && (
                        <div className="animate-fade-in">
                            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                                SAT
                            </h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400">AI Forecasting</p>
                        </div>
                    )}
                </div>
                {/* Mobile Close Button */}
                <button
                    onClick={onClose}
                    className="md:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="mt-6 px-3 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            cn(
                                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group',
                                isActive
                                    ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-800 hover:text-gray-900 dark:hover:text-gray-100'
                            )
                        }
                    >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {isOpen && (
                            <span className="font-medium animate-fade-in">{item.label}</span>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom Section */}

        </aside>
    )
}

export default Sidebar
