'use client'
// src/app/auth/login/page.tsx

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { AxiosError } from 'axios'
import { BookOpen, GraduationCap, FileText, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [matricule, setMatricule] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!matricule || !password) return

    setLoading(true)
    setError(null)
    try {
      await login(matricule.trim().toUpperCase(), password)
      router.push('/dashboard')
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>
      setError(axiosErr.response?.data?.message || 'Connexion impossible. Vérifiez vos identifiants.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* ── Panneau droit : formulaire ── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md animate-fade-up">

          {/* Header mobile */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="flex justify-center  items-center gap-3 ">
              <img
                src="/icon-192.png"
                alt="FS Archive logo"
                width={292}
                height={292}
                className="w-10 h-10 rounded-xl object-contain"
              />
              <span className="text-white font-display font-semibold text-xl">campus-edu</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold text-gray-900 text-center mb-5 bg-gray-200 rounded-xl p-3 ">Connexion</h2>
            <p className="text-gray-500 mt-1.5 text-sm text-center mb-10">Entrez votre matricule et votre mot de passe</p>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="mb-5 flex items-start gap-3 px-4 py-3 rounded-xl text-sm"
              style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' }}>
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Matricule */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Matricule
              </label>
              <input
                type="text"
                value={matricule}
                onChange={(e) => setMatricule(e.target.value)}
                placeholder="ex : XXFS0001"
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                style={{
                  fontFamily: 'var(--font-mono)',
                  borderColor: 'var(--border)',
                  background: 'var(--bg)',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                required
                autoComplete="username"
              />
              <p className="text-xs text-gray-400 mt-1">
                Étudiant : XXFSxxxx · Enseignant : ENS-xxxx · Admin : ADM-xxxx
              </p>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  className="w-full px-4 py-3 pr-12 rounded-xl border text-sm outline-none transition-all"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  required
                  autoComplete="current-password"
                />
                <button type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !matricule || !password}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
              style={{
                background: loading ? '#002a54dd' : 'var(--brand)',
                opacity: (!matricule || !password) ? 0.6 : 1,
                cursor: (!matricule || !password) ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(91, 111, 244, 0.4)',
              }}>
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Connexion…</>
              ) : 'Se connecter'}
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}
