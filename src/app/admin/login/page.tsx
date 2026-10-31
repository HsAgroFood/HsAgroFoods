'use client'

import { useActionState, useState } from 'react'
import { adminLogin, type AuthResult } from '@/actions/auth'
import { Eye, EyeOff, Shield, ShieldCheck, Mail, Lock, Loader2, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState<AuthResult, FormData>(
    adminLogin,
    {}
  )
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#FAF7F2] py-6 sm:py-10 px-4 sm:px-6">
      {/* ── Ambient Background Lighting Gradients (Matching Home & Customer Login) ── */}
      <div
        className="absolute inset-0 pointer-events-none select-none z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 10%, rgba(240, 152, 25, 0.08) 0%, transparent 45%),
            radial-gradient(circle at 92% 15%, rgba(224, 123, 12, 0.06) 0%, transparent 35%),
            radial-gradient(circle at 8% 85%, rgba(20, 77, 41, 0.06) 0%, transparent 40%)
          `,
        }}
      />

      {/* Decorative Corner Asset: Top Right Accent Spices */}
      <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 pointer-events-none select-none mix-blend-multiply opacity-65 z-0">
        <Image
          src="/images/accent-leaves-spices.png"
          alt="Natural Spice Accent"
          fill
          className="object-contain object-top-right"
          sizes="(max-width: 768px) 128px, 256px"
          priority={false}
        />
      </div>

      {/* Top Navigation Bar: Back to Store */}
      <div className="w-full max-w-[450px] flex items-center justify-between mb-4 sm:mb-5 relative z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#14361F] hover:text-[#E07B0C] transition-colors rounded-[5px] bg-white border border-[#EDE4D9] px-3.5 py-1.5 shadow-2xs group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Store</span>
        </Link>

        <span className="text-xs sm:text-[13px] font-semibold text-[#7A6458] tracking-wide">
          Admin Portal
        </span>
      </div>

      {/* Main Admin Card */}
      <div className="relative z-10 w-full max-w-[450px]">
        <div className="bg-white rounded-[5px] shadow-[0_4px_24px_rgba(20,54,31,0.06)] border border-[#EDE4D9] p-5 sm:p-7 lg:p-8">
          
          {/* Header */}
          <div className="text-center mb-5 sm:mb-6">
            <div className="inline-flex items-center gap-2.5 mb-2.5">
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-[5px] bg-[#FAF6F0] border border-[#EDE4D9] p-1 flex items-center justify-center overflow-hidden shrink-0">
                <Image
                  src="/images/logo.png"
                  alt="HS AgroFoods Logo"
                  width={36}
                  height={36}
                  className="object-contain"
                  priority
                />
              </div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#E07B0C]">
                HS AgroFoods
              </span>
            </div>

            <h1 className="font-serif text-xl sm:text-2xl lg:text-[26px] font-bold text-[#14361F] leading-tight">
              Admin Dashboard Login
            </h1>
            <p className="text-[#615147] mt-1 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
             HS AgroFoods - Management Portal
            </p>
          </div>

          {/* Error Message */}
          {state.error && (
            <div className="mb-4 p-3 rounded-[5px] bg-[#FFF5F5] border border-[#FEB2B2] text-red-700 text-xs sm:text-sm flex items-start gap-2">
              <span className="font-bold shrink-0">Error:</span>
              <span className="leading-snug">{state.error}</span>
            </div>
          )}

          {/* Login Form */}
          <form action={formAction} className="space-y-4">
            {/* Email Address */}
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs sm:text-[13px] font-bold text-[#14361F] uppercase tracking-wider mb-1.5"
              >
                Admin Email Address
              </label>
              <div className="relative">
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="admin@hsagrofoods.com"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-[5px] border border-[#EDE4D9] bg-[#FAF7F2] text-[#14361F] text-sm sm:text-base placeholder:text-[#9C8A7F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#E07B0C] focus:border-[#E07B0C] transition-all"
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#8C766E] pointer-events-none" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs sm:text-[13px] font-bold text-[#14361F] uppercase tracking-wider mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-2.5 sm:py-3 rounded-[5px] border border-[#EDE4D9] bg-[#FAF7F2] text-[#14361F] text-sm sm:text-base placeholder:text-[#9C8A7F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#E07B0C] focus:border-[#E07B0C] transition-all"
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#8C766E] pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C766E] hover:text-[#14361F] transition-colors p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={pending}
              className="w-full py-3 sm:py-3.5 px-4 bg-[#E07B0C] hover:bg-[#C86A08] text-white font-bold rounded-[5px] shadow-sm hover:shadow-md transition-all text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] mt-2.5"
            >
              {pending ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin text-white" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4.5 h-4.5" />
                  <span>Access Admin Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Trust Footer */}
          <div className="pt-3.5 border-t border-[#EDE4D9] mt-4 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xs sm:text-[13px] text-[#7A6458]">
              <ShieldCheck className="w-4 h-4 text-[#144D29]" />
              <span>Restricted Access · Authorized Personnel Only</span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#8C766E]">
              All administrative activities are monitored and cryptographically logged.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
