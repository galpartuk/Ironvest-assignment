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
      'bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-md p-8 w-full',
      className
    )}>
      {title && (
        <div className="mb-5">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 mb-1">{title}</h2>
          {subtitle && (
            <p className="text-sm text-slate-600">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};
