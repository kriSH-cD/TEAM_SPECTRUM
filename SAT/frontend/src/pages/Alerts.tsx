import { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertTriangle, Info, Clock, Trash2, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAlerts } from '../services/api';

const Alerts = () => {
    const [filter, setFilter] = useState('all');
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const userStr = localStorage.getItem('user');
                let hospitalId;
                if (userStr) {
                    try {
                        const user = JSON.parse(userStr);
                        if (user.role === 'hospital_staff') {
                            hospitalId = user.hospitalId;
                        }
                    } catch (e) {
                        console.error("Error parsing user data", e);
                    }
                }

                const data = await getAlerts(hospitalId);
                setAlerts(data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch alerts", error);
                setLoading(false);
            }
        };
        fetchAlerts();
    }, []);

    const filteredAlerts = filter === 'all'
        ? alerts
        : alerts.filter(alert => alert.type === filter);

    // Group alerts by date
    const groupedAlerts = filteredAlerts.reduce((groups: any, alert) => {
        const date = new Date(alert.createdAt).toDateString();
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        let key = date;
        if (date === today) key = 'Today';
        else if (date === yesterday) key = 'Yesterday';

        if (!groups[key]) groups[key] = [];
        groups[key].push(alert);
        return groups;
    }, {});

    const getIcon = (type: string) => {
        switch (type) {
            case 'critical': return <AlertTriangle className="text-red-500" size={24} />;
            case 'warning': return <AlertTriangle className="text-orange-500" size={24} />;
            default: return <Info className="text-blue-500" size={24} />;
        }
    };

    const getBorderColor = (type: string) => {
        switch (type) {
            case 'critical': return 'border-l-4 border-l-red-500';
            case 'warning': return 'border-l-4 border-l-orange-500';
            default: return 'border-l-4 border-l-blue-500';
        }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto p-4 md:p-6">
            <header className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Bell className="text-primary-600" />
                        System Alerts
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Critical notifications and system warnings
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-gray-200 dark:border-gray-700">
                        <Trash2 size={18} />
                        Clear All
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm">
                        <CheckCircle size={18} />
                        Mark all read
                    </button>
                </div>
            </header>

            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <Filter size={18} className="text-gray-400 mr-2" />
                {['all', 'critical', 'warning', 'info'].map((type) => (
                    <button
                        key={type}
                        onClick={() => setFilter(type)}
                        className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${filter === type
                            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                            }`}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {/* Alerts List */}
            <div className="space-y-8">
                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : Object.keys(groupedAlerts).length > 0 ? (
                    Object.entries(groupedAlerts).map(([date, groupAlerts]: [string, any]) => (
                        <div key={date} className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky top-20 bg-gray-50/90 dark:bg-dark-950/90 backdrop-blur-sm py-2 z-10">
                                {date}
                            </h3>
                            <div className="space-y-3">
                                <AnimatePresence>
                                    {groupAlerts.map((alert: any) => (
                                        <motion.div
                                            key={alert._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className={`bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 ${getBorderColor(alert.type)} hover:shadow-md transition-shadow`}
                                        >
                                            <div className="flex gap-4">
                                                <div className="flex-shrink-0 mt-1">
                                                    {getIcon(alert.type)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                            {alert.title || 'System Notification'}
                                                        </h4>
                                                        <span className="flex items-center text-xs text-gray-400 whitespace-nowrap ml-4">
                                                            <Clock size={12} className="mr-1" />
                                                            {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                                                        {alert.message}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-24 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                        <Bell size={64} className="mx-auto mb-6 text-gray-300 dark:text-gray-600" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">All Caught Up!</h3>
                        <p className="text-gray-500 dark:text-gray-400">No new alerts to display at this time.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Alerts;
