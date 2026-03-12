import React, { useState } from 'react';
import {
    User,
    Mail,
    Shield,
    Bell,
    Key,
    Camera,
    LogOut,
    CheckCircle2,
    Save,
    MapPin,
    Smartphone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/PageHeader';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';

export default function ProfilePage() {
    const { admin, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(false);

    // Mock form data
    const [formData, setFormData] = useState({
        name: admin?.name || '',
        email: admin?.email || '',
        phone: '+1 (555) 000-0000',
        location: 'New York, USA',
        bio: 'Senior Administrator managing vehicle listings and user accounts.',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        notifications: {
            email: true,
            push: false,
            security: true,
            marketing: false
        }
    });

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            toast.success("Profile updated successfully!");
        }, 1500);
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast.success("Password changed successfully!");
            setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
        }, 1500);
    };

    const toggleNotification = (key) => {
        setFormData(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [key]: !prev.notifications[key]
            }
        }));
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: User },
        { id: 'security', label: 'Security', icon: Key },
        { id: 'notifications', label: 'Notifications', icon: Bell },
    ];

    return (
        <div className="space-y-6 pb-20">
            <PageHeader
                title="My Profile"
                subtitle="Manage your account settings and preferences."
                breadcrumbs={['Dashboard', 'Profile']}
            />

            {/* Profile Header */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden relative animate-slide-up">
                {/* Cover Photo */}
                <div className="h-48 bg-gradient-to-r from-primary via-blue-600 to-secondary relative">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <button className="absolute bottom-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all">
                        <Camera size={16} /> Change Cover
                    </button>
                </div>

                {/* Profile Info */}
                <div className="px-8 pb-8 relative">
                    <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16 mb-6">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-3xl bg-white p-1.5 shadow-xl rotate-3 transition-transform group-hover:rotate-0">
                                <div className="w-full h-full rounded-2xl bg-admin-bg flex items-center justify-center overflow-hidden border border-admin-border relative">
                                    <span className="text-4xl font-bold text-gray-400 select-none">
                                        {(formData.name.charAt(0) || 'A').toUpperCase()}
                                    </span>
                                    {/* Edit Overlay */}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <Camera className="text-white" size={24} />
                                    </div>
                                </div>
                            </div>
                            <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
                        </div>

                        {/* Name & Role */}
                        <div className="flex-1 pt-14 md:pt-0">
                            <h1 className="text-3xl font-black text-gray-900 mb-1">{formData.name}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-500">
                                <span className="flex items-center gap-1.5 bg-admin-bg text-primary px-3 py-1 rounded-lg border border-admin-border">
                                    <Shield size={14} /> {admin?.role || 'Administrator'}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Mail size={16} /> {formData.email}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <MapPin size={16} /> {formData.location}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-4 md:mt-0">
                            <button onClick={logout} className="px-5 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-bold flex items-center gap-2 transition-colors">
                                <LogOut size={18} /> Sign Out
                            </button>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex overflow-x-auto border-b border-gray-100 scrollbar-hide">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={clsx(
                                    "px-6 py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap",
                                    activeTab === tab.id
                                        ? "border-primary text-primary bg-admin-bg/50"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-admin-border"
                                )}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-8 animate-slide-up" style={{ animationDelay: '100ms' }}>

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <form onSubmit={handleUpdateProfile} className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                                <button type="submit" disabled={loading} className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 flex items-center gap-2">
                                    {loading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            readOnly
                                            className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed font-medium"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                                    <div className="relative">
                                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Bio</label>
                                    <textarea
                                        rows="4"
                                        value={formData.bio}
                                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium resize-none"
                                        placeholder="Write something about yourself..."
                                    ></textarea>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* SECURITY TAB */}
                    {activeTab === 'security' && (
                        <form onSubmit={handlePasswordChange} className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Security Settings</h2>
                                    <p className="text-sm text-gray-500">Update your password and security preferences.</p>
                                </div>
                                <button type="submit" disabled={loading} className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg flex items-center gap-2">
                                    {loading ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>

                            <div className="space-y-6 max-w-xl">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Current Password</label>
                                    <div className="relative">
                                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="password"
                                            value={formData.currentPassword}
                                            onChange={e => setFormData({ ...formData, currentPassword: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-200 focus:border-gray-400 outline-none transition-all font-medium"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
                                        <input
                                            type="password"
                                            value={formData.newPassword}
                                            onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Confirm Password</label>
                                        <input
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* NOTIFICATIONS TAB */}
                    {activeTab === 'notifications' && (
                        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-8">Notification Preferences</h2>

                            <div className="space-y-6">
                                {[
                                    { id: 'email', label: 'Email Notifications', desc: 'Receive daily summaries and critical alerts.' },
                                    { id: 'push', label: 'Push Notifications', desc: 'Get real-time updates on your mobile device.' },
                                    { id: 'security', label: 'Security Alerts', desc: 'Notify me about login attempts and password changes.' },
                                    { id: 'marketing', label: 'Marketing Emails', desc: 'Receive updates about new features and promotions.' },
                                ].map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                        <div>
                                            <p className="font-bold text-gray-800">{item.label}</p>
                                            <p className="text-sm text-gray-500">{item.desc}</p>
                                        </div>
                                        <button
                                            onClick={() => toggleNotification(item.id)}
                                            className={clsx(
                                                "relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none",
                                                formData.notifications[item.id] ? 'bg-primary' : 'bg-gray-200'
                                            )}
                                        >
                                            <span className={clsx(
                                                "inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm",
                                                formData.notifications[item.id] ? 'translate-x-6' : 'translate-x-1'
                                            )} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Info Column */}
                <div className="space-y-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
                    {/* Account Status Card */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                                <Shield className="text-green-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Account Status</h3>
                                <p className="text-white/60 text-sm">Everything looks good</p>
                            </div>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <div className="flex items-center justify-between text-sm py-2 border-b border-white/10">
                                <span className="text-white/70">Role</span>
                                <span className="font-bold">{admin?.role || 'Admin'}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm py-2 border-b border-white/10">
                                <span className="text-white/70">Joined</span>
                                <span className="font-bold">May 2024</span>
                            </div>
                            <div className="flex items-center justify-between text-sm py-2 border-b border-white/10">
                                <span className="text-white/70">Last Login</span>
                                <span className="font-bold">Just now</span>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center gap-2 text-green-400 text-xs font-bold uppercase tracking-wider bg-green-500/10 py-2 px-3 rounded-lg border border-green-500/20">
                            <CheckCircle2 size={14} /> Verified Account
                        </div>
                    </div>

                    {/* Quick Stats or Tips */}
                    <div className="bg-admin-bg rounded-3xl p-6 border border-admin-border shadow-sm">
                        <h3 className="font-bold text-primary mb-2">Pro Tip</h3>
                        <p className="text-sm text-gray-700 leading-relaxed mb-4">
                            Enable Two-Factor Authentication (2FA) for enhanced security. Check the Security tab to get started.
                        </p>
                        <button onClick={() => setActiveTab('security')} className="text-sm font-bold text-primary hover:text-blue-700 flex items-center gap-1">
                            Go to Security <span aria-hidden="true">&rarr;</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
