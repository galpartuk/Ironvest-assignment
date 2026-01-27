'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface BiometricCaptureProps {
  isCapturing: boolean;
  onCaptureStart?: () => void;
}

export const BiometricCapture: React.FC<BiometricCaptureProps> = ({ 
  isCapturing,
  onCaptureStart 
}) => {
  return (
    <div className={cn(
      'border-2 rounded-xl p-6 sm:p-8 bg-gradient-to-br transition-all duration-300',
      isCapturing
        ? 'border-blue-500 bg-blue-50 shadow-lg'
        : 'border-dashed border-slate-300 bg-slate-50 hover:border-slate-400'
    )}>
      <div className="flex flex-col items-center justify-center space-y-4 sm:space-y-6">
        {isCapturing ? (
          <>
            <div className="relative w-32 h-32 sm:w-40 sm:h-40">
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full animate-ping opacity-75"></div>
              <div className="absolute inset-2 border-4 border-blue-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-6 sm:inset-8 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="text-center space-y-1 sm:space-y-2">
              <p className="text-sm sm:text-base font-semibold text-blue-900">Capturing biometric data...</p>
              <p className="text-xs sm:text-sm text-blue-700">Please look at your camera and keep still</p>
            </div>
          </>
        ) : (
          <>
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-inner">
              <svg
                className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="text-center space-y-1 sm:space-y-2">
              <p className="text-sm sm:text-base font-semibold text-slate-900">Ready to capture</p>
              <p className="text-xs sm:text-sm text-slate-600">Click the button below to start biometric enrollment</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
