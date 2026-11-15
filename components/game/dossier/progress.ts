'use client'

import { useCallback, useMemo, useSyncExternalStore } from 'react'
import type { MissionFile } from './types'

export type DossierSave = {
  opened: boolean
  page: number
  visited: string[]
  collected: string[]
}

export type PageState = 'unread' | 'reviewed' | 'collected'

const CHANGE_EVENT = 'last-signal:dossier-progress'
const EMPTY: DossierSave = { opened: false, page: 0, visited: [], collected: [] }
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

/** Start a fresh investigation without resetting archives, manga progress, or settings. */
export function resetInvestigationProgress(file: MissionFile) {
  const evidenceKeys = file.items
    .map((item) => item.externalKey)
    .filter((key): key is string => Boolean(key))
  try {
    window.localStorage.removeItem(storageKey(file.id))
    for (const key of evidenceKeys) window.localStorage.removeItem(key)
  } catch {
    // Storage may be unavailable; notify subscribers to refresh anyway.
  }
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

  const pageState = useCallback(
    (pageId: string): PageState => {
      if (!visited.has(pageId)) return 'unread'
      const items = file.items.filter((i) => i.pageId === pageId)
      return items.length > 0 && items.every((i) => collected.has(i.id)) ? 'collected' : 'reviewed'
    },
    [file.items, visited, collected],
  )

  const totals = {
    pages: file.pages.length,
    visited: file.pages.filter((p) => visited.has(p.id)).length,
    items: file.items.length,
    collected: file.items.filter((i) => collected.has(i.id)).length,
  }
  const percent = Math.round(((totals.visited + totals.collected) / (totals.pages + totals.items)) * 100)

  const actions = useMemo(
    () => ({
      open: () => write(file, (p) => ({ ...p, opened: true })),
      close: () => write(file, (p) => ({ ...p, opened: false })),
      goTo: (page: number) =>
        write(file, (p) => {
          const id = file.pages[page]?.id
          if (!id) return p
          return { ...p, opened: true, page, visited: p.visited.includes(id) ? p.visited : [...p.visited, id] }
        }),
      collect: (itemId: string) =>
        write(file, (p) => (p.collected.includes(itemId) ? p : { ...p, collected: [...p.collected, itemId] })),
      reset: () => {
        try {
          window.localStorage.removeItem(storageKey(file.id))
        } catch {
          // ignore
        }
        notifyDossierChange()
      },
    }),
    [file],
  )

  return { hydrated, save, collected, visited, pageState, totals, percent, ...actions }
}
