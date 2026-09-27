'use client'

import { useEffect, useState } from 'react'
import { User, Bot, type LucideIcon } from 'lucide-react'
import { api, AiPreferences, AuthUser, saveUser } from '@/lib/api'

interface SettingsPageProps {
  user: AuthUser | null
  onUserChange?: (user: AuthUser) => void
}

/** Human labels for the Gemini model ids returned by the backend. */
const MODEL_LABELS: Record<string, string> = {
  'gemini-3.8-flash': 'Gemini 3.8 Flash (latest)',
  'gemini-3.6-flash': 'Gemini 3.6 Flash',
  'gemini-2.5-flash': 'Gemini 2.5 Flash (stable)',
}

function modelLabel(id: string): string {
  return MODEL_LABELS[id] ?? id
}

export default function SettingsPage({ user, onUserChange }: SettingsPageProps) {
  const [tab, setTab] = useState('Profile')
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [workspaceName, setWorkspaceName] = useState(user?.workspaceName ?? '')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)

  // AI Preferences tab state
  const [preferences, setPreferences] = useState<AiPreferences | null>(null)
  const [selectedModel, setSelectedModel] = useState('')
  const [prefsLoading, setPrefsLoading] = useState(false)
  const [prefsSaving, setPrefsSaving] = useState(false)
  const [prefsStatus, setPrefsStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)

  const tabs: [string, LucideIcon][] = [
    ['Profile', User],
    ['AI Preferences', Bot],
  ]

  // keep the form in sync when the logged-in user is restored or updated
  useEffect(() => {
    setName(user?.name ?? '')
    setEmail(user?.email ?? '')
    setWorkspaceName(user?.workspaceName ?? '')
  }, [user])

  // load the current chat model when the AI Preferences tab is opened
  useEffect(() => {
    if (tab !== 'AI Preferences' || preferences) return
    let cancelled = false
    setPrefsLoading(true)
    api
      .getAiPreferences()
      .then((prefs) => {
        if (cancelled) return
        setPreferences(prefs)
        setSelectedModel(prefs.chatModel)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setPrefsStatus({
          kind: 'error',
          text: error instanceof Error ? error.message : 'Could not load AI preferences',
        })
      })
      .finally(() => {
        if (!cancelled) setPrefsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [tab, preferences])

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

  const savePreferences = async () => {
    if (prefsSaving || !selectedModel) return
    setPrefsSaving(true)
    setPrefsStatus(null)
    try {
      const updated = await api.updateAiPreferences(selectedModel)
      setPreferences(updated)
      setSelectedModel(updated.chatModel)
      setPrefsStatus({ kind: 'ok', text: 'Chat model saved and applied.' })
    } catch (error) {
      setPrefsStatus({
        kind: 'error',
        text: error instanceof Error ? error.message : 'Could not save AI preferences',
      })
    } finally {
      setPrefsSaving(false)
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
          {tab === 'Profile' ? (
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
          ) : (
          <div className="surface-card">
            <h2 className="section-title">AI Preferences</h2>
            <p className="muted mt-1">
              Choose which Gemini model powers chat answers. Retrieval and embeddings are
              unaffected.
            </p>
            {prefsLoading ? (
              <p className="mt-7 text-sm text-[#777180]">Loading preferences...</p>
            ) : (
              <>
                <label className="field mt-7 max-w-md">
                  Chat model
                  <div className="relative">
                    <Bot
                      aria-hidden="true"
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9b7bb9]"
                    />
                    <select
                      className="w-full"
                      value={selectedModel}
                      onChange={(e) => {
                        setSelectedModel(e.target.value)
                        setPrefsStatus(null)
                      }}
                    >
                      {(preferences?.availableModels ?? [selectedModel])
                        .filter(Boolean)
                        .map((model) => (
                          <option key={model} value={model}>
                            {modelLabel(model)}
                          </option>
                        ))}
                    </select>
                  </div>
                </label>
                <p className="mt-3 text-sm text-[#777180]">
                  The selected model is saved to the backend and takes effect
                  immediately - no restart needed.
                </p>
                {prefsStatus && (
                  <p
                    role="status"
                    className={`mt-4 text-sm ${prefsStatus.kind === 'ok' ? 'text-emerald-600' : 'text-red-600'}`}
                  >
                    {prefsStatus.text}
                  </p>
                )}
                <button
                  onClick={() => void savePreferences()}
                  disabled={prefsSaving || !selectedModel}
                  className="mt-7 rounded-full bg-[#5517dd] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#4310bd] disabled:opacity-60"
                >
                  {prefsSaving ? 'Saving...' : 'Save preferences'}
                </button>
              </>
            )}
          </div>
          )}
        </div>
      </div>
    </section>
  )
}