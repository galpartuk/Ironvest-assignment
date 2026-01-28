import { Card } from '@/components/ui/Card';

export function IntegrationDetailsCard() {
  return (
    <Card className="w-full" title="Integration Details" accent="violet">
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Auth Provider</p>
              <p className="font-bold text-slate-900">ActionID (IronVest)</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 border border-green-200">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            Live
          </span>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Authentication Flows</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-6 h-6 bg-indigo-100 rounded-md flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                </svg>
              </div>
              <span className="text-slate-700">
                <span className="font-semibold text-slate-900">Register:</span> email → biometric → validate
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-6 h-6 bg-violet-100 rounded-md flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-violet-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-slate-700">
                <span className="font-semibold text-slate-900">Login:</span> email → biometric → validate
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl border border-violet-100">
          <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide mb-2">Environment</p>
          <p className="text-sm text-slate-700 leading-relaxed">
            Demo app with <span className="font-semibold text-slate-900">SQLite</span> for user records, 
            <span className="font-semibold text-slate-900"> JWT sessions</span>, and 
            <span className="font-semibold text-slate-900"> ActionID</span> for biometric verification.
          </p>
        </div>
      </div>
    </Card>
  );
}

