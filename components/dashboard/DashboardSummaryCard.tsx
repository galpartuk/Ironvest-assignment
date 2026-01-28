import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { User } from '@/types/auth';
import { useRouter } from 'next/navigation';

interface DashboardSummaryCardProps {
  user: User;
}

export function DashboardSummaryCard({ user }: DashboardSummaryCardProps) {
  const router = useRouter();

  return (
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
            <p className="text-sm font-semibold text-slate-900">{user.email}</p>
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
              {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'Not available'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              user.isEnrolled ? 'bg-green-100' : 'bg-red-100'
            }`}
          >
            {user.isEnrolled ? (
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
                user.isEnrolled ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {user.isEnrolled ? 'Enrolled' : 'Not Enrolled'}
            </p>
          </div>
        </div>

        {!user.isEnrolled && (
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
  );
}

