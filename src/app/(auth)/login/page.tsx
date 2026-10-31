'use client'

import { Suspense, useEffect, useState, useTransition } from 'react'
import {
  customerPasswordLogin,
  requestSignupOtp,
  verifySignupOtp,
  requestLoginOtp,
  verifyLoginOtp,
} from '@/actions/auth'
import {
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  ShieldCheck,
  Loader2,
  KeyRound,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

const INPUT_CLASS =
  'w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-[5px] border border-[#EDE4D9] bg-[#FAF7F2] text-[#14361F] text-sm sm:text-base placeholder:text-[#9C8A7F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#E07B0C] focus:border-[#E07B0C] transition-all'
const LABEL_CLASS = 'block text-xs sm:text-[13px] font-bold text-[#14361F] uppercase tracking-wider mb-1.5'
const SUBMIT_CLASS =
  'w-full py-3 sm:py-3.5 px-4 bg-[#E07B0C] hover:bg-[#C86A08] text-white font-bold rounded-[5px] shadow-sm hover:shadow-md transition-all text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] mt-2.5'

// Resend cooldown: call `setSeconds(n)` after each OTP send to start the countdown.
function useCountdown() {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (seconds <= 0) return
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [seconds])

  return [seconds, setSeconds] as const
}

function OtpStep({
  email,
  purpose,
  code,
  onCodeChange,
  seconds,
  isPending,
  onResend,
  onBack,
  onSubmit,
}: {
  email: string
  purpose: 'signup' | 'login'
  code: string
  onCodeChange: (v: string) => void
  seconds: number
  isPending: boolean
  onResend: () => void
  onBack: () => void
  onSubmit: (e: React.FormEvent) => void
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="p-3.5 rounded-[5px] bg-[#FAF7F2] border border-[#EDE4D9] text-xs sm:text-sm text-[#615147] leading-relaxed">
        We sent a 6-digit code to <strong className="text-[#14361F] break-all">{email}</strong>. It is valid for{' '}
        <strong>10 minutes</strong>. Check your Spam folder if you do not see it.
      </div>

      <div>
        <label htmlFor="otp-code" className={LABEL_CLASS}>
          {purpose === 'signup' ? 'Verification Code' : 'Login Code'}
        </label>
        <div className="relative">
          <input
            id="otp-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            maxLength={6}
            pattern="[0-9]{6}"
            autoFocus
            value={code}
            onChange={(e) => onCodeChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="······"
            className={`${INPUT_CLASS} text-center tracking-[0.6em] font-mono font-bold text-lg sm:text-xl pl-4`}
          />
        </div>
      </div>

      <button type="submit" disabled={isPending || code.length !== 6} className={SUBMIT_CLASS}>
        {isPending ? (
          <>
            <Loader2 className="w-4.5 h-4.5 animate-spin text-white" />
            <span>Verifying...</span>
          </>
        ) : (
          <>
            <ShieldCheck className="w-4.5 h-4.5" />
            <span>{purpose === 'signup' ? 'Verify & Create Account' : 'Verify & Sign In'}</span>
          </>
        )}
      </button>

      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#7A6458] hover:text-[#E07B0C] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Change email</span>
        </button>

        <button
          type="button"
          onClick={onResend}
          disabled={isPending || seconds > 0}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#E07B0C] hover:text-[#C86A08] transition-colors cursor-pointer disabled:text-[#9C8A7F] disabled:cursor-not-allowed"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{seconds > 0 ? `Resend code in ${seconds}s` : 'Resend code'}</span>
        </button>
      </div>
    </form>
  )
}

function LoginForm() {
  const searchParams = useSearchParams()
  const nextParam = searchParams.get('next') || searchParams.get('redirect') || '/account'

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  // Sign in states
  const [method, setMethod] = useState<'password' | 'otp'>('password')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginOtpSent, setLoginOtpSent] = useState(false)
  const [loginCode, setLoginCode] = useState('')

  // Sign up states
  const [fullName, setFullName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupOtpSent, setSignupOtpSent] = useState(false)
  const [signupCode, setSignupCode] = useState('')

  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isPending, startTransition] = useTransition()
  const [seconds, setSeconds] = useCountdown()

  const resetFeedback = () => {
    setError('')
    setSuccessMessage('')
  }

  const switchMode = (next: 'signin' | 'signup') => {
    setMode(next)
    resetFeedback()
  }

  const switchMethod = (next: 'password' | 'otp') => {
    setMethod(next)
    setLoginOtpSent(false)
    setLoginCode('')
    setSeconds(0)
    resetFeedback()
  }

  // 1. Email + password login
  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault()
    resetFeedback()
    startTransition(async () => {
      const formData = new FormData()
      formData.append('email', loginEmail)
      formData.append('password', loginPassword)
      formData.append('redirectTo', nextParam)
      const res = await customerPasswordLogin({}, formData)
      if (res?.error) setError(res.error)
    })
  }

  // 2. Login with email OTP — send / resend
  const sendLoginCode = (e?: React.FormEvent) => {
    e?.preventDefault()
    resetFeedback()
    startTransition(async () => {
      const formData = new FormData()
      formData.append('email', loginEmail)
      const res = await requestLoginOtp({}, formData)
      if (res?.retryAfter) setSeconds(res.retryAfter)
      if (res?.error) {
        setError(res.error)
        // Cooldown error while a code already exists: still let the user enter it
        if (res.retryAfter) setLoginOtpSent(true)
        return
      }
      setLoginOtpSent(true)
      setLoginCode('')
      setSuccessMessage('Login code sent to your email.')
    })
  }

  const handleLoginOtpVerify = (e: React.FormEvent) => {
    e.preventDefault()
    resetFeedback()
    startTransition(async () => {
      const formData = new FormData()
      formData.append('email', loginEmail)
      formData.append('token', loginCode)
      formData.append('redirectTo', nextParam)
      const res = await verifyLoginOtp({}, formData)
      if (res?.error) setError(res.error)
    })
  }

  // 3. Signup with email OTP — send / resend
  const sendSignupCode = (e?: React.FormEvent) => {
    e?.preventDefault()
    resetFeedback()
    startTransition(async () => {
      const formData = new FormData()
      formData.append('full_name', fullName)
      formData.append('email', signupEmail)
      formData.append('password', signupPassword)
      const res = await requestSignupOtp({}, formData)
      if (res?.retryAfter) setSeconds(res.retryAfter)
      if (res?.error) {
        setError(res.error)
        if (res.retryAfter) setSignupOtpSent(true)
        return
      }
      setSignupOtpSent(true)
      setSignupCode('')
      setSuccessMessage('Verification code sent to your email.')
    })
  }

  const handleSignupOtpVerify = (e: React.FormEvent) => {
    e.preventDefault()
    resetFeedback()
    startTransition(async () => {
      const formData = new FormData()
      formData.append('email', signupEmail)
      formData.append('token', signupCode)
      formData.append('redirectTo', nextParam)
      const res = await verifySignupOtp({}, formData)
      if (res?.error) setError(res.error)
    })
  }

  const heading =
    mode === 'signup'
      ? signupOtpSent
        ? 'Verify Your Email'
        : 'Create New Account'
      : method === 'otp'
        ? 'Sign In with Email OTP'
        : 'Sign In to Your Account'

  const subheading =
    mode === 'signup'
      ? signupOtpSent
        ? 'Enter the 6-digit code we emailed you to finish creating your account.'
        : 'Join for 100% pure authentic spices & faster checkout.'
      : method === 'otp'
        ? loginOtpSent
          ? 'Enter the 6-digit code we emailed you.'
          : 'We will email a one-time code to your registered address.'
        : 'Access your orders, saved addresses and exclusive offers.'

  return (
    <div className="bg-white rounded-[5px] shadow-[0_4px_24px_rgba(20,54,31,0.06)] border border-[#EDE4D9] p-5 sm:p-7 lg:p-8">
      {/* ── Brand Header ── */}
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
          {heading}
        </h1>
        <p className="text-[#615147] mt-1 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">{subheading}</p>
      </div>

      {/* ── Mode Switcher Tabs ── */}
      <div className="flex rounded-[5px] bg-[#FAF7F2] p-1 border border-[#EDE4D9] mb-5">
        <button
          type="button"
          onClick={() => switchMode('signin')}
          className={`flex-1 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-[5px] transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            mode === 'signin' ? 'bg-[#E07B0C] text-white shadow-2xs' : 'text-[#7A6458] hover:text-[#14361F]'
          }`}
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In</span>
        </button>
        <button
          type="button"
          onClick={() => switchMode('signup')}
          className={`flex-1 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-[5px] transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            mode === 'signup' ? 'bg-[#E07B0C] text-white shadow-2xs' : 'text-[#7A6458] hover:text-[#14361F]'
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

      {/* ── SIGN IN ── */}
      {mode === 'signin' && (
        <>
          {/* Password / OTP method switch */}
          {!loginOtpSent && (
            <div role="tablist" className="grid grid-cols-2 mb-5 border-b border-[#EDE4D9]">
              {(
                [
                  { key: 'password', label: 'Password', icon: Lock },
                  { key: 'otp', label: 'Email OTP', icon: KeyRound },
                ] as const
              ).map(({ key, label, icon: Icon }) => {
                const active = method === key
                return (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => switchMethod(key)}
                    className={`-mb-px flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
                      active
                        ? 'border-[#E07B0C] text-[#E07B0C]'
                        : 'border-transparent text-[#7A6458] hover:text-[#14361F] hover:border-[#EDE4D9]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                )
              })}
            </div>
          )}

          {method === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label htmlFor="login-email" className={LABEL_CLASS}>
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
                    className={INPUT_CLASS}
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#8C766E] pointer-events-none" />
                </div>
              </div>

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
                    className={INPUT_CLASS}
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#8C766E] pointer-events-none" />
                </div>
              </div>

              <button type="submit" disabled={isPending} className={SUBMIT_CLASS}>
                {isPending ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin text-white" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4.5 h-4.5" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>
          )}

          {method === 'otp' && !loginOtpSent && (
            <form onSubmit={sendLoginCode} className="space-y-4">
              <div>
                <label htmlFor="login-otp-email" className={LABEL_CLASS}>
                  Registered Email
                </label>
                <div className="relative">
                  <input
                    id="login-otp-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@example.com"
                    className={INPUT_CLASS}
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#8C766E] pointer-events-none" />
                </div>
              </div>

              <button type="submit" disabled={isPending} className={SUBMIT_CLASS}>
                {isPending ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin text-white" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4.5 h-4.5" />
                    <span>Send Login Code</span>
                  </>
                )}
              </button>
            </form>
          )}

          {method === 'otp' && loginOtpSent && (
            <OtpStep
              email={loginEmail}
              purpose="login"
              code={loginCode}
              onCodeChange={setLoginCode}
              seconds={seconds}
              isPending={isPending}
              onResend={() => sendLoginCode()}
              onBack={() => switchMethod('otp')}
              onSubmit={handleLoginOtpVerify}
            />
          )}
        </>
      )}

      {/* ── CREATE ACCOUNT ── */}
      {mode === 'signup' && !signupOtpSent && (
        <form onSubmit={sendSignupCode} className="space-y-4">
          <div>
            <label htmlFor="signup-name" className={LABEL_CLASS}>
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
                className={INPUT_CLASS}
              />
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#8C766E] pointer-events-none" />
            </div>
          </div>

          <div>
            <label htmlFor="signup-email" className={LABEL_CLASS}>
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
                className={INPUT_CLASS}
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#8C766E] pointer-events-none" />
            </div>
          </div>

          <div>
            <label htmlFor="signup-password" className={LABEL_CLASS}>
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
                className={INPUT_CLASS}
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#8C766E] pointer-events-none" />
            </div>
          </div>

          <button type="submit" disabled={isPending} className={SUBMIT_CLASS}>
            {isPending ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin text-white" />
                <span>Sending Code...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4.5 h-4.5" />
                <span>Send Verification Code</span>
              </>
            )}
          </button>
        </form>
      )}

      {mode === 'signup' && signupOtpSent && (
        <OtpStep
          email={signupEmail}
          purpose="signup"
          code={signupCode}
          onCodeChange={setSignupCode}
          seconds={seconds}
          isPending={isPending}
          onResend={() => sendSignupCode()}
          onBack={() => {
            setSignupOtpSent(false)
            setSignupCode('')
            setSeconds(0)
            resetFeedback()
          }}
          onSubmit={handleSignupOtpVerify}
        />
      )}

      {/* ── Trust & Terms Footer ── */}
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
    <Suspense fallback={<div className="p-6 text-center text-xs text-[#7A6458]">Loading login screen...</div>}>
      <LoginForm />
    </Suspense>
  )
}
