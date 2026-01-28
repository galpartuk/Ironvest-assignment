'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { ActionIDFlowCapture } from '@/components/forms/ActionIDFlowCapture';

function EnrollContent() {
  const router = useRouter();
  const params = useSearchParams();
  const flow = (params.get('flow') || 'login') as 'register' | 'login';

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
                <span className="text-[11px] text-slate-500">Biometric demo environment</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex items-center justify-center px-4 py-14">
        {flow === 'register' ? (
          <Card
            className="w-full max-w-2xl"
            title="Biometric enrollment"
            subtitle="Step 2 of 2 · We’ll use your camera briefly to enroll your biometrics."
          >
            <ActionIDFlowCapture flow="register" />
          </Card>
        ) : flow === 'login' ? (
          <Card
            className="w-full max-w-2xl"
            title="Biometric verification"
            subtitle="We’ll use your camera briefly to verify it’s really you."
          >
            <ActionIDFlowCapture flow="login" />
          </Card>
        ) : (
          // If flow is something unexpected, send the user back to login.
          router.push('/login')
        )}
      </main>
    </div>
  );
}

export default function EnrollPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <EnrollContent />
    </Suspense>
  );
}
