import { Card } from '@/components/ui/Card';
import type { UserAuditEntry } from '@/lib/db';

interface AuditLogTableProps {
  logs: UserAuditEntry[];
  isLoading: boolean;
}

export function AuditLogTable({ logs, isLoading }: AuditLogTableProps) {
  if (!logs.length && !isLoading) {
    return null;
  }

  return (
    <Card className="w-full" title="Recent biometric validations">
      <div className="overflow-x-auto">
        {logs.length ? (
          <table className="min-w-full text-left text-xs">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="py-2 pr-4">Time</th>
                <th className="py-2 pr-4">Flow</th>
                <th className="py-2 pr-4">Biometric status</th>
                <th className="py-2 pr-4">IV score</th>
                <th className="py-2 pr-4">Indicators</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => {
                const date = new Date(log.createdAt);
                const formatted = isNaN(date.getTime())
                  ? log.createdAt
                  : date.toLocaleString();

                const prettyIndicators = Object.entries(log.indicators ?? {})
                  .map(([key, value]) => {
                    const labelMap: Record<string, string> = {
                      iv_is_biometrics_collected: 'Biometrics collected',
                      iv_is_biometrics_match: 'Biometric match',
                      iv_liveness: 'Liveness',
                      iv_user_enrolled: 'User enrolled',
                      iv_is_values_collected: 'Values collected',
                      iv_is_values_match: 'Values match',
                      idv_matching: 'IDV match',
                      driverLicenseCollected: 'Driver license',
                      idlive_liveness: 'ID Live',
                      regular_liveness: 'Face liveness',
                      iv_is_processing: 'Processing',
                    };
                    const label = labelMap[key] || key;
                    return `${label}: ${value ? 'yes' : 'no'}`;
                  })
                  .join(' · ');

                return (
                  <tr key={log.id} className="align-top">
                    <td className="py-2 pr-4 whitespace-nowrap text-slate-700">
                      {formatted}
                    </td>
                    <td className="py-2 pr-4 capitalize text-slate-700">
                      {log.action}
                    </td>
                    <td className="py-2 pr-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          log.verifiedAction ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {log.verifiedAction ? 'Enrolled' : 'Rejected'}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-slate-700">
                      {typeof log.ivScore === 'number' ? log.ivScore : '—'}
                    </td>
                    <td className="py-2 pr-4 text-slate-700">
                      {prettyIndicators || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : null}

        {isLoading && !logs.length && (
          <p className="mt-3 text-xs text-slate-500">Loading recent validations…</p>
        )}
      </div>
    </Card>
  );
}

