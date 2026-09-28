'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Check, Copy, FileText, WandSparkles } from 'lucide-react'

interface SourceRef { name: string; page: number; relevance?: string }
interface ChatMessageProps { role: 'user' | 'assistant'; content: string; timestamp: string; sources?: SourceRef[]; bubbleColor?: string }

export default function ChatMessage({ role, content, timestamp, sources, bubbleColor }: ChatMessageProps) {
  const isUser = role === 'user'; const [copied, setCopied] = useState(false)
  const copy = async () => { await navigator.clipboard?.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 1400) }
  return <div className={`mb-5 flex ${isUser ? 'justify-end' : 'justify-start'} gap-3`}>
    {!isUser && <div className="mt-1 grid size-8 shrink-0 place-items-center rounded-xl bg-[#f0e8ff] text-[#6a15fc]"><WandSparkles className="size-4" /></div>}
    <div className={`${isUser ? 'max-w-xs rounded-2xl rounded-tr-sm text-white lg:max-w-md xl:max-w-lg' : 'max-w-2xl rounded-2xl rounded-tl-sm border border-[#eadffb] bg-white text-[#342b42] shadow-sm'} p-4 transition-shadow hover:shadow-md`} style={isUser && bubbleColor ? { backgroundColor: bubbleColor } : undefined}>
      <div className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : 'prose-headings:text-[#201b29] prose-p:text-[#4e4264] prose-strong:text-[#201b29] prose-code:text-[#6a15fc]'}`}><ReactMarkdown components={{ code({ className, children, ...props }) { const block = className?.includes('language-'); return block ? <pre className="overflow-x-auto rounded-xl bg-[#201b29] p-3 text-xs text-white"><code {...props}>{children}</code></pre> : <code className="rounded bg-[#f0e8ff] px-1 py-0.5" {...props}>{children}</code> } }}>{content}</ReactMarkdown></div>
      {sources?.length ? <div className="mt-4 border-t border-[#eadffb] pt-3"><p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#8c7c9e]">Sources</p><div className="grid gap-2">{sources.map((source) => <button key={source.name} className="flex w-full items-center gap-3 rounded-xl border border-[#eadffb] bg-[#fcfaff] p-2.5 text-left transition hover:-translate-y-0.5 hover:border-[#b895ff] hover:bg-[#f4eaff]"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#f0e8ff] text-[#6a15fc]"><FileText className="size-4" /></span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-[#342b42]">{source.name}</span><span className="text-[10px] text-[#8c7c9e]">Page {source.page} · {source.relevance ?? 'Relevant source'}</span></span></button>)}</div></div> : null}
      <div className={`mt-3 flex items-center justify-between gap-3 text-[10px] ${isUser ? 'text-white/70' : 'text-[#9a8da8]'}`}><span>{timestamp}</span>{!isUser && <div className="flex items-center gap-1"><button aria-label="Copy response" onClick={copy} className="rounded-md p-1.5 hover:bg-[#f0e8ff]">{copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}</button></div>}</div>
    </div>
  </div>
}
