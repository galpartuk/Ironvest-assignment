'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { PasswordStrength } from '@/components/ui/PasswordStrength';
import { BiometricCapture } from '@/components/BiometricCapture/BiometricCapture';
import { useRouter } from 'next/navigation';

const registerSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password');

  const onStep1Submit = async (data: RegisterFormData) => {
    setError('');
    setFormData(data);
    setStep(2);
  };

  const handleBiometricEnrollment = async () => {
    if (!formData) return;

    setError('');
    setIsCapturing(true);

    // Simulate biometric capture
    // In phase 2, this will integrate with ActionID SDK
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsCapturing(false);
    setIsLoading(true);

    try {
      // Register user with biometric enrollment
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          biometricEnrolled: true, // In phase 2, this will be actual biometric data
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Store user in localStorage
        if (typeof window !== 'undefined' && result.user) {
          localStorage.setItem('actionid_user', JSON.stringify(result.user));
        }
        router.push('/home');
      } else {
        setError(result.error || 'Registration failed. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setError('');
  };

  return (
    <div className="space-y-6">
      <StepIndicator
        currentStep={step}
        totalSteps={2}
        labels={['Account Details', 'Biometric Enrollment']}
      />

      {error && <ErrorMessage message={error} />}

      {step === 1 ? (
        <form onSubmit={handleSubmit(onStep1Submit)} className="space-y-5">
          <Input
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
            placeholder="Enter your email"
            autoComplete="email"
          />

          <div>
            <Input
              label="Password"
              type="password"
              {...register('password')}
              error={errors.password?.message}
              placeholder="Enter your password"
              autoComplete="new-password"
            />
            {password && <PasswordStrength password={password} />}
          </div>

          <Input
            label="Confirm Password"
            type="password"
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
            placeholder="Confirm your password"
            autoComplete="new-password"
          />

          <Button type="submit" variant="primary" className="w-full" size="lg">
            Continue to Enrollment
          </Button>

          <p className="text-center text-sm text-slate-600">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors">
              Login
            </a>
          </p>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-slate-900">
              Biometric Enrollment Required
            </h3>
            <p className="text-sm text-slate-600">
              Complete biometric enrollment to create your account. This ensures secure access to your account.
            </p>
          </div>

          <BiometricCapture isCapturing={isCapturing} />

          <div className="flex gap-3">
            <Button
              onClick={handleBack}
              variant="outline"
              className="flex-1"
              disabled={isLoading || isCapturing}
            >
              Back
            </Button>
            <Button
              onClick={handleBiometricEnrollment}
              variant="primary"
              isLoading={isLoading || isCapturing}
              className="flex-1"
              disabled={isCapturing}
              size="lg"
            >
              {isCapturing ? 'Capturing...' : 'Complete Registration'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
