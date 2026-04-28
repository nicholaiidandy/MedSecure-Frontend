import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService, User } from '../services/userService';
import { Settings, UserPlus, Edit, Trash2, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';

export function UserManagementPage() {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Only admin can access
  useEffect(() => {
    if (authUser?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    // Fetch real users
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await userService.getAll();
        setUsers(response.data || []);
      } catch (err: any) {
        console.error('Failed to fetch users:', err);
        setError(err.message || 'Failed to load users. Check backend server.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [authUser, navigate]);

  if (authUser?.role !== 'admin') {
    return null;
  }

  const handleDelete = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.delete(userId);
        setUsers(users.filter(u => u._id !== userId));
      } catch (err) {
        alert('Failed to delete user');
      }
    }
  };

  const refreshUsers = async () => {
    try {
      const response = await userService.getAll();
      setUsers(response.data || []);
    } catch (err) {
      setError('Failed to refresh users');
    }
  };

  return (
    <div className="p-8">
      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          {error}
          <button 
            onClick={refreshUsers} 
            className="ml-auto text-red-600 hover:underline text-sm"
          >
            Retry
          </button>
        </div>
      )}

      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Settings className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">User Management</h1>
            <p className="text-slate-600">
              Manage system users and permissions ({users.length} users)
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/register')}
            className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            Add User
          </button>
          <button
            onClick={refreshUsers}
            disabled={loading}
            className="bg-slate-100 hover:bg-slate-200 disabled:bg-slate-200 px-4 py-3 rounded-lg transition-colors"
            title="Refresh user list"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '↻'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400 mb-4" />
          <p className="text-slate-600">Loading users...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Failed Attempts
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((u) => {
                  const isActive = !u.isLocked;
                  const roleColor = u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                    u.role === 'doctor' ? 'bg-blue-100 text-blue-800' :
                                    u.role === 'nurse' ? 'bg-emerald-100 text-emerald-800' :
                                    'bg-indigo-100 text-indigo-800';
                  return (
                    <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-900">{u.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-600">{u.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${roleColor}`}>
                          {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isActive ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            <XCircle className="w-3 h-3 mr-1" />
                            Locked
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600 font-mono">{u.failedAttempts}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(u._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {u.isLocked && (
                            <button 
                              onClick={async () => {
                                try {
                                  await userService.unlock(u._id);
                                  refreshUsers();
                                } catch (err) {
                                  alert('Failed to unlock user');
                                }
                              }}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Unlock Account"
                            >
                              🔓
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
