'use client'
// src/app/admin/filieres/page.tsx
// Gestion des filières et unités d'enseignement

import { useState } from 'react'
import { filieresService } from '@/lib/api'
import { useQuery } from '@/hooks/useQuery'
import AppShell from '@/components/layout/AppShell'
import {
  Card, EmptyState, PageHeader, Button, LoadingPage, ErrorState
} from '@/components/ui'
import Modal from '@/components/modals/Modal'
import { FormField, Input, Select, FormRow, FormSection } from '@/components/shared/FormField'
import {
  FolderOpen, ChevronDown, ChevronRight, Plus,
  BookOpen, GraduationCap, Hash
} from 'lucide-react'
import { AxiosError } from 'axios'
import type { Filiere, UE } from '@/types'

// ── Couleurs par niveau ───────────────────────────────────────────
const NIVEAU_STYLE: Record<string, { bg: string; color: string }> = {
  L1: { bg: '#eff6ff', color: '#1d4ed8' },
  L2: { bg: '#f0fdf4', color: '#15803d' },
  L3: { bg: '#fdf4ff', color: '#7e22ce' },
  M1: { bg: '#fff7ed', color: '#c2410c' },
  M2: { bg: '#fef2f2', color: '#b91c1c' },
}

// ── Modal Filière ─────────────────────────────────────────────────
function CreateFiliereModal({ open, onClose, onSuccess }: {
  open: boolean; onClose: () => void; onSuccess: () => void
}) {
  const [code,        setCode]        = useState('')
  const [nom,         setNom]         = useState('')
  const [departement, setDepartement] = useState('')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')

  const handleSubmit = async () => {
    if (!code.trim() || !nom.trim()) { setError('Code et nom sont obligatoires'); return }
    setLoading(true); setError('')
    try {
      await filieresService.create({ code: code.trim().toUpperCase(), nom: nom.trim(), departement: departement.trim() })
      setCode(''); setNom(''); setDepartement('')
      onSuccess()
    } catch (err) {
      const e = err as AxiosError<{ message: string }>
      setError(e.response?.data?.message || 'Erreur lors de la création')
    } finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nouvelle filière" size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Annuler</Button>
          <Button onClick={handleSubmit} loading={loading}>Créer</Button>
        </>
      }>
      <div className="space-y-4">
        {error && (
          <div className="px-4 py-3 rounded-xl text-sm"
            style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' }}>
            {error}
          </div>
        )}
        <FormField label="Code" required hint="Ex : INFO, MATH, GC">
          <Input value={code} onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="INFO" style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }} />
        </FormField>
        <FormField label="Nom complet" required>
          <Input value={nom} onChange={e => setNom(e.target.value)} placeholder="Informatique" />
        </FormField>
        <FormField label="Département">
          <Input value={departement} onChange={e => setDepartement(e.target.value)}
            placeholder="Sciences & Technologies" />
        </FormField>
      </div>
    </Modal>
  )
}

