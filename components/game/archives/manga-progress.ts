'use client'

import { useCallback, useSyncExternalStore } from 'react'
import { chapterForPage, totalPages, type MangaConfig } from './manga-data'

export type MangaProgress = {
  chapter: number
  page: number
  completedChapters: number[]
  finished: boolean
}

const CHANGE_EVENT = 'last-signal:manga-progress'

function sanitize(manga: MangaConfig, raw: unknown): MangaProgress | null {
  if (!raw || typeof raw !== 'object') return null
  const value = raw as Record<string, unknown>
  const page = Number(value.page)
  if (!Number.isInteger(page) || page < 1 || page > totalPages(manga)) return null
  const chapterNumbers = manga.chapters.map((c) => c.number)
  const completed = Array.isArray(value.completedChapters)
    ? chapterNumbers.filter((n) => (value.completedChapters as unknown[]).includes(n))
    : []
  return {
    chapter: chapterForPage(manga, page).number,
    page,
    completedChapters: completed,
    finished: value.finished === true,
  }
}

const cache = new Map<string, { raw: string | null; value: MangaProgress | null }>()

function read(manga: MangaConfig): MangaProgress | null {
  let raw: string | null = null
  try {
    raw = window.localStorage.getItem(manga.storageKey)
  } catch {
    raw = null
  }
  const cached = cache.get(manga.storageKey)
  if (cached && cached.raw === raw) return cached.value
  let value: MangaProgress | null = null
  try {
    value = sanitize(manga, JSON.parse(raw ?? 'null'))
  } catch {
    value = null
  }
  cache.set(manga.storageKey, { raw, value })
  return value
}

function write(manga: MangaConfig, progress: MangaProgress) {
  try {
    window.localStorage.setItem(manga.storageKey, JSON.stringify(progress))
  } catch {
    // Storage can be unavailable (private mode); progress then lasts for the session only.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function saveMangaPage(manga: MangaConfig, page: number) {
  const previous = read(manga)
  const chapter = chapterForPage(manga, page)
  const completed = new Set(previous?.completedChapters ?? [])
  if (page === chapter.lastPage) completed.add(chapter.number)
  write(manga, {
    chapter: chapter.number,
    page,
    completedChapters: manga.chapters.map((c) => c.number).filter((n) => completed.has(n)),
    finished: previous?.finished ?? false,
  })
}

export function markMangaFinished(manga: MangaConfig) {
  const previous = read(manga)
  const last = totalPages(manga)
  write(manga, {
    chapter: chapterForPage(manga, last).number,
    page: previous?.page ?? last,
    completedChapters: manga.chapters.map((c) => c.number),
    finished: true,
  })
}

export function useMangaProgress(manga: MangaConfig) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const onStorage = (e: StorageEvent) => e.key === manga.storageKey && onChange()
      window.addEventListener(CHANGE_EVENT, onChange)
      window.addEventListener('storage', onStorage)
      return () => {
        window.removeEventListener(CHANGE_EVENT, onChange)
        window.removeEventListener('storage', onStorage)
      }
    },
    [manga.storageKey],
  )
  const getSnapshot = useCallback(() => read(manga), [manga])
  return useSyncExternalStore(subscribe, getSnapshot, () => null)
}
