import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Mail } from 'lucide-react';

export function AccountLockedPage() {
  const navigate = useNavigate();

  const handleContactAdmin = () => {
    alert('Contact admin at: admin@medical.com');
  };

  const handleReset = () => {
    localStorage.removeItem('accountLocked');
    localStorage.removeItem('failedAttempts');
    navigate('/login');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Warning Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <ShieldAlert className="w-12 h-12 text-red-600" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-semibold text-slate-900 mb-3">
            Account Locked
          </h1>

          {/* Message */}
          <p className="text-slate-600 mb-8">
            Your account has been locked due to multiple failed login attempts and suspicious activity. 
            Please contact the system administrator to unlock your account.
          </p>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleContactAdmin}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Mail className="w-5 h-5" />
              Contact Administrator
            </button>

            {(import.meta as any).env.DEV ? (
              <button
                onClick={handleReset}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-lg font-medium transition-colors"
              >
                Reset & Try Again (Demo)
              </button>
            ) : (
              <button
                onClick={handleContactAdmin}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Contact Administrator
              </button>
            )}
          </div>

          {/* Info */}
          <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200 text-left">
            <p className="text-xs text-slate-600">
              <strong className="text-slate-800">Security Notice:</strong><br />
              This lockout is triggered after 5 failed login attempts to protect your account from unauthorized access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
