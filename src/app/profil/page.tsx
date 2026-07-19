'use client'
// src/app/profil/page.tsx
// Page profil — infos personnelles + changement de mot de passe

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import AppShell from '@/components/layout/AppShell'
import { Card, PageHeader, Button } from '@/components/ui'
import { FormField, Input, FormSection } from '@/components/shared/FormField'
import { api } from '@/lib/api'
import {
  User, Mail, GraduationCap, Hash, BookOpen,
  Shield, CheckCircle, Eye, EyeOff
} from 'lucide-react'
import { AxiosError } from 'axios'

const ROLE_LABEL: Record<string, string> = {
  etudiant:   'Étudiant',
  enseignant: 'Enseignant',
  admin:      'Administrateur',
}

export default function ProfilPage() {
  const { user } = useAuth()

  // Changement mot de passe
  const [oldPwd,      setOldPwd]    = useState('')
  const [newPwd,      setNewPwd]    = useState('')
  const [confirmPwd,  setConfirmPwd] = useState('')
  const [showPwds,    setShowPwds]  = useState(false)
  const [pwdLoading,  setPwdLoading] = useState(false)
  const [pwdSuccess,  setPwdSuccess] = useState(false)
  const [pwdError,    setPwdError]   = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const validatePwd = () => {
    const e: Record<string, string> = {}
    if (!oldPwd)              e.oldPwd     = 'Mot de passe actuel requis'
    if (!newPwd)              e.newPwd     = 'Nouveau mot de passe requis'
    if (newPwd.length < 8)   e.newPwd     = 'Minimum 8 caractères'
    if (newPwd !== confirmPwd) e.confirmPwd = 'Les mots de passe ne correspondent pas'
    if (oldPwd === newPwd)    e.newPwd     = 'Le nouveau mot de passe doit être différent'
    setFieldErrors(e)
    return Object.keys(e).length === 0
  }

  const handleChangePwd = async () => {
    if (!validatePwd()) return
    setPwdLoading(true); setPwdError(''); setPwdSuccess(false)

    try {
      // Endpoint de changement de mot de passe
      // À ajouter dans le backend : PUT /auth/change-password
      await api.put('/auth/change-password', {
        ancienPassword: oldPwd,
        nouveauPassword: newPwd,
      })
      setOldPwd(''); setNewPwd(''); setConfirmPwd('')
      setPwdSuccess(true)
      setTimeout(() => setPwdSuccess(false), 4000)
    } catch (err) {
      const e = err as AxiosError<{ message: string }>
      setPwdError(e.response?.data?.message || 'Erreur lors du changement de mot de passe')
    } finally {
      setPwdLoading(false)
    }
  }

  if (!user) return null

  const initials = `${user.prenom[0]}${user.nom[0]}`.toUpperCase()

  return (
    <AppShell>
      <PageHeader
        title="Mon profil"
        description="Vos informations personnelles et paramètres de sécurité"
      />

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Colonne gauche : avatar + infos ── */}
        <div className="space-y-5">

          {/* Avatar card */}
          <Card className="p-6 flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-display font-bold text-2xl"
              style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}>
              {initials}
            </div>
            <div className="text-center">
              <h2 className="font-display text-lg font-bold text-gray-900">
                {user.prenom} {user.nom}
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                {user.matricule}
              </p>
              <span className="inline-flex items-center gap-1.5 mt-2 text-xs font-medium px-3 py-1 rounded-full"
                style={{ background: '#eef2ff', color: 'var(--brand)', border: '1px solid #c7d2fe' }}>
                <Shield size={11} />
                {ROLE_LABEL[user.role]}
              </span>
            </div>
          </Card>

          {/* Infos détaillées */}
          <Card className="p-5 space-y-4">
            <h3 className="font-display font-semibold text-sm text-gray-700">Informations</h3>

            {[
              {
                icon: User,
                label: 'Nom complet',
                value: `${user.prenom} ${user.nom}`,
              },
              {
                icon: Hash,
                label: 'Matricule',
                value: user.matricule,
                mono: true,
              },
              ...(user.filiere ? [{
                icon: BookOpen,
                label: 'Filière',
                value: `${user.filiere.nom} (${user.filiere.code})`,
              }] : []),
              ...(user.niveau ? [{
                icon: GraduationCap,
                label: 'Niveau',
                value: user.niveau,
              }] : []),
            ].map(({ icon: Icon, label, value, mono }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--surface-2)' }}>
                  <Icon size={14} style={{ color: 'var(--text-3)' }} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>{label}</p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5"
                    style={mono ? { fontFamily: 'var(--font-mono)' } : {}}>
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* ── Colonne droite : sécurité ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Changement mot de passe */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: '#fdf4ff' }}>
                <Shield size={16} style={{ color: '#7c3aed' }} />
              </div>
              <div>
                <h3 className="font-display font-semibold text-gray-900">Changer le mot de passe</h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                  Utilisez un mot de passe fort d&apos;au moins 8 caractères
                </p>
              </div>
              <button
                onClick={() => setShowPwds(v => !v)}
                className="ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
                style={{ background: 'var(--surface-2)', color: 'var(--text-2)', border: '1px solid var(--border)' }}>
                {showPwds ? <EyeOff size={12} /> : <Eye size={12} />}
                {showPwds ? 'Masquer' : 'Afficher'} les champs
              </button>
            </div>

            {/* Messages de feedback */}
            {pwdSuccess && (
              <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d' }}>
                <CheckCircle size={15} />
                Mot de passe modifié avec succès !
              </div>
            )}
            {pwdError && (
              <div className="mb-4 px-4 py-3 rounded-xl text-sm"
                style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' }}>
                {pwdError}
              </div>
            )}

            <div className="space-y-4">
              <FormField label="Mot de passe actuel" required error={fieldErrors.oldPwd}>
                <Input
                  type={showPwds ? 'text' : 'password'}
                  value={oldPwd}
                  onChange={e => setOldPwd(e.target.value)}
                  placeholder="Votre mot de passe actuel"
                  error={!!fieldErrors.oldPwd}
                  autoComplete="current-password"
                />
              </FormField>

              <FormField label="Nouveau mot de passe" required error={fieldErrors.newPwd}
                hint="Au moins 8 caractères, avec lettres et chiffres">
                <Input
                  type={showPwds ? 'text' : 'password'}
                  value={newPwd}
                  onChange={e => setNewPwd(e.target.value)}
                  placeholder="Nouveau mot de passe (min. 8 caractères)"
                  error={!!fieldErrors.newPwd}
                  autoComplete="new-password"
                />
              </FormField>

              <FormField label="Confirmer le nouveau mot de passe" required error={fieldErrors.confirmPwd}>
                <Input
                  type={showPwds ? 'text' : 'password'}
                  value={confirmPwd}
                  onChange={e => setConfirmPwd(e.target.value)}
                  placeholder="Répétez le nouveau mot de passe"
                  error={!!fieldErrors.confirmPwd}
                  autoComplete="new-password"
                />
              </FormField>

              {/* Indicateur de force du mot de passe */}
              {newPwd && (
                <PasswordStrength password={newPwd} />
              )}

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleChangePwd}
                  loading={pwdLoading}
                  disabled={!oldPwd || !newPwd || !confirmPwd}>
                  Mettre à jour le mot de passe
                </Button>
              </div>
            </div>
          </Card>

          {/* Infos session */}
          <Card className="p-6">
            <h3 className="font-display font-semibold text-gray-900 mb-4">Sécurité du compte</h3>
            <div className="space-y-3">
              {[
                {
                  label: 'Authentification',
                  value: 'JWT avec refresh token automatique',
                  icon: Shield,
                  color: '#059669',
                  bg:   '#ecfdf5',
                },
                {
                  label: 'Durée de session',
                  value: '4 heures (renouvellement automatique)',
                  icon: GraduationCap,
                  color: '#0891b2',
                  bg:   '#ecfeff',
                },
                {
                  label: 'Rôle',
                  value: ROLE_LABEL[user.role] + ' — accès selon votre profil',
                  icon: User,
                  color: 'var(--brand)',
                  bg:   '#eef2ff',
                },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: bg }}>
                    <Icon size={14} style={{ color }} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-700">{label}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}

// ── Indicateur de force mot de passe ─────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8 caractères minimum',             ok: password.length >= 8 },
    { label: 'Une lettre majuscule',              ok: /[A-Z]/.test(password) },
    { label: 'Un chiffre',                        ok: /\d/.test(password) },
    { label: 'Un caractère spécial (!@#$…)',      ok: /[^a-zA-Z0-9]/.test(password) },
  ]

  const score = checks.filter(c => c.ok).length

  const strengthLabel = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'][score]
  const strengthColor = ['#ef4444', '#f97316', '#f59e0b', '#22c55e', '#16a34a'][score]

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: 'var(--text-3)' }}>Force du mot de passe</p>
        <p className="text-xs font-medium" style={{ color: strengthColor }}>{strengthLabel}</p>
      </div>
      <div className="flex gap-1">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="flex-1 h-1.5 rounded-full transition-all"
            style={{
              background: i < score ? strengthColor : 'var(--border)',
            }} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1 mt-2">
        {checks.map(({ label, ok }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs"
            style={{ color: ok ? '#16a34a' : 'var(--text-3)' }}>
            <span>{ok ? '✓' : '○'}</span>
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}
