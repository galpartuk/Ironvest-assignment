'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoginForm } from '@/components/forms/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/home');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>Need an account?</span>
              <Button
                variant="outline"
                className="px-3 py-1 text-xs"
                onClick={() => router.push('/register')}
              >
                Register
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex items-center justify-center px-4 py-14">
        <div className="w-full max-w-5xl grid gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-start">
          <div className="space-y-3 max-md:hidden">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Biometric login
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Sign in with ActionID
            </h1>
            <p className="text-sm text-slate-600 max-w-md">
              Enter your email to start a short biometric check powered by ActionID. We verify the capture
              on the backend before giving access to your dashboard.
            </p>
          </div>

          <Card className="w-full max-w-lg" title="Welcome back" subtitle="Step 1 of 2 · Enter your email to continue">
            <LoginForm />
          </Card>
        </div>
      </main>
    </div>
  );
}
