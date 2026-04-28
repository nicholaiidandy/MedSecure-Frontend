import { useNavigate } from 'react-router-dom';
import { ServerCrash, RefreshCw, Mail } from 'lucide-react';

export function Error500Page() {
  const navigate = useNavigate();
  const errorId = 'ERR-' + Math.random().toString(36).substring(2, 10).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-6">
          <ServerCrash className="w-12 h-12 text-orange-600" />
        </div>
        
        <h1 className="text-6xl font-semibold text-slate-900 mb-4">500</h1>
        <h2 className="text-2xl font-semibold text-slate-900 mb-3">Internal Server Error</h2>
        
        <p className="text-slate-600 mb-6">
          Something went wrong on our end. We've been notified and are working to fix the issue.
        </p>

        <div className="bg-slate-100 border border-slate-200 rounded-lg p-4 mb-8">
          <p className="text-xs font-medium text-slate-500 uppercase mb-1">Error ID</p>
          <code className="text-sm font-mono text-slate-900">{errorId}</code>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
          <button
            onClick={() => alert('Support: support@medical.com')}
            className="inline-flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Mail className="w-5 h-5" />
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
