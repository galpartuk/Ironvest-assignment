import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  accent?: 'indigo' | 'violet' | 'emerald' | 'amber' | 'none';
}

export const Card: React.FC<CardProps> = ({ children, className, title, subtitle, accent = 'none' }) => {
  const accentStyles = {
    indigo: 'border-t-4 border-t-indigo-500',
    violet: 'border-t-4 border-t-violet-500',
    emerald: 'border-t-4 border-t-emerald-500',
    amber: 'border-t-4 border-t-amber-500',
    none: '',
  };

  return (
    <div className={cn(
      'bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/50 p-6 sm:p-8 w-full',
      accentStyles[accent],
      className
    )}>
      {title && (
        <div className="mb-6">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-1">{title}</h2>
          {subtitle && (
            <p className="text-sm text-slate-500">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};
