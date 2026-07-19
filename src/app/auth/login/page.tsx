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
      {/* ── Panneau gauche : illustration / branding ── */}
      <div className="md:lg:flex lg:w-[52%] flex-col justify-between p-8 relative overflow-hidden rounded-b-xl md:rounded-r-xl round"
        style={{ background: 'linear-gradient(145deg, #9cf4f7 0%, #02286fef 40%, #001c37 100%)' }}>
        {/* Formes décoratives */}
        <div className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} />
        <div className="absolute bottom-[-60px] left-[-60px] w-[300px] h-[300px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
        <div className="absolute top-1/3 left-1/4 w-1 h-32 opacity-20"
          style={{ background: 'linear-gradient(to bottom, transparent, #a5b4fc, transparent)' }} />

        {/* Logo */}
        <div className="relative z-10 mb-5">
          <div className="flex justify-center flex-col items-center gap-3 ">
            <img
              src="/icon-192.png"
              alt="campus-edu logo"
              width={292}
              height={292}
              className="rounded-xl object-contain"
            />
            {/* <span className="text-white font-display font-semibold text-xl">campus-edu</span> */}
          </div>
        </div>

        {/* Contenu central */}
        <div className="relative z-10 space-y-10">
          <div className="space-y-4">
            <h1 className="text-white font-display md:text-5xl text-3xl font-bold leading-tight text-balance text-center">
              Vos ressources pédagogiques<br />
              <span className="text-white font-display text-2xl font-bold leading-tight text-balance" style={{ color: '#a5b4fc' }}>en un clic, partout.</span>
            </h1>
            <br />
            <p className="text-indigo-200 text-lg leading-relaxed max-w-xxl space">
              Accédez aux supports de cours, sujets d'examen et guides pédagogiques en quelques secondes.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            {[
              { icon: BookOpen, label: 'Bibliothèque complète', desc: 'Tous les documents officiels de la faculté des sciences' },
              { icon: FileText, label: 'Accès rapide', desc: 'Matricule et mot de passe suffisent pour vous connecter' },
              { icon: GraduationCap, label: 'Aide dédiée', desc: 'Support technique disponible sur WhatsApp +237 655 595 984' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-4"
                style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 16px' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(165,180,252,0.15)' }}>
                  <Icon size={18} className="text-indigo-200" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{label}</p>
                  <p className="text-indigo-300 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-indigo-400 text-sm mt-5">
          © {new Date().getFullYear()} campus-edu — faculte des sciences universite de garoua
        </p>
      </div>

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