// ── Modal UE ──────────────────────────────────────────────────────
function CreateUEModal({ open, onClose, onSuccess, filiereId, filiereName }: {
  open: boolean; onClose: () => void; onSuccess: () => void
  filiereId: number; filiereName: string
}) {
  const [code,     setCode]     = useState('')
  const [intitule, setIntitule] = useState('')
  const [niveau,   setNiveau]   = useState('L1')
  const [semestre, setSemestre] = useState('S1')
  const [credits,  setCredits]  = useState('3')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  // Map niveau → semestres possibles
  const SEMESTRES_BY_NIVEAU: Record<string, string[]> = {
    L1: ['S1', 'S2'], L2: ['S3', 'S4'], L3: ['S5', 'S6'],
    M1: ['S7', 'S8'], M2: ['S9', 'S10'],
  }

  const semestresDispos = SEMESTRES_BY_NIVEAU[niveau] ?? ['S1', 'S2']

  const handleNiveauChange = (n: string) => {
    setNiveau(n)
    setSemestre(SEMESTRES_BY_NIVEAU[n]?.[0] ?? 'S1')
  }

  const handleSubmit = async () => {
    if (!code.trim() || !intitule.trim()) { setError('Code et intitulé sont obligatoires'); return }
    setLoading(true); setError('')
    try {
      await filieresService.creerUE(filiereId, {
        code: code.trim().toUpperCase(), intitule: intitule.trim(),
        niveau, semestre, credits: parseInt(credits) || 3,
      })
      setCode(''); setIntitule(''); setNiveau('L1'); setSemestre('S1'); setCredits('3')
      onSuccess()
    } catch (err) {
      const e = err as AxiosError<{ message: string }>
      setError(e.response?.data?.message || 'Erreur lors de la création')
    } finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose}
      title="Nouvelle UE"
      subtitle={`Filière : ${filiereName}`}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Annuler</Button>
          <Button onClick={handleSubmit} loading={loading}>Créer l&apos;UE</Button>
        </>
      }>
      <div className="space-y-5">
        {error && (
          <div className="px-4 py-3 rounded-xl text-sm"
            style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' }}>
            {error}
          </div>
        )}
        <FormSection title="Identification">
          <FormField label="Code" required hint="Ex : INFO301, MATH201">
            <Input value={code} onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="INFO301"
              style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }} />
          </FormField>
          <FormField label="Intitulé" required>
            <Input value={intitule} onChange={e => setIntitule(e.target.value)}
              placeholder="Algorithmique avancée" />
          </FormField>
        </FormSection>

        <FormSection title="Niveau & Crédits">
          <FormRow>
            <FormField label="Niveau">
              <Select value={niveau} onChange={e => handleNiveauChange(e.target.value)}
                options={['L1','L2','L3','M1','M2'].map(v => ({ value: v, label: v }))} />
            </FormField>
            <FormField label="Semestre">
              <Select value={semestre} onChange={e => setSemestre(e.target.value)}
                options={semestresDispos.map(s => ({ value: s, label: s }))} />
            </FormField>
          </FormRow>
          <FormField label="Crédits ECTS">
            <Input type="number" value={credits} onChange={e => setCredits(e.target.value)}
              min="1" max="10" />
          </FormField>
        </FormSection>
      </div>
    </Modal>
  )
}

