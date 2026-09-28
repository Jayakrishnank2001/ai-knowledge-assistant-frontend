'use client'
import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
    setMobileMenuOpen(false)
    // best effort - tell the backend to invalidate the session token
    void api.logout().catch(() => {})
    clearSession()
    setUser(null)
    setAuth(false)
  }

  // Called by LoginPage after a successful OTP signup - the backend has
  // already created the user and returned a session token.
  const handleAuthenticated = (token: string, loggedIn: AuthUser) => {
    saveSession(token, loggedIn)
    setUser(loggedIn)
    setAuth(true)
    navigate('/')
  }

  if (!auth) return <LoginPage onLogin={handleLogin} onAuthenticated={handleAuthenticated} />

  const active = location.pathname.slice(1) || 'overview'
  const go = (tab: string) => {
    setMobileMenuOpen(false)
    navigate(`/${tab}`)
  }

  return (
    <div
      className={`${active === 'chat' ? 'h-screen overflow-hidden' : 'min-h-screen overflow-y-auto'} bg-[#faf9fc] md:flex`}
    >
      {/* Desktop Sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:left-0 md:z-20 md:block md:w-[244px]">
        <Sidebar activeTab={active as any} onTabChange={go as any} onLogout={handleLogout} user={user} />
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'
        }`}
      >
        <Sidebar
          activeTab={active as any}
          onTabChange={go as any}
          onLogout={handleLogout}
          user={user}
          onClose={() => setMobileMenuOpen(false)}
        />
      </div>

      <div
        className={`${active === 'chat' ? 'flex h-full min-h-0' : 'flex min-h-screen'} min-w-0 flex-1 flex-col md:ml-[244px]`}
      >
        {/* Mobile Top Bar */}
        <div className="flex items-center justify-between border-b border-[#ece8f0] bg-white/90 px-4 py-3 backdrop-blur md:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
              className="grid size-9 place-items-center rounded-xl border border-[#ece8f0] bg-[#faf8fd] text-[#201b29] transition hover:bg-[#f0e8ff] hover:text-[#5517dd]"
            >
              <Menu className="size-5" />
            </button>
            <span className="font-semibold text-[#201b29]">
              Nexa <span className="gradient-text">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => go('chat')}
              className="rounded-lg bg-[#5517dd] px-2.5 py-1 text-xs font-medium text-white shadow-sm hover:bg-[#4310bd]"
            >
              + Chat
            </button>
          </div>
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
