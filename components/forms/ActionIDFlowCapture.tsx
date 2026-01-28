'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { BiometricCapture } from '@/components/BiometricCapture/BiometricCapture';
import { useActionID } from '../../hooks/useActionID';
import { useAuth } from '@/context/AuthContext';
import { getPendingLogin, getPendingRegister, setPendingLogin, setPendingRegister } from '@/lib/auth';

type Flow = 'register' | 'login';

export const ActionIDFlowCapture: React.FC<{ flow: Flow }> = ({ flow }) => {
  const router = useRouter();
  const { registerWithBiometric, loginWithBiometric } = useAuth();
  const { initialize, startBiometric, stop, getCsid, ensureCameraPermission, cameraContainerId } = useActionID();
  const [error, setError] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const start = async () => {
    setError('');
    if (!uid) {
      setError(`Missing ${flow} data. Please start from /${flow === 'register' ? 'register' : 'login'}.`);
      return;
    }

    // Check camera permission before we attempt to start the SDK.
    try {
      await ensureCameraPermission();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Unable to access the camera. Please check your device permissions and try again.'
      );
      return;
    }

    setIsCapturing(true);

    // Start the SDK once the container is mounted.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        try {
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

  // Automatically start capture once when the component mounts and we have a UID.
  useEffect(() => {
    if (!autoStartRef.current && uid) {
      autoStartRef.current = true;
      void start();
    }
  }, [uid, start]);

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
            <Button onClick={start} variant="primary" isLoading={isSubmitting} className="w-full">
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

