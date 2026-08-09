'use client'
// src/app/cours/page.tsx

import { useState } from 'react'
import { api, filieresService, getAccessToken, searchService } from '@/lib/api'
import { usePaginatedQuery, useQuery } from '@/hooks/useQuery'
import AppShell from '@/components/layout/AppShell'
import {
  Badge, Card, SkeletonCard, EmptyState, Pagination, PageHeader, Button
} from '@/components/ui'
import UploadCoursModal from '@/components/modals/UploadCoursModal'
import { BookOpen, Download, Eye, Search, X } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import type { Filiere, SearchDocumentItem } from '@/types'

export default function CoursPage() {


  const { isAdmin, isEnseignant } = useAuth()

  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [niveau, setNiveau] = useState('')
  const [filiereId, setFiliereId] = useState('')
  const [ecole, setEcole] = useState('')
  const [annee, setAnnee] = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)

  const { data: filieresRaw } = useQuery<Filiere[]>(filieresService.list)
  const filieres = (filieresRaw ?? []) as Filiere[]

  const { items, pagination, loading, error, page, setPage } = usePaginatedQuery<SearchDocumentItem>(
    (p) => searchService.documents({
      page: p,
      limit: 12,
      ...(search ? { q: search, nom: search } : {}),
      ...(type ? { type } : {}),
      ...(niveau ? { niveau } : {}),
      ...(filiereId ? { filiere_id: filiereId } : {}),
      ...(ecole ? { ecole } : {}),
      ...(annee ? { annee } : {}),
    }),
    { search, type, niveau, filiereId, ecole, annee }
  )

  const handleDownload = async (documentItem: SearchDocumentItem) => {
    const downloadUrl = documentItem.lien_telechargement || `/cours/${documentItem.id}/telecharger`

    try {
      const response = await api.get(downloadUrl, { responseType: 'blob' })
      const disposition = response.headers['content-disposition'] || ''
      const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      const filename = match?.[1]?.replace(/['"]/g, '') || documentItem.nom || 'document'

      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erreur téléchargement:', error)
    }
  }

  const hasFilters = Boolean(search || type || niveau || filiereId || ecole || annee)

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
          <div className="flex items-center gap-2 flex-1 min-w-[220px] px-3 py-2 rounded-xl"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <Search size={14} style={{ color: 'var(--text-3)' }} />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Rechercher un document…"
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: 'var(--text-1)' }}
            />
          </div>

          <select
            value={type}
            onChange={e => { setType(e.target.value); setPage(1) }}
            className="px-3 py-2 rounded-xl text-sm outline-none cursor-pointer"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
            <option value="">Tous les types</option>
            <option value="pdf">PDF</option>
            <option value="video">Vidéo</option>
            <option value="slide">Slides</option>
            <option value="partiel">Partiel</option>
            <option value="rattrapage">Rattrapage</option>
            <option value="terminal">Terminal</option>
            <option value="tp">TP</option>
            <option value="td">TD</option>
            <option value="autre">Autre</option>
          </select>

          <select
            value={niveau}
            onChange={e => { setNiveau(e.target.value); setPage(1) }}
            className="px-3 py-2 rounded-xl text-sm outline-none cursor-pointer"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
            <option value="">Tous niveaux</option>
            <option value="L1">L1</option>
            <option value="L2">L2</option>
            <option value="L3">L3</option>
            <option value="M1">M1</option>
            <option value="M2">M2</option>
          </select>

          <select
            value={filiereId}
            onChange={e => { setFiliereId(e.target.value); setPage(1) }}
            className="px-3 py-2 rounded-xl text-sm outline-none cursor-pointer"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
            <option value="">Toutes filières</option>
            {filieres.map((filiere) => (
              <option key={filiere.id} value={filiere.id}>{filiere.nom}</option>
            ))}
          </select>

          <input
            value={ecole}
            onChange={e => { setEcole(e.target.value); setPage(1) }}
            placeholder="École"
            className="px-3 py-2 rounded-xl text-sm outline-none min-w-[140px]"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
          />

          <input
            value={annee}
            onChange={e => { setAnnee(e.target.value); setPage(1) }}
            placeholder="Année"
            className="px-3 py-2 rounded-xl text-sm outline-none w-[110px]"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
          />

          {hasFilters && (
            <button
              onClick={() => { setSearch(''); setType(''); setNiveau(''); setFiliereId(''); setEcole(''); setAnnee(''); setPage(1) }}
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((documentItem, idx) => {
              const title = documentItem.nom || documentItem.titre || 'Document'
              const contentLabel = documentItem.type_contenu === 'sujet_examen' ? 'Sujet d’examen' : 'Cours'
              const yearLabel = documentItem.annee_academique || documentItem.annee || ''

              return (
                <Card key={documentItem.id} className="p-5 hover:translate-y-[-2px] animate-fade-up">
                  <div className="flex flex-col gap-3" style={{ animationDelay: `${idx * 40}ms` }}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: '#eef2ff' }}>
                        <BookOpen size={18} style={{ color: 'var(--brand)' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2">
                          {title}
                        </h3>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>
                          {contentLabel}
                        </p>
                      </div>
                    </div>

                    <div className="px-3 py-2 rounded-lg text-xs"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                      {documentItem.filiere_nom && (
                        <p className="font-medium" style={{ color: 'var(--text-2)' }}>{documentItem.filiere_nom}</p>
                      )}
                      {(documentItem.ecole_nom || documentItem.code_ue || documentItem.intitule_ue) && (
                        <p className="mt-1" style={{ color: 'var(--text-3)' }}>
                          {documentItem.ecole_nom ? `${documentItem.ecole_nom} · ` : ''}
                          {documentItem.code_ue ? `${documentItem.code_ue} · ` : ''}
                          {documentItem.intitule_ue || ''}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="blue">{documentItem.type?.toUpperCase() || 'AUTRE'}</Badge>
                      <Badge variant="green">Disponible</Badge>
                      {documentItem.deja_telecharge && <Badge variant="purple">Téléchargé</Badge>}
                      {yearLabel && <span className="text-xs ml-auto" style={{ color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{yearLabel}</span>}
                    </div>

                    <div className="flex items-center justify-between pt-1 mt-auto"
                      style={{ borderTop: '1px solid var(--border)' }}>
                      <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-3)' }}>
                        <span className="flex items-center gap-1"><Eye size={12} />{documentItem.vues ?? 0}</span>
                        <span className="flex items-center gap-1"><Download size={12} />{documentItem.telechargements}</span>
                        {documentItem.taille_lisible && <span>{documentItem.taille_lisible}</span>}
                      </div>
                      <button
                        onClick={() => handleDownload(documentItem)}
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                        style={{
                          background: 'var(--brand)', color: 'white',
                          boxShadow: '0 2px 6px rgba(91,94,244,.3)'
                        }}>
                        <Download size={12} /> Télécharger
                      </button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {pagination && (
            <Pagination page={page} totalPages={pagination.totalPages} onPage={setPage} />
          )}
        </>
      )}

      <UploadCoursModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={() => { setUploadOpen(false); setPage(1) }}
      />
    </AppShell>
  )
}
