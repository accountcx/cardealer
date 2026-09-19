'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Mail, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import {
  Button,
  Input,
  Card,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@cardealer/ui';
import { authService } from '../../services/auth.service';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Vui lòng nhập email đăng nhập')
    .email('Địa chỉ email không đúng định dạng'),
  password: z
    .string()
    .min(6, 'Mật khẩu phải có tối thiểu 6 ký tự'),
  remember: z.boolean(),
});

type LoginFormData = z.infer<typeof loginSchema>;

// 🧠 Mental Model: Màn hình đăng nhập Quản trị viên Showroom theo UI_SPEC.md Mục 3
// Chuẩn phong cách Luxury Dark Automotive với react-hook-form & Shadcn Form Primitives
export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@xehyundaivinh.com',
      password: 'AdminPassword123!',
      remember: true,
    },
    mode: 'onSubmit',
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);

    try {
      const result = await authService.login({
        email: data.email,
        password: data.password,
      });

      if (result && result.user) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/cars');
        }, 800);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin tài khoản.';
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden">
      {/* Background Gradient Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[32rem] aspect-square bg-[#0072CE]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 sm:w-96 aspect-square bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <Card
          variant="glass"
          className="p-8 sm:p-10 border border-white/10 shadow-2xl backdrop-blur-xl bg-slate-900/80 rounded-2xl"
        >
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#0072CE] to-sky-600 shadow-lg shadow-[#0072CE]/30 text-white font-black text-xl mb-4">
              H
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              CarDealer Admin CMS
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 font-medium">
              Hệ thống quản trị Showroom Hyundai Vinh chính hãng
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="flex items-center gap-2.5 p-3.5 mb-5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-medium animate-in fade-in">
              <ShieldAlert size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {success && (
            <div className="flex items-center gap-2.5 p-3.5 mb-5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium animate-in fade-in">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>Đăng nhập thành công! Đang chuyển hướng...</span>
            </div>
          )}

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Đăng Nhập *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="admin@xehyundaivinh.com"
                        leftIcon={<Mail size={16} />}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật Khẩu *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="••••••••••••"
                        leftIcon={<Lock size={16} />}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="remember"
                render={({ field }) => (
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="w-4 h-4 rounded text-[#0072CE] bg-slate-800 border-slate-700 focus:ring-[#0072CE] cursor-pointer"
                      />
                      Ghi nhớ đăng nhập
                    </label>

                    <span className="text-slate-500 hover:text-slate-300 cursor-pointer transition-colors">
                      Quên mật khẩu?
                    </span>
                  </div>
                )}
              />

              <Button
                type="submit"
                variant="accent"
                glow
                className="w-full mt-2"
                isLoading={form.formState.isSubmitting}
                rightIcon={<ArrowRight size={16} />}
              >
                {form.formState.isSubmitting ? 'Đang xác thực...' : 'Đăng Nhập Quản Trị'}
              </Button>
            </form>
          </Form>

          {/* Footer Security Badge */}
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <span className="text-[11px] text-slate-500 font-mono flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Secured with SHA-256 JWT Token & Role-Based Access Control
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
