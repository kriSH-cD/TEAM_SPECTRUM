import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Patient } from '../types/patient';
import { Activity, Users, HeartPulse, Play, Pause, Plus, RefreshCw, MessageCircle, Send, X as CloseIcon, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ResourcePanel from '../components/ResourcePanel';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = 'http://localhost:5001/api/patients';

// Helper Icon
const BrainIcon = ({ size, className }: { size: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" /><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" /><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" /><path d="M17.599 6.5a3 3 0 0 0 .399-1.375" /><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" /><path d="M3.477 10.896a4 4 0 0 1 .585-.396" /><path d="M19.938 10.5a4 4 0 0 1 .585.396" /><path d="M6 18a4 4 0 0 1-1.937-.5" /><path d="M19.937 17.5A4 4 0 0 1 18 18" /></svg>
);

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: string }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: "" };
    }

    static getDerivedStateFromError(error: any) {
        return { hasError: true, error: error.toString() };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 text-center text-red-500 bg-gray-900 min-h-screen flex flex-col items-center justify-center">
                    <h1 className="text-3xl font-bold mb-4">⚠️ User Interface Error</h1>
                    <p className="font-mono bg-black p-4 rounded border border-red-900">{this.state.error}</p>
                    <button onClick={() => window.location.reload()} className="mt-8 px-6 py-2 bg-red-600 rounded text-white hover:bg-red-700">Reload System</button>
                </div>
            );
        }

        return this.props.children;
    }
}

