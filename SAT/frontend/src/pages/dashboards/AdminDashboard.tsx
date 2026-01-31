import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Map, AlertTriangle, Download, Users, Brain, Calendar,
    Activity, Wind, ShieldCheck
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { getAiForecast } from '../../services/api';

// Import reusable chart components
import ForecastLineChart from '../../components/charts/ForecastLineChart';
import FeatureImportanceChart from '../../components/charts/FeatureImportanceChart';

interface ForecastDay {
    date: string;
    value: number;
    risk_level: string;
    hotspot_probability: number;
    action_required: boolean;
    confidence_lower: number;
    confidence_upper: number;
}

interface ForecastData {
    forecast: ForecastDay[];
    ensemble_confidence: number;
    explanations: Array<{ feature: string; importance: number }>;
    models_used: string[];
}

const AdminDashboard: React.FC = () => {
    const [forecastData, setForecastData] = useState<ForecastData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    useEffect(() => {
        const fetchForecast = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getAiForecast('admin', 7);
                setForecastData(data);
                setLastUpdated(new Date());
            } catch (err: any) {
                console.error('Failed to fetch admin forecast', err);
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
                    <p className="text-gray-600 dark:text-gray-400">Loading Regional Forecasts...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen p-6">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 max-w-md">
                    <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 text-center mb-2">
                        Forecast Unavailable
                    </h3>
                    <p className="text-red-600 dark:text-red-400 text-center text-sm">{error}</p>
                </div>
            </div>
        );
    }

    if (!forecastData) return null;

    // Mock regional/district data (in a real app, this would be aggregated from multiple hospitals)
    // Using forecast value to scale mock data for consistency
    const baseValue = forecastData.forecast[0].value;
    const mockDistricts = [
        { name: 'Mumbai City', admissions: Math.round(baseValue * 2.5), risk: baseValue > 120 ? 'HIGH' : 'MEDIUM' },
        { name: 'Mumbai Suburban', admissions: Math.round(baseValue * 3.1), risk: baseValue > 130 ? 'HIGH' : 'MEDIUM' },
        { name: 'Thane', admissions: Math.round(baseValue * 1.8), risk: baseValue > 110 ? 'MEDIUM' : 'LOW' },
        { name: 'Pune City', admissions: Math.round(baseValue * 2.2), risk: baseValue > 125 ? 'HIGH' : 'MEDIUM' },
        { name: 'Nashik', admissions: Math.round(baseValue * 1.2), risk: 'LOW' }
    ].sort((a, b) => b.admissions - a.admissions);

    const top5HighRisk = mockDistricts.filter(d => d.risk === 'HIGH' || d.risk === 'MEDIUM').slice(0, 5);

    // ICU and oxygen calculations
    const totalAdmissions = forecastData.forecast.reduce((sum, day) => sum + day.value, 0);
    const icuShortage = Math.max(0, Math.floor(totalAdmissions * 0.15) - 450); // Assuming 450 ICU capacity
    const oxygenDemand = totalAdmissions * 2.5; // 2.5 units per admission
    const oxygenSupply = 2800; // Mock supply
    const oxygenRisk = oxygenDemand > oxygenSupply ? 'HIGH' : oxygenDemand > oxygenSupply * 0.8 ? 'MEDIUM' : 'LOW';

    // Prepare chart data
    const trendChartData = forecastData.forecast.map(day => ({
        date: day.date,
        value: day.value,
        confidence_lower: day.confidence_lower,
        confidence_upper: day.confidence_upper
    }));

    const highRiskDays = forecastData.forecast.filter(day => day.risk_level === 'HIGH').length;

    return (
        <div className="p-4 md:p-6 space-y-6 animate-fade-in max-w-7xl mx-auto">
            {/* Confidentiality Banner */}
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3 rounded-r-lg mb-6 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-semibold text-red-800 dark:text-red-300 uppercase tracking-wider">
                        Confidential - Government Use Only
                    </span>
                </div>
                <span className="text-xs text-red-600 dark:text-red-400 hidden md:inline">
                    Unauthorized access is a punishable offense.
                </span>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-6 md:mb-8 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Admin Dashboard
                    </h1>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                        health monitoring and resource allocation
                    </p>
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    {/* Last Updated */}
                    <div className="text-left md:text-right">
                        <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
                            <Calendar className="w-3 h-3" />
                            <span>Last Updated</span>
                        </div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {lastUpdated.toLocaleTimeString()}
                        </div>
                    </div>
                    {/* AI Confidence */}
                    <div className="text-left md:text-right">
                        <div className="flex items-center md:justify-end space-x-1 text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            <Brain className="w-3 h-3" />
                            <span>AI Confidence</span>
                        </div>
                        <div className="text-xl md:text-2xl font-bold text-primary-600 dark:text-primary-400">
                            {(forecastData.ensemble_confidence * 100).toFixed(0)}%
                        </div>
                    </div>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm md:text-base">
                        <Download className="w-4 h-4" />
                        <span>Export Report</span>
                    </button>
                </div>
            </div>

            {/* Alert Banner - Action Required */}
            {forecastData.forecast.some(day => day.action_required) && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center space-x-3"
                >
                    <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <div className="flex-1">
                        <span className="font-medium text-sm md:text-base text-red-800 dark:text-red-300">
                            Critical Alert: {highRiskDays} high-risk day(s) detected. Immediate resource allocation required.
                        </span>
                    </div>
                </motion.div>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-dark-900 rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6"
                >
                    <div className="flex items-center justify-between mb-2 md:mb-4">
                        <h3 className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300">Total Forecast</h3>
                        <Users className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
                    </div>
                    <div className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">
                        {Math.ceil(totalAdmissions)}
                    </div>
                    <div className="text-xs md:text-sm text-gray-500 mt-1 md:mt-2">
                        Next 7 days (all regions)
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-dark-900 rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6"
                >
                    <div className="flex items-center justify-between mb-2 md:mb-4">
                        <h3 className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300">ICU Shortage</h3>
                        <Activity className={`w-4 h-4 md:w-5 md:h-5 ${icuShortage > 50 ? 'text-red-500' : 'text-green-500'}`} />
                    </div>
                    <div className={`text-2xl md:text-4xl font-bold ${icuShortage > 50 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        {icuShortage > 0 ? icuShortage : 0}
                    </div>
                    <div className="text-xs md:text-sm text-gray-500 mt-1 md:mt-2">
                        {icuShortage > 0 ? 'Beds short' : 'Adequate capacity'}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-dark-900 rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6"
                >
                    <div className="flex items-center justify-between mb-2 md:mb-4">
                        <h3 className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300">Oxygen Risk</h3>
                        <Wind className={`w-4 h-4 md:w-5 md:h-5 ${oxygenRisk === 'HIGH' ? 'text-red-500' :
                            oxygenRisk === 'MEDIUM' ? 'text-orange-500' : 'text-green-500'
                            }`} />
                    </div>
                    <div className={`text-2xl md:text-4xl font-bold ${oxygenRisk === 'HIGH' ? 'text-red-600 dark:text-red-400' :
                        oxygenRisk === 'MEDIUM' ? 'text-orange-600 dark:text-orange-400' :
                            'text-green-600 dark:text-green-400'
                        }`}>
                        {oxygenRisk}
                    </div>
                    <div className="text-xs md:text-sm text-gray-500 mt-1 md:mt-2">
                        {Math.ceil(oxygenDemand)} / {oxygenSupply} units
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-dark-900 rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6"
                >
                    <div className="flex items-center justify-between mb-2 md:mb-4">
                        <h3 className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300">High-Risk Districts</h3>
                        <Map className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
                    </div>
                    <div className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">
                        {top5HighRisk.filter(d => d.risk === 'HIGH').length}
                    </div>
                    <div className="text-xs md:text-sm text-gray-500 mt-1 md:mt-2">
                        Require immediate attention
                    </div>
                </motion.div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Top 5 High-Risk Districts and Trend Line removed as per request */}

                {/* Feature Importance (TFT Explanations) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="lg:col-span-2"
                >
                    <FeatureImportanceChart
                        data={forecastData.explanations}
                        title="AI Model Feature Importance (Multi-Model Analysis)"
                    />
                    <div className="mt-2 text-xs text-gray-500 text-center">
                        Powered by: {forecastData.models_used.join(', ')}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminDashboard;
