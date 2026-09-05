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
  const [editingCoursId, setEditingCoursId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editType, setEditType] = useState<'pdf' | 'video' | 'slide' | 'autre'>('pdf')
  const [editMainFile, setEditMainFile] = useState<File | null>(null)
  const [editDocs, setEditDocs] = useState<File[]>([])

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

  const isOwner = (cours: Cours) => isAdmin || user?.id === cours.enseignant?.id

  const openEditCours = (cours: Cours) => {
    setEditingCoursId(cours.id)
    setEditTitle(cours.titre)
    setEditDescription(cours.description ?? '')
    setEditType(cours.type)
  }

  const handleDeleteCours = async (id: number) => {
    if (!window.confirm('Supprimer ce cours ?')) return
    try {
      await coursService.supprimer(id)
      setEditingCoursId(null)
      refetch()
    } catch (err) {
      console.error('Erreur suppression cours:', err)
      alert('Impossible de supprimer ce cours.')
    }
  }

  const handleUpdateCours = async (id: number) => {
    try {
      // Si des fichiers sont fournis, utiliser FormData
      if (editMainFile || editDocs.length > 0) {
        const fd = new FormData()
        fd.append('titre', editTitle.trim())
        fd.append('description', editDescription.trim())
        fd.append('type', editType)
        if (editMainFile) fd.append('main', editMainFile)
        editDocs.forEach((f: File) => fd.append('documents', f))
        await coursService.update(id, fd)
      } else {
        await coursService.update(id, {
          titre: editTitle.trim(),
          description: editDescription.trim(),
          type: editType,
        })
      }

      setEditingCoursId(null)
      refetch()
    } catch (err) {
      console.error('Erreur modification cours:', err)
      alert('Impossible de modifier ce cours.')
    }
  }

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

                {isOwner(cours) && (
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => openEditCours(cours)}
                      className="text-xs font-medium px-2.5 py-1.5 rounded-lg border"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-2)', background: 'var(--surface-2)' }}>
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteCours(cours.id)}
                      className="text-xs font-medium px-2.5 py-1.5 rounded-lg border"
                      style={{ borderColor: 'rgba(220,38,38,.2)', color: '#b91c1c', background: 'rgba(220,38,38,.06)' }}>
                      Supprimer
                    </button>
                  </div>
                )}

                {editingCoursId === cours.id && isOwner(cours) && (
                  <div className="rounded-xl p-3 space-y-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full rounded-lg px-2.5 py-2 text-sm border outline-none"
                      style={{ borderColor: 'var(--border)', background: 'white' }}
                      placeholder="Titre du cours"
                    />
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={2}
                      className="w-full rounded-lg px-2.5 py-2 text-sm border outline-none resize-none"
                      style={{ borderColor: 'var(--border)', background: 'white' }}
                      placeholder="Description"
                    />
                    <select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value as 'pdf' | 'video' | 'slide' | 'autre')}
                      className="w-full rounded-lg px-2.5 py-2 text-sm border outline-none"
                      style={{ borderColor: 'var(--border)', background: 'white' }}
                    >
                      <option value="pdf">PDF</option>
                      <option value="video">Vidéo</option>
                      <option value="slide">Slides</option>
                      <option value="autre">Autre</option>
                    </select>

                    <div className="space-y-2">
                      <label className="text-xs">Remplacer le fichier principal</label>
                      <input type="file" accept="application/pdf,video/*,application/vnd.openxmlformats-officedocument.presentationml.presentation" onChange={(e) => setEditMainFile(e.target.files?.[0] ?? null)} />
                      <label className="text-xs">Ajouter des documents</label>
                      <input type="file" multiple onChange={(e) => setEditDocs(e.target.files ? Array.from(e.target.files) : [])} />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button onClick={() => setEditingCoursId(null)} className="text-xs px-2.5 py-1.5 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>Annuler</button>
                      <button onClick={() => handleUpdateCours(cours.id)} className="text-xs px-2.5 py-1.5 rounded-lg" style={{ background: 'var(--brand)', color: 'white' }}>Enregistrer</button>
                    </div>
                  </div>
                )}

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