'use client'
// src/app/dashboard/page.tsx

import { useAuth } from '@/lib/auth-context'
import { coursService, sujetsService, filieresService } from '@/lib/api'
import { usePaginatedQuery, useQuery } from '@/hooks/useQuery'
import AppShell from '@/components/layout/AppShell'
import { Card, StatutBadge, TypeCoursBADGE, SkeletonCard } from '@/components/ui'
import { BookOpen, FileText, Download, Eye, ArrowRight, GraduationCap } from 'lucide-react'
import Link from 'next/link'
import type { Cours, Filiere, Sujet } from '@/types'

const normalizePaginatedResponse = <T,>(payload: unknown) => {
  const source = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {}
  const items = Array.isArray(source.data)
    ? source.data as T[]
    : Array.isArray(payload)
      ? payload as T[]
      : []

  const pagination = (source.pagination as Record<string, unknown> | undefined) ?? {
    total: Number(source.total ?? items.length),
    page: 1,
    limit: items.length,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  }

  return {
    data: items,
    pagination: {
      total: Number(pagination.total ?? items.length),
      page: Number(pagination.page ?? 1),
      limit: Number(pagination.limit ?? items.length),
      totalPages: Number(pagination.totalPages ?? 1),
      hasNext: Boolean(pagination.hasNext ?? false),
      hasPrev: Boolean(pagination.hasPrev ?? false),
    },
  }
}

export default function DashboardPage() {
  const { user, isAdmin, isEnseignant } = useAuth()

  const {
    items: coursItems,
    pagination: coursPagination,
    loading: cLoading,
  } = usePaginatedQuery<Cours>(async (page) => {
    const response = await coursService.list({ page, limit: 1000 })
    return { data: normalizePaginatedResponse<Cours>(response.data) }
  })

  const {
    items: sujetsItems,
    pagination: sujetsPagination,
    loading: sLoading,
  } = usePaginatedQuery<Sujet>(async (page) => {
    const response = await sujetsService.list({ page, limit: 1000 })
    return { data: normalizePaginatedResponse<Sujet>(response.data) }
  })

  const { data: filieresRaw } = useQuery(async () => {
    const response = await filieresService.list()
    return { data: { data: Array.isArray(response.data) ? response.data : response.data?.data ?? [] } }
  })
  const filieres = (filieresRaw as unknown as Filiere[]) ?? []

  const recentCours = coursItems.slice(0, 4)
  const recentSujets = sujetsItems.slice(0, 4)
  const totalCours = coursPagination?.total ?? recentCours.length
  const totalSujets = sujetsPagination?.total ?? recentSujets.length
  const totalTelechargements = coursItems.reduce((sum, c) => sum + (c.telechargemements ?? 0), 0)

const greetHour = new Date().getHours()
const greet = greetHour < 12 ? 'Bonjour' : greetHour < 18 ? 'Bon après-midi' : 'Bonsoir'
 
  return (
    <AppShell>
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <h1 className="font-display text-2xl font-bold text-gray-900">
          {greet}, {user?.prenom} 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>
          {user?.filiere
            ? `${user.filiere.nom} · ${user.niveau}`
            : `Tableau de bord — ${user?.role}`}
        </p>
      </div>

        {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Cours disponibles',
            value: cLoading ? '…' : totalCours,
            icon:  BookOpen,
            color: '#5b5ef4',
            bg:    '#eef2ff',
            delay: 0,
            roles:["enseignant","admin"]
          },
          {
            label: 'Anciens sujets',
            value: sLoading ? '…' : totalSujets,
            icon:  FileText,
            color: '#0891b2',
            bg:    '#ecfeff',
            delay: 100,
            roles:["enseignant","admin"]
          },
          {
            label: isAdmin ? 'Filières' : 'Votre niveau',
            value: isAdmin
              ? ((filieres as unknown[])?.length ?? 0)
              : (user?.niveau ?? '—'),
            icon:  GraduationCap,
            color: '#7c3aed',
            bg:    '#f5f3ff',
            delay: 200,
            roles:["enseignant","admin"]
          },
          {
            label: 'Total téléchargements',
            value: cLoading ? '…' : totalTelechargements,
            icon:  Download,
            color: '#059669',
            bg:    '#ecfdf5',
            delay: 300,
            roles:["enseignant","admin"]
          },
        ].map(({ label, value, icon: Icon, color, bg, delay,roles }) => (
          <Card key={label} className={`p-5 animate-fade-up animate-delay-${delay}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: bg }}>
                <Icon size={18} style={{ color }} />
              </div>
            </div>
            <p className="font-display text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>{label}</p>
          </Card>
        ))}
      </div>

      {/* Deux colonnes : Cours récents + Sujets récents */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Cours récents */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-gray-800">Cours récents</h2>
            <Link href="/cours"
              className="flex items-center gap-1 text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ color: 'var(--brand)' }}>
              Voir tout <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-3">
            {cLoading
              ? Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : recentCours.length === 0
                ? <Card className="p-6 text-center text-sm text-gray-500">
                    Aucun cours disponible
                  </Card>
                : recentCours.map((c) => (
                  <Link href={`/cours?ue=${c.ue?.id ?? ''}`} key={c.id}>
                    <Card className="p-4 hover:translate-y-[-1px] mb-2">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: '#eef2ff' }}>
                          <BookOpen size={16} style={{ color: 'var(--brand)' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{c.titre}</p>
                          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-3)' }}>
                            {c.ue?.intitule ?? 'UE inconnue'} · {c.anneAcademique}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <TypeCoursBADGE type={c.type} />
                            <StatutBadge statut={c.statut} />
                            <span className="flex items-center gap-1 text-xs ml-auto"
                              style={{ color: 'var(--text-3)' }}>
                              <Eye size={12} /> {c.vues}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))
            }
          </div>
        </div>

        {/* Sujets récents */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-gray-800">Anciens sujets</h2>
            <Link href="/sujets"
              className="flex items-center gap-1 text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ color: 'var(--brand)' }}>
              Voir tout <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-3">
            {sLoading
              ? Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : recentSujets.length === 0
                ? <Card className="p-6 text-center text-sm">
                    Aucun sujet disponible
                  </Card>
                : recentSujets.map((s) => (
                  <Link href={`/sujets?ue=${s.ue?.id ?? ''}`} key={s.id}>
                    <Card className="p-4 hover:translate-y-[-1px] mb-2">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: '#ecfeff' }}>
                          <FileText size={16} style={{ color: '#0891b2' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{s.titre}</p>
                          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-3)' }}>
                            {s.ue?.intitule ?? 'UE inconnue'} · {s.annee}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{ background: '#f1f5f9', color: '#475569' }}>
                              {s.type}
                            </span>
                            {s.avecCorrige && (
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                                + Corrigé
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-xs ml-auto"
                              style={{ color: 'var(--text-3)' }}>
                              <Download size={12} /> {s.telechargements}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))
            }
          </div>
        </div>
      </div>
    </AppShell>
  )
}