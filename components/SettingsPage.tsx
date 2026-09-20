'use client'

import { useEffect, useState } from 'react'
import { User, Bot, Shield, Database, type LucideIcon } from 'lucide-react'
import { api, AuthUser, saveUser } from '@/lib/api'

interface SettingsPageProps {
  user: AuthUser | null
  onUserChange?: (user: AuthUser) => void
}

export default function SettingsPage({ user, onUserChange }: SettingsPageProps) {
  const [tab, setTab] = useState('Profile')
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [workspaceName, setWorkspaceName] = useState(user?.workspaceName ?? '')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const tabs: [string, LucideIcon][] = [
    ['Profile', User],
    ['AI Preferences', Bot],
    ['Knowledge Base', Database],
    ['Security', Shield],
  ]

  // keep the form in sync when the logged-in user is restored or updated
  useEffect(() => {
    setName(user?.name ?? '')
    setEmail(user?.email ?? '')
    setWorkspaceName(user?.workspaceName ?? '')
  }, [user])

  const save = async () => {
    if (saving) return
    setSaving(true)
    setStatus(null)
    try {
      const updated = await api.updateProfile({ name, email, workspaceName })
      saveUser(updated)
      onUserChange?.(updated)
      setStatus({ kind: 'ok', text: 'Changes saved.' })
    } catch (error) {
      setStatus({
        kind: 'error',
        text: error instanceof Error ? error.message : 'Could not save changes',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="min-h-screen bg-[#faf9fc] px-5 py-8 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <p className="eyebrow">Workspace settings</p>
        <h1 className="page-title">Settings</h1>
        <p className="mt-3 text-[#777180]">Manage your account and knowledge assistant preferences.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-[210px_1fr]">
          <nav className="flex gap-2 overflow-auto md:flex-col">
            {tabs.map(([tabName, Icon]) => (
              <button
                key={tabName}
                onClick={() => setTab(String(tabName))}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${tab === tabName ? 'bg-[#efe6ff] font-medium text-[#5517dd]' : 'text-[#777180] hover:bg-white'}`}
              >
                <Icon />
                {tabName}
              </button>
            ))}
          </nav>
          <div className="surface-card">
            <h2 className="section-title">{tab}</h2>
            <p className="muted mt-1">Keep your Nexa AI workspace tailored to the way you work.</p>
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <label className="field">
                Full name
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </label>
              <label className="field">
                Email address
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                />
              </label>
              <label className="field sm:col-span-2">
                Workspace name
                <input
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="Acme knowledge base"
                />
              </label>
            </div>
            {status && (
              <p
                role="status"
                className={`mt-4 text-sm ${status.kind === 'ok' ? 'text-emerald-600' : 'text-red-600'}`}
              >
                {status.text}
              </p>
            )}
            <button
              onClick={() => void save()}
              disabled={saving}
              className="mt-7 rounded-full bg-[#5517dd] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#4310bd] disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}