'use client'
// src/components/modals/UploadCoursModal.tsx
// Formulaire de dépôt d'un cours — Enseignant ou Admin

import { useState, useEffect } from 'react'
import Modal from './Modal'
import { FormField, Input, Select, Textarea, FileInput, FormRow, FormSection } from '../shared/FormField'
import { Button } from '../ui'
import { coursService, filieresService } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { AxiosError } from 'axios'
import type { Filiere, UE } from '@/types'

interface Props {
  open:     boolean
  onClose:  () => void
  onSuccess: () => void
}

interface FieldErrors { [key: string]: string }

export default function UploadCoursModal({ open, onClose, onSuccess }: Props) {
  const { user, isAdmin } = useAuth()

  const [titre,        setTitre]       = useState('')
  const [description,  setDescription] = useState('')
  const [type,         setType]        = useState('pdf')
  const [annee,        setAnnee]       = useState(`${new Date().getFullYear()}-${new Date().getFullYear() + 1}`)
  const [filiereId,    setFiliereId]   = useState(String(user?.filiere?.id ?? ''))
  const [ueId,         setUeId]        = useState('')
  const [fichier,      setFichier]     = useState<File | null>(null)
  const [loading,      setLoading]     = useState(false)
  const [errors,       setErrors]      = useState<FieldErrors>({})
  const [apiError,     setApiError]    = useState('')

  const [filieres, setFilieres] = useState<Filiere[]>([])
  const [ues,      setUes]      = useState<UE[]>([])

  // Charger les filières (admin peut choisir, enseignant est fixé)
  useEffect(() => {
    if (!open) return
    filieresService.list().then(r => {
      const data = (r.data as { data: Filiere[] }).data
      setFilieres(data)
      if (!isAdmin && user?.filiere?.id) setFiliereId(String(user.filiere.id))
    }).catch(() => {})
  }, [open, isAdmin, user])

  // Charger les UEs quand la filière change
  useEffect(() => {
    if (!filiereId) { setUes([]); setUeId(''); return }
    filieresService.ues(parseInt(filiereId)).then(r => {
      const data = (r.data as { data: UE[] }).data
      setUes(data)
      setUeId('')
    }).catch(() => {})
  }, [filiereId])

  const validate = (): boolean => {
    const e: FieldErrors = {}
    if (!titre.trim())   e.titre   = 'Le titre est obligatoire'
    if (!ueId)           e.ueId    = 'Veuillez sélectionner une UE'
    if (!fichier)        e.fichier = 'Veuillez joindre un fichier'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    setApiError('')

    const formData = new FormData()
    formData.append('titre',           titre.trim())
    formData.append('description',     description)
    formData.append('type',            type)
    formData.append('ue_id',           ueId)
    formData.append('anneAcademique',  annee)
    formData.append('fichier',         fichier!)

    try {
      await coursService.create(formData)
      handleClose()
      onSuccess()
    } catch (err) {
      const e = err as AxiosError<{ message: string }>
      setApiError(e.response?.data?.message || 'Erreur lors du dépôt du cours')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setTitre(''); setDescription(''); setType('pdf'); setUeId('')
    setFichier(null); setErrors({}); setApiError('')
    onClose()
  }

  const currentYear = new Date().getFullYear()
  const anneesOptions = Array.from({ length: 4 }, (_, i) => {
    const y = currentYear - 1 + i
    return { value: `${y}-${y + 1}`, label: `${y}-${y + 1}` }
  })

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Déposer un cours"
      subtitle="Le cours sera soumis à validation avant publication"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={loading}>Annuler</Button>
          <Button onClick={handleSubmit} loading={loading}>
            {loading ? 'Dépôt en cours…' : 'Déposer le cours'}
          </Button>
        </>
      }>

      <div className="space-y-5">
        {apiError && (
          <div className="px-4 py-3 rounded-xl text-sm"
            style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' }}>
            {apiError}
          </div>
        )}

        <FormSection title="Informations">
          <FormField label="Titre du cours" required error={errors.titre}>
            <Input value={titre} onChange={e => setTitre(e.target.value)}
              placeholder="ex : Algorithmique avancée — Chapitre 3"
              error={!!errors.titre} />
          </FormField>

          <FormField label="Description" hint="Optionnelle — quelques mots sur le contenu">
            <Textarea value={description} onChange={e => setDescription(e.target.value)}
              rows={3} placeholder="Résumé du cours…" />
          </FormField>

          <FormRow>
            <FormField label="Type de fichier">
              <Select value={type} onChange={e => setType(e.target.value)}
                options={[
                  { value: 'pdf',   label: 'PDF' },
                  { value: 'video', label: 'Vidéo' },
                  { value: 'slide', label: 'Présentation / Slides' },
                  { value: 'autre', label: 'Autre' },
                ]} />
            </FormField>
            <FormField label="Année académique">
              <Select value={annee} onChange={e => setAnnee(e.target.value)} options={anneesOptions} />
            </FormField>
          </FormRow>
        </FormSection>

        <FormSection title="Rattachement">
          {isAdmin && (
            <FormField label="Filière" required>
              <Select value={filiereId} onChange={e => setFiliereId(e.target.value)}
                placeholder="Sélectionner une filière"
                options={filieres.map(f => ({ value: String(f.id), label: f.nom }))} />
            </FormField>
          )}
          {!isAdmin && user?.filiere && (
            <div className="px-4 py-2.5 rounded-xl text-sm"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
              Filière : <strong>{user.filiere.nom}</strong>
            </div>
          )}

          <FormField label="Unité d'enseignement (UE)" required error={errors.ueId}>
            <Select value={ueId} onChange={e => setUeId(e.target.value)}
              placeholder={filiereId ? 'Sélectionner une UE' : 'Choisissez d\'abord une filière'}
              disabled={!filiereId || ues.length === 0}
              error={!!errors.ueId}
              options={ues.map(u => ({ value: String(u.id), label: `${u.code} — ${u.intitule} (${u.niveau})` }))} />
          </FormField>
        </FormSection>

        <FormSection title="Fichier">
          <FileInput
            label="Fichier du cours"
            accept=".pdf,.mp4,.webm,.pptx,.docx"
            onChange={setFichier}
            file={fichier}
            error={errors.fichier}
            hint="PDF, vidéo, slides — max 50 MB"
            required
          />
        </FormSection>
      </div>
    </Modal>
  )
}
