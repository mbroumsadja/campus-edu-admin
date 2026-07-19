'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import {
  LayoutDashboard, BookOpen, FileText, Users, GitBranch, User, LogOut, ChevronDown, Menu, X
} from 'lucide-react'

const roleLabel = { etudiant: 'Étudiant', enseignant: 'Enseignant', admin: 'Administrateur' }

const navMain = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/cours', label: 'Cours', icon: BookOpen },
  { href: '/sujets', label: 'Anciens sujets', icon: FileText },
]

const navAdmin = [
  { href: '/admin/users', label: 'Utilisateurs', icon: Users },
  { href: '/admin/filieres', label: 'Filières & UEs', icon: GitBranch },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const isAdmin = user?.role === 'admin'

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>

      {/* ── BARRE 1 : Logo + Profil ── */}
      <header
        className="flex items-center justify-between px-6 h-14 flex-shrink-0 round1"
        style={{
          background: '#003356',
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
              style={{ background: 'rgba(165,180,252,0.3)' }}
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
              style={{ background: '#002a45', border: '1px solid rgba(255,255,255,0.08)' }}
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
          background: '#002a45',
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

        {/* Mobile : bouton hamburger */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-white/70 hover:text-white flex items-center justify-between px-4 h-11">
            <span className="text-white/50 text-xs flex gap-1">
              <Users size={13} />
              {roleLabel[user?.role as keyof typeof roleLabel]}
            </span>
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile : menu déroulant */}
        {menuOpen && (
          <div className="md:hidden px-4 pb-3 flex flex-col gap-1 ml-10">
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
      </nav>

      {/* ── CONTENU ── */}
      <main className="flex-1 overflow-auto flex-1 p-6 lg:p-8 page-enter mb-10">
        {children}
      </main>
    </div>
  )
}
