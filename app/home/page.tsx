'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-200 border-t-blue-600" />
          <p className="text-sm text-slate-600">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
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
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-start">
          <Card className="w-full" title="Dashboard">
            <div className="space-y-5">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-sm font-semibold text-slate-900">{user?.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l2.5 2.5M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Account created</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleString()
                      : 'Not available'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    user?.isEnrolled ? 'bg-green-100' : 'bg-red-100'
                  }`}
                >
                  {user?.isEnrolled ? (
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Biometric Status</p>
                  <p
                    className={`text-sm font-semibold ${
                      user?.isEnrolled ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {user?.isEnrolled ? 'Enrolled' : 'Not Enrolled'}
                  </p>
                </div>
              </div>
              
              {!user?.isEnrolled && (
                <div className="pt-1">
                  <Button
                    variant="primary"
                    onClick={() => router.push('/enroll?flow=register')}
                    className="w-full"
                  >
                    Complete biometric enrollment
                  </Button>
                </div>
              )}
            </div>
          </Card>

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
                  Demo app without a persistent DB. Users are validated against ActionID and stored only in local
                  browser state.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
