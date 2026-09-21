// src/lib/upload.ts

import { upload } from '@vercel/blob/client'
import { getAccessToken } from './api'

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api').replace(/\/+$/, '')

export interface FichierUploade {
  url: string
  nomFichierOriginal: string
  tailleFichier: number
}

/**
 * Uploade un fichier directement vers Vercel Blob et retourne les
 */
export async function uploaderFichier(
  file: File,
  onProgress?: (pct: number) => void
): Promise<FichierUploade> {
  const token = getAccessToken()

  const blob = await upload(file.name, file, {
    access: 'public',
    handleUploadUrl: `${BASE_URL}/upload/client-token`,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    onUploadProgress: (evt) => onProgress?.(evt.percentage),
  })

  return {
    url: blob.url,
    nomFichierOriginal: file.name,
    tailleFichier: file.size,
  }
}

/**
 * Uploade plusieurs fichiers en parallèle vers Vercel Blob.
 */
export async function uploaderFichiers(
  files: File[],
  onProgress?: (index: number, pct: number) => void
): Promise<FichierUploade[]> {
  return Promise.all(
    files.map((f, i) => uploaderFichier(f, (pct) => onProgress?.(i, pct)))
  )
}
