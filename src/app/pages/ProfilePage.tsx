import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService, ProfileResponse } from '../services/authService';
import { AlertTriangle } from 'lucide-react';
import { User, Mail, Briefcase, Clock, Key, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLogin?: string;
  twoFactorEnabled: boolean;
  failedAttempts: number;
  isLocked: boolean;
}

export function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingPassword, setSavingPassword] = useState(false);
  const [saving2FA, setSaving2FA] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await authService.getProfile();
      if (response && response.success) {
        setProfile(response.data);
      }
    } catch (error) {
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error('New passwords do not match!');
      return;
    }

    if (passwordForm.new.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    try {
      setSavingPassword(true);
      await authService.updateProfilePassword(passwordForm.current, passwordForm.new);
      toast.success('Password changed successfully!');
      setShowPasswordForm(false);
      setPasswordForm({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handle2FAToggle = async (enabled: boolean) => {
    try {
      setSaving2FA(true);
      const response = await authService.toggle2FA(enabled);
      if (response.success) {
        setProfile(prev => prev ? { ...prev, twoFactorEnabled: enabled } : null);
        toast.success(`2FA ${enabled ? 'enabled' : 'disabled'} successfully`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update 2FA setting');
    } finally {
      setSaving2FA(false);
    }
  };

  if (!user) return null;
  if (loading && !profile) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  const currentProfile = profile || {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    twoFactorEnabled: false,
    failedAttempts: 0,
    isLocked: false,
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-900">Profile Settings</h1>
          <p className="text-slate-600 mt-1">Manage your account information and security</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-teal-600" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900">{currentProfile.name}</h2>
                <p className="text-sm text-slate-600 capitalize mt-1">{currentProfile.role}</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-200">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-900">{currentProfile.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-900 capitalize">{currentProfile.role}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-900">
                    {currentProfile.lastLogin ? new Date(currentProfile.lastLogin).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                {currentProfile.failedAttempts > 0 && (
                  <div className="flex items-center gap-3 text-sm text-orange-600 bg-orange-50 p-2 rounded-lg">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Failed attempts: {currentProfile.failedAttempts}</span>
                  </div>
                )}
                {currentProfile.isLocked && (
                  <div className="flex items-center gap-3 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Account locked</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Information */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Account Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={currentProfile.name}
                    disabled
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={currentProfile.email}
                    disabled
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    value={currentProfile.role.charAt(0).toUpperCase() + currentProfile.role.slice(1)}
                    disabled
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-5 h-5 text-teal-600" />
                <h3 className="text-lg font-semibold text-slate-900">Security Settings</h3>
              </div>

              {/* Change Password */}
              <div className="mb-6">
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
                  disabled={savingPassword}
                >
                  <Key className="w-4 h-4" />
                  Change Password
                </button>

                {showPasswordForm && (
                  <form onSubmit={handlePasswordChange} className="mt-4 space-y-4 p-4 bg-slate-50 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.current}
                        onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                        className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                        disabled={savingPassword}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.new}
                        onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                        className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                        disabled={savingPassword}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.confirm}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                        className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                        disabled={savingPassword}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={savingPassword}
                        className="px-4 py-2 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        {savingPassword ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          'Update Password'
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPasswordForm(false)}
                        disabled={savingPassword}
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 disabled:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* 2FA Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">Two-Factor Authentication</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentProfile.twoFactorEnabled}
                    onChange={(e) => handle2FAToggle(e.target.checked)}
                    disabled={saving2FA}
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${currentProfile.twoFactorEnabled ? 'peer-checked:bg-teal-500' : 'bg-slate-300'} ${saving2FA ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
