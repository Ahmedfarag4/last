'use client'

import { useCallback, useMemo, useSyncExternalStore } from 'react'
import type { MissionFile } from './types'

export type DossierSave = {
  opened: boolean
  page: number
  visited: string[]
  collected: string[]
  reviewed?: string[]
}

export type PageState = 'unread' | 'reviewed' | 'collected'

const CHANGE_EVENT = 'last-signal:dossier-progress'
const EMPTY: DossierSave = { opened: false, page: 0, visited: [], collected: [], reviewed: [] }
const storageKey = (missionId: string) => `last-signal:dossier:${missionId}:v1`

function safeGet(key: string) {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function sanitize(raw: string | null, file: MissionFile): DossierSave {
  if (!raw) return EMPTY
  try {
    const value = JSON.parse(raw) as Partial<DossierSave>
    const pageIds = new Set(file.pages.map((p) => p.id))
    const itemIds = new Set(file.items.map((i) => i.id))
    const page = Number(value.page)
    return {
      opened: value.opened === true,
      page: Number.isInteger(page) && page >= 0 && page < file.pages.length ? page : 0,
      visited: Array.isArray(value.visited) ? value.visited.filter((id) => pageIds.has(id)) : [],
      collected: Array.isArray(value.collected) ? value.collected.filter((id) => itemIds.has(id)) : [],
      reviewed: Array.isArray(value.reviewed) ? value.reviewed.filter((id) => pageIds.has(id)) : [],
    }
  } catch {
    return EMPTY
  }
}

type Snapshot = { save: DossierSave; external: string[] }
const cache = new Map<string, { signature: string; snapshot: Snapshot }>()
const SERVER_SNAPSHOT: Snapshot = { save: EMPTY, external: [] }

function readSnapshot(file: MissionFile): Snapshot {
  const raw = safeGet(storageKey(file.id))
  const externalItems = file.items.filter((i) => i.externalKey)
  const external = externalItems.filter((i) => safeGet(i.externalKey!) === 'collected').map((i) => i.id)
  const signature = `${raw}|${external.join(',')}`
  const cached = cache.get(file.id)
  if (cached && cached.signature === signature) return cached.snapshot
  const snapshot = { save: sanitize(raw, file), external }
  cache.set(file.id, { signature, snapshot })
  return snapshot
}

function write(file: MissionFile, update: (prev: DossierSave) => DossierSave) {
  const next = update(readSnapshot(file).save)
  try {
    window.localStorage.setItem(storageKey(file.id), JSON.stringify(next))
  } catch {
    // Storage unavailable (private mode): progress lasts for this session only.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange)
  window.addEventListener('storage', onChange)
  window.addEventListener('focus', onChange)
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange)
    window.removeEventListener('storage', onChange)
    window.removeEventListener('focus', onChange)
  }
}

/** Start from scratch only for this mission; do not touch archive, reader, or settings data. */
export function startNewInvestigation(file: MissionFile) {
  try {
    window.localStorage.removeItem(storageKey(file.id))
    file.items.forEach(item => { if (item.externalKey) window.localStorage.removeItem(item.externalKey) })
  } catch { /* Progress is also reset in memory when storage is available. */ }
  cache.delete(file.id)
  notifyDossierChange()
}

/** Re-evaluates externally stored evidence (e.g. a puzzle that saved its own key). */
export function notifyDossierChange() {
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function useDossierProgress(file: MissionFile) {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => readSnapshot(file),
    () => SERVER_SNAPSHOT,
  )
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false)
  const { save, external } = snapshot

  const collected = useMemo(() => new Set([...save.collected, ...external]), [save.collected, external])
  const visited = useMemo(() => new Set(save.visited), [save.visited])
  const reviewed = useMemo(() => new Set(save.reviewed ?? []), [save.reviewed])

  // Evidence earned in an analysis is required where that analysis is performed,
  // not only on the later Evidence Locker recap page.
  const requirementsFor = useCallback((id: string) => {
    const page = file.pages.find(p => p.id === id)
    if (!page) return [] as string[]
    const direct = file.items.filter(item => item.pageId === id && !item.externalKey).map(item => item.id)
    const analysis = [...page.left, ...page.right].filter(block => block.type === 'analysis').map(block => block.itemId)
    return [...direct, ...analysis]
  }, [file])
  const completedPage = useCallback((id: string) => {
    const required = requirementsFor(id)
    return required.every(item => collected.has(item)) && (required.length > 0 || reviewed.has(id))
  }, [requirementsFor, collected, reviewed])
  const unlockedCount = (() => {
    let count = 1
    for (let i = 0; i < file.pages.length - 1; i++) {
      if (!completedPage(file.pages[i].id)) break
      count++
    }
    return count
  })()
  const isUnlocked = (index: number) => index >= 0 && index < unlockedCount
  const completedPages = file.pages.filter(p => completedPage(p.id)).length
  const missionComplete = file.pages.every(p => completedPage(p.id))

  const pageState = useCallback(
    (pageId: string): PageState => {
      if (!visited.has(pageId)) return 'unread'
      if (completedPage(pageId)) return 'collected'
      const items = file.items.filter((i) => i.pageId === pageId)
      return items.length > 0 && items.every((i) => collected.has(i.id)) ? 'collected' : 'reviewed'
    },
    [file.items, visited, collected, completedPage],
  )

  const totals = {
    pages: file.pages.length,
    visited: file.pages.filter((p) => visited.has(p.id)).length,
    items: file.items.length,
    collected: file.items.filter((i) => collected.has(i.id)).length,
  }
  const percent = Math.round((completedPages / file.pages.length) * 100)

  const actions = useMemo(
    () => ({
      open: () => write(file, (p) => ({ ...p, opened: true })),
      close: () => write(file, (p) => ({ ...p, opened: false })),
      goTo: (page: number) =>
        write(file, (p) => {
          const id = file.pages[page]?.id
          if (!id || !isUnlocked(page)) return p
          return { ...p, opened: true, page, visited: p.visited.includes(id) ? p.visited : [...p.visited, id] }
        }),
      review: (id: string) => write(file, p => ({ ...p, reviewed: (p.reviewed ?? []).includes(id) ? p.reviewed : [...(p.reviewed ?? []), id] })),
      collect: (itemId: string) =>
        write(file, (p) => (p.collected.includes(itemId) ? p : { ...p, collected: [...p.collected, itemId] })),
      reset: () => {
        startNewInvestigation(file)
      },
    }),
    [file],
  )

  return { hydrated, save, collected, visited, reviewed, pageState, requirementsFor, completedPage, completedPages, unlockedCount, isUnlocked, missionComplete, totals, percent, ...actions }
}