// ── Carte filière expandable ──────────────────────────────────────
function FiliereCard({
  filiere, onAddUE, onRefresh,
}: {
  filiere: Filiere
  onAddUE: (f: Filiere) => void
  onRefresh: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [ues, setUes]           = useState<UE[]>([])
  const [loadingUEs, setLoadingUEs] = useState(false)

  const toggleExpand = async () => {
    if (!expanded && ues.length === 0) {
      setLoadingUEs(true)
      try {
        const r = await filieresService.ues(filiere.id)
        setUes((r.data as { data: UE[] }).data)
      } catch { /* ignore */ } finally { setLoadingUEs(false) }
    }
    setExpanded(v => !v)
  }

  // Grouper les UEs par niveau
  const byNiveau = ues.reduce<Record<string, UE[]>>((acc, ue) => {
    ;(acc[ue.niveau] = acc[ue.niveau] ?? []).push(ue)
    return acc
  }, {})

  return (
    <Card className="overflow-hidden">
      {/* Header filière */}
      <div
        className="flex items-center gap-4 p-5 cursor-pointer hover:bg-gray-50/50 transition-colors select-none"
        onClick={toggleExpand}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #eef2ff, #ddd6fe)' }}>
          <FolderOpen size={18} style={{ color: 'var(--brand)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-semibold text-gray-900">{filiere.nom}</h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded-md"
              style={{ background: '#eef2ff', color: 'var(--brand)' }}>
              {filiere.code}
            </span>
          </div>
          {filiere.departement && (
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-3)' }}>{filiere.departement}</p>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onAddUE(filiere) }}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
            style={{ background: '#eef2ff', color: 'var(--brand)', border: '1px solid #c7d2fe' }}>
            <Plus size={12} /> UE
          </button>
          {expanded
            ? <ChevronDown size={16} style={{ color: 'var(--text-3)' }} />
            : <ChevronRight size={16} style={{ color: 'var(--text-3)' }} />}
        </div>
      </div>

      {/* UEs expandable */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)' }}>
          {loadingUEs ? (
            <div className="p-6 text-center text-sm" style={{ color: 'var(--text-3)' }}>
              Chargement des UEs…
            </div>
          ) : ues.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm" style={{ color: 'var(--text-3)' }}>Aucune UE dans cette filière.</p>
              <button
                onClick={() => onAddUE(filiere)}
                className="mt-3 text-sm font-medium"
                style={{ color: 'var(--brand)' }}>
                + Ajouter la première UE
              </button>
            </div>
          ) : (
            <div className="p-5 space-y-4">
              {['L1','L2','L3','M1','M2'].filter(n => byNiveau[n]?.length).map(niveau => (
                <div key={niveau}>
                  {/* Titre niveau */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={NIVEAU_STYLE[niveau]}>
                      {niveau}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-3)' }}>
                      {byNiveau[niveau].length} UE{byNiveau[niveau].length > 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Liste UEs */}
                  <div className="space-y-1.5 pl-2">
                    {byNiveau[niveau].map(ue => (
                      <div key={ue.id}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl group"
                        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                        <BookOpen size={13} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                        <span className="text-xs font-mono font-medium"
                          style={{ color: NIVEAU_STYLE[niveau].color, flexShrink: 0 }}>
                          {ue.code}
                        </span>
                        <span className="text-sm text-gray-700 flex-1 truncate">{ue.intitule}</span>
                        <div className="flex items-center gap-2 flex-shrink-0 text-xs"
                          style={{ color: 'var(--text-3)' }}>
                          <Hash size={11} />
                          <span>{ue.credits} crédits</span>
                          <span className="px-1.5 py-0.5 rounded-md"
                            style={{ background: '#f1f5f9', color: '#64748b' }}>
                            {ue.semestre}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

// ── Page principale ───────────────────────────────────────────────
export default function AdminFilieresPage() {
  const [filiereModalOpen, setFiliereModalOpen] = useState(false)
  const [ueModalOpen,      setUeModalOpen]      = useState(false)
  const [selectedFiliere,  setSelectedFiliere]  = useState<Filiere | null>(null)

  const { data: raw, loading, error, refetch } = useQuery(filieresService.list)
  const filieres: Filiere[] = (raw as unknown as Filiere[]) ?? []

  const handleAddUE = (filiere: Filiere) => {
    setSelectedFiliere(filiere)
    setUeModalOpen(true)
  }

  return (
    <AppShell>
      <PageHeader
        title="Filières & Ues"
        description="Gérez la structure pédagogique de l'université"
        action={
          <Button onClick={() => setFiliereModalOpen(true)}>
            <Plus size={14} /> Nouvelle filière
          </Button>
        }
      />

      {/* Résumé */}
      {filieres.length > 0 && (
        <div className="flex items-center gap-6 mb-6 px-5 py-4 rounded-2xl animate-fade-in"
          style={{ background: 'white', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2">
            <FolderOpen size={16} style={{ color: 'var(--brand)' }} />
            <span className="text-sm font-medium text-gray-700">
              <strong className="font-display text-lg" style={{ color: 'var(--brand)' }}>
                {filieres.length}
              </strong>
              {' '}filière{filieres.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="w-px h-5" style={{ background: 'var(--border)' }} />
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>
            Cliquez sur une filière pour voir et gérer ses UEs
          </p>
        </div>
      )}

      {/* Contenu */}
      {loading ? (
        <LoadingPage />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : filieres.length === 0 ? (
        <EmptyState
          title="Aucune filière"
          description="Commencez par créer la première filière de l'université."
          action={
            <Button onClick={() => setFiliereModalOpen(true)}>
              <Plus size={14} /> Créer une filière
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {filieres.map((f, idx) => (
            <div key={f.id} className="animate-fade-up" style={{ animationDelay: `${idx * 60}ms` }}>
              <FiliereCard filiere={f} onAddUE={handleAddUE} onRefresh={refetch} />
            </div>
          ))}
        </div>
      )}

      {/* Modales */}
      <CreateFiliereModal
        open={filiereModalOpen}
        onClose={() => setFiliereModalOpen(false)}
        onSuccess={() => { setFiliereModalOpen(false); refetch() }}
      />

      {selectedFiliere && (
        <CreateUEModal
          open={ueModalOpen}
          onClose={() => { setUeModalOpen(false); setSelectedFiliere(null) }}
          onSuccess={() => { setUeModalOpen(false); refetch() }}
          filiereId={selectedFiliere.id}
          filiereName={selectedFiliere.nom}
        />
      )}
    </AppShell>
  )
}
