'use client'
// src/components/modals/UploadSujetModal.tsx

import { useState, useEffect } from 'react'
import Modal from './Modal'
import { FormField, Input, Select, FileInput, FormRow, FormSection } from '../shared/FormField'
import { Button } from '../ui'
import { sujetsService, filieresService } from '@/lib/api'
import { uploaderFichiers } from '@/lib/upload'
import { useAuth } from '@/lib/auth-context'
import { AxiosError } from 'axios'
import type { Filiere, UE } from '@/types'

interface Props { open: boolean; onClose: () => void; onSuccess: () => void }
interface FieldErrors { [key: string]: string }

export default function UploadSujetModal({ open, onClose, onSuccess }: Props) {
  const { user, isAdmin } = useAuth()

  const [titre,         setTitre]        = useState('')
  const [type,          setType]         = useState('partiel')
  const [session,       setSession]      = useState('normale')
  const [annee,         setAnnee]        = useState(String(new Date().getFullYear()))
  const [ueId,          setUeId]         = useState('')
  const [filiereId,     setFiliereId]    = useState(String(user?.filiere?.id ?? ''))
  const [fichierSujet,  setFichierSujet] = useState<File | null>(null)
  const [fichierCorrige,setFichierCorrige] = useState<File | null>(null)
  const [loading,       setLoading]      = useState(false)
  const [uploadStep,    setUploadStep]   = useState('')
  const [errors,        setErrors]       = useState<FieldErrors>({})
  const [apiError,      setApiError]     = useState('')

  const [filieres, setFilieres] = useState<Filiere[]>([])
  const [ues,      setUes]      = useState<UE[]>([])

  useEffect(() => {
    if (!open) return
    filieresService.list().then(r => {
      setFilieres((r.data as { data: Filiere[] }).data)
      if (!isAdmin && user?.filiere?.id) setFiliereId(String(user.filiere.id))
    }).catch(() => {})
  }, [open, isAdmin, user])

  useEffect(() => {
    if (!filiereId) { setUes([]); setUeId(''); return }
    filieresService.ues(parseInt(filiereId)).then(r => {
      setUes((r.data as { data: UE[] }).data)
      setUeId('')
    }).catch(() => {})
  }, [filiereId])

  const validate = (): boolean => {
    const e: FieldErrors = {}
    if (!titre.trim())   e.titre       = 'Le titre est obligatoire'
    if (!ueId)           e.ueId        = 'Veuillez sélectionner une UE'
    if (!fichierSujet)   e.fichierSujet = 'Le fichier sujet est obligatoire'
    if (annee && (parseInt(annee) < 2000 || parseInt(annee) > 2099)) e.annee = 'Année invalide'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    setApiError('')

    try {
      setUploadStep('Envoi du sujet…')
      const filesToUpload = fichierCorrige ? [fichierSujet!, fichierCorrige] : [fichierSujet!]
      const [sujetUploade, corrigeUploade] = await uploaderFichiers(filesToUpload)

      setUploadStep('Enregistrement…')
      await sujetsService.create({
        titre:   titre.trim(),
        type,
        session,
        annee,
        ue_id:   ueId,
        sujet:   sujetUploade,
        ...(corrigeUploade ? { corrige: corrigeUploade } : {}),
      })
      handleClose()
      onSuccess()
    } catch (err) {
      const e = err as AxiosError<{ message: string }>
      setApiError(e.response?.data?.message || 'Erreur lors du dépôt du sujet')
    } finally {
      setLoading(false)
      setUploadStep('')
    }
  }

  const handleClose = () => {
    setTitre(''); setType('partiel'); setSession('normale')
    setAnnee(String(new Date().getFullYear())); setUeId('')
    setFichierSujet(null); setFichierCorrige(null)
    setErrors({}); setApiError('')
    onClose()
  }

  const years = Array.from({ length: 8 }, (_, i) => {
    const y = new Date().getFullYear() - i
    return { value: String(y), label: String(y) }
  })

  return (
    <Modal
      open={open} onClose={handleClose}
      title="Déposer un sujet d'examen"
      subtitle="Vous pouvez joindre le corrigé en option"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={loading}>Annuler</Button>
          <Button onClick={handleSubmit} loading={loading}>
            {loading ? (uploadStep || 'Dépôt en cours…') : 'Déposer le sujet'}
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
          <FormField label="Titre du sujet" required error={errors.titre}>
            <Input value={titre} onChange={e => setTitre(e.target.value)}
              placeholder="ex : Examen partiel Algorithmique S5 — 2023"
              error={!!errors.titre} />
          </FormField>

          <FormRow>
            <FormField label="Type d'épreuve">
              <Select value={type} onChange={e => setType(e.target.value)}
                options={[
                  { value: 'cc',   label: 'Controlle continue' },
                  { value: 'sn',  label: 'Session Normale' },
                  { value: 'rattrapage',label: 'Rattrapage' },
                  { value: 'tp',        label: 'TP' },
                  { value: 'td',        label: 'TD' },
                ]} />
            </FormField>
            <FormField label="Session">
              <Select value={session} onChange={e => setSession(e.target.value)}
                options={[
                  { value: 'normale',    label: 'Session normale' },
                  { value: 'rattrapage', label: 'Session de rattrapage' },
                ]} />
            </FormField>
          </FormRow>

          <FormField label="Année" required error={errors.annee}>
            <Select value={annee} onChange={e => setAnnee(e.target.value)} options={years} />
          </FormField>
        </FormSection>

        <FormSection title="Rattachement">
          {isAdmin && (
            <FormField label="Filière" required>
              <Select value={filiereId} onChange={e => setFiliereId(e.target.value)}
                placeholder="Sélectionner une filière"
                options={filieres.map(f => ({ value: String(f.id), label: f.nom }))} />
            </FormField>
          )}

          <FormField label="Unité d'enseignement (UE)" required error={errors.ueId}>
            <Select value={ueId} onChange={e => setUeId(e.target.value)}
              placeholder={filiereId ? 'Sélectionner une UE' : 'Choisissez d\'abord une filière'}
              disabled={!filiereId || ues.length === 0}
              error={!!errors.ueId}
              options={ues.map(u => ({ value: String(u.id), label: `${u.code} — ${u.intitule} (${u.niveau})` }))} />
          </FormField>
        </FormSection>

        <FormSection title="Fichiers">
          <FileInput
            label="Sujet d'examen" accept=".pdf" required
            onChange={setFichierSujet} file={fichierSujet}
            error={errors.fichierSujet} hint="Format PDF uniquement" />

          <FileInput
            label="Corrigé (optionnel)" accept=".pdf"
            onChange={setFichierCorrige} file={fichierCorrige}
            hint="Si disponible — format PDF" />
        </FormSection>
      </div>
    </Modal>
  )
}
