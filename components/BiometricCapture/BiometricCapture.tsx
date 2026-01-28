'use client';

import React from 'react';
import { cn } from '@/lib/utils';

const CAMERA_CONTAINER_ID = 'actionid-camera-container';

interface BiometricCaptureProps {
  /** When true, the camera container is visible and SDK can render into it. */
  isCapturing: boolean;
  /** DOM id for the camera container (must match id passed to startBiometricSession). */
  containerId?: string;
  onCaptureStart?: () => void;
}

export const BiometricCapture: React.FC<BiometricCaptureProps> = ({
  isCapturing,
  containerId = CAMERA_CONTAINER_ID,
  onCaptureStart,
}) => {
  return (
    <div
      className={cn(
        'border-2 rounded-lg p-6',
        isCapturing
          ? 'border-blue-500 bg-blue-50'
          : 'border-dashed border-slate-300 bg-slate-50'
      )}
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        {isCapturing ? (
          <>
            {/* SDK renders camera feed into this div; explicit size so feed aligns inside */}
            <div
              id={containerId}
              className="relative w-full aspect-video max-w-md mx-auto rounded-lg overflow-hidden bg-slate-900"
              style={{ minHeight: 240 }}
              aria-label="Camera feed for biometric capture"
            />
            <div className="text-center">
              <p className="text-sm font-semibold text-blue-900">Capturing biometric data...</p>
              <p className="text-xs text-blue-700">Please look at your camera and keep still</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-blue-600"
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
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-900">Ready to capture</p>
              <p className="text-xs text-slate-600">Click the button below to start biometric enrollment</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export { CAMERA_CONTAINER_ID };
