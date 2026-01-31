import React, { useState, useEffect, useRef } from 'react'
import { Bell, Search, Moon, Sun, User, Check, ExternalLink, Menu, LogOut, Settings } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { getAlerts } from '../services/api'
import { motion, AnimatePresence } from 'framer-motion'

interface NavbarProps {
    onToggleDarkMode?: () => void
    isDarkMode?: boolean
    onToggleSidebar?: () => void
}

const Navbar: React.FC<NavbarProps> = ({ onToggleDarkMode, isDarkMode = false, onToggleSidebar }) => {
    const [searchQuery, setSearchQuery] = useState('')
    const [showNotifications, setShowNotifications] = useState(false)
    const [alerts, setAlerts] = useState<any[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const notificationRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()

    // Fetch alerts for notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const userStr = localStorage.getItem('user');
                let hospitalId;
                if (userStr) {
                    const user = JSON.parse(userStr);
                    if (user.role === 'hospital_staff') hospitalId = user.hospitalId;
                }
                const data = await getAlerts(hospitalId);
                // Simulate unread count (random for demo or based on data)
                setAlerts(data.slice(0, 5)); // Top 5
                setUnreadCount(data.length > 0 ? 3 : 0);
            } catch (error) {
                console.error("Failed to load notifications", error);
            }
        };
        fetchNotifications();

        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkRead = () => {
        setUnreadCount(0);
        // In real app, call API to mark read
    };

    const [user, setUser] = useState<{ name: string, role: string } | null>(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    useEffect(() => {
        const loadUser = () => {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                setUser(JSON.parse(userStr));
            }
        };
        loadUser();

        window.addEventListener('user-updated', loadUser);
        return () => window.removeEventListener('user-updated', loadUser);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-dark-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-dark-800">
            <div className="flex items-center justify-between h-16 px-4 md:px-6">
                {/* Left Section: Menu & Search */}
                <div className="flex items-center gap-4 flex-1">
                    <button
                        onClick={onToggleSidebar}
                        className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 text-gray-600 dark:text-gray-400"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    {/* Search Bar */}
                    <div className="max-w-md hidden md:block w-full">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search hospitals, predictions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center space-x-2 md:space-x-4 ml-auto">
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={onToggleDarkMode}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
                        aria-label="Toggle dark mode"
                    >
                        {isDarkMode ? (
                            <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        ) : (
                            <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        )}
                    </button>

                    {/* Notifications */}
                    <div className="relative" ref={notificationRef}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
                        >
                            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            )}
                        </button>

                        <AnimatePresence>
                            {showNotifications && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-dark-900 rounded-xl shadow-xl border border-gray-200 dark:border-dark-700 overflow-hidden"
                                >
                                    <div className="p-4 border-b border-gray-100 dark:border-dark-800 flex justify-between items-center">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={handleMarkRead}
                                                className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                                            >
                                                <Check size={14} /> Mark all read
                                            </button>
                                        )}
                                    </div>

                                    <div className="max-h-[400px] overflow-y-auto">
                                        {alerts.length > 0 ? (
                                            alerts.map((alert, i) => (
                                                <div key={i} className="p-4 border-b border-gray-50 dark:border-dark-800 hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors cursor-pointer" onClick={() => navigate('/alerts')}>
                                                    <div className="flex gap-3">
                                                        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${alert.type === 'critical' ? 'bg-red-500' :
                                                            alert.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                                                            }`} />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{alert.title || 'System Alert'}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{alert.message}</p>
                                                            <p className="text-[10px] text-gray-400 mt-2">
                                                                {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-gray-500">
                                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                                <p className="text-sm">No new notifications</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-3 bg-gray-50 dark:bg-dark-800 text-center border-t border-gray-100 dark:border-dark-700">
                                        <Link
                                            to="/alerts"
                                            onClick={() => setShowNotifications(false)}
                                            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center gap-1"
                                        >
                                            View All Alerts <ExternalLink size={14} />
                                        </Link>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* User Profile */}
                    <div className="relative pl-4 border-l border-gray-200 dark:border-dark-700">
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-dark-800 p-2 rounded-lg transition-colors"
                        >
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                    {user?.name || 'Guest'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                    {user?.role?.replace('_', ' ') || 'Visitor'}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold shadow-md">
                                <User className="w-5 h-5" />
                            </div>
                        </button>

                        <AnimatePresence>
                            {showProfileMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-900 rounded-xl shadow-xl border border-gray-200 dark:border-dark-700 overflow-hidden z-50"
                                >
                                    <div className="p-1">
                                        <button
                                            onClick={() => {
                                                navigate('/settings');
                                                setShowProfileMenu(false);
                                            }}
                                            className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg transition-colors"
                                        >
                                            <Settings className="w-4 h-4" />
                                            <span>Profile Settings</span>
                                        </button>
                                        <div className="h-px bg-gray-100 dark:bg-dark-800 my-1" />
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Navbar
