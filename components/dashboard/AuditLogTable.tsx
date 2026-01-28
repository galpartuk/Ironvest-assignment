import { Card } from '@/components/ui/Card';
import type { UserAuditEntry } from '@/lib/db';

interface AuditLogTableProps {
  logs: UserAuditEntry[];
  isLoading: boolean;
}

function StatusBadge({ success }: { success: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
        success
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200'
          : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200'
      }`}
    >
      {success ? (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {success ? 'Verified' : 'Rejected'}
    </span>
  );
}

function IndicatorPill({ label, value }: { label: string; value: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium ${
        value
          ? 'bg-green-50 text-green-600 border border-green-100'
          : 'bg-slate-50 text-slate-400 border border-slate-100'
      }`}
    >
      {value ? (
        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      )}
      {label}
    </span>
  );
}

function ScoreBadge({ score }: { score: number | null | undefined }) {
  if (typeof score !== 'number') {
    return <span className="text-slate-400">—</span>;
  }

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'from-green-500 to-emerald-500 text-white';
    if (s >= 60) return 'from-amber-400 to-orange-400 text-white';
    return 'from-red-400 to-rose-400 text-white';
  };

  return (
    <span
      className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-sm font-bold bg-gradient-to-br shadow-lg ${getScoreColor(score)}`}
    >
      {score}
    </span>
  );
}

export function AuditLogTable({ logs, isLoading }: AuditLogTableProps) {
  if (!logs.length && !isLoading) {
    return null;
  }

  const labelMap: Record<string, string> = {
    iv_is_biometrics_collected: 'Biometrics',
    iv_is_biometrics_match: 'Match',
    iv_liveness: 'Liveness',
    iv_user_enrolled: 'Enrolled',
    iv_is_values_collected: 'Values collected',
    iv_is_values_match: 'Values match',
    idv_matching: 'IDV',
    driverLicenseCollected: 'License',
    idlive_liveness: 'ID Live',
    regular_liveness: 'Face',
    iv_is_processing: 'Processing',
  };

  return (
    <Card className="w-full" title="Recent Biometric Validations" subtitle="Your authentication activity log" accent="violet">
      <div className="space-y-3">
        {logs.length ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Timestamp</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Flow Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Score</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Indicators</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {logs.map((log) => {
                    const date = new Date(log.createdAt);
                    const formatted = isNaN(date.getTime())
                      ? log.createdAt
                      : date.toLocaleString();

                    const indicators = Object.entries(log.indicators ?? {}).map(([key, value]) => ({
                      key,
                      label: labelMap[key] || key,
                      value: Boolean(value),
                    }));

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{formatted.split(',')[0]}</p>
                              <p className="text-xs text-slate-500">{formatted.split(',')[1]?.trim()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-lg border border-indigo-100">
                            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span className="text-sm font-medium text-indigo-700 capitalize">{log.action}</span>
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge success={log.verifiedAction} />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <ScoreBadge score={log.ivScore} />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1.5 max-w-sm">
                            {indicators.length > 0 ? (
                              indicators.slice(0, 6).map(({ key, label, value }) => (
                                <IndicatorPill key={key} label={label} value={value} />
                              ))
                            ) : (
                              <span className="text-slate-400 text-sm">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {logs.map((log) => {
                const date = new Date(log.createdAt);
                const formatted = isNaN(date.getTime())
                  ? log.createdAt
                  : date.toLocaleString();

                const indicators = Object.entries(log.indicators ?? {}).map(([key, value]) => ({
                  key,
                  label: labelMap[key] || key,
                  value: Boolean(value),
                }));

                return (
                  <div
                    key={log.id}
                    className="p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <span className="text-sm font-semibold text-slate-900 capitalize">{log.action}</span>
                      </div>
                      <StatusBadge success={log.verifiedAction} />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatted}
                      </div>
                      <ScoreBadge score={log.ivScore} />
                    </div>

                    {indicators.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                        {indicators.map(({ key, label, value }) => (
                          <IndicatorPill key={key} label={label} value={value} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : null}

        {isLoading && !logs.length && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3 text-slate-500">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm font-medium">Loading recent validations...</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

