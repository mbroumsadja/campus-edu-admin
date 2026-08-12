'use client'
// src/app/cours/page.tsx

import { useState } from 'react'
import { api, coursService, filieresService, getAccessToken } from '@/lib/api'
import { usePaginatedQuery, useQuery } from '@/hooks/useQuery'
import AppShell from '@/components/layout/AppShell'
import {
  Card, StatutBadge, TypeCoursBADGE,
  SkeletonCard, EmptyState, Pagination, PageHeader, Button
} from '@/components/ui'
import UploadCoursModal from '@/components/modals/UploadCoursModal'
import { BookOpen, Download, Eye, Search, X ,FileText} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import type { Cours, Filiere } from '@/types'

export default function CoursPage() {


  const { user, isAdmin, isEnseignant } = useAuth()

  const [search,       setSearch]       = useState('')
  const [type,         setType]         = useState('')
  const [ueId,         setUeId]         = useState('')
  const [uploadOpen,   setUploadOpen]   = useState(false)

  const { data: filieresRaw } = useQuery(filieresService.list)
  const filieres = (filieresRaw as unknown as { data: Filiere[] })?.data ?? []

  const { items, pagination, loading, error, page, setPage, refetch } = usePaginatedQuery<Cours>(
    (p) => coursService.list({
      page: p, limit: 12,
      ...(search && { search }),
      ...(type   && { type }),
      ...(ueId   && { ue_id: ueId }),
    }),
    { search, type, ueId }
  )

// dans handleDownload, ajouter un paramètre documentId
const handleDownload = async (coursId: number, documentId: number, titre: string) => {
  try {
    const response = await api.get(`/cours/${coursId}/documents/${documentId}/telecharger`, {
      responseType: 'blob'
    })

    const disposition = response.headers['content-disposition'] || ''
    const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
    const filename = match?.[1]?.replace(/['"]/g, '') || titre

    const blob = new Blob([response.data])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.log('Erreur téléchargement:', error)
  }
}

  const hasFilters = search || type || ueId

  return (
    <AppShell>
      <PageHeader
        title="Cours"
        description="Tous les cours disponibles"
        action={
          (isAdmin || isEnseignant) && (
            <Button onClick={() => setUploadOpen(true)}>
              + Déposer un cours
            </Button>
          )
        }
      />

      {/* Filtres */}
      <Card className="p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Recherche */}
          <div className="flex items-center gap-2 flex-1 min-w-[200px] px-3 py-2 rounded-xl"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <Search size={14} style={{ color: 'var(--text-3)' }} />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Rechercher un cours…"
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: 'var(--text-1)' }}
            />
          </div>

          {/* Filtre type */}
          <select
            value={type}
            onChange={e => { setType(e.target.value); setPage(1) }}
            className="px-3 py-2 rounded-xl text-sm outline-none cursor-pointer"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
            <option value="">Tous les types</option>
            <option value="pdf">PDF</option>
            <option value="video">Vidéo</option>
            <option value="slide">Slides</option>
            <option value="autre">Autre</option>
          </select>

          {/* Reset */}
          {hasFilters && (
            <button
              onClick={() => { setSearch(''); setType(''); setUeId(''); setPage(1) }}
              className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl transition-all"
              style={{ color: 'var(--red)', background: 'rgba(220,38,38,.06)', border: '1px solid rgba(220,38,38,.15)' }}>
              <X size={14} /> Effacer
            </button>
          )}

          {pagination && (
            <span className="text-xs ml-auto" style={{ color: 'var(--text-3)' }}>
              {pagination.total} résultat{pagination.total > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </Card>

      {/* Grille cours */}
      {error ? (
        <div className="text-center py-12 text-sm" style={{ color: 'var(--red)' }}>{error}</div>
      ) : loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="Aucun cours trouvé"
          description={hasFilters ? 'Essayez de modifier vos filtres.' : 'Aucun cours disponible pour le moment.'}
        />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((cours, idx) => (
              <Card key={cours.id} className="p-3 hover:translate-y-[-2px] animate-fade-up">
                <div className="flex flex-col gap-3" style={{ animationDelay: `${idx * 40}ms` }}>

                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: '#eef2ff' }}>
                    <BookOpen size={18} style={{ color: 'var(--brand)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2">
                      {cours.titre}
                    </h3>
                    {cours.enseignant && (
                      <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>
                        {cours.enseignant.prenom} {cours.enseignant.nom}
                      </p>
                    )}
                  </div>
                </div>

                {/* UE info */}
                {cours.ue && (
                  <div className="px-3 py-2 rounded-lg text-xs"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                    <span className="font-medium" style={{ fontFamily: 'var(--font-mono)' }}>
                      {cours.ue.code}
                    </span>
                    <span style={{ color: 'var(--text-3)' }}> · {cours.ue.intitule}</span>
                  </div>
                )}

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <TypeCoursBADGE type={cours.type} />
                  {(isAdmin || isEnseignant) && <StatutBadge statut={cours.statut} />}
                  <span className="text-xs ml-auto" style={{ color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                    {cours.anneAcademique}
                  </span>
                </div>
                {/* Stats + Télécharger */}
               {/* Stats */}
                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-3)' }}>
                  <span className="flex items-center gap-1"><Eye size={12} />{cours.vues}</span>
                  <span className="flex items-center gap-1"><Download size={12} />{cours.telechargemements}</span>
                </div>

                {/* Fichiers rattachés — un bouton de téléchargement par fichier */}
                <div className="flex flex-col gap-1.5 pt-2 mt-auto" style={{ borderTop: '1px solid var(--border)' }}>
                  {(cours.fichiers ?? []).length === 0 ? (
                    <p className="text-xs pt-2" style={{ color: 'var(--text-3)' }}>Aucun fichier disponible</p>
                  ) : (
                    (cours.fichiers ?? []).map((fichier, i) => {
                      const total = (cours.fichiers ?? []).length
                      return (
                        <div key={fichier.id}
                          className="flex items-center justify-between gap-2 text-xs pt-1">
                          <span className="flex items-center gap-1.5 truncate flex-1"
                            style={{ color: 'var(--text-2)' }}
                            title={fichier.nomFichierOriginal}>
                            <FileText size={12} style={{ flexShrink: 0 }} />
                            {total > 1 && (
                              <span
                                className="flex-shrink-0 inline-flex items-center justify-center rounded-full text-[10px] font-semibold"
                                style={{
                                  width: 16, height: 16,
                                  background: 'var(--brand-soft, #eef0fe)', color: 'var(--brand)'
                                }}>
                                {i + 1}
                              </span>
                            )}
                            <span className="truncate">{fichier.nomFichierOriginal}</span>
                          </span>
                          <button
                            onClick={() => handleDownload(cours.id, fichier.id, fichier.nomFichierOriginal)}
                            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg flex-shrink-0 transition-all"
                            style={{
                              background: 'var(--brand)', color: 'white',
                              boxShadow: '0 2px 6px rgba(91,94,244,.3)'
                            }}>
                            <Download size={11} />
                          </button>
                        </div>
                      )
                    })
                  )}
                </div>
                </div>
              </Card>
            ))}
          </div>

          {pagination && (
            <Pagination page={page} totalPages={pagination.totalPages} onPage={setPage} />
          )}
        </>
      )}

      <UploadCoursModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={() => { setUploadOpen(false); setPage(1); refetch() }}
      />
    </AppShell>
  )
}