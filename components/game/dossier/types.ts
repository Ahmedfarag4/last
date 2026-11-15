export type InfoKind = 'text' | 'media' | 'data' | 'signal' | 'note' | 'evidence'

export type CollectibleItem = {
  id: string
  pageId: string
  kind: InfoKind
  label: string
  detail: string
  /** Items secured by an external analysis (puzzle) instead of a direct "log" action. */
  externalKey?: string
}

export type TimelineEntry = { stamp: string; title: string; body: string }

export type LogEntry = {
  id: string
  stamp: string
  title: string
  body: string
  kind: 'history' | 'fiction'
  sourceUrl?: string
  sourceLabel?: string
}

export type DossierBlock =
  | { type: 'text'; body: string; lead?: boolean }
  | { type: 'facts'; title: string; rows: { label: string; value: string }[] }
  | { type: 'list'; title: string; items: string[] }
  | { type: 'photo'; src: string; alt: string; caption: string; credit?: string; tilt?: number; fit?: 'cover' | 'contain'; aspect?: string }
  | { type: 'timeline'; title?: string; entries: TimelineEntry[] }
  | { type: 'logs'; title?: string; entries: LogEntry[] }
  | { type: 'chart'; chartId: string; title: string; caption?: string }
  | { type: 'callout'; title: string; body: string }
  | { type: 'note'; body: string; signature?: string }
  | { type: 'clue'; itemId: string }
  | { type: 'analysis'; analysisId: string; title: string; body: string; itemId: string }
  | { type: 'evidence'; itemIds: string[] }
  | { type: 'summary'; conclusion: string; caveat?: string }

export type DossierPage = {
  id: string
  tab: string
  kicker: string
  title: string
  lede?: string
  left: DossierBlock[]
  right: DossierBlock[]
}

export type MissionFile = {
  id: string
  code: string
  name: string
  designation: string
  agency: string
  clearance: string
  cover: { src: string; alt: string; caption: string }
  backdrop: string
  pages: DossierPage[]
  items: CollectibleItem[]
}
