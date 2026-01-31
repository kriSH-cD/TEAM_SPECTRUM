import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Phone, Activity, Building2,
  X, TrendingUp, Clock
} from 'lucide-react';
import { getHospitals } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Hospitals = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('all'); // all, critical, warning, normal

  // Simulated Live Data State
  const [liveOccupancy, setLiveOccupancy] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const data = await getHospitals();
        setHospitals(data);

        // Initialize random occupancy
        const initialOccupancy: Record<string, number> = {};
        data.forEach((h: any) => {
          initialOccupancy[h._id] = Math.round(65 + Math.random() * 25);
        });
        setLiveOccupancy(initialOccupancy);

        setLoading(false);
      } catch (error: any) {
        console.error("Failed to fetch hospitals", error);
        setError('Failed to load hospitals. Please try again.');
        setLoading(false);
      }
    };
    fetchHospitals();
  }, []);

  // Live Data Effect
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveOccupancy(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(id => {
          // Randomly fluctuate by -2 to +2, keeping within 0-100
          const change = Math.floor(Math.random() * 5) - 2;
          next[id] = Math.min(100, Math.max(0, next[id] + change));
        });
        return next;
      });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatus = (occupancy: number) => {
    if (occupancy >= 85) return { label: 'Critical', color: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400', border: 'border-red-200 dark:border-red-800' };
    if (occupancy >= 70) return { label: 'High Load', color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800' };
    return { label: 'Normal', color: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400', border: 'border-green-200 dark:border-green-800' };
  };

  const filteredHospitals = hospitals.filter(hospital => {
    const matchesSearch =
      hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.city.toLowerCase().includes(searchTerm.toLowerCase());

    const occupancy = liveOccupancy[hospital._id] || 0;
    const status = getStatus(occupancy).label;

    const matchesFilter =
      statusFilter === 'all' ||
      (statusFilter === 'critical' && status === 'Critical') ||
      (statusFilter === 'warning' && status === 'High Load') ||
      (statusFilter === 'normal' && status === 'Normal');

    return matchesSearch && matchesFilter;
  });

  // Generate dummy forecast data for modal
  const generateForecastData = () => {
    return Array.from({ length: 7 }, (_, i) => ({
      day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
      load: Math.floor(60 + Math.random() * 30)
    }));
  };

  // --- Modal Component ---
  const HospitalModal = ({ hospital, onClose }: any) => {
    if (!hospital) return null;
    const occupancy = liveOccupancy[hospital._id] || 0;
    const status = getStatus(occupancy);
    const forecastData = generateForecastData();

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-dark-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800"
        >
          <div className="sticky top-0 z-10 flex justify-between items-center p-6 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                {hospital.name}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                  {status.label}
                </span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                <MapPin size={16} /> {hospital.location}, {hospital.city}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <X size={24} className="text-gray-500" />
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Stats */}
            <div className="lg:col-span-2 space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Beds</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{hospital.totalBeds}</p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">ICU Capacity</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{hospital.icuBeds}</p>
                </div>
                <div className={`p-4 rounded-xl border ${status.border} ${status.color.replace('text-', 'bg-opacity-10 ')}`}>
                  <p className="text-sm opacity-80 mb-1">Live Occupancy</p>
                  <div className="flex items-end gap-2">
                    <p className="text-2xl font-bold">{occupancy}%</p>
                    <span className="text-xs mb-1 animate-pulse">● LIVE</span>
                  </div>
                </div>
              </div>

              {/* AI Forecast Chart */}
              <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp size={20} className="text-blue-500" />
                  AI Predicted Load (Next 7 Days)
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={forecastData}>
                      <defs>
                        <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} vertical={false} />
                      <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="load" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorLoad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Right Column: Info */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Building2 size={18} className="text-gray-400" /> Departments
                </h3>
                <div className="flex flex-wrap gap-2">
                  {hospital.departments?.map((dept: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-sm rounded-lg text-gray-700 dark:text-gray-300">
                      {dept}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Phone size={18} className="text-gray-400" /> Contact
                </h3>
                <div className="space-y-3">
                  <a href={`tel:${hospital.contact?.phone}`} className="flex items-center gap-3 text-blue-600 hover:underline">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Phone size={16} />
                    </div>
                    {hospital.contact?.phone || 'N/A'}
                  </a>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <Clock size={16} />
                    </div>
                    24/7 Emergency
                  </div>
                </div>
              </div>

              <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-600/20">
                Contact Hospital
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-6">
      <header className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Activity className="text-red-500 animate-pulse" />
            Live Hospital Status
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Real-time resource monitoring across Mumbai network</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search hospitals..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            {['all', 'critical', 'warning', 'normal'].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${statusFilter === filter
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Connecting to live feed...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 p-12">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredHospitals.map((hospital) => {
              const occupancy = liveOccupancy[hospital._id] || 0;
              const status = getStatus(occupancy);

              return (
                <motion.div
                  key={hospital._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setSelectedHospital(hospital)}
                  className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-pointer relative overflow-hidden"
                >
                  {/* Status Bar */}
                  <div className={`absolute top-0 left-0 w-full h-1 ${status.color.replace('text-', 'bg-')}`} />

                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {hospital.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                        <MapPin size={14} /> {hospital.location}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${status.color}`}>
                      {status.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Beds</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{hospital.totalBeds}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">ICU Beds</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{hospital.icuBeds}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Live Occupancy</span>
                      <span className={`font-bold ${status.color.split(' ')[0]}`}>{occupancy}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${status.color.replace('text-', 'bg-')}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${occupancy}%` }}
                        transition={{ type: "spring", stiffness: 50 }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {selectedHospital && (
          <HospitalModal
            hospital={selectedHospital}
            onClose={() => setSelectedHospital(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Hospitals;
