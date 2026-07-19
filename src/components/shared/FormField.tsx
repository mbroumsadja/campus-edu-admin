'use client'
// src/components/shared/FormField.tsx
// Composants de formulaire réutilisables dans toutes les modales

import { ReactNode, forwardRef } from 'react'
import clsx from 'clsx'

// ── FormField wrapper ─────────────────────────────────────────────
interface FormFieldProps {
  label:    string
  error?:   string
  hint?:    string
  required?: boolean
  children: ReactNode
}

export function FormField({ label, error, hint, required, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1" style={{ color: 'var(--red)' }}>*</span>}
      </label>
      {children}
      {hint  && !error && <p className="text-xs" style={{ color: 'var(--text-3)' }}>{hint}</p>}
      {error && <p className="text-xs" style={{ color: 'var(--red)' }}>{error}</p>}
    </div>
  )
}

// ── Input ─────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className, ...props }, ref) => (
    <input
      ref={ref}
      {...props}
      className={clsx('w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all', className)}
      style={{
        background:  'var(--bg)',
        border:      `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
        color:       'var(--text-1)',
        ...props.style,
      }}
      onFocus={(e) => { e.target.style.borderColor = error ? 'var(--red)' : 'var(--brand)'; props.onFocus?.(e) }}
      onBlur={(e)  => { e.target.style.borderColor = error ? 'var(--red)' : 'var(--border)'; props.onBlur?.(e) }}
    />
  )
)
Input.displayName = 'Input'

// ── Select ────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
  options: { value: string; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, options, placeholder, className, ...props }, ref) => (
    <select
      ref={ref}
      {...props}
      className={clsx('w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all cursor-pointer appearance-none', className)}
      style={{
        background:  'var(--bg)',
        border:      `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
        color:       'var(--text-1)',
        ...props.style,
      }}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
)
Select.displayName = 'Select'

// ── Textarea ──────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className, ...props }, ref) => (
    <textarea
      ref={ref}
      {...props}
      className={clsx('w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all resize-none', className)}
      style={{
        background: 'var(--bg)',
        border:     `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
        color:      'var(--text-1)',
        ...props.style,
      }}
      onFocus={(e) => { e.target.style.borderColor = error ? 'var(--red)' : 'var(--brand)'; props.onFocus?.(e) }}
      onBlur={(e)  => { e.target.style.borderColor = error ? 'var(--red)' : 'var(--border)'; props.onBlur?.(e) }}
    />
  )
)
Textarea.displayName = 'Textarea'

// ── FileInput ─────────────────────────────────────────────────────
interface FileInputProps {
  label:     string
  accept?:   string
  onChange:  (file: File | null) => void
  file?:     File | null
  error?:    string
  hint?:     string
  required?: boolean
}

export function FileInput({ label, accept, onChange, file, error, hint, required }: FileInputProps) {
  return (
    <FormField label={label} error={error} hint={hint} required={required}>
      <label className="flex flex-col items-center justify-center gap-2 w-full py-6 rounded-xl cursor-pointer transition-all"
        style={{
          border:      `2px dashed ${error ? 'var(--red)' : file ? 'var(--brand)' : 'var(--border-2)'}`,
          background:  file ? '#eef2ff' : 'var(--bg)',
        }}>
        <input
          type="file" accept={accept} className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
        {file ? (
          <>
            <span className="text-2xl">📄</span>
            <span className="text-sm font-medium" style={{ color: 'var(--brand)' }}>{file.name}</span>
            <span className="text-xs" style={{ color: 'var(--text-3)' }}>
              {(file.size / 1024 / 1024).toFixed(2)} MB — Cliquer pour changer
            </span>
          </>
        ) : (
          <>
            <span className="text-2xl">📁</span>
            <span className="text-sm font-medium text-gray-600">Cliquer pour choisir un fichier</span>
            <span className="text-xs" style={{ color: 'var(--text-3)' }}>
              {accept ? `Formats : ${accept}` : 'PDF, MP4, PPTX — max 50 MB'}
            </span>
          </>
        )}
      </label>
    </FormField>
  )
}

// ── FormRow (responsive 1-2 colonnes) ──────────────────────────────
export function FormRow({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
}

// ── FormSection ───────────────────────────────────────────────────
export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>
        {title}
      </p>
      {children}
    </div>
  )
}
