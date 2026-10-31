'use client'

import { Suspense, useState, useTransition } from 'react'
import { resetPasswordWithToken } from '@/actions/auth'
import { Lock, ArrowLeft, ShieldCheck, AlertCircle, Key, Loader2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  if (!token) {
    return (
      <div className="bg-white rounded-[5px] shadow-[0_4px_24px_rgba(20,54,31,0.06)] border border-[#EDE4D9] p-5 sm:p-7 text-center space-y-3.5">
        <div className="w-12 h-12 bg-red-50 text-red-700 border border-red-200 rounded-[5px] flex items-center justify-center mx-auto shadow-2xs">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-lg sm:text-xl font-bold text-[#14361F]">
          Invalid Password Reset Link
        </h1>
        <p className="text-xs sm:text-sm text-[#7A6458]">
          No security token was detected in your link. The link might be malformed or expired.
        </p>
        <div className="pt-2">
          <Link
            href="/forgot-password"
            className="inline-flex items-center justify-center gap-2 py-3 px-5 bg-[#E07B0C] hover:bg-[#C86A08] text-white font-bold text-xs sm:text-sm rounded-[5px] shadow-sm transition-all cursor-pointer active:scale-[0.98]"
          >
            <span>Request a New Reset Link</span>
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.')
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append('token', token)
      formData.append('password', password)
      formData.append('confirm_password', confirmPassword)

      const res = await resetPasswordWithToken({}, formData)
      if (res?.error) {
        setError(res.error)
      }
    })
  }

  return (
    <div className="bg-white rounded-[5px] shadow-[0_4px_24px_rgba(20,54,31,0.06)] border border-[#EDE4D9] p-5 sm:p-7 lg:p-8">
      {/* ── Brand Header (Slightly Increased Typography) ── */}
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
          Set a New Password
        </h1>
        <p className="text-[#615147] mt-1 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
          Please enter your new password below to regain access to your account.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-[5px] bg-[#FFF5F5] border border-[#FEB2B2] text-red-700 text-xs sm:text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <span className="leading-snug">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="new-password" className="block text-xs sm:text-[13px] font-bold text-[#14361F] uppercase tracking-wider mb-1.5">
            New Password <span className="text-[#8C766E] font-normal lowercase">(min 6 chars)</span>
          </label>
          <div className="relative">
            <input
              id="new-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoFocus
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-[5px] border border-[#EDE4D9] bg-[#FAF7F2] text-[#14361F] placeholder:text-[#9C8A7F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#E07B0C] focus:border-[#E07B0C] text-sm sm:text-base transition-all"
            />
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#8C766E] pointer-events-none" />
          </div>
        </div>

        <div>
          <label htmlFor="confirm-password" className="block text-xs sm:text-[13px] font-bold text-[#14361F] uppercase tracking-wider mb-1.5">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              id="confirm-password"
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-[5px] border border-[#EDE4D9] bg-[#FAF7F2] text-[#14361F] placeholder:text-[#9C8A7F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#E07B0C] focus:border-[#E07B0C] text-sm sm:text-base transition-all"
            />
            <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#8C766E] pointer-events-none" />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 sm:py-3.5 px-4 bg-[#E07B0C] hover:bg-[#C86A08] text-white font-bold rounded-[5px] shadow-sm hover:shadow-md transition-all text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] mt-2.5"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4.5 h-4.5 animate-spin text-white" />
              <span>Updating Password...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4.5 h-4.5" />
              <span>Update Password &amp; Enter</span>
            </>
          )}
        </button>

        <div className="text-center pt-3 border-t border-[#EDE4D9] mt-3.5">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#7A6458] hover:text-[#E07B0C] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel &amp; Back to Sign In</span>
          </Link>
        </div>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-xs text-[#7A6458]">Loading password reset screen...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
