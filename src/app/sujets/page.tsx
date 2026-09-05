'use client'
// src/app/sujets/page.tsx

import { useState } from 'react'
import { api, sujetsService } from '@/lib/api'
import { usePaginatedQuery } from '@/hooks/useQuery'
import AppShell from '@/components/layout/AppShell'
import {
  Card, StatutBadge, SkeletonCard, EmptyState, Pagination, PageHeader, Button
} from '@/components/ui'
import UploadSujetModal from '@/components/modals/UploadSujetModal'
import { FileText, Download, Search, X, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import type { Sujet } from '@/types'

const TYPE_LABELS: Record<string, string> = {
  partiel: 'Partiel', rattrapage: 'Rattrapage',
  terminal: 'Terminal', tp: 'TP', td: 'TD',
}

const SESSION_COLORS: Record<string, { bg: string; color: string }> = {
  normale:    { bg: '#eff6ff', color: '#1d4ed8' },
  rattrapage: { bg: '#fff7ed', color: '#c2410c' },
}

export default function SujetsPage() {
  const { user, isAdmin, isEnseignant } = useAuth()

  const [search,      setSearch]    = useState('')
  const [type,        setType]      = useState('')
  const [session,     setSession]   = useState('')
  const [annee,       setAnnee]     = useState('')
  const [uploadOpen,  setUploadOpen] = useState(false)
  const [editingSujetId, setEditingSujetId] = useState<number | null>(null)
  const [editTitre, setEditTitre] = useState('')
  const [editSujetType, setEditSujetType] = useState<'partiel' | 'rattrapage' | 'terminal' | 'tp' | 'td'>('partiel')
  const [editSession, setEditSession] = useState<'normale' | 'rattrapage'>('normale')
  const [editAnnee, setEditAnnee] = useState(String(new Date().getFullYear()))
  const [editSujetFile, setEditSujetFile] = useState<File | null>(null)
  const [editCorrigeFile, setEditCorrigeFile] = useState<File | null>(null)

  const { items, pagination, loading, error, page, setPage, refetch } = usePaginatedQuery<Sujet>(
    (p) => sujetsService.list({
      page: p, limit: 12,
      ...(search  && { search }),
      ...(type    && { type }),
      ...(session && { session }),
      ...(annee   && { annee }),
    }),
    { search, type, session, annee }
  )

  const isOwner = (sujet: Sujet) => isAdmin || user?.id === sujet.enseignant?.id

  const openEditSujet = (sujet: Sujet) => {
    setEditingSujetId(sujet.id)
    setEditTitre(sujet.titre)
    setEditSujetType(sujet.type)
    setEditSession(sujet.session)
    setEditAnnee(String(sujet.annee))
  }

  const handleDeleteSujet = async (id: number) => {
    if (!window.confirm('Supprimer ce sujet ?')) return
    try {
      await sujetsService.supprimer(id)
      setEditingSujetId(null)
      refetch()
    } catch (err) {
      console.error('Erreur suppression sujet:', err)
      alert('Impossible de supprimer ce sujet.')
    }
  }

  const handleUpdateSujet = async (id: number) => {
    try {
      if (editSujetFile || editCorrigeFile) {
        const fd = new FormData()
        fd.append('titre', editTitre.trim())
        fd.append('type', editSujetType)
        fd.append('session', editSession)
        fd.append('annee', String(editAnnee))
        if (editSujetFile) fd.append('sujet', editSujetFile)
        if (editCorrigeFile) fd.append('corrige', editCorrigeFile)
        await sujetsService.update(id, fd)
      } else {
        await sujetsService.update(id, {
          titre: editTitre.trim(),
          type: editSujetType,
          session: editSession,
          annee: Number(editAnnee),
        })
      }
      setEditingSujetId(null)
      refetch()
    } catch (err) {
      console.error('Erreur modification sujet:', err)
      alert('Impossible de modifier ce sujet.')
    }
  }


  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 8 }, (_, i) => currentYear - i)

  const hasFilters = search || type || session || annee