const AgentControlRoomContent: React.FC = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [optimizing, setOptimizing] = useState(false);
    const [lastLog, setLastLog] = useState<string>("System initialized. Agents active.");
    const [hospitalState, setHospitalState] = useState({ icuBedsOccupied: 0, icuBedsTotal: 20, wardBedsOccupied: 0, wardBedsTotal: 100 });
    const [showAdmitModal, setShowAdmitModal] = useState(false);
    const [admitForm, setAdmitForm] = useState({
        name: '',
        age: 30,
        gender: 'Male',
        chiefComplaint: 'Respiratory Distress',
        status: 'WAITING' as 'WAITING' | 'ER' | 'ICU' | 'WARD',
        heartRate: 80,
        spO2: 95,
        bpSystolic: 120,
        bpDiastolic: 80
    });

    // Chatbot state
    const [showChat, setShowChat] = useState(false);
    const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([{
        role: 'assistant',
        content: 'Hello! I\'m your AI Agent Assistant. I can help you with patient triage, resource allocation, and answer questions about the system. How can I assist you today?'
    }]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);

    // Edit/Delete state
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
    const [editForm, setEditForm] = useState({
        name: '',
        age: 30,
        gender: 'Male',
        chiefComplaint: '',
        status: 'WAITING' as 'WAITING' | 'ER' | 'ICU' | 'WARD' | 'DISCHARGED',
        heartRate: 80,
        spO2: 95,
        bpSystolic: 120,
        bpDiastolic: 80
    });

    // Fetch data
    const fetchPatients = async () => {
        try {
            const res = await axios.get(API_URL);
            setPatients(res.data);
        } catch (err) {
            console.error("Failed to fetch patients", err);
        }
    };

    // Simulation Loop
    useEffect(() => {
        fetchPatients();
        let interval: ReturnType<typeof setInterval>;
        if (optimizing) {
            interval = setInterval(async () => {
                try {
                    const res = await axios.post(`${API_URL}/simulate`);

                    // Update Resource State
                    if (res.data.hospitalState) {
                        setHospitalState(res.data.hospitalState);
                    }

                    // Update log & Check for Alerts
                    if (res.data.results.length > 0) {
                        const significant = res.data.results.find((r: any) => r.decision.decision.priority_score > 30);
                        if (significant) {
                            setLastLog(`🤖 Agent: ${significant.decision.decision.action} for ${significant.name} (${significant.decision.decision.reason})`);
                        }

                        // Trigger Critical Alerts
                        const critical = res.data.results.find((r: any) => r.decision.risk_analysis.level === 'CRITICAL');
                        if (critical) {
                            toast.error(`CRITICAL: ${critical.name} deteriorating! Score: ${critical.decision.risk_analysis.score}`);
                        }
                    }
                    fetchPatients();
                } catch (e) {
                    console.error("Simulation error", e);
                }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [optimizing]);

    // Handle patient admission with form data
    const handleAdmitPatient = async () => {
        try {
            const payload = {
                name: admitForm.name || `Patient ${Math.floor(Math.random() * 1000)}`,
                age: admitForm.age,
                gender: admitForm.gender,
                chiefComplaint: admitForm.chiefComplaint,
                status: admitForm.status,
                vitals: {
                    heartRate: admitForm.heartRate,
                    spO2: admitForm.spO2,
                    bpSystolic: admitForm.bpSystolic,
                    bpDiastolic: admitForm.bpDiastolic
                }
            };
            await axios.post(`${API_URL}/admit`, payload);
            fetchPatients();
            setLastLog(`🏥 New patient admitted: ${payload.name} → ${payload.status}`);
            setShowAdmitModal(false);
            // Reset form
            setAdmitForm({
                name: '',
                age: 30,
                gender: 'Male',
                chiefComplaint: 'Respiratory Distress',
                status: 'WAITING',
                heartRate: 80,
                spO2: 95,
                bpSystolic: 120,
                bpDiastolic: 80
            });
            toast.success(`Patient ${payload.name} admitted to ${payload.status}`);
        } catch (error) {
            console.error('Failed to admit patient', error);
            toast.error('Failed to admit patient');
        }
    };

    // Quick Add Patient for Demo (opens modal)
    const addDemoPatient = () => {
        setShowAdmitModal(true);
    };

    // Edit patient handler
    const handleEditPatient = (patient: Patient) => {
        setEditingPatient(patient);
        setEditForm({
            name: patient.name,
            age: patient.age,
            gender: patient.gender,
            chiefComplaint: patient.chiefComplaint,
            status: patient.status,
            heartRate: patient.currentVitals.heartRate,
            spO2: patient.currentVitals.spO2,
            bpSystolic: patient.currentVitals.bpSystolic,
            bpDiastolic: patient.currentVitals.bpDiastolic
        });
        setShowEditModal(true);
    };

    // Update patient handler
    const handleUpdatePatient = async () => {
        if (!editingPatient) return;

        try {
            await axios.put(`${API_URL}/${editingPatient._id}`, {
                name: editForm.name,
                age: editForm.age,
                gender: editForm.gender,
                chiefComplaint: editForm.chiefComplaint,
                status: editForm.status,
                vitals: {
                    heartRate: editForm.heartRate,
                    spO2: editForm.spO2,
                    bpSystolic: editForm.bpSystolic,
                    bpDiastolic: editForm.bpDiastolic
                }
            });

            toast.success('Patient updated successfully!');
            setShowEditModal(false);
            setEditingPatient(null);
            fetchPatients();
        } catch (error) {
            console.error('Failed to update patient:', error);
            toast.error('Failed to update patient');
        }
    };

    // Delete patient handler
    const handleDeletePatient = async (patientId: string) => {
        if (!confirm('Are you sure you want to delete this patient?')) return;

        try {
            await axios.delete(`${API_URL}/${patientId}`);
            toast.success('Patient deleted successfully!');
            fetchPatients();
            setLastLog(`🗑️ Patient removed from system`);
        } catch (error) {
            console.error('Failed to delete patient:', error);
            toast.error('Failed to delete patient');
        }
    };

    // Manual Status Change Handler
    const handleStatusChange = async (patient: Patient, newStatus: string) => {
        try {
            // Optimistic update for better UX
            setPatients(prev => prev.map(p =>
                p._id === patient._id ? { ...p, status: newStatus as any } : p
            ));

            await axios.put(`${API_URL}/${patient._id}`, {
                status: newStatus
            });

            toast.success(`Patient moved to ${newStatus}`);
            // fetchPatients(); // Removed to rely on optimistic update and avoid race conditions
            setLastLog(`🔄 Admin moved ${patient.name} to ${newStatus}`);
        } catch (error) {
            console.error('Failed to update status', error);
            toast.error('Failed to move patient');
            fetchPatients(); // Revert on error
        }
    };

    // Chat handler
    const handleSendMessage = async () => {
        if (!chatInput.trim()) return;

        const userMessage = chatInput.trim();
        setChatInput('');

        // Add user message
        setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setChatLoading(true);

        try {
            const response = await axios.post('http://localhost:5002/chat', {
                message: userMessage,
                role: 'hospital_staff',
                context: {
                    patients: patients.length,
                    icuOccupied: hospitalState.icuBedsOccupied,
                    icuTotal: hospitalState.icuBedsTotal,
                    wardOccupied: hospitalState.wardBedsOccupied,
                    wardTotal: hospitalState.wardBedsTotal
                }
            });

            setChatMessages(prev => [...prev, {
                role: 'assistant',
                content: response.data.response || 'I apologize, I encountered an issue. Please try again.'
            }]);
        } catch (error) {
            console.error('Chat error:', error);
            setChatMessages(prev => [...prev, {
                role: 'assistant',
                content: 'I\'m having trouble connecting to the AI service. Please check if the AI service is running on port 5002.'
            }]);
        } finally {
            setChatLoading(false);
        }
    };

    const getRiskColor = (score: number) => {
        if (score >= 70) return "from-red-600 to-red-900 border-red-500 shadow-red-900/50";
        if (score >= 40) return "from-yellow-600 to-yellow-900 border-yellow-500 shadow-yellow-900/50";
        return "from-emerald-600 to-emerald-900 border-emerald-500 shadow-emerald-900/50";
    };

    const getStatusColor = (score: number) => {
        if (score >= 70) return "text-red-400";
        if (score >= 40) return "text-yellow-400";
        return "text-emerald-400";
    }

    return (
        <div className="min-h-screen bg-[#0f1014] text-white font-sans selection:bg-blue-500/30">

            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px]" />
            </div>

            <div className="relative z-10 p-6 max-w-[1600px] mx-auto">

                {/* Header */}
                <header className="flex justify-between items-center mb-8 backdrop-blur-xl bg-white/5 p-6 rounded-2xl border border-white/10 shadow-2xl">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-4">
                            <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
                                <Activity className="text-white" size={32} />
                            </div>
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                Agent Command Center
                            </span>
                        </h1>
                        <p className="text-gray-400 mt-2 ml-1 text-lg flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Autonomous Triage & Resource Orchestration
                        </p>
                    </div>

                    <div className="flex gap-4 items-center">
                        {/* Back Button */}
                        <button
                            onClick={() => navigate('/dashboard/hospital')}
                            className="flex items-center gap-2 px-5 py-3 bg-gray-800/50 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl font-semibold transition-all border border-gray-700 hover:border-gray-500 hover:shadow-lg active:scale-95"
                        >
                            <ArrowLeft size={20} />
                            Back to Dashboard
                        </button>

                        <button
                            onClick={addDemoPatient}
                            className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition-all border border-gray-700 hover:border-gray-500 hover:shadow-lg active:scale-95"
                        >
                            <Plus size={20} /> Admit Simulation
                        </button>
                        <button
                            onClick={() => setOptimizing(!optimizing)}
                            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all border shadow-xl active:scale-95 ${optimizing
                                ? "bg-red-500/10 text-red-400 border-red-500/50 hover:bg-red-500/20"
                                : "bg-blue-600 text-white border-blue-400 hover:bg-blue-500 shadow-blue-600/20"
                                }`}
                        >
                            {optimizing ? <><Pause size={20} /> Pause Agents</> : <><Play size={20} /> Activate Agents</>}
                        </button>
                    </div>
                </header>

                {/* Agent Live Feed */}
                <div className="mb-8 overflow-hidden rounded-xl border border-white/10 bg-black/40 backdrop-blur-md relative group">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500" />
                    <div className="p-4 font-mono text-sm text-blue-200 flex items-center gap-4">
                        <RefreshCw size={18} className={`text-blue-400 ${optimizing ? 'animate-spin' : ''}`} />
                        <span className="opacity-70">{new Date().toLocaleTimeString()}</span>
                        <span className="font-bold tracking-wide">{lastLog}</span>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-8 h-[calc(100vh-280px)]">

                    {/* Left Sidebar: Resources */}
                    <div className="col-span-3 h-full">
                        <div className="h-full bg-gray-900/50 backdrop-blur-xl rounded-3xl border border-white/5 p-6 shadow-xl flex flex-col gap-6">
                            <ResourcePanel
                                icuOccupied={hospitalState.icuBedsOccupied}
                                icuTotal={hospitalState.icuBedsTotal}
                                wardOccupied={hospitalState.wardBedsOccupied}
                                wardTotal={hospitalState.wardBedsTotal}
                            />

                            <div className="mt-auto p-4 bg-blue-900/20 rounded-xl border border-blue-500/20">
                                <h4 className="flex items-center gap-2 font-bold text-blue-300 mb-2">
                                    <Users size={18} /> Active Staff
                                </h4>
                                <div className="flex justify-between text-sm text-gray-400 mb-1">
                                    <span>Doctors</span>
                                    <span className="text-white font-mono">12/15</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-400">
                                    <span>Nurses</span>
                                    <span className="text-white font-mono">28/30</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Kanban Board */}
                    <div className="col-span-9 h-full overflow-hidden">
                        <div className="grid grid-cols-4 gap-4 h-full">
                            {['WAITING', 'ER', 'ICU', 'WARD'].map((status) => (
                                <div key={status} className="flex flex-col h-full bg-gray-900/30 rounded-3xl border border-white/5 backdrop-blur-sm overflow-hidden">
                                    {/* Column Header */}
                                    <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center backdrop-blur-md">
                                        <h2 className="font-bold text-gray-200 tracking-wide text-sm uppercase flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${status === 'ICU' ? 'bg-red-500' :
                                                status === 'ER' ? 'bg-orange-500' :
                                                    status === 'WARD' ? 'bg-blue-500' : 'bg-gray-500'
                                                }`} />
                                            {status}
                                        </h2>
                                        <span className="text-xs font-mono bg-black/40 px-3 py-1 rounded-full text-gray-400 border border-white/5">
                                            {patients.filter(p => p.status === status).length}
                                        </span>
                                    </div>

                                    {/* Scrollable Column Body */}
                                    <div className="p-3 flex-1 overflow-y-auto custom-scrollbar space-y-3">
                                        <AnimatePresence>
                                            {patients.filter(p => p.status === status).map((patient) => (
                                                <motion.div
                                                    key={patient._id}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                                    className={`relative rounded-xl p-4 border bg-gradient-to-br ${getRiskColor(patient.riskScore).replace('border-', 'border-l-4 border-')} bg-gray-800 hover:shadow-2xl hover:scale-[1.02] transition-scale duration-200 group cursor-pointer`}
                                                >
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <h3 className="font-bold text-white text-lg leading-tight">{patient.name}</h3>
                                                            <p className="text-xs text-gray-400 mt-0.5">{patient.age}yrs • {patient.gender}</p>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2">
                                                            <span className={`text-xl font-black ${getStatusColor(patient.riskScore)}`}>
                                                                {patient.riskScore}
                                                            </span>
                                                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Risk</span>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2 mb-4 bg-black/20 rounded-lg p-2">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] text-gray-500 uppercase">HR</span>
                                                            <span className="text-sm font-mono font-bold text-gray-300 flex items-center gap-1">
                                                                <HeartPulse size={12} className="text-red-500/70" /> {Math.round(patient.currentVitals?.heartRate || 0)}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] text-gray-500 uppercase">SpO2</span>
                                                            <span className="text-sm font-mono font-bold text-gray-300 flex items-center gap-1">
                                                                <Activity size={12} className="text-blue-500/70" /> {Math.round(patient.currentVitals?.spO2 || 0)}%
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="pt-3 border-t border-white/10">
                                                        {/* AI Suggestion */}
                                                        <div className="flex items-start gap-2 mb-3 bg-purple-500/10 p-2 rounded-lg border border-purple-500/20">
                                                            <div className="mt-0.5 p-1 bg-purple-500/20 rounded text-purple-400 shrink-0">
                                                                <BrainIcon size={12} />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-xs font-bold text-purple-300">
                                                                    AI Recommendation:
                                                                </p>
                                                                <p className="text-xs font-medium text-white/90">
                                                                    {patient.actionsHistory && patient.actionsHistory.length > 0 && patient.actionsHistory[patient.actionsHistory.length - 1]?.action
                                                                        ? patient.actionsHistory[patient.actionsHistory.length - 1].action.replace(/_/g, ' ')
                                                                        : "Analyzing..."}
                                                                </p>
                                                                <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed opacity-80 line-clamp-2">
                                                                    {patient.actionsHistory && patient.actionsHistory.length > 0
                                                                        ? patient.actionsHistory[patient.actionsHistory.length - 1]?.reason
                                                                        : "Waiting for agent..."}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Manual Override Dropdown */}
                                                        <div className="mb-3">
                                                            <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Manual Transfer</label>
                                                            <select
                                                                value={patient.status}
                                                                onChange={(e) => handleStatusChange(patient, e.target.value)}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="w-full bg-black/40 text-xs text-gray-300 rounded-md border border-white/10 px-2 py-1.5 focus:border-blue-500 focus:outline-none cursor-pointer hover:bg-black/60 transition-colors"
                                                            >
                                                                <option value="WAITING">WAITING</option>
                                                                <option value="ER">ER (Emergency)</option>
                                                                <option value="ICU">ICU (Critical)</option>
                                                                <option value="WARD">WARD (General)</option>
                                                                <option value="DISCHARGED">DISCHARGED</option>
                                                            </select>
                                                        </div>

                                                        {/* Edit and Delete Buttons */}
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEditPatient(patient);
                                                                }}
                                                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg transition-all text-xs font-semibold border border-blue-500/30 hover:border-blue-500/60"
                                                            >
                                                                <Edit size={14} />
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeletePatient(patient._id);
                                                                }}
                                                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition-all text-xs font-semibold border border-red-500/30 hover:border-red-500/60"
                                                            >
                                                                <Trash2 size={14} />
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <ToastContainer position="top-right" theme="dark" toastClassName="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl" />

                {/* Admission Modal */}
                <AnimatePresence>
                    {showAdmitModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                            onClick={() => setShowAdmitModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-gray-900 rounded-2xl border border-white/10 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            >
                                <div className="p-6 border-b border-white/10">
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                        <Plus className="text-blue-400" />
                                        Admit New Patient
                                    </h2>
                                    <p className="text-gray-400 text-sm mt-1">Enter patient details and select initial status</p>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Patient Info */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Patient Name</label>
                                            <input
                                                type="text"
                                                value={admitForm.name}
                                                onChange={(e) => setAdmitForm({ ...admitForm, name: e.target.value })}
                                                placeholder="John Doe"
                                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Age</label>
                                            <input
                                                type="number"
                                                value={admitForm.age}
                                                onChange={(e) => setAdmitForm({ ...admitForm, age: parseInt(e.target.value) || 0 })}
                                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                                            <select
                                                value={admitForm.gender}
                                                onChange={(e) => setAdmitForm({ ...admitForm, gender: e.target.value })}
                                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option>Male</option>
                                                <option>Female</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Initial Status</label>
                                            <select
                                                value={admitForm.status}
                                                onChange={(e) => setAdmitForm({ ...admitForm, status: e.target.value as any })}
                                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="WAITING">WAITING</option>
                                                <option value="ER">ER (Emergency)</option>
                                                <option value="ICU">ICU (Critical)</option>
                                                <option value="WARD">WARD (General)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Chief Complaint</label>
                                        <input
                                            type="text"
                                            value={admitForm.chiefComplaint}
                                            onChange={(e) => setAdmitForm({ ...admitForm, chiefComplaint: e.target.value })}
                                            placeholder="e.g., Respiratory Distress, Chest Pain"
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* Vitals */}
                                    <div className="border-t border-white/10 pt-4">
                                        <h3 className="text-lg font-semibold text-white mb-4">Vital Signs</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">Heart Rate (bpm)</label>
                                                <input
                                                    type="number"
                                                    value={admitForm.heartRate}
                                                    onChange={(e) => setAdmitForm({ ...admitForm, heartRate: parseInt(e.target.value) || 0 })}
                                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">SpO2 (%)</label>
                                                <input
                                                    type="number"
                                                    value={admitForm.spO2}
                                                    onChange={(e) => setAdmitForm({ ...admitForm, spO2: parseInt(e.target.value) || 0 })}
                                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">BP Systolic</label>
                                                <input
                                                    type="number"
                                                    value={admitForm.bpSystolic}
                                                    onChange={(e) => setAdmitForm({ ...admitForm, bpSystolic: parseInt(e.target.value) || 0 })}
                                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">BP Diastolic</label>
                                                <input
                                                    type="number"
                                                    value={admitForm.bpDiastolic}
                                                    onChange={(e) => setAdmitForm({ ...admitForm, bpDiastolic: parseInt(e.target.value) || 0 })}
                                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 border-t border-white/10 flex gap-3 justify-end">
                                    <button
                                        onClick={() => setShowAdmitModal(false)}
                                        className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors border border-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAdmitPatient}
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-600/20 flex items-center gap-2"
                                    >
                                        <Plus size={18} />
                                        Admit Patient
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Edit Patient Modal */}
                <AnimatePresence>
                    {showEditModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                            onClick={() => setShowEditModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-gray-900 rounded-2xl border border-white/10 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            >
                                <div className="p-6 border-b border-white/10">
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                        <Edit className="text-blue-400" size={28} />
                                        Edit Patient
                                    </h2>
                                    <p className="text-gray-400 mt-1">Update patient information and vitals</p>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Patient Information */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-4">Patient Information</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                                                <input
                                                    type="text"
                                                    value={editForm.name}
                                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">Age</label>
                                                <input
                                                    type="number"
                                                    value={editForm.age}
                                                    onChange={(e) => setEditForm({ ...editForm, age: parseInt(e.target.value) || 0 })}
                                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                                                <select
                                                    value={editForm.gender}
                                                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option>Male</option>
                                                    <option>Female</option>
                                                    <option>Other</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                                                <select
                                                    value={editForm.status}
                                                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="WAITING">WAITING</option>
                                                    <option value="ER">ER</option>
                                                    <option value="ICU">ICU</option>
                                                    <option value="WARD">WARD</option>
                                                    <option value="DISCHARGED">DISCHARGED</option>
                                                </select>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-sm font-medium text-gray-300 mb-2">Chief Complaint</label>
                                                <input
                                                    type="text"
                                                    value={editForm.chiefComplaint}
                                                    onChange={(e) => setEditForm({ ...editForm, chiefComplaint: e.target.value })}
                                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Vital Signs */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-4">Vital Signs</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">Heart Rate (bpm)</label>
                                                <input
                                                    type="number"
                                                    value={editForm.heartRate}
                                                    onChange={(e) => setEditForm({ ...editForm, heartRate: parseInt(e.target.value) || 0 })}
                                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">SpO2 (%)</label>
                                                <input
                                                    type="number"
                                                    value={editForm.spO2}
                                                    onChange={(e) => setEditForm({ ...editForm, spO2: parseInt(e.target.value) || 0 })}
                                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">BP Systolic</label>
                                                <input
                                                    type="number"
                                                    value={editForm.bpSystolic}
                                                    onChange={(e) => setEditForm({ ...editForm, bpSystolic: parseInt(e.target.value) || 0 })}
                                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">BP Diastolic</label>
                                                <input
                                                    type="number"
                                                    value={editForm.bpDiastolic}
                                                    onChange={(e) => setEditForm({ ...editForm, bpDiastolic: parseInt(e.target.value) || 0 })}
                                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 border-t border-white/10 flex gap-3 justify-end">
                                    <button
                                        onClick={() => setShowEditModal(false)}
                                        className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors border border-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdatePatient}
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-600/20 flex items-center gap-2"
                                    >
                                        <Edit size={18} />
                                        Update Patient
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* AI Chatbot */}
                <AnimatePresence>
                    {showChat && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            className="fixed bottom-24 right-6 w-96 h-[600px] bg-gray-900 rounded-2xl border border-white/10 shadow-2xl flex flex-col z-50"
                        >
                            {/* Chat Header */}
                            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                        <BrainIcon size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">AI Agent Assistant</h3>
                                        <p className="text-xs text-white/70">Always here to help</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowChat(false)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <CloseIcon size={18} className="text-white" />
                                </button>
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {chatMessages.map((msg, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-800 text-gray-100 border border-white/10'
                                            }`}>
                                            <p className="text-sm leading-relaxed">{msg.content}</p>
                                        </div>
                                    </motion.div>
                                ))}
                                {chatLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-800 border border-white/10 rounded-2xl px-4 py-3">
                                            <div className="flex gap-2">
                                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Chat Input */}
                            <div className="p-4 border-t border-white/10">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder="Ask about patients, resources, or triage..."
                                        className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={chatLoading}
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={chatLoading || !chatInput.trim()}
                                        className="px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center gap-2"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Chat Toggle Button */}
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowChat(!showChat)}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-2xl flex items-center justify-center z-40 hover:shadow-blue-500/50 transition-shadow"
                >
                    {showChat ? (
                        <CloseIcon size={24} className="text-white" />
                    ) : (
                        <MessageCircle size={24} className="text-white" />
                    )}
                </motion.button>
            </div>
        </div>
    );
};

const AgentControlRoom = () => (
    <ErrorBoundary>
        <AgentControlRoomContent />
    </ErrorBoundary>
);

export default AgentControlRoom;
