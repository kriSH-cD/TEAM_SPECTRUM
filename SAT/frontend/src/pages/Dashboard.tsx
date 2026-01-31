import { useEffect, useState } from 'react';
import { Activity, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import StatCard from '../components/StatCard';
import PredictionChart from '../components/PredictionChart';
import AlertCard from '../components/AlertCard';
import { getHospitals, getAlerts, getForecastsByHospital } from '../services/api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalPatients: 0,
        activeAlerts: 0,
        avgOccupancy: 0,
        trend: '+0%'
    });
    const [alerts, setAlerts] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Hospitals to calculate occupancy/patients
                const hospitals = await getHospitals();

                // Calculate aggregate stats
                const totalBeds = hospitals.reduce((acc: number, h: any) => acc + h.totalBeds, 0);
                // Mocking current occupancy as we don't have real-time sensors yet
                const totalPatients = Math.floor(totalBeds * 0.75);

                // 2. Fetch Alerts
                const alertsData = await getAlerts();

                setStats({
                    totalPatients,
                    activeAlerts: alertsData.filter((a: any) => !a.read).length,
                    avgOccupancy: 75, // Mocked average
                    trend: '+12%'
                });
                setAlerts(alertsData.slice(0, 3)); // Top 3 alerts

                // 3. Fetch Chart Data (using first hospital as example or aggregate)
                if (hospitals.length > 0) {
                    // Fetch predictions for the first hospital to show in chart
                    const predictions = await getForecastsByHospital('Mumbai', hospitals[0]._id);

                    // Transform for chart
                    const chartDataFormatted = predictions
                        .filter((p: any) => p.type === 'beds')
                        .slice(0, 7) // Next 7 days
                        .map((p: any) => ({
                            date: new Date(p.date).toLocaleDateString('en-US', { weekday: 'short' }),
                            actual: p.currentValue,
                            predicted: p.predictedValue
                        }));

                    setChartData(chartDataFormatted);
                }

                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="p-8 text-center">Loading Dashboard...</div>;
    }

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400">Real-time healthcare resource monitoring</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Patients"
                    value={stats.totalPatients}
                    trend={12}
                    trendLabel="vs last month"
                    icon={Users}
                    color="primary"
                />
                <StatCard
                    title="Avg. Occupancy"
                    value={`${stats.avgOccupancy}%`}
                    trend={5}
                    trendLabel="vs last week"
                    icon={Activity}
                    color="warning"
                />
                <StatCard
                    title="Active Alerts"
                    value={stats.activeAlerts}
                    trend={-2}
                    trendLabel="decreased"
                    icon={AlertTriangle}
                    color="danger"
                />
                <StatCard
                    title="Prediction Accuracy"
                    value="94%"
                    trend={2}
                    trendLabel="improved"
                    icon={TrendingUp}
                    color="success"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart */}
                <div className="lg:col-span-2">
                    <PredictionChart data={chartData} title="Hospital Bed Occupancy Trend" />
                </div>

                {/* Recent Alerts */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Alerts</h2>
                    <div className="space-y-4">
                        {alerts.length > 0 ? (
                            alerts.map((alert: any) => (
                                <AlertCard
                                    key={alert._id}
                                    alert={{
                                        id: alert._id,
                                        type: alert.type || 'info',
                                        title: alert.title || 'System Alert',
                                        message: alert.message,
                                        timestamp: new Date().toISOString(), // Mock timestamp if missing
                                        read: false
                                    }}
                                />
                            ))
                        ) : (
                            <p className="text-gray-500">No active alerts</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
