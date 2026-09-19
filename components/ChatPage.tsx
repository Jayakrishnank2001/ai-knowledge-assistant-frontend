'use client'

import React, { useEffect, useRef, useState } from 'react'
import Header from './Header'
import ChatMessage from './ChatMessage'
import { Check, ChevronDown, FileText, MoreHorizontal, Paperclip, Send, Sparkles, ThumbsDown, ThumbsUp, WandSparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Message { role: 'user' | 'assistant'; content: string; timestamp: string; sources?: { name: string; page: number; relevance?: string }[] }

const initialMessages: Message[] = [
  { role: 'user', content: 'How many days of annual leave do employees get?', timestamp: '10:24 AM' },
  { role: 'assistant', content: '## Annual leave allowance\n\nEmployees are entitled to **24 days** of annual leave per year according to the company\'s leave policy.', timestamp: '10:24 AM', sources: [{ name: 'Leave Policy.pdf', page: 12, relevance: '98% match' }] },
  { role: 'user', content: 'What are the working hours for employees?', timestamp: '10:25 AM' },
  { role: 'assistant', content: 'According to the company policy, the standard working hours are **9:00 AM to 5:00 PM**, Monday to Friday. Employees are also allowed a 1-hour lunch break.', timestamp: '10:25 AM', sources: [{ name: 'Employee Handbook.pdf', page: 8, relevance: '95% match' }] },
]

const suggestions = ['What are the working hours?', 'How do I request leave?', 'What are the password requirements?', 'Can I work remotely?']

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingPhase, setLoadingPhase] = useState('Searching your knowledge base...')
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isLoading])

  const send = async (event?: React.FormEvent) => {
    event?.preventDefault(); if (!inputValue.trim() || isLoading) return
    const content = inputValue.trim(); setInputValue('')
    setMessages((prev) => [...prev, { role: 'user', content, timestamp: '10:26 AM' }]); setIsLoading(true); setLoadingPhase('Searching your knowledge base...')
    await new Promise((r) => setTimeout(r, 700)); setLoadingPhase('Generating answer...')
    await new Promise((r) => setTimeout(r, 800)); setMessages((prev) => [...prev, { role: 'assistant', content: 'I found the relevant information in your knowledge base. This answer would be generated from your uploaded documents.', timestamp: '10:26 AM', sources: [{ name: 'Employee Handbook.pdf', page: 8, relevance: '92% match' }] }]); setIsLoading(false)
  }

  return <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#fbf9ff]">
    <Header title="Chat" description="Ask questions about your documents" compact />
    <div className="flex shrink-0 items-center justify-between border-b border-[#eadffb] bg-white/70 px-6 py-2.5 text-xs">
      <div className="flex items-center gap-3"><span className="font-semibold text-[#201b29]">Leave & workplace policies</span><span className="rounded-full bg-[#f0e8ff] px-2.5 py-1 text-[#5517dd]">All documents <ChevronDown className="ml-1 inline size-3" /></span><span className="flex items-center gap-1 text-emerald-600"><span className="size-1.5 rounded-full bg-emerald-500" /> Nexa AI ready</span></div><button aria-label="More options" className="rounded-lg p-1.5 hover:bg-[#f0e8ff]"><MoreHorizontal className="size-4" /></button>
    </div>
    <div className="min-h-0 flex-1 overflow-y-auto p-6 lg:p-8">
      {messages.length === 0 && <div className="mx-auto flex max-w-lg flex-col items-center py-16 text-center"><div className="mb-5 grid size-16 place-items-center rounded-2xl bg-[#6a15fc] text-white shadow-lg shadow-[#6a15fc]/20"><Sparkles className="size-8" /></div><h2 className="text-2xl font-bold text-[#201b29]">What would you like to know?</h2><p className="mt-2 text-sm text-[#766b87]">Ask anything about your uploaded documents and Nexa AI will find the answer for you.</p><div className="mt-8 grid w-full gap-2 sm:grid-cols-2">{suggestions.map((q) => <button key={q} onClick={() => setInputValue(q)} className="rounded-xl border border-[#eadffb] bg-white p-3 text-left text-xs text-[#4e4264] transition hover:-translate-y-0.5 hover:border-[#b895ff] hover:shadow-sm">{q}</button>)}</div></div>}
      {messages.map((message, index) => <ChatMessage key={index} {...message} bubbleColor={message.role === 'user' ? '#6a15fc' : undefined} />)}
      {isLoading && <div className="flex items-start gap-3"><div className="grid size-8 shrink-0 place-items-center rounded-xl bg-[#f0e8ff] text-[#6a15fc]"><WandSparkles className="size-4" /></div><div className="rounded-2xl rounded-tl-sm border border-[#eadffb] bg-white p-4"><p className="mb-3 text-xs font-medium text-[#6a15fc]">{loadingPhase}</p><div className="flex gap-1.5"><span className="size-2 animate-bounce rounded-full bg-[#b895ff]" /><span className="size-2 animate-bounce rounded-full bg-[#8c5cf6] [animation-delay:120ms]" /><span className="size-2 animate-bounce rounded-full bg-[#6a15fc] [animation-delay:240ms]" /></div></div></div>}
      <div ref={endRef} />
    </div>
    <div className="shrink-0 border-t border-[#eadffb] bg-white/90 px-4 py-3 backdrop-blur lg:px-6"><form onSubmit={send} className="mx-auto flex max-w-5xl items-end gap-3"><div className="flex min-h-14 flex-1 flex-col rounded-2xl border border-[#d9c3ff] bg-[#f0e8ff] px-3 py-2 shadow-inner shadow-[#e8dcff]/50"><div className="flex items-center gap-2"><button type="button" aria-label="Attach document" className="rounded-lg p-1.5 text-[#6a15fc] hover:bg-white"><Paperclip className="size-4" /></button><input value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) { e.preventDefault(); void send() } }} placeholder="Ask a question about your documents..." className="flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-[#978aaa]" disabled={isLoading} /></div><div className="flex items-center justify-between pl-8 text-[10px] text-[#8c7c9e]"><span><FileText className="mr-1 inline size-3" /> All documents</span><span>Press Enter to send</span></div></div><Button type="submit" disabled={isLoading || !inputValue.trim()} size="icon" className="size-12 rounded-xl bg-[#6a15fc] shadow-lg shadow-[#6a15fc]/20 transition hover:-translate-y-0.5 hover:bg-[#5517dd] disabled:opacity-50"><Send className="size-4" /></Button></form><p className="mx-auto mt-2 max-w-5xl text-center text-[10px] text-[#9a8da8]">AI-generated answers are based on your knowledge base.</p></div>
  </div>
}
