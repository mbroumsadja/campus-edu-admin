'use client'
// src/components/modals/CreateUserModal.tsx

import { useState, useEffect } from 'react'
import Modal from './Modal'
import { FormField, Input, Select, FormRow, FormSection } from '../shared/FormField'
import { Button } from '../ui'
import { usersService, filieresService } from '@/lib/api'
import { AxiosError } from 'axios'
import type { Filiere } from '@/types'

interface Props { open: boolean; onClose: () => void; onSuccess: () => void }
interface FieldErrors { [key: string]: string }

// Format matricule selon le rôle
const MATRICULE_HINTS: Record<string, string> = {
  etudiant:   'Format : 22FS0001 (2 chiffres + U + 4 chiffres)',
  enseignant: 'Format : ENS-0001',
  admin:      'Format : ADM-0001',
}

export default function CreateUserModal({ open, onClose, onSuccess }: Props) {
  const [nom,        setNom]        = useState('')
  const [prenom,     setPrenom]     = useState('')
  const [matricule,  setMatricule]  = useState('')
  const [email,      setEmail]      = useState('')
  const [role,       setRole]       = useState('etudiant')
  const [niveau,     setNiveau]     = useState('')
  const [filiereId,  setFiliereId]  = useState('')
  const [password,   setPassword]   = useState('')
  const [loading,    setLoading]    = useState(false)
  const [errors,     setErrors]     = useState<FieldErrors>({})
  const [apiError,   setApiError]   = useState('')
  const [filieres,   setFilieres]   = useState<Filiere[]>([])

  useEffect(() => {
    if (!open) return
    filieresService.list().then(r => {
      setFilieres((r.data as { data: Filiere[] }).data)
    }).catch(() => {})
  }, [open])

  const validate = (): boolean => {
    const e: FieldErrors = {}
    if (!nom.trim())       e.nom       = 'Nom obligatoire'
    if (!prenom.trim())    e.prenom    = 'Prénom obligatoire'
    if (!matricule.trim()) e.matricule = 'Matricule obligatoire'
    if (!role)             e.role      = 'Rôle obligatoire'
    if (role === 'etudiant' && !filiereId) e.filiereId = 'Filière obligatoire pour un étudiant'
    if (role === 'etudiant' && !niveau)    e.niveau    = 'Niveau obligatoire pour un étudiant'
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Email invalide'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    setApiError('')

    try {
      await usersService.create({
        nom: nom.trim(), prenom: prenom.trim(),
        matricule: matricule.trim().toUpperCase(),
        email:     email || undefined,
        role, niveau: niveau || undefined,
        filiere_id: filiereId ? parseInt(filiereId) : undefined,
        password:  password || undefined,
      })
      handleClose()
      onSuccess()
    } catch (err) {
      const e = err as AxiosError<{ message: string }>
      setApiError(e.response?.data?.message || 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setNom(''); setPrenom(''); setMatricule(''); setEmail('')
    setRole('etudiant'); setNiveau(''); setFiliereId('')
    setPassword(''); setErrors({}); setApiError('')
    onClose()
  }

  return (
    <Modal
      open={open} onClose={handleClose}
      title="Créer un compte"
      subtitle="Le mot de passe par défaut est le matricule si non renseigné"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={loading}>Annuler</Button>
          <Button onClick={handleSubmit} loading={loading}>Créer le compte</Button>
        </>
      }>

      <div className="space-y-5">
        {apiError && (
          <div className="px-4 py-3 rounded-xl text-sm"
            style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' }}>
            {apiError}
          </div>
        )}

        <FormSection title="Identité">
          <FormRow>
            <FormField label="Prénom" required error={errors.prenom}>
              <Input value={prenom} onChange={e => setPrenom(e.target.value)}
                placeholder="Aline" error={!!errors.prenom} />
            </FormField>
            <FormField label="Nom" required error={errors.nom}>
              <Input value={nom} onChange={e => setNom(e.target.value)}
                placeholder="Mbarga" error={!!errors.nom} />
            </FormField>
          </FormRow>

          <FormField label="Email institutionnel" error={errors.email}>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="a.mbarga@univ.cm" error={!!errors.email} />
          </FormField>
        </FormSection>

        <FormSection title="Compte">
          <FormField label="Matricule" required error={errors.matricule}
            hint={MATRICULE_HINTS[role]}>
            <Input value={matricule} onChange={e => setMatricule(e.target.value.toUpperCase())}
              placeholder={role === 'etudiant' ? '22FS0001' : role === 'enseignant' ? 'ENS-0001' : 'ADM-0001'}
              error={!!errors.matricule}
              style={{ fontFamily: 'var(--font-mono)' }} />
          </FormField>

          <FormField label="Rôle" required error={errors.role}>
            <Select value={role} onChange={e => { setRole(e.target.value); setNiveau('') }}
              options={[
                { value: 'etudiant',   label: 'Étudiant' },
                { value: 'enseignant', label: 'Enseignant' },
                { value: 'admin',      label: 'Administrateur' },
              ]} />
          </FormField>

          {(role === 'etudiant' || role === 'enseignant') && (
            <FormField label="Filière" required={role === 'etudiant'} error={errors.filiereId}>
              <Select value={filiereId} onChange={e => setFiliereId(e.target.value)}
                placeholder="Sélectionner une filière"
                options={filieres.map(f => ({ value: String(f.id), label: f.nom }))} />
            </FormField>
          )}

          {role === 'etudiant' && (
            <FormField label="Niveau" required error={errors.niveau}>
              <Select value={niveau} onChange={e => setNiveau(e.target.value)}
                placeholder="Sélectionner le niveau"
                options={['L1','L2','L3','M1','M2'].map(v => ({ value: v, label: v }))} />
            </FormField>
          )}

          <FormField label="Mot de passe" hint="Si vide, le matricule sera utilisé comme mot de passe initial">
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Laisser vide = matricule" />
          </FormField>
        </FormSection>
      </div>
    </Modal>
  )
}
