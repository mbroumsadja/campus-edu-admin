'use client'
// src/components/layout/AppShell.tsx
// Layout principal : sidebar + topbar + contenu

import { useState, ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import {
  LayoutDashboard, BookOpen, FileText, Users, FolderOpen,
  LogOut, Menu, X, ChevronRight, GraduationCap, Settings, User
} from 'lucide-react'
import clsx from 'clsx'

interface NavItem {
  href:   string
  label:  string
  icon:   React.ElementType
  roles?: ('etudiant' | 'enseignant' | 'admin')[]
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard',       label: 'Tableau de bord',  icon: LayoutDashboard },
  { href: '/cours',           label: 'Cours',            icon: BookOpen       },
  { href: '/sujets',          label: 'Anciens sujets',   icon: FileText       },
  { href: '/admin/users',     label: 'Utilisateurs',     icon: Users,    roles: ['admin'] },
  { href: '/admin/filieres',  label: 'Filières & UEs',   icon: FolderOpen, roles: ['admin'] },
]

export default function AppShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout, isAdmin } = useAuth()
  const pathname = usePathname()

  const visibleItems = NAV_ITEMS.filter(item =>
    !item.roles || (user && item.roles.includes(user.role))
  )

  const initials = user
    ? `${user.prenom[0]}${user.nom[0]}`.toUpperCase()
    : 'U'

  const roleLabel = { etudiant: 'Étudiant', enseignant: 'Enseignant', admin: 'Administrateur' }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* ── Overlay mobile ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={clsx(
        'fixed top-0 left-0 z-50 h-full w-64 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full rounded-r-lg'
      )} style={{ background: '#033567', borderRight: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Logo */}
        <div className="flex items-center justify-center px-5 h-16 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-display font-bold text-sm"
              style={{ background: 'rgba(165,180,252,0.2)' }}>
              U
            </div>
            <span className="text-white font-display font-semibold">campus-edu</span>
          </div>
          <button className="lg:hidden text-indigo-300 hover:text-white p-1"
            onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Profil utilisateur */}
        <div className="px-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-indigo-900 font-semibold text-sm flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #a5b4fc, #818cf8)' }}>
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.prenom} {user?.nom}</p>
              <p className="text-indigo-400 text-xs truncate" style={{ fontFamily: 'var(--font-mono)' }}>
                {user?.matricule}
              </p>
            </div>
          </div>
          {user?.filiere && (
            <p className="text-gray-300 text-xs mt-2 px-2">
              {user.filiere.nom}{user.niveau && ` · ${user.niveau}`}
            </p>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {/* Séparateur sections */}
          {visibleItems.map((item, idx) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const isAdminSection = item.roles?.includes('admin')

            return (
              <div key={item.href}>
                {/* Titre section Admin */}
                {isAdminSection && idx > 0 && !NAV_ITEMS[idx - 1].roles?.includes('admin') && (
                  <p className="text-indigo-500 text-xs font-medium uppercase tracking-widest px-3 pt-4 pb-1">
                    Administration
                  </p>
                )}
                <Link href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                    isActive
                      ? 'text-white'
                      : 'text-indigo-300 hover:text-white hover:bg-white/5'
                  )}
                  style={isActive ? { background: 'rgba(165,180,252,0.15)' } : {}}>
                  <item.icon size={16} className={isActive ? 'text-indigo-300' : 'text-indigo-500 group-hover:text-indigo-300'} />
                  {item.label}
                  {isActive && <ChevronRight size={14} className="ml-auto text-indigo-400" />}
                </Link>
              </div>
            )
          })}
        </nav>

        {/* Déconnexion */}
        <div className="px-3 py-4 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Link href="/profil"
            onClick={() => setSidebarOpen(false)}
            className={clsx(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm mb-1 transition-all ',
              pathname === '/profil'
                ? 'text-white bg-white/10'
                : 'text-indigo-400 hover:text-white hover:bg-white/5'
            )}>
            <User size={16} />
            MON PROFIL
          </Link>
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-indigo-400 hover:text-red-300 hover:bg-red-500/10 transition-all">
            <LogOut size={16} />
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* ── CONTENU PRINCIPAL ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className="h-16 flex items-center px-6 gap-4 flex-shrink-0 sticky top-0 z-30"
          style={{ background: 'white', borderBottom: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
          <button className="lg:hidden text-gray-500 hover:text-gray-800 p-1"
            onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>

          <div className="flex-1" />

          {/* Badge rôle */}
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
            style={{
              background: isAdmin ? '#eef2ff' : 'var(--surface-2)',
              color:      isAdmin ? '#4338ca' : 'var(--text-2)',
              border:     `1px solid ${isAdmin ? '#c7d2fe' : 'var(--border)'}`,
            }}>
            <GraduationCap size={12} />
            {roleLabel[user?.role ?? 'etudiant']}
          </span>
        </header>

        {/* Page */}
        <main className="flex-1 p-6 lg:p-8 page-enter">
          {children}
        </main>
      </div>
    </div>
  )
}
