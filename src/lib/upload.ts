// src/lib/upload.ts
// Upload direct navigateur → Vercel Blob.
//
// Pourquoi : Vercel Functions plafonne le corps de requête à 4,5 Mo.
// Envoyer plusieurs fichiers en multipart/form-data vers notre API
// dépasse vite cette limite et provoque un 413. On utilise donc le
// pattern "client upload" officiel de @vercel/blob : le navigateur
// envoie chaque fichier DIRECTEMENT à Vercel Blob (jusqu'à 5 To), et
// notre backend ne fait qu'émettre un jeton signé via
// POST /api/upload/client-token (voir upload.controller.js).
// Doc : https://vercel.com/docs/vercel-blob/client-upload

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
 * métadonnées à envoyer ensuite à notre API (POST /cours, /sujets).
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
