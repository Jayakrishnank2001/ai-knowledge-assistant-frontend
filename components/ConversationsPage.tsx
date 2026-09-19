'use client'

import React from 'react'
import Header from './Header'
import ConversationItem from './ConversationItem'

const MOCK_CONVERSATIONS = [
  {
    title: 'Leave policy questions',
    preview: 'How many days of annual leave do employees get?',
    date: 'Today, 10:24 AM',
  },
  {
    title: 'IT security guidelines',
    preview: 'What are the password requirements?',
    date: 'Today, 09:10 AM',
  },
  {
    title: 'Company overview',
    preview: 'What does the company do?',
    date: 'Apr 25, 2025',
  },
  {
    title: 'Remote work policy',
    preview: 'Can employees work from home?',
    date: 'Apr 24, 2025',
  },
  {
    title: 'Benefits and compensation',
    preview: 'What health benefits are offered?',
    date: 'Apr 23, 2025',
  },
]

export default function ConversationsPage() {
  const handleConversationClick = (title: string) => {
    console.log('Opening conversation:', title)
    // In a real app, this would load the conversation
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      <Header
        title="Conversations"
        description="View your previous conversations and continue where you left off"
      />

      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-gray-200">
          {MOCK_CONVERSATIONS.map((conv, idx) => (
            <ConversationItem
              key={idx}
              {...conv}
              onClick={() => handleConversationClick(conv.title)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
