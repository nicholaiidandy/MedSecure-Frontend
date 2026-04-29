import { useNavigate } from 'react-router-dom';
import { ShieldX, Home } from 'lucide-react';

export function Error403Page() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
          <ShieldX className="w-12 h-12 text-red-600" />
        </div>
        
        <h1 className="text-6xl font-semibold text-slate-900 mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-slate-900 mb-3">Access Denied</h2>
        
        <p className="text-slate-600 mb-8">
          You don't have permission to access this resource. Please contact your administrator if you believe this is an error.
        </p>

        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          <Home className="w-5 h-5" />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
