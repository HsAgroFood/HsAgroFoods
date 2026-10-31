'use client'

import { useState, useRef } from 'react'
import { submitInquiry } from '@/actions/contact'
import { Loader2, CheckCircle2, Send } from 'lucide-react'

export function ContactForm() {
  const [isPending, setIsPending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const result = await submitInquiry(formData)

    if (result.success) {
      setSuccess(true)
      formRef.current?.reset()
    } else {
      setError(result.error || 'Failed to submit inquiry. Please try again.')
    }

    setIsPending(false)
  }

  if (success) {
    return (
      <div className="bg-white rounded-[5px] shadow-md border border-[#EDE4D9] p-8 sm:p-10 text-center flex flex-col items-center justify-center min-h-[420px] animate-in fade-in zoom-in-95 duration-300">
        <div className="w-14 h-14 rounded-[5px] bg-[#FAF3EB] border border-[#F09819]/40 flex items-center justify-center text-[#E07B0C] mb-4 shadow-2xs">
          <CheckCircle2 className="w-7 h-7 text-[#E07B0C]" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-[#14361F] mb-2">Message Sent Successfully!</h3>
        <p className="text-sm text-[#5A433B] max-w-md leading-relaxed">
          Thank you for reaching out to HS AgroFoods. Our spice care team has received your message and will respond within 24 hours.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-6 inline-flex items-center justify-center rounded-[5px] bg-[#E07B0C] hover:bg-[#C96B06] px-7 py-3 text-xs sm:text-sm font-bold tracking-wider uppercase text-white shadow-md shadow-[#E07B0C]/25 transition-all active:scale-95 cursor-pointer"
        >
          Send Another Message
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-[5px] shadow-md border border-[#EDE4D9] p-6 sm:p-8 lg:p-10">
      <div className="mb-6 space-y-1.5">
        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#E07B0C]">
          Direct Inquiry
        </span>
        <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#14361F]">Send Us a Message</h3>
        <p className="text-xs sm:text-sm text-[#7A6458]">Fill out the form below and we will get right back to you.</p>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-medium rounded-[5px]">
          {error}
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <div>
            <label htmlFor="first-name" className="block text-xs sm:text-sm font-semibold text-[#14361F] mb-1.5">
              First Name <span className="text-[#E07B0C]">*</span>
            </label>
            <input
              required
              type="text"
              name="first-name"
              id="first-name"
              placeholder="e.g. Ramesh"
              className="block w-full rounded-[5px] border border-[#EDE4D9] bg-[#FAF7F2] py-2.5 px-3.5 text-xs sm:text-sm text-[#14361F] placeholder:text-[#9C8A7F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E07B0C]/20 focus:border-[#E07B0C] transition-all"
            />
          </div>
          <div>
            <label htmlFor="last-name" className="block text-xs sm:text-sm font-semibold text-[#14361F] mb-1.5">
              Last Name <span className="text-[#E07B0C]">*</span>
            </label>
            <input
              required
              type="text"
              name="last-name"
              id="last-name"
              placeholder="e.g. Sharma"
              className="block w-full rounded-[5px] border border-[#EDE4D9] bg-[#FAF7F2] py-2.5 px-3.5 text-xs sm:text-sm text-[#14361F] placeholder:text-[#9C8A7F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E07B0C]/20 focus:border-[#E07B0C] transition-all"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-[#14361F] mb-1.5">
            Email Address <span className="text-[#E07B0C]">*</span>
          </label>
          <input
            required
            type="email"
            name="email"
            id="email"
            placeholder="you@example.com"
            className="block w-full rounded-[5px] border border-[#EDE4D9] bg-[#FAF7F2] py-2.5 px-3.5 text-xs sm:text-sm text-[#14361F] placeholder:text-[#9C8A7F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E07B0C]/20 focus:border-[#E07B0C] transition-all"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-xs sm:text-sm font-semibold text-[#14361F] mb-1.5">
            Your Message or Inquiry <span className="text-[#E07B0C]">*</span>
          </label>
          <textarea
            required
            name="message"
            id="message"
            rows={4}
            placeholder="Tell us what you are looking for (e.g. product questions, bulk spice orders, restaurant supply, packaging requests)..."
            className="block w-full rounded-[5px] border border-[#EDE4D9] bg-[#FAF7F2] py-2.5 px-3.5 text-xs sm:text-sm text-[#14361F] placeholder:text-[#9C8A7F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E07B0C]/20 focus:border-[#E07B0C] transition-all resize-none"
          ></textarea>
        </div>

        <div className="pt-2">
          <button 
            type="submit" 
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 rounded-[5px] bg-[#E07B0C] hover:bg-[#C96B06] px-6 py-3.5 text-center text-xs sm:text-sm font-bold tracking-wider uppercase text-white shadow-md shadow-[#E07B0C]/25 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending Message...</span>
              </>
            ) : (
              <>
                <span>Send Message</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
