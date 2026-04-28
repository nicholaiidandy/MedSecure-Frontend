import { useState } from 'react';
import { Shield, Search, CheckCircle, XCircle, Hash } from 'lucide-react';
import { medicalRecordService, VerificationResult } from '../services/medicalRecordService';
import { toast } from 'sonner';

export function BlockchainVerificationPage() {
  const [recordId, setRecordId] = useState('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setVerificationResult(null);

      const response = await medicalRecordService.verify(recordId.trim());
      const data = response.data;

      if (!data) {
        toast.error('Verification failed. Please try again.');
        return;
      }

      setVerificationResult(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-100 rounded-lg">
              <Shield className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">Blockchain Verification</h1>
              <p className="text-slate-600">Verify medical record integrity using blockchain</p>
            </div>
          </div>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6">
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Record ID / Patient Identifier
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={recordId}
                  onChange={(e) => setRecordId(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter record ID, patient ID, or patient name"
                  required
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              </div>
              <p className="text-xs text-slate-500 mt-2">Use the record's Mongo ID, the patient ID, or the patient name.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-600 disabled:cursor-not-allowed disabled:bg-slate-300 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Shield className="w-5 h-5" />
              {loading ? 'Verifying...' : 'Verify Record'}
            </button>
          </form>
        </div>

        {/* Verification Result */}
        {verificationResult && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Status Header */}
            <div className={`p-6 ${
              verificationResult.isValid
                ? 'bg-green-50 border-b border-green-200'
                : 'bg-red-50 border-b border-red-200'
            }`}>
              <div className="flex items-center gap-3">
                {verificationResult.isValid ? (
                  <>
                    <div className="p-3 bg-green-100 rounded-full">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-green-900">Integrity Verified</h2>
                      <p className="text-sm text-green-700">This record has not been tampered with</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3 bg-red-100 rounded-full">
                      <XCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-red-900">Data Tampered</h2>
                      <p className="text-sm text-red-700">Warning: This record may have been modified</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Record Details */}
            <div className="p-6 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4">Record Details</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Patient:</span>
                  <span className="text-sm font-medium text-slate-900">{verificationResult.recordDetails.patient}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Diagnosis:</span>
                  <span className="text-sm font-medium text-slate-900">{verificationResult.recordDetails.diagnosis}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Date:</span>
                  <span className="text-sm font-medium text-slate-900">{verificationResult.recordDetails.date}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Verification Scope:</span>
                  <span className="text-sm font-medium text-blue-700">Internal Database Integrity</span>
                </div>
              </div>
            </div>

            {/* Hash Comparison */}
            <div className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Hash className="w-5 h-5 text-teal-600" />
                Hash Comparison
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase mb-2">Database Hash</p>
                  <code className="block text-sm text-slate-900 bg-slate-50 p-3 rounded-lg break-all">
                    {verificationResult.dbHash}
                  </code>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase mb-2">Blockchain Hash</p>
                  <code className="block text-sm text-slate-900 bg-slate-50 p-3 rounded-lg break-all">
                    {verificationResult.blockchainHash}
                  </code>
                </div>

                <div className="flex items-center justify-center py-3">
                  {verificationResult.isValid ? (
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Hashes Match
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      <XCircle className="w-4 h-4 mr-2" />
                      Hashes Do Not Match
                    </span>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-500">
                    Verified at: {new Date(verificationResult.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-medium text-blue-900 mb-2">How Blockchain Verification Works</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Every medical record is hashed for integrity checking</li>
            <li>• Hashes are stored and verified internally for medical privacy</li>
            <li>• The hash acts as a digital fingerprint of the record</li>
            <li>• Any modification to the record changes the hash</li>
            <li>• Verification compares stored hash with freshly computed hash</li>
            <li>• If hashes match, the record is verified as authentic</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
