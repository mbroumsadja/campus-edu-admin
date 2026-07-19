'use client'
// src/app/admin/users/page.tsx

import { useState } from 'react'
import { usersService } from '@/lib/api'
import { usePaginatedQuery } from '@/hooks/useQuery'
import AppShell from '@/components/layout/AppShell'
import { Card, StatutBadge, EmptyState, Pagination, PageHeader, Button } from '@/components/ui'
import CreateUserModal from '@/components/modals/CreateUserModal'
import { Search, X, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import type { Utilisateur } from '@/types'

const ROLE_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  etudiant:   { label: 'Étudiant',      color: '#4338ca', bg: '#eef2ff' },
  enseignant: { label: 'Enseignant',    color: '#7c3aed', bg: '#f5f3ff' },
  admin:      { label: 'Admin',         color: '#be185d', bg: '#fdf2f8' },
}

export default function AdminUsersPage() {
  const [search,      setSearch]      = useState('')
  const [role,        setRole]        = useState('')
  const [statut,      setStatut]      = useState('')
  const [createOpen,  setCreateOpen]  = useState(false)

  const { items, pagination, loading, page, setPage, refetch } = usePaginatedQuery<Utilisateur>(
    (p) => usersService.list({ page: p, limit: 15,
      ...(search && { search }),
      ...(role   && { role }),
      ...(statut && { statut }),
    }),
    { search, role, statut }
  )

  const handleStatut = async (user: Utilisateur, newStatut: string) => {
    if (!confirm(`${newStatut === 'actif' ? 'Activer' : 'Suspendre'} le compte de ${user.prenom} ${user.nom} ?`)) return
    try {
      await usersService.changerStatut(user.id, newStatut)
      refetch()
    } catch { alert('Erreur lors de la modification') }
  }

  const handleDelete = async (user: Utilisateur) => {
    if (!confirm(`Supprimer définitivement le compte de ${user.prenom} ${user.nom} (${user.matricule}) ?`)) return
    try {
      await usersService.supprimer(user.id)
      refetch()
    } catch { alert('Erreur lors de la suppression') }
  }

  return (
    <AppShell>
      <PageHeader
        title="Gestion des utilisateurs"
        description="Gérez les comptes étudiants et enseignants"
        action={<Button onClick={() => setCreateOpen(true)}>+ Ajouter</Button>}
      />

      {/* Filtres */}
      <Card className="p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] px-3 py-2 rounded-xl"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <Search size={14} style={{ color: 'var(--text-3)' }} />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Nom, prénom, matricule…"
              className="flex-1 bg-transparent outline-none text-sm" />
          </div>
          <select value={role} onChange={e => { setRole(e.target.value); setPage(1) }}
            className="px-3 py-2 rounded-xl text-sm outline-none cursor-pointer"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
            <option value="">Tous les rôles</option>
            <option value="etudiant">Étudiant</option>
            <option value="enseignant">Enseignant</option>
            <option value="admin">Admin</option>
          </select>
          <select value={statut} onChange={e => { setStatut(e.target.value); setPage(1) }}
            className="px-3 py-2 rounded-xl text-sm outline-none cursor-pointer"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
            <option value="">Tous les statuts</option>
            <option value="actif">Actif</option>
            <option value="en_attente">En attente</option>
            <option value="suspendu">Suspendu</option>
          </select>
          {(search || role || statut) && (
            <button onClick={() => { setSearch(''); setRole(''); setStatut(''); setPage(1) }}
              className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl"
              style={{ color: 'var(--red)', background: 'rgba(220,38,38,.06)', border: '1px solid rgba(220,38,38,.15)' }}>
              <X size={14} /> Effacer
            </button>
          )}
          {pagination && (
            <span className="text-xs ml-auto" style={{ color: 'var(--text-3)' }}>
              {pagination.total} utilisateur{pagination.total > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                {['Utilisateur', 'Rôle', 'Filière / Niveau', 'Statut', 'Connexion', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--text-3)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(6).fill(0).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td colSpan={6} className="px-5 py-4">
                      <div className="h-4 skeleton w-full rounded" />
                    </td>
                  </tr>
                ))
                : items.length === 0
                  ? <tr><td colSpan={6}>
                    <EmptyState title="Aucun utilisateur" description="Modifiez les filtres ou ajoutez un compte." />
                  </td></tr>
                  : items.map((user) => {
                    const rb = ROLE_BADGE[user.role]
                    const initials = `${user.prenom[0]}${user.nom[0]}`.toUpperCase()
                    return (
                      <tr key={user.id}
                        className="transition-colors hover:bg-gray-50/50"
                        style={{ borderBottom: '1px solid var(--border)' }}>

                        {/* Utilisateur */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                              style={{ background: `linear-gradient(135deg, ${rb.color}, #818cf8)` }}>
                              {initials}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">{user.prenom} {user.nom}</p>
                              <p className="text-xs" style={{ color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                                {user.matricule}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Rôle */}
                        <td className="px-5 py-3.5">
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                            style={{ background: rb.bg, color: rb.color }}>
                            {rb.label}
                          </span>
                        </td>

                        {/* Filière */}
                        <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-2)' }}>
                          {user.filiere?.nom ?? '—'}
                          {user.niveau && <span className="ml-1.5 text-xs font-mono px-1.5 py-0.5 rounded"
                            style={{ background: 'var(--surface-2)', color: 'var(--text-3)' }}>
                            {user.niveau}
                          </span>}
                        </td>

                        {/* Statut */}
                        <td className="px-5 py-3.5"><StatutBadge statut={user.statut} /></td>

                        {/* Connexion */}
                        <td className="px-5 py-3.5 text-xs" style={{ color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                          {user.derniereConnexion
                            ? new Date(user.derniereConnexion).toLocaleDateString('fr-FR')
                            : 'Jamais'}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1">
                            {user.statut !== 'actif'
                              ? <button onClick={() => handleStatut(user, 'actif')}
                                  title="Activer" className="p-1.5 rounded-lg hover:bg-green-50 transition-colors">
                                  <CheckCircle size={15} style={{ color: '#16a34a' }} />
                                </button>
                              : <button onClick={() => handleStatut(user, 'suspendu')}
                                  title="Suspendre" className="p-1.5 rounded-lg hover:bg-amber-50 transition-colors">
                                  <XCircle size={15} style={{ color: '#d97706' }} />
                                </button>
                            }
                            <button onClick={() => handleDelete(user)}
                              title="Supprimer" className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                              <Trash2 size={15} style={{ color: '#dc2626' }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
              }
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="px-5 py-4" style={{ borderTop: '1px solid var(--border)' }}>
            <Pagination page={page} totalPages={pagination.totalPages} onPage={setPage} />
          </div>
        )}
      </Card>

      <CreateUserModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => { setCreateOpen(false); refetch() }}
      />
    </AppShell>
  )
}
