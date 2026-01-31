import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bed, Users, Activity, Brain, Calendar, ShieldCheck, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle } from 'lucide-react';
import { getAiForecast } from '../../services/api';

// Import reusable chart components
import ForecastLineChart from '../../components/charts/ForecastLineChart';
import ICUBarChart from '../../components/charts/ICUBarChart';
import OxygenBarChart from '../../components/charts/OxygenBarChart';
import StaffBarChart from '../../components/charts/StaffBarChart';
import RiskMeter from '../../components/charts/RiskMeter';
// FeatureImportanceChart removed

interface ForecastDay {
    date: string;
    value: number;
    icu_demand: number;
    oxygen_units: number;
    staff_needed: number;
    alert: string;
    confidence_lower: number;
    confidence_upper: number;
}

interface HospitalAlerts {
    alert_level: 'NORMAL' | 'WARNING' | 'CRITICAL';
    reasons: string[];
    recommended_actions: string[];
}

interface ForecastData {
    forecast: ForecastDay[];
    ensemble_confidence: number;
    explanations: Array<{ feature: string; importance: number }>;
    models_used: string[];
    hospital_alerts?: HospitalAlerts;
}

const HospitalDashboard: React.FC = () => {
    const [forecastData, setForecastData] = useState<ForecastData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    useEffect(() => {
        const fetchForecast = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getAiForecast('hospital_staff', 7);
                setForecastData(data);
                setLastUpdated(new Date());
            } catch (err: any) {
                console.error('Failed to fetch AI forecast', err);
                setError(err.message || 'Failed to load forecast data');
            } finally {
                setLoading(false);
            }
        };

        fetchForecast();

        // Auto-refresh every 5 minutes
        const interval = setInterval(fetchForecast, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400 font-medium animate-pulse">Initializing Command Center...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen p-6">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 max-w-md shadow-xl backdrop-blur-sm">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-full">
                            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-red-800 dark:text-red-300 text-center mb-2">
                        System Unavailable
                    </h3>
                    <p className="text-red-600 dark:text-red-400 text-center text-sm">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                    >
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    if (!forecastData) return null;

    // Prepare chart data
    const admissionsChartData = forecastData.forecast.map(day => ({
        date: day.date,
        value: day.value,
        confidence_lower: day.confidence_lower,
        confidence_upper: day.confidence_upper
    }));

    const icuChartData = forecastData.forecast.map(day => ({
        date: day.date,
        icu_demand: day.icu_demand
    }));

    const oxygenChartData = forecastData.forecast.map(day => ({
        date: day.date,
        oxygen_units: day.oxygen_units
    }));

    const staffChartData = forecastData.forecast.map(day => ({
        date: day.date,
        staff_needed: day.staff_needed
    }));

    const today = forecastData.forecast[0];
    const riskLevel = forecastData.hospital_alerts?.alert_level || (today.alert === 'HIGH' ? 'HIGH' : 'LOW');

    // Calculate trends
    const avgAdmissions = forecastData.forecast.reduce((sum, day) => sum + day.value, 0) / forecastData.forecast.length;
    const admissionTrend = today.value > avgAdmissions * 1.05 ? 'up' : today.value < avgAdmissions * 0.95 ? 'down' : 'stable';

    const avgICU = forecastData.forecast.reduce((sum, day) => sum + day.icu_demand, 0) / forecastData.forecast.length;
    const icuTrend = today.icu_demand > avgICU * 1.05 ? 'up' : today.icu_demand < avgICU * 0.95 ? 'down' : 'stable';

    const getTrendIcon = (trend: string) => {
        if (trend === 'up') return <TrendingUp className="w-4 h-4 text-red-500" />;
        if (trend === 'down') return <TrendingDown className="w-4 h-4 text-green-500" />;
        return <Minus className="w-4 h-4 text-gray-400" />;
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto"
        >
            {/* Confidentiality Banner */}
            <motion.div
                variants={itemVariants}
                className="bg-gradient-to-r from-red-50 to-white dark:from-red-900/20 dark:to-dark-900 border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm flex items-center justify-between backdrop-blur-sm"
            >
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <ShieldCheck className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <span className="text-sm font-bold text-red-800 dark:text-red-300 uppercase tracking-wider block">
                            Confidential Data
                        </span>
                        <span className="text-xs text-red-600 dark:text-red-400 hidden md:inline">
                            Authorized Hospital Personnel Only. Do not distribute.
                        </span>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <span className="text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-widest">Live Feed</span>
                </div>
            </motion.div>

            {/* Header Section */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 mb-2">
                        Command Center
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
                        <Brain className="w-4 h-4 text-primary-500" />
                        AI-Powered Resource Forecasting
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-dark-800 rounded-full text-xs text-gray-500 border border-gray-200 dark:border-gray-700">
                            v2.4.0
                        </span>
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-md p-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium uppercase tracking-wide">Last Updated</div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {lastUpdated.toLocaleTimeString()}
                        </div>
                    </div>

                    <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-md p-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm min-w-[160px]">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium uppercase tracking-wide">Model Confidence</div>
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                                {(forecastData.ensemble_confidence * 100).toFixed(0)}%
                            </span>
                            <div className="w-16 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${forecastData.ensemble_confidence * 100}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Risk & Alerts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div variants={itemVariants} className="lg:col-span-1 h-full">
                    <RiskMeter
                        riskLevel={riskLevel as any}
                        label="Overall Resource Risk"
                    />
                </motion.div>

                {forecastData.hospital_alerts && forecastData.hospital_alerts.reasons.length > 0 && (
                    <motion.div variants={itemVariants} className="lg:col-span-2 bg-white/90 dark:bg-dark-900/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 dark:border-gray-800 p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/10 to-transparent rounded-bl-full -mr-8 -mt-8 pointer-events-none" />

                        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center text-lg">
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg mr-3">
                                <Activity className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            Critical Action Items
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-2">
                                    <AlertTriangle className="w-3 h-3" />
                                    Issues Detected
                                </h4>
                                <ul className="space-y-2">
                                    {forecastData.hospital_alerts.reasons.map((reason, i) => (
                                        <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start bg-red-50/50 dark:bg-red-900/10 p-2 rounded-lg border border-red-100 dark:border-red-900/30">
                                            <span className="mr-2 text-red-500">•</span>
                                            {reason}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-2">
                                    <CheckCircle className="w-3 h-3" />
                                    Recommended Actions
                                </h4>
                                <ul className="space-y-2">
                                    {forecastData.hospital_alerts.recommended_actions.map((action, i) => (
                                        <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start bg-blue-50/50 dark:bg-blue-900/10 p-2 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                            <span className="mr-2 text-blue-500">✓</span>
                                            {action}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Stats Cards */}
            <motion.div variants={containerVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[
                    {
                        title: "Admissions",
                        value: today.value,
                        trend: admissionTrend,
                        avg: avgAdmissions,
                        icon: Bed,
                        color: "blue",
                        subtext: "Patients expected"
                    },
                    {
                        title: "ICU Demand",
                        value: today.icu_demand,
                        trend: icuTrend,
                        avg: avgICU,
                        icon: Activity,
                        color: "red",
                        subtext: "Critical beds needed"
                    },
                    {
                        title: "Oxygen Units",
                        value: today.oxygen_units,
                        trend: "stable",
                        avg: null,
                        icon: Activity,
                        color: "green",
                        subtext: "Cylinders required"
                    },
                    {
                        title: "Staffing",
                        value: today.staff_needed,
                        trend: "stable",
                        avg: null,
                        icon: Users,
                        color: "purple",
                        subtext: "Personnel on shift"
                    }
                ].map((stat, index) => (
                    <motion.div
                        key={index}
                        variants={itemVariants}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        className={`bg-white/90 dark:bg-dark-900/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 dark:border-gray-800 p-5 relative overflow-hidden group`}
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`} />

                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className={`p-3 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 rounded-xl`}>
                                <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                            </div>
                            {stat.avg && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 dark:bg-dark-800 rounded-lg border border-gray-100 dark:border-gray-700">
                                    {getTrendIcon(stat.trend)}
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                        {stat.trend === 'up' ? '+' : ''}{Math.round(((stat.value - stat.avg) / stat.avg) * 100)}%
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-1">
                                {stat.value}
                            </h3>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{stat.subtext}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Main Forecast Chart */}
            <motion.div
                variants={itemVariants}
                className="bg-white/90 dark:bg-dark-900/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 dark:border-gray-800 p-6"
            >
                <ForecastLineChart
                    data={admissionsChartData}
                    title="Patient Admissions Forecast (Next 7 Days)"
                    color="#3B82F6"
                    height={400}
                />
            </motion.div>

            {/* Secondary Metrics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <motion.div variants={itemVariants}>
                        <ICUBarChart
                            data={icuChartData}
                            title="ICU Bed Demand"
                        />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <OxygenBarChart
                            data={oxygenChartData}
                            title="Oxygen Supply Requirements"
                        />
                    </motion.div>
                </div>

                <div className="space-y-6">
                    <motion.div variants={itemVariants}>
                        <StaffBarChart
                            data={staffChartData}
                            title="Staff Allocation Needs"
                        />
                    </motion.div>


                </div>
            </div>
        </motion.div>
    );
};

export default HospitalDashboard;
