'use client'
import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import Sidebar from '@/components/Sidebar'
import LoginPage from '@/components/LoginPage'
import DocumentsPage from '@/components/DocumentsPage'
import ChatPage from '@/components/ChatPage'
import ConversationsPage from '@/components/ConversationsPage'
import OverviewPage from '@/components/OverviewPage'
import SettingsPage from '@/components/SettingsPage'
import { api, AuthUser, clearSession, getToken, saveSession } from '@/lib/api'

function Shell() {
  const navigate = useNavigate()
  const location = useLocation()
  const [auth, setAuth] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)

  // If a token from a previous session exists in localStorage, ask the
  // backend whether it is still valid (401 -> stale token, log out).
  useEffect(() => {
    if (!getToken()) return
    void api
      .me()
      .then((currentUser) => {
        setUser(currentUser)
        setAuth(true)
      })
      .catch(() => {
        clearSession()
        setAuth(false)
      })
  }, [])

  const handleLogin = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { token, user: loggedIn } = await api.login(email, password)
      saveSession(token, loggedIn)
      setUser(loggedIn)
      setAuth(true)
      navigate('/')
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unable to sign in',
      }
    }
  }

  const handleLogout = () => {
    // best effort - tell the backend to invalidate the session token
    void api.logout().catch(() => {})
    clearSession()
    setUser(null)
    setAuth(false)
  }

  if (!auth) return <LoginPage onLogin={handleLogin} />

  const active = location.pathname.slice(1) || 'overview'
  const go = (tab: string) => navigate(`/${tab}`)

  return (
    <div
      className={`${active === 'chat' ? 'h-screen overflow-hidden' : 'min-h-screen overflow-y-auto'} bg-[#faf9fc] md:flex`}
    >
      <div className="hidden md:block">
        <Sidebar activeTab={active as any} onTabChange={go as any} onLogout={handleLogout} user={user} />
      </div>

      <div
        className={`${active === 'chat' ? 'flex h-full min-h-0' : 'flex min-h-screen'} min-w-0 flex-1 flex-col md:ml-[244px]`}
      >
        <div className="flex items-center justify-between border-b border-[#ece8f0] bg-white/80 px-5 py-3 backdrop-blur md:hidden">
          <span className="font-semibold text-[#201b29]">
            Nexa <span className="gradient-text">AI</span>
          </span>
          <select
            aria-label="Navigate"
            value={active}
            onChange={(e) => go(e.target.value)}
            className="rounded-lg border border-[#e7e1ec] bg-white px-2 py-1 text-xs"
          >
            <option value="overview">Overview</option>
            <option value="documents">Documents</option>
            <option value="chat">Chat</option>
            <option value="conversations">Conversations</option>
            <option value="settings">Settings</option>
          </select>
        </div>

        <Routes>
          <Route path="/" element={<OverviewPage onAsk={() => go('chat')} />} />
          <Route path="/overview" element={<OverviewPage onAsk={() => go('chat')} />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/conversations" element={<ConversationsPage />} />
          <Route path="/settings" element={<SettingsPage user={user} onUserChange={setUser} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default function AppClient() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  )
}