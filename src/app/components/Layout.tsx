import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Activity, 
  User, 
  LogOut,
  Shield,
  AlertTriangle,
  Settings,
  FileHeart,
  Stethoscope,
  Link as LinkIcon
} from 'lucide-react';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const getDoctorLinks = () => [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/patients', icon: Users, label: 'Patients' },
    { path: '/add-record', icon: FileText, label: 'Add Medical Record' },
    { path: '/blockchain-verify', icon: LinkIcon, label: 'Blockchain Verify' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const getNurseLinks = () => [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/patients', icon: Users, label: 'Patients' },
    { path: '/vital-signs', icon: Stethoscope, label: 'Input Vital Sign' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const getAdminLinks = () => [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/user-management', icon: Settings, label: 'User Management' },
    { path: '/patients', icon: FileHeart, label: 'Patient Records' },


    { path: '/security-events', icon: Shield, label: 'Security Events' },
    { path: '/blockchain-verify', icon: LinkIcon, label: 'Blockchain Verify' },
  ];

  const getNavLinks = () => {
    if (!user) return [];
    switch (user.role) {
      case 'doctor':
        return getDoctorLinks();
      case 'nurse':
        return getNurseLinks();
      case 'admin':
        return getAdminLinks();
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-teal-400" />
            <div>
              <h1 className="text-lg font-semibold">MedSecure</h1>
              <p className="text-xs text-slate-400">Medical System</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive(link.path)
                        ? 'bg-teal-500 text-white'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-700">
          <div className="px-4 py-3 mb-2 bg-slate-800 rounded-lg">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-red-900/30 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}