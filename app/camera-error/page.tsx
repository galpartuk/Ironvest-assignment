'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function CameraErrorPage() {
  const router = useRouter();
  const params = useSearchParams();
  const flow = (params.get('flow') || 'login') as 'login' | 'register';
  const message =
    params.get('reason') ||
    'We were unable to access your camera. Please enable camera permissions in your browser settings and try again.';

  const handleBack = () => {
    router.push(flow === 'register' ? '/register' : '/login');
  };

  return (
    <div className="min-h-screen bg-gray-50/60">
      <nav className="bg-white/90 backdrop-blur border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-14 items-center">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                ID
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold text-slate-900">ActionID Auth</span>
                <span className="text-[11px] text-slate-500">Camera access required</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex items-center justify-center px-4 py-14">
        <Card
          className="w-full max-w-lg"
          title="Camera access blocked"
          subtitle="We need your camera only for the biometric step; nothing is stored locally."
        >
          <div className="space-y-4 text-sm text-slate-700">
            <p>{message}</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Check your browser’s address bar and allow camera access for this site.</li>
              <li>If you denied access previously, you may need to refresh after changing the permission.</li>
            </ul>
            <Button className="w-full" variant="primary" onClick={handleBack}>
              Go back and try again
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}