const handleDownload = async (id: number, corrige = false) => {
  try {
    const response = await api.get(
      `/sujets/${id}/telecharger${corrige ? '?corrige=true' : ''}`,
      { responseType: 'blob' }
    );

    // Récupérer le nom du fichier depuis Content-Disposition
    const disposition = response.headers['content-disposition'];
    let filename = `sujet_${id}${corrige ? '_corrige' : ''}.pdf`;
    if (disposition) {
      const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^;"'\n]+)/i);
      if (match) filename = decodeURIComponent(match[1].replace(/['"]/g, ''));
    }

    // Créer un lien temporaire pour déclencher le téléchargement
    const url = URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Erreur téléchargement:', error);
    // Afficher une notification d'erreur
  }
};


  return (
    <AppShell>
      <PageHeader
        title="Anciens sujets d'examen"
        description="Retrouvez tous les sujets et corrigés disponibles"
        action={
          (isAdmin || isEnseignant) && (
            <Button onClick={() => setUploadOpen(true)}>
              + Déposer un sujet
            </Button>
          )
        }
      />

      {/* Filtres */}
      <Card className="p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 flex-1 min-w-[180px] px-3 py-2 rounded-xl"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <Search size={14} style={{ color: 'var(--text-3)' }} />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Rechercher…"
              className="flex-1 bg-transparent outline-none text-sm" />
          </div>

          <select value={type} onChange={e => { setType(e.target.value); setPage(1) }}
            className="px-3 py-2 rounded-xl text-sm outline-none cursor-pointer"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
            <option value="">Type d&apos;épreuve</option>
            {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>

          <select value={session} onChange={e => { setSession(e.target.value); setPage(1) }}
            className="px-3 py-2 rounded-xl text-sm outline-none cursor-pointer"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
            <option value="">Session</option>
            <option value="normale">Normale</option>
            <option value="rattrapage">Rattrapage</option>
          </select>

          <select value={annee} onChange={e => { setAnnee(e.target.value); setPage(1) }}
            className="px-3 py-2 rounded-xl text-sm outline-none cursor-pointer"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
            <option value="">Toutes les années</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          {hasFilters && (
            <button onClick={() => { setSearch(''); setType(''); setSession(''); setAnnee(''); setPage(1) }}
              className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl"
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

      {error ? (
        <div className="text-center py-12 text-sm" style={{ color: 'var(--red)' }}>{error}</div>
      ) : loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState title="Aucun sujet trouvé" description={hasFilters ? 'Modifiez vos filtres.' : 'Aucun sujet disponible.'} />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((sujet, idx) => {
              const sessionStyle = SESSION_COLORS[sujet.session] ?? SESSION_COLORS.normale
              return (
                <Card key={sujet.id} className="p-5 flex flex-col gap-3 hover:translate-y-[-2px] animate-fade-up"
                  >

                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: sessionStyle.bg }}>
                      <FileText size={18} style={{ color: sessionStyle.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">{sujet.titre}</h3>
                      {sujet.ue && (
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                          <span style={{ fontFamily: 'var(--font-mono)' }}>{sujet.ue.code}</span>
                          {' · '}{sujet.ue.intitule}
                        </p>
                      )}
                    </div>
                  </div>

                  {isOwner(sujet) && (
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => openEditSujet(sujet)}
                        className="text-xs font-medium px-2.5 py-1.5 rounded-lg border"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-2)', background: 'var(--surface-2)' }}>
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteSujet(sujet.id)}
                        className="text-xs font-medium px-2.5 py-1.5 rounded-lg border"
                        style={{ borderColor: 'rgba(220,38,38,.2)', color: '#b91c1c', background: 'rgba(220,38,38,.06)' }}>
                        Supprimer
                      </button>
                    </div>
                  )}

                  {editingSujetId === sujet.id && isOwner(sujet) && (
                    <div className="rounded-xl p-3 space-y-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                      <input
                        value={editTitre}
                        onChange={(e) => setEditTitre(e.target.value)}
                        className="w-full rounded-lg px-2.5 py-2 text-sm border outline-none"
                        style={{ borderColor: 'var(--border)', background: 'white' }}
                        placeholder="Titre du sujet"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={editSujetType}
                          onChange={(e) => setEditSujetType(e.target.value as 'partiel' | 'rattrapage' | 'terminal' | 'tp' | 'td')}
                          className="w-full rounded-lg px-2.5 py-2 text-sm border outline-none"
                          style={{ borderColor: 'var(--border)', background: 'white' }}
                        >
                          <option value="partiel">Partiel</option>
                          <option value="rattrapage">Rattrapage</option>
                          <option value="terminal">Terminal</option>
                          <option value="tp">TP</option>
                          <option value="td">TD</option>
                        </select>
                        <select
                          value={editSession}
                          onChange={(e) => setEditSession(e.target.value as 'normale' | 'rattrapage')}
                          className="w-full rounded-lg px-2.5 py-2 text-sm border outline-none"
                          style={{ borderColor: 'var(--border)', background: 'white' }}
                        >
                          <option value="normale">Normale</option>
                          <option value="rattrapage">Rattrapage</option>
                        </select>
                      </div>
                      <select
                        value={editAnnee}
                        onChange={(e) => setEditAnnee(e.target.value)}
                        className="w-full rounded-lg px-2.5 py-2 text-sm border outline-none"
                        style={{ borderColor: 'var(--border)', background: 'white' }}
                      >
                        {Array.from({ length: 8 }, (_, i) => currentYear - i).map((year) => (
                          <option key={year} value={String(year)}>{year}</option>
                        ))}
                      </select>

                      <div className="space-y-2">
                        <label className="text-xs">Remplacer le sujet (fichier)</label>
                        <input type="file" accept="application/pdf" onChange={(e) => setEditSujetFile(e.target.files?.[0] ?? null)} />
                        <label className="text-xs">Remplacer le corrigé (optionnel)</label>
                        <input type="file" accept="application/pdf" onChange={(e) => setEditCorrigeFile(e.target.files?.[0] ?? null)} />
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button onClick={() => setEditingSujetId(null)} className="text-xs px-2.5 py-1.5 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>Annuler</button>
                        <button onClick={() => handleUpdateSujet(sujet.id)} className="text-xs px-2.5 py-1.5 rounded-lg" style={{ background: 'var(--brand)', color: 'white' }}>Enregistrer</button>
                      </div>
                    </div>
                  )}

                  {/* Méta */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                      style={{ background: sessionStyle.bg, color: sessionStyle.color }}>
                      {TYPE_LABELS[sujet.type] ?? sujet.type}
                    </span>
                    <span className="text-xs font-mono px-2 py-1 rounded-lg"
                      style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}>
                      {sujet.annee}
                    </span>
                    {sujet.avecCorrige && (
                      <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
                        style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                        <CheckCircle2 size={11} /> Corrigé
                      </span>
                    )}
                    {(isAdmin || isEnseignant) && <StatutBadge statut={sujet.statut} />}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 mt-auto"
                    style={{ borderTop: '1px solid var(--border)' }}>
                    <span className="flex items-center gap-1 text-xs mr-auto"
                      style={{ color: 'var(--text-3)' }}>
                      <Download size={11} /> {sujet.telechargements}
                    </span>
                    <button onClick={() => handleDownload(sujet.id)}
                      className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                      style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                      <Download size={11} /> Sujet
                    </button>
                    {sujet.avecCorrige && (
                      <button onClick={() => handleDownload(sujet.id, true)}
                        className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                        style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                        <Download size={11} /> Corrigé
                      </button>
                    )}
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

      <UploadSujetModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={() => { setUploadOpen(false); setPage(1); refetch() }}
      />
    </AppShell>
  )
}