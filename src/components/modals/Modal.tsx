'use client'
// src/components/modals/Modal.tsx
// Composant Modal générique — base pour tous les formulaires popup

import { ReactNode, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'

interface ModalProps {
  open:       boolean
  onClose:    () => void
  title:      string
  subtitle?:  string
  children:   ReactNode
  footer?:    ReactNode
  size?:      'sm' | 'md' | 'lg'
}

const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
}

export default function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  // Fermer avec Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Bloquer le scroll de la page quand la modal est ouverte
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,17,23,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}>

      <div
        className={clsx(
          'w-full rounded-2xl flex flex-col animate-fade-up',
          SIZE_CLASSES[size]
        )}
        style={{
          background:  'white',
          border:      '1px solid var(--border)',
          boxShadow:   '0 20px 60px rgba(0,0,0,0.18)',
          maxHeight:   '90vh',
        }}>

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 className="font-display text-lg font-bold text-gray-900">{title}</h2>
            {subtitle && <p className="text-sm mt-0.5" style={{ color: 'var(--text-2)' }}>{subtitle}</p>}
          </div>
          <button onClick={onClose}
            className="ml-4 p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
            style={{ color: 'var(--text-3)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 flex justify-end gap-3 flex-shrink-0"
            style={{ borderTop: '1px solid var(--border)', background: 'var(--surface-2)', borderRadius: '0 0 16px 16px' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
