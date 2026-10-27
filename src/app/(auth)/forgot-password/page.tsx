'use client'

import { useState, useTransition } from 'react'
import { requestPasswordReset } from '@/actions/auth'
import { Mail, ArrowLeft, Send, CheckCircle2, ShieldAlert } from 'lucide-react'
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
          Reset Your Password
        </h1>
        <p className="text-[#6E5951] mt-1 text-xs sm:text-sm">
          Enter your registered email address and we will send you a secure password reset link via Brevo.
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {isSuccess ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <h2 className="font-serif text-lg font-bold text-[#14361F]">
            Password Reset Link Sent!
          </h2>

          <div className="p-4 rounded-2xl bg-[#FDF9F3] border border-[#F09819]/40 text-xs sm:text-sm text-[#6E5951] text-left space-y-2">
            <p>
              We have sent a secure password reset link to <strong className="text-[#14361F]">{email}</strong>.
            </p>
            <p className="text-[11px] text-[#8C7567]">
              ⏳ The link is valid for <strong>15 minutes</strong>. If you don't see it within 1–2 minutes, please check your Spam or Promotions folder.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-[#FDF9F3] hover:bg-[#F2EAE1] text-[#14361F] font-semibold text-xs rounded-full border border-[#D4C7BA] transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="reset-email" className="block text-xs font-semibold text-[#14361F] uppercase tracking-wider mb-1.5">
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
                className="w-full px-4 py-3 pl-11 rounded-xl border border-[#D4C7BA] bg-white text-[#14361F] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#E07B0C]/30 focus:border-[#E07B0C] text-sm transition-all shadow-inner"
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-[#E07B0C] to-[#D1491B] hover:from-[#2D1409] hover:to-[#E07B0C] text-white font-bold rounded-full shadow-lg shadow-[#E07B0C]/20 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed transition-all text-sm flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:scale-98 cursor-pointer"
          >
            {isPending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Reset Link</span>
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E07B0C] hover:text-[#2D1409] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}
