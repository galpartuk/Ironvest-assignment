'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { BiometricCapture } from '@/components/BiometricCapture/BiometricCapture';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export const EnrollForm: React.FC = () => {
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const { enroll } = useAuth();
  const router = useRouter();

  const handleEnroll = async () => {
    setError('');
    setIsCapturing(true);

    // Simulate biometric capture
    // In phase 2, this will integrate with ActionID SDK
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsCapturing(false);
    setIsLoading(true);

    try {
      const response = await enroll();

      if (response.success) {
        router.push('/home');
      } else {
        setError(response.error || 'Enrollment failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
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

      <BiometricCapture isCapturing={isCapturing} />

      <Button
        onClick={handleEnroll}
        variant="primary"
        isLoading={isLoading || isCapturing}
        className="w-full"
        disabled={isCapturing}
      >
        {isCapturing ? 'Capturing...' : 'Complete Enrollment'}
      </Button>
    </div>
  );
};
