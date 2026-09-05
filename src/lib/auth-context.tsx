'use client'
// src/lib/auth-context.tsx
// Contexte d'authentification global — wraps l'app entière

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authService, setTokens, clearTokens, getAccessToken, unwrapApiData } from './api'
import type { AuthUser } from '@/types'

interface AuthContextType {
  user:      AuthUser | null
  loading:   boolean
  login:     (matricule: string, password: string) => Promise<void>
  logout:    () => Promise<void>
  isAdmin:       boolean
  isEnseignant:  boolean
  isEtudiant:    boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Récupérer le profil au montage si un token existe
  useEffect(() => {
    const init = async () => {
      try {
        const token = getAccessToken()
        if(!token){
          setLoading(false)
          return
        }
        const { data } = await authService.me()
        const userPayload = unwrapApiData<AuthUser | null>(data)
        setUser(userPayload)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const login = async (matricule: string, password: string) => {
    const { data } = await authService.login(matricule, password)
    const payload = unwrapApiData<{
      accessToken?: string
      refreshToken?: string
      user?: AuthUser
      utilisateur?: AuthUser
    }>(data)

    const accessToken = payload.accessToken
    const refreshToken = payload.refreshToken
    const userData = payload.user ?? payload.utilisateur

    if (!accessToken || !refreshToken) {
      throw new Error('Réponse de connexion invalide')
    }

    setTokens(accessToken, refreshToken)
    setUser(userData ?? null)
  }

  const logout = async () => {
    try { await authService.logout() } catch { /* ignore */ }
    clearTokens()
    setUser(null)
    window.location.href = '/auth/login'
  }

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout,
      isAdmin:      user?.role === 'admin',
      isEnseignant: user?.role === 'enseignant',
      isEtudiant:   user?.role === 'etudiant',
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>')
  return ctx
}
