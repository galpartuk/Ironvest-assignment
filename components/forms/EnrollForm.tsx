'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { BiometricCapture } from '@/components/BiometricCapture/BiometricCapture';
import { useAuth } from '@/context/AuthContext';
import { useActionID } from '../../hooks/useActionID';
import { useRouter } from 'next/navigation';

export const EnrollForm: React.FC = () => {
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const { user, enroll } = useAuth();
  const { initialize, startBiometric, stop, getCsid, ensureCameraPermission, cameraContainerId } = useActionID();
  const router = useRouter();

  // Start SDK camera when container is visible (isCapturing true)
  useEffect(() => {
    if (!isCapturing || !user?.email) return;
    try {
      initialize(user.email);
      // Container must be in DOM; start on next tick
      const t = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          try {
            startBiometric(cameraContainerId, 'enrollment');
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to start camera');
            setIsCapturing(false);
          }
        });
      });
      return () => cancelAnimationFrame(t);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to initialize ActionID');
      setIsCapturing(false);
    }
  }, [isCapturing, user?.email, initialize, startBiometric, cameraContainerId]);

  const handleStartEnroll = async () => {
    setError('');
    if (!user?.email) {
      setError('You must be logged in to enroll.');
      return;
    }

    setIsLoading(true);
    try {
      // Proactively request camera permission before starting the SDK.
      await ensureCameraPermission();
      setIsCapturing(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to access the camera. Please check your device and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDoneCapturing = async () => {
    setError('');
    try {
      stop();
      setIsCapturing(false);
      setIsLoading(true);

      const data = await enroll({ csid: getCsid() });

      if (data.success) {
        router.push('/home');
      } else {
        setError(data.error || 'Enrollment failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelCapture = () => {
    stop();
    setIsCapturing(false);
    setError('');
  };

  return (
    <div className="space-y-6">
      {error && <ErrorMessage message={error} />}

      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Biometric Enrollment
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Please complete biometric enrollment to secure your account.
        </p>
      </div>

      <BiometricCapture
        isCapturing={isCapturing}
        containerId={cameraContainerId}
      />

      {!isCapturing ? (
        <Button
          onClick={handleStartEnroll}
          variant="primary"
          isLoading={isLoading}
          className="w-full"
        >
          Start Enrollment
        </Button>
      ) : (
        <div className="flex gap-3">
          <Button
            onClick={handleCancelCapture}
            variant="outline"
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDoneCapturing}
            variant="primary"
            isLoading={isLoading}
            className="flex-1"
          >
            Done capturing
          </Button>
        </div>
      )}
    </div>
  );
};
