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
    <Card className="w-full" title="Account Overview" accent="indigo">
      <div className="space-y-4">
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl border border-indigo-100">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide">Email</p>
            <p className="text-base font-bold text-slate-900">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl border border-slate-200">
          <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center shadow-lg shadow-slate-500/25">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Account created</p>
            <p className="text-base font-bold text-slate-900">
              {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'Not available'}
            </p>
          </div>
        </div>

        <div className={`flex items-center gap-4 p-4 rounded-xl border ${
          user.isEnrolled 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
            : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
        }`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
            user.isEnrolled 
              ? 'bg-gradient-to-br from-green-500 to-emerald-500 shadow-green-500/25' 
              : 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/25'
          }`}>
            {user.isEnrolled ? (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <p className={`text-xs font-medium uppercase tracking-wide ${
              user.isEnrolled ? 'text-green-600' : 'text-amber-600'
            }`}>Biometric Status</p>
            <p className={`text-base font-bold ${
              user.isEnrolled ? 'text-green-700' : 'text-amber-700'
            }`}>
              {user.isEnrolled ? 'Verified & Active' : 'Pending Enrollment'}
            </p>
          </div>
        </div>

        {!user.isEnrolled && (
          <div className="pt-2">
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

