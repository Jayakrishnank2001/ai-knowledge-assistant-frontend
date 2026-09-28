'use client'

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, FileText, MessageSquare, Sparkles, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { api, OverviewStats, RecentDocument } from '@/lib/api'

const questions = [
  'How many annual leave days do employees receive?',
  'What are the password requirements?',
  'How do I request parental leave?',
]

export default function OverviewPage({ onAsk }: { onAsk: () => void }) {
  const navigate = useNavigate()
  const [stats, setStats] = useState<OverviewStats | null>(null)
  const [recent, setRecent] = useState<RecentDocument[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    void Promise.all([api.stats(), api.recentDocuments()])
      .then(([statsResult, recentResult]) => {
        setStats(statsResult)
        setRecent(recentResult)
        setError('')
      })
      .catch((requestError) => {
        setError(
          requestError instanceof Error ? requestError.message : 'Could not load workspace data',
        )
      })
  }, [])

  const statCards: [string, string, any][] = [
    [stats ? String(stats.documents) : '—', 'Documents', FileText],
    [stats ? String(stats.pages) : '—', 'Pages', FileText],
    [stats ? `${stats.processedPercent}%` : '—', 'Processed', TrendingUp],
    [stats ? String(stats.conversations) : '—', 'Conversations', MessageSquare],
  ]

  const statusOf = (status: string) => {
    if (status === 'completed') return { className: 'processed', label: 'Processed' }
    if (status === 'processing') return { className: 'processing', label: 'Processing' }
    return { className: 'failed', label: 'Failed' }
  }

  return (
    <section className="min-h-screen bg-[#faf9fc] px-5 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="eyebrow">Workspace overview</p>
            <h1 className="page-title">Your knowledge,<br /><span className="gradient-text">always within reach.</span></h1>
            <p className="mt-4 max-w-xl text-base text-[#6d6878]">Search across your documents and get grounded answers in seconds.</p>
          </div>
          <Button onClick={onAsk} className="hidden rounded-full bg-[#5517dd] px-5 shadow-[0_10px_24px_-12px_#5517dd] hover:bg-[#4310bd] sm:flex"><MessageSquare data-icon="inline-start" />Ask your knowledge base</Button>
        </div>

        <Button onClick={onAsk} className="mb-6 rounded-full bg-[#5517dd] px-5 sm:hidden">Ask your knowledge base</Button>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map(([value, label, Icon]) => (
            <div key={String(label)} className="stat-card">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-semibold tracking-tight text-[#191522]">{value}</span>
                <span className="rounded-xl bg-[#f0e8ff] p-2 text-[#6b24e8]"><Icon /></span>
              </div>
              <span className="mt-2 text-sm text-[#777180]">{label}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <div className="surface-card">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="section-title">Recent documents</h2>
                <p className="muted">Your latest knowledge base updates</p>
              </div>
              <button className="icon-link" onClick={() => navigate('/documents')}>View all <ArrowUpRight /></button>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              {error && <p className="text-sm text-red-600">{error}</p>}
              {!error && recent.length === 0 && (
                <p className="text-sm text-[#8a8491]">No documents uploaded yet.</p>
              )}
              {recent.map((doc) => {
                const { className, label } = statusOf(doc.status)
                return (
                  <div key={doc.id} className="list-row">
                    <span className="file-icon"><FileText /></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#201b29]">{doc.name}</p>
                      <p className="text-xs text-[#8a8491]">{doc.pages} pages · {doc.daysAgo} day{doc.daysAgo === 1 ? '' : 's'} ago</p>
                    </div>
                    <span className={`status ${className}`}>{label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="surface-card">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="section-title">Knowledge activity</h2>
                <p className="muted">
                  {stats ? `${stats.questionsAnswered} questions answered` : 'Questions answered'}
                </p>
              </div>
              <Sparkles className="text-[#a433e8]" />
            </div>
            <div className="mt-8 flex h-28 items-end gap-2">
              {[35, 52, 44, 68, 58, 82, 76, 94, 70, 88, 100, 84].map((height, i) => (
                <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-[#741de5] to-[#d939cb] opacity-80" style={{ height: `${height}%` }} />
              ))}
            </div>
            <div className="mt-3 flex justify-between text-xs text-[#948e9c]"><span>Mon</span><span>Today</span></div>
          </div>
        </div>

        <div className="mt-6 surface-card">
          <h2 className="section-title">Frequently asked questions</h2>
          <div className="mt-4 grid gap-2 md:grid-cols-3">
            {questions.map((q) => (
              <button key={q} onClick={() => navigate(`/chat?question=${encodeURIComponent(q)}`)} className="rounded-xl bg-[#faf8fd] p-4 text-left text-sm text-[#554e61] transition hover:bg-[#f1e9ff] hover:text-[#5517dd]">{q}<ArrowUpRight className="mt-3 text-[#a28cae]" /></button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}