'use client'

import { Suspense, useState, useTransition } from 'react'
import { customerPasswordLogin, customerDirectRegister } from '@/actions/auth'
import { LogIn, UserPlus, Mail, Lock, User, ShieldCheck, Loader2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

function LoginForm() {
  const searchParams = useSearchParams()
  const nextParam = searchParams.get('next') || searchParams.get('redirect') || '/account'

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  // Sign in states
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Sign up states
  const [fullName, setFullName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')

  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  // 1. Direct Database Login
  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      const formData = new FormData()
      formData.append('email', loginEmail)
      formData.append('password', loginPassword)
      formData.append('redirectTo', nextParam)
      const res = await customerPasswordLogin({}, formData)
      if (res?.error) {
        setError(res.error)
      }
    })
  }

  // 2. Direct Database Registration
  const handleDirectRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      const formData = new FormData()
      formData.append('full_name', fullName)
      formData.append('email', signupEmail)
      formData.append('password', signupPassword)
      formData.append('redirectTo', nextParam)

      const res = await customerDirectRegister({}, formData)
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
          {mode === 'signin' ? 'Sign In to Your Account' : 'Create New Account'}
        </h1>
        <p className="text-[#615147] mt-1 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
          {mode === 'signin'
            ? 'Access your orders, saved addresses and exclusive offers.'
            : 'Join for 100% pure authentic spices & faster checkout.'}
        </p>
      </div>

      {/* ── Mode Switcher Tabs (Increased Font & Padding) ── */}
      <div className="flex rounded-[5px] bg-[#FAF7F2] p-1 border border-[#EDE4D9] mb-5">
        <button
          type="button"
          onClick={() => {
            setMode('signin')
            setError('')
            setSuccessMessage('')
          }}
          className={`flex-1 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-[5px] transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            mode === 'signin'
              ? 'bg-[#E07B0C] text-white shadow-2xs'
              : 'text-[#7A6458] hover:text-[#14361F]'
          }`}
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('signup')
            setError('')
            setSuccessMessage('')
          }}
          className={`flex-1 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-[5px] transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            mode === 'signup'
              ? 'bg-[#E07B0C] text-white shadow-2xs'
              : 'text-[#7A6458] hover:text-[#14361F]'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>New Account</span>
        </button>
      </div>

      {/* ── Error & Success Alerts ── */}
      {error && (
        <div className="mb-4 p-3 rounded-[5px] bg-[#FFF5F5] border border-[#FEB2B2] text-red-700 text-xs sm:text-sm flex items-start gap-2">
          <span className="font-bold shrink-0">Error:</span>
          <span className="leading-snug">{error}</span>
        </div>
      )}

      {successMessage && !error && (
        <div className="mb-4 p-3 rounded-[5px] bg-[#EBF3ED] border border-[#CFE3D3] text-[#144D29] text-xs sm:text-sm flex items-center gap-2">
          <span className="font-bold shrink-0">Success:</span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* ── TAB 1: SIGN IN ── */}
      {mode === 'signin' && (
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          {/* Email Address */}
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs sm:text-[13px] font-bold text-[#14361F] uppercase tracking-wider mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-[5px] border border-[#EDE4D9] bg-[#FAF7F2] text-[#14361F] text-sm sm:text-base placeholder:text-[#9C8A7F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#E07B0C] focus:border-[#E07B0C] transition-all"
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#8C766E] pointer-events-none" />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="login-password"
                className="block text-xs sm:text-[13px] font-bold text-[#14361F] uppercase tracking-wider"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs sm:text-sm font-bold text-[#E07B0C] hover:text-[#C86A08] transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-[5px] border border-[#EDE4D9] bg-[#FAF7F2] text-[#14361F] text-sm sm:text-base placeholder:text-[#9C8A7F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#E07B0C] focus:border-[#E07B0C] transition-all"
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#8C766E] pointer-events-none" />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 sm:py-3.5 px-4 bg-[#E07B0C] hover:bg-[#C86A08] text-white font-bold rounded-[5px] shadow-sm hover:shadow-md transition-all text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] mt-2.5"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin text-white" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4.5 h-4.5" />
                <span>Sign In Instantly</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* ── TAB 2: CREATE ACCOUNT ── */}
      {mode === 'signup' && (
        <form onSubmit={handleDirectRegister} className="space-y-4">
          {/* Full Name */}
          <div>
            <label
              htmlFor="signup-name"
              className="block text-xs sm:text-[13px] font-bold text-[#14361F] uppercase tracking-wider mb-1.5"
            >
              Full Name
            </label>
            <div className="relative">
              <input
                id="signup-name"
                type="text"
                required
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-[5px] border border-[#EDE4D9] bg-[#FAF7F2] text-[#14361F] text-sm sm:text-base placeholder:text-[#9C8A7F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#E07B0C] focus:border-[#E07B0C] transition-all"
              />
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#8C766E] pointer-events-none" />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label
              htmlFor="signup-email"
              className="block text-xs sm:text-[13px] font-bold text-[#14361F] uppercase tracking-wider mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <input
                id="signup-email"
                type="email"
                required
                autoComplete="email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="ramesh@example.com"
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-[5px] border border-[#EDE4D9] bg-[#FAF7F2] text-[#14361F] text-sm sm:text-base placeholder:text-[#9C8A7F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#E07B0C] focus:border-[#E07B0C] transition-all"
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#8C766E] pointer-events-none" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="signup-password"
              className="block text-xs sm:text-[13px] font-bold text-[#14361F] uppercase tracking-wider mb-1.5"
            >
              Password <span className="text-[#8C766E] font-normal lowercase">(min 6 chars)</span>
            </label>
            <div className="relative">
              <input
                id="signup-password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-[5px] border border-[#EDE4D9] bg-[#FAF7F2] text-[#14361F] text-sm sm:text-base placeholder:text-[#9C8A7F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#E07B0C] focus:border-[#E07B0C] transition-all"
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#8C766E] pointer-events-none" />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 sm:py-3.5 px-4 bg-[#E07B0C] hover:bg-[#C86A08] text-white font-bold rounded-[5px] shadow-sm hover:shadow-md transition-all text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] mt-2.5"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin text-white" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4.5 h-4.5" />
                <span>Create Account &amp; Sign In</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* ── Compact Trust & Terms Footer ── */}
      <div className="pt-3.5 border-t border-[#EDE4D9] mt-4 text-center space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-xs sm:text-[13px] text-[#7A6458]">
          <ShieldCheck className="w-4 h-4 text-[#144D29]" />
          <span>100% Encrypted &amp; Secure Authentication</span>
        </div>
        <p className="text-[11px] sm:text-xs text-[#8C766E]">
          By continuing, you agree to our Terms of Service &amp; Privacy Policy.
        </p>
      </div>

    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={<div className="p-6 text-center text-xs text-[#7A6458]">Loading login screen...</div>}
    >
      <LoginForm />
    </Suspense>
  )
}
