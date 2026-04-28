import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Briefcase, Clock, Key, Shield } from 'lucide-react';

export function ProfilePage() {
  const { user } = useAuth();
  const [enable2FA, setEnable2FA] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  if (!user) return null;

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      alert('New passwords do not match!');
      return;
    }
    alert('Password changed successfully!');
    setShowPasswordForm(false);
    setPasswordForm({ current: '', new: '', confirm: '' });
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
                <h2 className="text-xl font-semibold text-slate-900">{user.name}</h2>
                <p className="text-sm text-slate-600 capitalize mt-1">{user.role}</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-200">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-900">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-900 capitalize">{user.role}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-900">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
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
                    value={user.name}
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
                    value={user.email}
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
                    value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
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
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-colors"
                      >
                        Update Password
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPasswordForm(false)}
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
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
                    checked={enable2FA}
                    onChange={(e) => setEnable2FA(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
