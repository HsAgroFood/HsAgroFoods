'use client'

import { useState, useTransition } from 'react'
import { requestPasswordReset } from '@/actions/auth'
import { Mail, ArrowLeft, Send, CheckCircle2, ShieldAlert, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      const formData = new FormData()
      formData.append('email', email)
      const res = await requestPasswordReset({}, formData)
      if (res.error) {
        setError(res.error)
      } else {
        setIsSuccess(true)
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
          Reset Your Password
        </h1>
        <p className="text-[#615147] mt-1 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
          Enter your registered email address and we will send you a secure password reset link.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-[5px] bg-[#FFF5F5] border border-[#FEB2B2] text-red-700 text-xs sm:text-sm flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <span className="leading-snug">{error}</span>
        </div>
      )}

      {isSuccess ? (
        <div className="text-center py-2 space-y-3.5">
          <div className="w-12 h-12 bg-[#EBF3ED] text-[#144D29] border border-[#CFE3D3] rounded-[5px] flex items-center justify-center mx-auto shadow-2xs">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <h2 className="font-serif text-lg sm:text-xl font-bold text-[#14361F]">
            Reset Link Sent!
          </h2>

          <div className="p-4 rounded-[5px] bg-[#FAF7F2] border border-[#EDE4D9] text-xs sm:text-sm text-[#615147] text-left space-y-2">
            <p>
              We have sent a secure password reset link to <strong className="text-[#14361F]">{email}</strong>.
            </p>
            <p className="text-xs text-[#8C766E]">
              The link is valid for <strong>15 minutes</strong>. If you do not see it, please check your Spam or Promotions folder.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-[#E07B0C] hover:bg-[#C86A08] text-white font-bold text-sm sm:text-base rounded-[5px] transition-all cursor-pointer shadow-sm active:scale-[0.98]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reset-email" className="block text-xs sm:text-[13px] font-bold text-[#14361F] uppercase tracking-wider mb-1.5">
              Account Email Address
            </label>
            <div className="relative">
              <input
                id="reset-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-[5px] border border-[#EDE4D9] bg-[#FAF7F2] text-[#14361F] placeholder:text-[#9C8A7F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#E07B0C] focus:border-[#E07B0C] text-sm sm:text-base transition-all"
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#8C766E] pointer-events-none" />
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
                <span>Sending Reset Link...</span>
              </>
            ) : (
              <>
                <Send className="w-4.5 h-4.5" />
                <span>Send Reset Link</span>
              </>
            )}
          </button>

          <div className="text-center pt-3 border-t border-[#EDE4D9] mt-3.5">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#7A6458] hover:text-[#E07B0C] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}
