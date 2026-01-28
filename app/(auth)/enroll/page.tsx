'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { EnrollForm } from '@/components/forms/EnrollForm';
import { ActionIDFlowCapture } from '@/components/forms/ActionIDFlowCapture';

function EnrollContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { isAuthenticated, isLoading, user } = useAuth();
  const flow = (params.get('flow') || 'enroll') as 'register' | 'login' | 'enroll';

  useEffect(() => {
    // For register/login flows, auth is not required (pending data comes from sessionStorage).
    if (flow === 'register' || flow === 'login') return;
    if (!isLoading) {
      if (!isAuthenticated) router.push('/login');
      else if (user?.isEnrolled) router.push('/home');
    }
  }, [flow, isAuthenticated, isLoading, user, router]);

  if (isLoading && flow === 'enroll') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-8">
      {flow === 'register' ? (
        <Card title="Create Account" subtitle="Step 2 of 2: Biometric enrollment">
          <ActionIDFlowCapture flow="register" />
        </Card>
      ) : flow === 'login' ? (
        <Card title="Login" subtitle="Biometric verification">
          <ActionIDFlowCapture flow="login" />
        </Card>
      ) : (
        <Card title="Biometric Enrollment" subtitle="Complete enrollment to secure your account">
          <EnrollForm />
        </Card>
      )}
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
