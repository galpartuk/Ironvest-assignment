import { Card } from '@/components/ui/Card';

export function IntegrationDetailsCard() {
  return (
    <Card className="w-full" title="Integration details">
      <div className="space-y-3 text-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Auth provider</p>
            <p className="font-medium text-slate-900">ActionID (IronVest)</p>
          </div>
          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700 border border-green-100">
            Connected
          </span>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Flows</p>
          <ul className="text-slate-700 list-disc list-inside space-y-0.5">
            <li>Registration: email → biometric enrollment → `/v1/validate`</li>
            <li>Login: email → biometric verification → `/v1/validate`</li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Environment</p>
          <p className="text-slate-700">
            Demo app using SQLite for user records and ActionID for biometric verification.
            User sessions are backed by a server-side JWT.
          </p>
        </div>
      </div>
    </Card>
  );
}

