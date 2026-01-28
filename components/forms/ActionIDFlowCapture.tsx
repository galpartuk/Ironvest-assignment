'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { BiometricCapture } from '@/components/BiometricCapture/BiometricCapture';
import { CameraPermissionPrompt } from '@/components/BiometricCapture/CameraPermissionPrompt';
import { useActionID, CameraPermissionStatus } from '../../hooks/useActionID';
import { useAuth } from '@/context/AuthContext';
import { getPendingLogin, getPendingRegister, setPendingLogin, setPendingRegister } from '@/lib/auth';

type Flow = 'register' | 'login';

export const ActionIDFlowCapture: React.FC<{ flow: Flow }> = ({ flow }) => {
  const router = useRouter();
  const { registerWithBiometric, loginWithBiometric } = useAuth();
  const { initialize, startBiometric, stop, getCsid, ensureCameraPermission, getPermissionStatus, cameraContainerId } = useActionID();
  const [error, setError] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<CameraPermissionStatus | null>(null);
  const [isCheckingPermission, setIsCheckingPermission] = useState(false);
  const timerRef = useRef<number | null>(null);
  const autoStartRef = useRef(false);

  const pendingRegister = flow === 'register' ? getPendingRegister() : null;
  const pendingLogin = flow === 'login' ? getPendingLogin() : null;
  const uid = flow === 'register' ? pendingRegister?.email : pendingLogin?.email;

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      stop();
    };
  }, [stop]);

  const runValidateAndContinue = async () => {
    if (!uid) return;
    setIsSubmitting(true);
    try {
      stop();
      const csid = getCsid();
      const res =
        flow === 'register'
          ? await registerWithBiometric({
              email: uid,
              csid,
            })
          : await loginWithBiometric({ email: uid, csid });

      if (!res.success) {
        setError(res.error || 'Validation failed.');
        setIsSubmitting(false);
        return;
      }

      // Clear pending state and continue
      setPendingRegister(null);
      setPendingLogin(null);
      router.push('/home');
    } catch (e) {
      setError('An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // User chose to cancel – do not attempt validation.
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    stop();
    setIsCapturing(false);

    // Return the user to the page where they initiated the flow.
    router.push(flow === 'register' ? '/register' : '/login');
  };

  /**
   * Check camera permission status using the SDK's getPermissionsStatus().
   * If granted, proceed with capture. Otherwise, show the permission prompt.
   */
  const checkAndStartCapture = async () => {
    setError('');
    setIsCheckingPermission(true);

    if (!uid) {
      setError(`Missing ${flow} data. Please start from /${flow === 'register' ? 'register' : 'login'}.`);
      setIsCheckingPermission(false);
      return;
    }

    // Initialize SDK first so we can use getPermissionsStatus
    try {
      initialize(uid);
    } catch (e: any) {
      setError(e?.message || 'Failed to initialize SDK');
      setIsCheckingPermission(false);
      return;
    }

    // Check permission status using SDK
    const status = await getPermissionStatus();
    setPermissionStatus(status);
    setIsCheckingPermission(false);

    if (status === 'granted') {
      // Permission already granted, proceed with capture
      startCaptureFlow();
    }
    // If not granted, the CameraPermissionPrompt will be shown
  };

  /**
   * Actually starts the biometric capture (called after permission is confirmed).
   */
  const startCaptureFlow = async () => {
    setError('');

    if (!uid) {
      setError(`Missing ${flow} data. Please start from /${flow === 'register' ? 'register' : 'login'}.`);
      return;
    }

    // If we need to request permission (prompt or retry after denied)
    try {
      await ensureCameraPermission();
      setPermissionStatus('granted');
    } catch (e) {
      // If permission was denied after prompt, update status
      const status = await getPermissionStatus();
      setPermissionStatus(status);
      return;
    }

    setIsCapturing(true);

    // Start the SDK once the container is mounted.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        try {
          // Re-initialize if needed (in case SDK was cleaned up)
          if (!uid) return;
          initialize(uid);
          startBiometric(cameraContainerId, flow);

          // Per docs: capture ~6–8s then POST validate. We'll auto-advance at 8s.
          timerRef.current = window.setTimeout(() => {
            setIsCapturing(false);
            runValidateAndContinue();
          }, 8000);
        } catch (e: any) {
          setError(e?.message || 'Failed to start capture');
          setIsCapturing(false);
        }
      });
    });
  };

  /**
   * Handle retry from permission prompt - attempts to request permission again.
   */
  const handleRetryPermission = () => {
    startCaptureFlow();
  };

  // Automatically check permission and start capture once when the component mounts and we have a UID.
  useEffect(() => {
    if (!autoStartRef.current && uid) {
      autoStartRef.current = true;
      void checkAndStartCapture();
    }
  }, [uid]);

  // Show loading state while checking permission
  if (isCheckingPermission) {
    return (
      <div className="space-y-6">
        <div className="border-2 border-dashed border-slate-300 bg-slate-50 rounded-lg p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm text-slate-600">Checking camera access...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show permission prompt if camera is not granted
  if (permissionStatus && permissionStatus !== 'granted' && !isCapturing) {
    return (
      <CameraPermissionPrompt
        status={permissionStatus}
        onRetry={handleRetryPermission}
        onBack={handleCancel}
        isLoading={isSubmitting}
      />
    );
  }

  return (
    <div className="space-y-6">
      {error && <ErrorMessage message={error} />}

      <BiometricCapture isCapturing={isCapturing} containerId={cameraContainerId} />

      {isCapturing ? (
        <Button onClick={handleCancel} variant="outline" className="w-full">
          Cancel
        </Button>
      ) : (
        <div className="space-y-3">
          {error && (
            <Button onClick={startCaptureFlow} variant="primary" isLoading={isSubmitting} className="w-full">
              Try capture again
            </Button>
          )}
          <Button onClick={handleCancel} variant="outline" className="w-full">
            Back
          </Button>
        </div>
      )}
    </div>
  );
};

