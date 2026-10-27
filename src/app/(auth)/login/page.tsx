'use client'

import { Suspense, useState, useTransition } from 'react'
import { customerPasswordLogin, customerDirectRegister } from '@/actions/auth'
import { LogIn, UserPlus, Mail, Lock, User, ShieldCheck } from 'lucide-react'
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
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#E8DFD5] p-6 sm:p-10">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <Link href="/" className="inline-flex flex-col items-center gap-2 group mb-3">
          <div className="relative w-16 h-16 rounded-full bg-white shadow-md border border-[#E8DFD5] p-1 flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden">
            <Image
              src="/images/logo.png"
              alt="HS AgroFoods Logo"
              width={60}
              height={60}
              className="w-full h-full object-contain rounded-full"
              priority
            />
          </div>
          <span className="font-serif text-2xl font-bold tracking-tight text-[#E07B0C]">
            HS AgroFoods
          </span>
        </Link>

        <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#14361F]">
          {mode === 'signin' ? 'Sign In to Your Account' : 'Create Your Account'}
        </h1>
        <p className="text-[#6E5951] mt-1 text-xs sm:text-sm">
          {mode === 'signin'
            ? 'Access your orders, saved addresses and exclusive spice & powder offers.'
            : 'Join HS AgroFoods for 100% pure authentic spices, dehydrated powders & faster checkout.'}
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex rounded-xl bg-[#FDF9F3] p-1 border border-[#E8DFD5] mb-6">
        <button
          type="button"
          onClick={() => {
            setMode('signin')
            setError('')
            setSuccessMessage('')
          }}
          className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            mode === 'signin'
              ? 'bg-[#E07B0C] text-white shadow-xs'
              : 'text-[#8C7567] hover:text-[#14361F]'
          }`}
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Sign In</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('signup')
            setError('')
            setSuccessMessage('')
          }}
          className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            mode === 'signup'
              ? 'bg-[#E07B0C] text-white shadow-xs'
              : 'text-[#8C7567] hover:text-[#14361F]'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Create Account</span>
        </button>
      </div>

      {/* Error & Success Messages */}
      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2">
          <span className="font-bold shrink-0">Error:</span>
          <span>{error}</span>
        </div>
      )}

      {successMessage && !error && (
        <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2">
          <span className="font-bold shrink-0">Success:</span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* TAB 1: REGULAR SIGN IN */}
      {mode === 'signin' && (
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-semibold text-[#14361F] uppercase tracking-wider mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <input
                id="login-email"
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3 pl-11 rounded-xl border border-[#D4C7BA] bg-white text-[#14361F] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#E07B0C]/30 focus:border-[#E07B0C] text-sm transition-all shadow-inner"
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold text-[#14361F] uppercase tracking-wider"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-[#E07B0C] hover:text-[#2D1409] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 pl-11 rounded-xl border border-[#D4C7BA] bg-white text-[#14361F] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#E07B0C]/30 focus:border-[#E07B0C] text-sm transition-all shadow-inner"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-[#E07B0C] to-[#D1491B] hover:from-[#2D1409] hover:to-[#E07B0C] text-white font-bold rounded-full shadow-lg shadow-[#E07B0C]/20 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed transition-all text-sm flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:scale-98 cursor-pointer mt-3"
          >
            {isPending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In Instantly</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#8C7567] pt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#E07B0C]" />
            <span>Direct Database Auth · 100% Encrypted & Secure</span>
          </div>
        </form>
      )}

      {/* TAB 2: CREATE ACCOUNT (Instant Direct Database Register) */}
      {mode === 'signup' && (
        <form onSubmit={handleDirectRegister} className="space-y-4">
          <div>
            <label
              htmlFor="signup-name"
              className="block text-xs font-semibold text-[#14361F] uppercase tracking-wider mb-1.5"
            >
              Full Name
            </label>
            <div className="relative">
              <input
                id="signup-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ramesh Kumar"
                className="w-full px-4 py-3 pl-11 rounded-xl border border-[#D4C7BA] bg-white text-[#14361F] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#E07B0C]/30 focus:border-[#E07B0C] text-sm transition-all shadow-inner"
              />
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            </div>
          </div>

          <div>
            <label
              htmlFor="signup-email"
              className="block text-xs font-semibold text-[#14361F] uppercase tracking-wider mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <input
                id="signup-email"
                type="email"
                required
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="ramesh@example.com"
                className="w-full px-4 py-3 pl-11 rounded-xl border border-[#D4C7BA] bg-white text-[#14361F] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#E07B0C]/30 focus:border-[#E07B0C] text-sm transition-all shadow-inner"
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            </div>
          </div>

          <div>
            <label
              htmlFor="signup-password"
              className="block text-xs font-semibold text-[#14361F] uppercase tracking-wider mb-1.5"
            >
              Password <span className="text-[#8C7567] font-normal lowercase">(min 6 chars)</span>
            </label>
            <div className="relative">
              <input
                id="signup-password"
                type="password"
                required
                minLength={6}
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 pl-11 rounded-xl border border-[#D4C7BA] bg-white text-[#14361F] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#E07B0C]/30 focus:border-[#E07B0C] text-sm transition-all shadow-inner"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-[#E07B0C] to-[#D1491B] hover:from-[#2D1409] hover:to-[#E07B0C] text-white font-bold rounded-full shadow-lg shadow-[#E07B0C]/20 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed transition-all text-sm flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:scale-98 cursor-pointer mt-3"
          >
            {isPending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Account & Sign In</span>
              </>
            )}
          </button>

          <p className="text-center text-xs text-[#8C7567] mt-3">
            By creating an account, you agree to our Terms of Service & Privacy Policy.
          </p>
        </form>
      )}
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={<div className="p-8 text-center text-[#6E5951]">Loading login screen...</div>}
    >
      <LoginForm />
    </Suspense>
  )
}
