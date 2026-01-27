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
      'bg-white rounded-xl shadow-lg p-6 sm:p-8 w-full max-w-md',
      'border border-slate-100',
      'page-transition',
      className
    )}>
      {title && (
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1 sm:mb-2">{title}</h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-600">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};
