import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export const Card: React.FC<CardProps> = ({ children, className, title, subtitle }) => {
  return (
    <div className={cn(
      'bg-white rounded-lg border border-slate-200 p-6 w-full max-w-md',
      className
    )}>
      {title && (
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900 mb-1">{title}</h2>
          {subtitle && (
            <p className="text-sm text-slate-600">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};
