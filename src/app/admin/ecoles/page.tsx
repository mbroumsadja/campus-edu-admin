'use client'
// src/app/admin/ecoles/page.tsx
// Gestion des écoles

import { useEffect, useState } from 'react'
import { AxiosError } from 'axios'
import { ecolesService } from '@/lib/api'
import { useQuery } from '@/hooks/useQuery'
import AppShell from '@/components/layout/AppShell'
import { Card, EmptyState, PageHeader, Button, LoadingPage, ErrorState } from '@/components/ui'
import Modal from '@/components/modals/Modal'
import { FormField, Input } from '@/components/shared/FormField'
import { Building2, Plus, Pencil, Trash2 } from 'lucide-react'

interface Ecole {
  id: number
  ecole: string
  createdAt?: string
}

function CreateEcoleModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [nom, setNom] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!nom.trim()) {
      setError('Le nom de l’école est obligatoire')
      return
    }

    setLoading(true)
    setError('')
    try {
      await ecolesService.create({ ecole: nom.trim() })
      setNom('')
      onSuccess()
    } catch (err) {
      const e = err as AxiosError<{ message: string }>
      setError(e.response?.data?.message || 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nouvelle école" size="sm"
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
        <FormField label="Nom de l’école" required>
          <Input value={nom} onChange={e => setNom(e.target.value)} placeholder="École Nationale d’Informatique" />
        </FormField>
      </div>
    </Modal>
  )
}

function EditEcoleModal({ open, onClose, onSuccess, ecole }: { open: boolean; onClose: () => void; onSuccess: () => void; ecole: Ecole | null }) {
  const [nom, setNom] = useState(ecole?.ecole ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setNom(ecole?.ecole ?? '')
  }, [ecole])

  const handleSubmit = async () => {
    if (!ecole || !nom.trim()) {
      setError('Le nom de l’école est obligatoire')
      return
    }

    setLoading(true)
    setError('')
    try {
      await ecolesService.update(ecole.id, { ecole: nom.trim() })
      onSuccess()
    } catch (err) {
      const e = err as AxiosError<{ message: string }>
      setError(e.response?.data?.message || 'Erreur lors de la modification')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Modifier l’école" size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Annuler</Button>
          <Button onClick={handleSubmit} loading={loading}>Enregistrer</Button>
        </>
      }>
      <div className="space-y-4">
        {error && (
          <div className="px-4 py-3 rounded-xl text-sm"
            style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' }}>
            {error}
          </div>
        )}
        <FormField label="Nom de l’école" required>
          <Input value={nom} onChange={e => setNom(e.target.value)} placeholder="École Nationale d’Informatique" />
        </FormField>
      </div>
    </Modal>
  )
}

export default function AdminEcolesPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedEcole, setSelectedEcole] = useState<Ecole | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const { data: raw, loading, error, refetch } = useQuery(ecolesService.list)
  const ecoles: Ecole[] = (raw as unknown as Ecole[]) ?? []

  const handleDelete = async (id: number) => {
    if (!window.confirm('Supprimer cette école ?')) return
    setDeletingId(id)
    try {
      await ecolesService.delete(id)
      await refetch()
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Écoles"
        description="Gérez les établissements disponibles dans la plateforme"
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus size={14} /> Nouvelle école
          </Button>
        }
      />

      {loading ? (
        <LoadingPage />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : ecoles.length === 0 ? (
        <EmptyState
          title="Aucune école"
          description="Ajoutez la première école pour commencer la gestion académique."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus size={14} /> Créer une école
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ecoles.map((ecole) => (
            <Card key={ecole.id} className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)' }}>
                  <Building2 size={18} style={{ color: 'var(--brand)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{ecole.ecole}</h3>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>Identifiant #{ecole.id}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button
                  onClick={() => { setSelectedEcole(ecole); setEditOpen(true) }}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
                  style={{ background: '#eef2ff', color: 'var(--brand)', border: '1px solid #c7d2fe' }}>
                  <Pencil size={12} /> Modifier
                </button>
                <button
                  onClick={() => handleDelete(ecole.id)}
                  disabled={deletingId === ecole.id}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
                  style={{ background: '#fef2f2', color: 'var(--red)', border: '1px solid #fecaca' }}>
                  <Trash2 size={12} /> {deletingId === ecole.id ? '...' : 'Supprimer'}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CreateEcoleModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => { setCreateOpen(false); refetch() }}
      />

      <EditEcoleModal
        open={editOpen}
        onClose={() => { setEditOpen(false); setSelectedEcole(null) }}
        onSuccess={() => { setEditOpen(false); setSelectedEcole(null); refetch() }}
        ecole={selectedEcole}
      />
    </AppShell>
  )
}
