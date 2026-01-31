import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Database, Save, Loader, Shield, Lock, Smartphone, Mail, AlertTriangle } from 'lucide-react';
import api from '../services/api';

interface UserProfile {
    name: string;
    email: string;
    phone: string;
    role: string;
    preferences: {
        email: boolean;
        sms: boolean;
        whatsapp: boolean;
    };
}

const Settings: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'ai'>('profile');

    const [profile, setProfile] = useState<UserProfile>({
        name: '',
        email: '',
        phone: '',
        role: '',
        preferences: {
            email: true,
            sms: true,
            whatsapp: true
        }
    });

    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/auth/me');
            const data = response.data;
            setProfile({
                name: data.name,
                email: data.email,
                phone: data.phone || '',
                role: data.role,
                preferences: data.preferences || {
                    email: true,
                    sms: true,
                    whatsapp: true
                }
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setMessage({ type: 'error', text: 'Failed to load profile' });
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const updateData: any = {
                name: profile.name,
                email: profile.email,
                phone: profile.phone,
                preferences: profile.preferences
            };

            if (passwords.new) {
                if (passwords.new !== passwords.confirm) {
                    setMessage({ type: 'error', text: 'New passwords do not match' });
                    setSaving(false);
                    return;
                }
                updateData.password = passwords.new;
            }

            const response = await api.put('/auth/profile', updateData);

            // Update localStorage
            const updatedUser = response.data;
            const currentUserStr = localStorage.getItem('user');
            if (currentUserStr) {
                const currentUser = JSON.parse(currentUserStr);
                const newUser = { ...currentUser, ...updatedUser };
                localStorage.setItem('user', JSON.stringify(newUser));

                // Dispatch event to update Navbar
                window.dispatchEvent(new Event('user-updated'));
            }

            setMessage({ type: 'success', text: 'Settings updated successfully' });
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({ type: 'error', text: 'Failed to update settings' });
        } finally {
            setSaving(false);
        }
    };

    const togglePreference = (key: keyof UserProfile['preferences']) => {
        setProfile(prev => ({
            ...prev,
            preferences: {
                ...prev.preferences,
                [key]: !prev.preferences[key]
            }
        }));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader className="w-10 h-10 animate-spin text-primary-600" />
            </div>
        );
    }

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'ai', label: 'AI Configuration', icon: Database },
    ];

    return (
        <div className="p-6 max-w-6xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Account Settings
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Manage your personal information, security, and application preferences.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-64 flex-shrink-0">
                    <nav className="space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700'
                                    }`}
                            >
                                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-primary-600' : 'text-gray-500'}`} />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${message.type === 'success'
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                                }`}
                        >
                            {message.type === 'error' && <AlertTriangle className="w-5 h-5" />}
                            <span>{message.text}</span>
                        </motion.div>
                    )}

                    <form onSubmit={handleProfileUpdate}>
                        {/* Profile Section */}
                        {activeTab === 'profile' && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="card space-y-6"
                            >
                                <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Personal Information</h2>
                                    <p className="text-sm text-gray-500">Update your personal details and contact info.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                value={profile.name}
                                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                                className="input pl-10"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="email"
                                                value={profile.email}
                                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                                className="input pl-10"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                                        <div className="relative">
                                            <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="tel"
                                                value={profile.phone}
                                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                                className="input pl-10"
                                                placeholder="+91 98765 43210"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role</label>
                                        <input
                                            type="text"
                                            value={profile.role.replace('_', ' ').toUpperCase()}
                                            className="input bg-gray-100 dark:bg-dark-700 cursor-not-allowed font-semibold text-gray-500"
                                            disabled
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Security Section */}
                        {activeTab === 'security' && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="card space-y-6"
                            >
                                <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Security</h2>
                                    <p className="text-sm text-gray-500">Manage your password and account security.</p>
                                </div>

                                <div className="space-y-4 max-w-md">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="password"
                                                value={passwords.new}
                                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                                className="input pl-10"
                                                placeholder="Enter new password"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="password"
                                                value={passwords.confirm}
                                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                                className="input pl-10"
                                                placeholder="Confirm new password"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Notifications Section */}
                        {activeTab === 'notifications' && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="card space-y-6"
                            >
                                <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Notifications</h2>
                                    <p className="text-sm text-gray-500">Choose how you want to be notified.</p>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { key: 'email', label: 'Email Notifications', desc: 'Receive daily summaries and critical alerts via email.' },
                                        { key: 'sms', label: 'SMS Alerts', desc: 'Get instant SMS for high-priority emergency alerts.' },
                                        { key: 'whatsapp', label: 'WhatsApp Updates', desc: 'Receive forecast updates and reports on WhatsApp.' }
                                    ].map((item) => (
                                        <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-800 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors">
                                            <div>
                                                <h3 className="font-medium text-gray-900 dark:text-gray-100">{item.label}</h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => togglePreference(item.key as any)}
                                                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${profile.preferences[item.key as keyof typeof profile.preferences] ? 'bg-primary-600' : 'bg-gray-300 dark:bg-dark-600'
                                                    }`}
                                            >
                                                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ease-in-out ${profile.preferences[item.key as keyof typeof profile.preferences] ? 'translate-x-6' : 'translate-x-0'
                                                    }`} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* AI Configuration Section */}
                        {activeTab === 'ai' && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="card space-y-6"
                            >
                                <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">AI Model Configuration</h2>
                                    <p className="text-sm text-gray-500">Customize how the AI generates forecasts for you.</p>
                                </div>

                                <div className="space-y-6 max-w-xl">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prediction Horizon</label>
                                        <select className="input">
                                            <option value="7">7 Days (Short Term)</option>
                                            <option value="14" selected>14 Days (Standard)</option>
                                            <option value="30">30 Days (Long Term)</option>
                                        </select>
                                        <p className="text-xs text-gray-500 mt-1">Longer horizons may have lower accuracy.</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Model Sensitivity</label>
                                        <div className="flex items-center space-x-4">
                                            <input type="range" min="1" max="10" defaultValue="7" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
                                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">High</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Adjust how sensitive the model is to recent data spikes.</p>
                                    </div>

                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                                        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Active Models</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {['Random Forest', 'Gradient Boosting', 'Chronos', 'MOIRAI', 'Lag-Llama'].map(model => (
                                                <span key={model} className="px-2 py-1 bg-white dark:bg-dark-800 text-xs font-medium text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-700">
                                                    {model}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Save Button - Always Visible */}
                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="btn-primary flex items-center space-x-2 px-6 py-2.5 text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all bg-blue-600 text-white hover:bg-blue-700"
                            >
                                {saving ? (
                                    <>
                                        <Loader className="w-5 h-5 animate-spin" />
                                        <span>Saving Changes...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        <span>Save All Changes</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Settings;
