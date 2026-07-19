'use client'
// src/hooks/useQuery.ts
// Hook générique pour fetcher des données depuis l'API avec états loading/error

import { useState, useEffect, useCallback, useRef } from 'react'
import { AxiosError } from 'axios'

interface UseQueryResult<T> {
  data:    T | null
  loading: boolean
  error:   string | null
  refetch: () => void
}

export function useQuery<T>(
  fetcher: () => Promise<{ data: { data: T } }>,
  deps:    unknown[] = []
): UseQueryResult<T> {
  const [data,    setData]    = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const mountedRef = useRef(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetcher()
      if (mountedRef.current) setData(res.data.data)
    } catch (err) {
      if (mountedRef.current) {
        const axiosErr = err as AxiosError<{ message: string }>
        setError(axiosErr.response?.data?.message || 'Erreur de chargement')
      }
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    mountedRef.current = true
    fetch()
    return () => { mountedRef.current = false }
  }, [fetch])

  return { data, loading, error, refetch: fetch }
}

// Hook pour les listes paginées
interface PaginatedData<T> {
  data:       T[]
  pagination: {
    total: number; page: number; limit: number
    totalPages: number; hasNext: boolean; hasPrev: boolean
  }
}

export function usePaginatedQuery<T>(
  fetcher: (page: number, params?: Record<string, unknown>) => Promise<{ data: PaginatedData<T> }>,
  extraParams?: Record<string, unknown>
) {
  const [page,   setPage]   = useState(1)
  const [result, setResult] = useState<PaginatedData<T> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      
      const res = await fetcher(page, extraParams)
      setResult(res.data)

    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>
      setError(axiosErr.response?.data?.message || 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, JSON.stringify(extraParams)])

  useEffect(() => { fetch() }, [fetch])

  return {
    items: result?.data ?? [],
    pagination: result?.pagination ?? null,
    loading, error,
    page, setPage,
    refetch: fetch,
  }
}
