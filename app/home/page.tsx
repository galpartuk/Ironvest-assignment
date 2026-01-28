'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { DashboardSummaryCard } from '@/components/dashboard/DashboardSummaryCard';
import { IntegrationDetailsCard } from '@/components/dashboard/IntegrationDetailsCard';
import { AuditLogTable } from '@/components/dashboard/AuditLogTable';
import type { UserAuditEntry } from '@/lib/db';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const [auditLogs, setAuditLogs] = useState<UserAuditEntry[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchLogs = async () => {
      try {
        setIsLoadingLogs(true);
        const res = await fetch('/api/auth/audit-logs');
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && Array.isArray(data.logs)) {
          setAuditLogs(data.logs);
        }
      } catch {
        // ignore for now
      } finally {
        setIsLoadingLogs(false);
      }
    };
    void fetchLogs();
  }, [isAuthenticated]);

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

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-start">
          {user && <DashboardSummaryCard user={user} />}
          <IntegrationDetailsCard />
        </div>
        <AuditLogTable logs={auditLogs} isLoading={isLoadingLogs} />
      </main>
    </div>
  );
}
