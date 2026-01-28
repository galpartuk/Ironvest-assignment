'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useRouter } from 'next/navigation';
import { setPendingRegister } from '@/lib/auth';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm: React.FC = () => {
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError('');
    setIsLoading(true);
    // Per ActionID flow, registration completes on /enroll after biometric validation.
    setPendingRegister({ email: data.email });
    router.push('/enroll?flow=register');
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Email"
          type="email"
          {...register('email')}
          error={errors.email?.message}
          placeholder="Enter your email"
          autoComplete="email"
        />

        <Button type="submit" variant="primary" isLoading={isLoading} className="w-full">
          Continue to Enrollment
        </Button>

        <p className="text-center text-sm text-slate-600">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
            Login
          </a>
        </p>
      </form>
    </div>
  );
};
