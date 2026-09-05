'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import {
  LayoutDashboard, BookOpen, FileText, Users, GitBranch, Building2, User, LogOut, ChevronDown, Menu, X
} from 'lucide-react'

const roleLabel = { etudiant: 'Étudiant', enseignant: 'Enseignant', admin: 'Administrateur' }

const navMain = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/cours', label: 'Cours', icon: BookOpen },
  { href: '/sujets', label: 'Anciens sujets', icon: FileText },
]

const navAdmin = [
  { href: '/admin/users', label: 'Utilisateurs', icon: Users },
  { href: '/admin/ecoles', label: 'Écoles', icon: Building2 },
  { href: '/admin/filieres', label: 'Filières & UEs', icon: GitBranch },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [dragPosition, setDragPosition] = useState({ x: 12, y: 12 })
  const dragRef = useRef({ active: false, startX: 0, startY: 0, originX: 0, originY: 0 })
  const dragMovedRef = useRef(false)

  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    if (typeof window === 'undefined') return

    const maxX = Math.max(12, window.innerWidth - 220)
    const maxY = Math.max(12, window.innerHeight - 260)
    setDragPosition({ x: maxX, y: maxY })
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handlePointerMove = (event: PointerEvent) => {
      if (!dragRef.current.active) return

      const dx = event.clientX - dragRef.current.startX
      const dy = event.clientY - dragRef.current.startY
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
        dragMovedRef.current = true
      }

      const nextX = Math.min(Math.max(12, dragRef.current.originX + dx), window.innerWidth - 220)
      const nextY = Math.min(Math.max(12, dragRef.current.originY + dy), window.innerHeight - 200)
      setDragPosition({ x: nextX, y: nextY })
    }

    const handlePointerUp = () => {
      dragRef.current.active = false
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [])

  const handleMobileToggle = () => {
    if (dragMovedRef.current) {
      dragMovedRef.current = false
      return
    }
    setMenuOpen((prev) => !prev)
  }

  const handleDragStart = (event: React.PointerEvent<HTMLButtonElement>) => {
    dragRef.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      originX: dragPosition.x,
      originY: dragPosition.y,
    }
    dragMovedRef.current = false
    event.preventDefault()
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>

      {/* ── BARRE 1 : Logo + Profil ── */}
      <header
        className="flex items-center justify-between px-6 h-14 flex-shrink-0 round1"
        style={{
          background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-strong) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <img
            src="/icon-192.png"
            alt="FS Archive logo"
            width={292}
            height={292}
            className="w-8 h-8 rounded-lg object-contain"
          />
          <span className="text-white font-semibold text-sm tracking-wide">campus-edu</span>
        </div>

        {/* Profil dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'rgba(127, 193, 242, 0.28)' }}
            >
              {user?.prenom?.[0]}{user?.nom?.[0]}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-medium text-white leading-tight">
                {user?.prenom} {user?.nom}
              </p>
              <p className="text-xs text-white/50">{user?.matricule}</p>
            </div>
            <ChevronDown size={14} className={clsx('transition-transform', profileOpen && 'rotate-180')} />
          </button>

          {profileOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden z-50 shadow-xl"
              style={{ background: 'var(--brand-strong)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <Link
                href="/profil"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2 px-4 py-3 text-sm text-white/80 hover:bg-white/5 transition-colors"
              >
                <User size={14} /> Mon profil
              </Link>
              <button
                onClick={() => { setProfileOpen(false); logout() }}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-white/5 transition-colors"
              >
                <LogOut size={14} /> Se déconnecter
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── BARRE 2 : Navigation horizontale ── */}
      <nav
        className="flex-shrink-0 justify-between fixed bottom-0 right-0 rounded-xl z-10"
        style={{
          background: 'var(--brand-strong)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Desktop */}
        <div className="hidden md:flex items-center px-6 h-11 justify-center">
          {/* Nav principale */}
          <div className="flex items-center gap-5">
            {navMain.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  pathname === href
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                )}
              >
                <Icon size={13} />
                {label}
              </Link>
            ))}
          </div>

          {/* Séparateur + nav admin */}
          {isAdmin && (
            <>
              <div className="mx-4 h-4 w-px bg-white/10" />
              <div className="flex items-center gap-1">
                {navAdmin.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={clsx(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                      pathname === href
                        ? 'bg-white/10 text-white'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <Icon size={13} />
                    {label}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Mobile : menu flottant draggable */}
        <div
          className="md:hidden fixed z-50 select-none"
          style={{
            left: `${dragPosition.x}px`,
            top: `${dragPosition.y}px`,
            width: 'min(220px, calc(100vw - 24px))',
          }}
        >
          <div
            className="rounded-2xl shadow-2xl"
            style={{ background: 'var(--brand-strong)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <button
              type="button"
              onClick={handleMobileToggle}
              onPointerDown={handleDragStart}
              className="text-white/70 hover:text-white flex items-center justify-between w-full px-4 h-11 rounded-2xl"
              style={{ touchAction: 'none' }}
            >
              <span className="text-white/70 text-xs flex items-center gap-1.5">
                <Users size={13} />
                {roleLabel[user?.role as keyof typeof roleLabel]}
              </span>
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            {menuOpen && (
              <div className="px-3 pb-3 pt-1 flex flex-col gap-1">
                {[...navMain, ...(isAdmin ? navAdmin : [])].map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className={clsx(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all',
                      pathname === href
                        ? 'bg-white/10 text-white'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <Icon size={14} /> {label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── CONTENU ── */}
      <main className="flex-1 overflow-auto flex-1 p-6 lg:p-8 page-enter mb-10">
        {children}
      </main>
    </div>
  )
}
