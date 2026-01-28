'use client';

import React from 'react';
import { CameraPermissionStatus } from '@/hooks/useActionID';
import { Button } from '@/components/ui/Button';

interface CameraPermissionPromptProps {
  status: CameraPermissionStatus;
  onRetry: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

/**
 * Displays an informative, user-friendly message based on camera permission status.
 * Guides the user on how to resolve permission issues.
 */
export const CameraPermissionPrompt: React.FC<CameraPermissionPromptProps> = ({
  status,
  onRetry,
  onBack,
  isLoading = false,
}) => {
  const content = getContentForStatus(status);

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-amber-300 bg-amber-50 rounded-lg p-8">
        <div className="flex flex-col items-center justify-center space-y-5">
          {/* Icon */}
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${content.iconBg}`}>
            {content.icon}
          </div>

          {/* Title and Description */}
          <div className="text-center max-w-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {content.title}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {content.description}
            </p>
          </div>

          {/* Instructions */}
          {content.instructions && (
            <div className="w-full max-w-sm bg-white/80 rounded-lg p-4 border border-slate-200">
              <p className="text-xs font-medium text-slate-700 mb-2">How to enable camera access:</p>
              <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside">
                {content.instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button 
          onClick={onRetry} 
          variant="primary" 
          className="w-full"
          isLoading={isLoading}
        >
          {content.retryLabel}
        </Button>
        <Button onClick={onBack} variant="outline" className="w-full">
          Back
        </Button>
      </div>
    </div>
  );
};

function getContentForStatus(status: CameraPermissionStatus) {
  switch (status) {
    case 'denied':
      return {
        title: 'Camera Access Blocked',
        description:
          'Your browser has blocked camera access for this site. You\'ll need to manually enable it in your browser settings to continue with biometric verification.',
        instructions: [
          'Click the camera/lock icon in your browser\'s address bar',
          'Find the camera permission setting',
          'Change it from "Block" to "Allow"',
          'Refresh the page and try again',
        ],
        retryLabel: 'Try Again',
        iconBg: 'bg-red-100',
        icon: (
          <svg
            className="w-10 h-10 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        ),
      };

    case 'prompt':
      return {
        title: 'Camera Permission Required',
        description:
          'We need access to your camera for biometric verification. When you click the button below, your browser will ask for permission. Please click "Allow" to continue.',
        instructions: null,
        retryLabel: 'Allow Camera Access',
        iconBg: 'bg-blue-100',
        icon: (
          <svg
            className="w-10 h-10 text-blue-600"
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
        ),
      };

    case 'unknown':
    default:
      return {
        title: 'Camera Access Needed',
        description:
          'We couldn\'t determine your camera permission status. Please ensure your browser supports camera access and that no other application is using your camera.',
        instructions: [
          'Close any other apps that might be using your camera',
          'Check that your camera is properly connected',
          'Try using a different browser if the issue persists',
        ],
        retryLabel: 'Check Camera Access',
        iconBg: 'bg-amber-100',
        icon: (
          <svg
            className="w-10 h-10 text-amber-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        ),
      };
  }
}
