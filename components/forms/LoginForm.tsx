'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useRouter } from 'next/navigation';
import { setPendingLogin } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError('');
    setIsLoading(true);
    try {
      // Ensure the user already exists before starting biometric verification.
      const res = await fetch('/api/auth/user-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, mode: 'login' }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error || 'Unable to start login. Please try again.');
        return;
      }

      // Per ActionID flow, login must go through biometric capture on /enroll
      setPendingLogin({ email: data.email });
      router.push('/enroll?flow=login');
    } catch {
      setError('Unable to check user status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && <ErrorMessage message={error} />}

      <Input
        label="Email"
        type="email"
        {...register('email')}
        error={errors.email?.message}
        placeholder="Enter your email"
        autoComplete="email"
      />

      <Button type="submit" variant="primary" isLoading={isLoading} className="w-full">
        Login
      </Button>

      <p className="text-center text-sm text-slate-600">
        Don't have an account?{' '}
        <a href="/register" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
          Register
        </a>
      </p>
    </form>
  );
};
