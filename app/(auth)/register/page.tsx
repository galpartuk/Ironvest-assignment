'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { RegisterForm } from '@/components/forms/RegisterForm';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="bg-white/70 backdrop-blur-lg border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-indigo-500/30">
                ID
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-base font-bold text-slate-900">ActionID</span>
                <span className="text-xs text-slate-500">Biometric Authentication</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500 hidden sm:block">Already have an account?</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/login')}
              >
                Sign in
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-5xl grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-center">
          <div className="space-y-6 max-lg:hidden">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-100 text-violet-700 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></span>
              New Account
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Get started with{' '}
              <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                ActionID
              </span>
            </h1>
            <p className="text-lg text-slate-600 max-w-md leading-relaxed">
              Create your account in seconds with just your email and a quick biometric scan. Say goodbye to passwords forever.
            </p>
            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-indigo-600 font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Enter your email</h3>
                  <p className="text-sm text-slate-500">We'll use this to identify your account</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-violet-600 font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Quick biometric scan</h3>
                  <p className="text-sm text-slate-500">A 5-second face scan to secure your account</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">You're all set!</h3>
                  <p className="text-sm text-slate-500">Access your dashboard instantly</p>
                </div>
              </div>
            </div>
          </div>

          <Card 
            className="w-full max-w-md mx-auto lg:mx-0" 
            title="Create account" 
            subtitle="Enter your email to get started"
            accent="violet"
          >
            <RegisterForm />
          </Card>
        </div>
      </main>
    </div>
  );
}
