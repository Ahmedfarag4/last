'use client'

import { useSyncExternalStore } from 'react'
import { OPPORTUNITY_MANGA, TOTAL_PAGES, chapterForPage } from './manga-data'

export type MangaProgress = {
  chapter: number
  page: number
  completedChapters: number[]
  finished: boolean
}

const STORAGE_KEY = 'last-signal:manga:opportunity:v1'
const CHANGE_EVENT = 'last-signal:manga-progress'
const CHAPTER_NUMBERS = OPPORTUNITY_MANGA.chapters.map((c) => c.number) as number[]

function sanitize(raw: unknown): MangaProgress | null {
  if (!raw || typeof raw !== 'object') return null
  const value = raw as Record<string, unknown>
  const page = Number(value.page)
  if (!Number.isInteger(page) || page < 1 || page > TOTAL_PAGES) return null
  const completed = Array.isArray(value.completedChapters)
    ? CHAPTER_NUMBERS.filter((n) => (value.completedChapters as unknown[]).includes(n))
    : []
  return {
    chapter: chapterForPage(page).number,
    page,
    completedChapters: completed,
    finished: value.finished === true,
  }
}

let cachedRaw: string | null | undefined
let cachedValue: MangaProgress | null = null

function read(): MangaProgress | null {
  let raw: string | null = null
  try {
    raw = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    raw = null
  }
  if (raw === cachedRaw) return cachedValue
  cachedRaw = raw
  try {
    cachedValue = sanitize(JSON.parse(raw ?? 'null'))
  } catch {
    cachedValue = null
  }
  return cachedValue
}

function write(progress: MangaProgress) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // Storage can be unavailable (private mode); progress then lasts for the session only.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function saveMangaPage(page: number) {
  const previous = read()
  const chapter = chapterForPage(page)
  const completed = new Set(previous?.completedChapters ?? [])
  if (page === chapter.lastPage) completed.add(chapter.number)
  write({
    chapter: chapter.number,
    page,
    completedChapters: CHAPTER_NUMBERS.filter((n) => completed.has(n)),
    finished: previous?.finished ?? false,
  })
}

export function markMangaFinished() {
  const previous = read()
  write({
    chapter: chapterForPage(TOTAL_PAGES).number,
    page: previous?.page ?? TOTAL_PAGES,
    completedChapters: [...CHAPTER_NUMBERS],
    finished: true,
  })
}

function subscribe(onChange: () => void) {
  const onStorage = (e: StorageEvent) => e.key === STORAGE_KEY && onChange()
  window.addEventListener(CHANGE_EVENT, onChange)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange)
    window.removeEventListener('storage', onStorage)
  }
}

export function useMangaProgress() {
  return useSyncExternalStore(subscribe, read, () => null)
}
