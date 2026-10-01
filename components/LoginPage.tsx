'use client'

import React, { useState } from 'react'
import { ArrowUpRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { api, AuthUser } from '@/lib/api'

interface LoginResult {
  success: boolean
  error?: string
}

/** The auth card walks through signin -> signup (details) -> otp (code entry). */
type AuthView = 'signin' | 'signup' | 'otp'

export default function LoginPage({
  onLogin,
  onAuthenticated,
}: {
  onLogin: (email: string, password: string) => Promise<LoginResult>
  /** Called after OTP verification - the backend already created the session. */
  onAuthenticated: (token: string, user: AuthUser) => void
}) {
  const [view, setView] = useState<AuthView>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  /** Dev-only hint when the email service is unconfigured (backend echoes the code back). */
  const [devOtp, setDevOtp] = useState<string | null>(null)
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const goTo = (next: AuthView) => {
    setView(next)
    setError('')
    setInfo('')
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (loading) return
    setLoading(true)
    setError('')
    const result = await onLogin(email, password)
    if (!result.success) {
      setError(result.error ?? 'Unable to sign in. Please try again.')
    }
    setLoading(false)
  }

  /** Sign-up step 1: send the OTP, then move to the code-entry view. */
  const startSignup = async (event: React.FormEvent) => {
    event.preventDefault()
    if (loading) return
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    setError('')
    setInfo('')
    try {
      const result = await api.signupStart(email, password)
      setDevOtp(result.devOtp ?? null)
      setInfo(result.message)
      setOtp('')
      setView('otp')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start signup. Please try again.')
    }
    setLoading(false)
  }

  /** Sign-up step 2: verify the code - success logs the user straight in. */
  const verifyCode = async (event: React.FormEvent) => {
    event.preventDefault()
    if (loading) return
    if (otp.length !== 6) {
      setError('Enter the 6-digit code we emailed you.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { token, user } = await api.signupVerify(email, otp)
      onAuthenticated(token, user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to verify the code. Please try again.')
      setLoading(false)
    }
  }

  /** Ask the backend for a fresh code for the same email + password. */
  const resendCode = async () => {
    if (loading) return
    setLoading(true)
    setError('')
    setInfo('')
    try {
      const result = await api.signupStart(email, password)
      setDevOtp(result.devOtp ?? null)
      setInfo('A new code has been sent to your email.')
      setOtp('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to resend the code. Please try again.')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#faf9fc] p-4 sm:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl overflow-hidden rounded-[2rem] bg-white shadow-[0_25px_80px_-35px_rgba(65,13,127,.3)] lg:grid-cols-[1.15fr_.85fr]">
        <section className="relative overflow-hidden bg-gradient-to-br from-[#5312dc] via-[#a513e5] to-[#ef38bd] p-8 text-white sm:p-14 lg:p-20">
          <div className="absolute -right-20 top-20 size-72 rounded-full border border-white/20" />
          <div className="absolute -bottom-32 -left-16 size-96 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex h-full flex-col">
            <div className="flex items-center gap-2 font-semibold"><span className="grid size-9 place-items-center rounded-xl bg-white text-[#6419da]">N</span>Nexa <span className="text-white/70">AI</span></div>
            <div className="my-auto max-w-xl py-20"><p className="mb-8 flex items-center gap-2 text-sm text-white/70"><Sparkles /> AI knowledge, reimagined</p><h1 className="text-5xl font-bold leading-[.98] tracking-[-.065em] sm:text-7xl">Turn your documents into <span className="text-[#ffd5f6]">instant answers.</span></h1><p className="mt-8 max-w-md text-lg leading-relaxed text-white/75">Ask questions across your company&apos;s knowledge base and get grounded answers with sources.</p><div className="mt-10 flex items-center gap-2 text-sm font-medium">Explore your knowledge <ArrowUpRight /></div></div>
            <p className="text-xs text-white/55">Trusted by teams building the future of work.</p>
          </div>
        </section>
        <section className="flex items-center justify-center p-7 sm:p-14"><div className="w-full max-w-sm">
          {view === 'otp' ? (
            <>
              <p className="mb-3 text-sm font-medium text-[#8d42e8]">Check your inbox</p>
              <h2 className="text-4xl font-bold tracking-[-.05em] text-[#201534]">Enter the code</h2>
              <p className="mt-3 text-sm text-[#786b88]">We sent a 6-digit code to <span className="font-semibold text-[#342641]">{email}</span>. It expires in 10 minutes.</p>
            </>
          ) : view === 'signup' ? (
            <>
              <p className="mb-3 text-sm font-medium text-[#8d42e8]">Create your account</p>
              <h2 className="text-4xl font-bold tracking-[-.05em] text-[#201534]">Sign up to Nexa</h2>
              <p className="mt-3 text-sm text-[#786b88]">Set up your account - we&apos;ll email you a verification code.</p>
            </>
          ) : (
            <>
              <p className="mb-3 text-sm font-medium text-[#8d42e8]">Welcome back</p>
              <h2 className="text-4xl font-bold tracking-[-.05em] text-[#201534]">Sign in to Nexa</h2>
              <p className="mt-3 text-sm text-[#786b88]">Continue to your private knowledge workspace.</p>
            </>
          )}
          {view === 'signin' && (
          <form onSubmit={submit} className="mt-9 flex flex-col gap-5">
            {error && (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
            <label className="flex flex-col gap-2 text-sm font-medium text-[#342641]">Email address<div className="relative"><Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9b7bb9]" /><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="h-12 w-full rounded-xl border border-[#e4d8ef] bg-[#fcfaff] pl-12 pr-4 outline-none transition focus:border-[#a855f7] focus:ring-4 focus:ring-[#a855f7]/10" /></div></label>
            <label className="flex flex-col gap-2 text-sm font-medium text-[#342641]">Password<div className="relative"><LockKeyhole className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9b7bb9]" /><input type={show ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="h-12 w-full rounded-xl border border-[#e4d8ef] bg-[#fcfaff] pl-12 pr-12 outline-none transition focus:border-[#a855f7] focus:ring-4 focus:ring-[#a855f7]/10" /><button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9b7bb9]" aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff /> : <Eye />}</button></div></label>
            <button type="button" onClick={() => goTo('signup')} className="text-center text-sm text-[#786b88]">
              Don&apos;t have an account? <span className="font-semibold text-[#8d42e8] transition hover:text-[#6b24e8]">Create account?</span>
            </button>
            <Button type="submit" disabled={loading} className="h-12 rounded-xl bg-[#5517dd] text-base hover:bg-[#4310bd]">{loading ? 'Signing in...' : 'Sign in'}</Button>
          </form>
          )}

          {view === 'signup' && (
            <form onSubmit={startSignup} className="mt-9 flex flex-col gap-5">
              {error && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}
              <label className="flex flex-col gap-2 text-sm font-medium text-[#342641]">Email address<div className="relative"><Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9b7bb9]" /><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="h-12 w-full rounded-xl border border-[#e4d8ef] bg-[#fcfaff] pl-12 pr-4 outline-none transition focus:border-[#a855f7] focus:ring-4 focus:ring-[#a855f7]/10" /></div></label>
              <label className="flex flex-col gap-2 text-sm font-medium text-[#342641]">Create password<div className="relative"><LockKeyhole className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9b7bb9]" /><input type={show ? 'text' : 'password'} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="h-12 w-full rounded-xl border border-[#e4d8ef] bg-[#fcfaff] pl-12 pr-12 outline-none transition focus:border-[#a855f7] focus:ring-4 focus:ring-[#a855f7]/10" /><button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9b7bb9]" aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff /> : <Eye />}</button></div><span className="text-xs font-normal text-[#786b88]">At least 6 characters. We&apos;ll email you a code to confirm it.</span></label>
              <Button type="submit" disabled={loading} className="h-12 rounded-xl bg-[#5517dd] text-base hover:bg-[#4310bd]">{loading ? 'Sending code...' : 'Create account'}</Button>
              <button type="button" onClick={() => goTo('signin')} className="text-center text-sm text-[#786b88]">
                Already have an account? <span className="font-semibold text-[#8d42e8] transition hover:text-[#6b24e8]">Sign in</span>
              </button>
            </form>
          )}
          {view === 'otp' && (
            <form onSubmit={verifyCode} className="mt-9 flex flex-col gap-5">
              {error && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}
              {info && (
                <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{info}</p>
              )}
              {devOtp && (
                <p className="rounded-xl border border-[#e4d8ef] bg-[#f6f1ff] px-3 py-2 text-sm text-[#5c3ea8]">
                  Dev mode (email not configured): your code is <strong className="tracking-[0.35em]">{devOtp}</strong>
                </p>
              )}
              <label className="flex flex-col gap-2 text-sm font-medium text-[#342641]">6-digit code<div className="relative"><ShieldCheck className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9b7bb9]" /><input inputMode="numeric" autoComplete="one-time-code" maxLength={6} required value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" className="h-12 w-full rounded-xl border border-[#e4d8ef] bg-[#fcfaff] pl-12 pr-4 text-lg font-semibold tracking-[0.4em] outline-none transition focus:border-[#a855f7] focus:ring-4 focus:ring-[#a855f7]/10" /></div></label>
              <Button type="submit" disabled={loading} className="h-12 rounded-xl bg-[#5517dd] text-base hover:bg-[#4310bd]">{loading ? 'Verifying...' : 'Verify and sign in'}</Button>
              <div className="flex items-center justify-between text-sm">
                <button type="button" onClick={() => goTo('signin')} className="font-medium text-[#786b88] transition hover:text-[#342641]">Back to sign in</button>
                <button type="button" onClick={resendCode} disabled={loading} className="font-medium text-[#8d42e8] transition hover:text-[#6b24e8] disabled:opacity-60">Resend code</button>
              </div>
            </form>
          )}
        </div></section>
      </div>
    </main>
  )
}
