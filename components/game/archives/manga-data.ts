export type MangaChapter = {
  number: number
  firstPage: number
  lastPage: number
  pdf: string
  title?: string
}

/** Mission-specific copy (alongside title/subtitle/intro). When omitted, the localized Opportunity strings from i18n are used. */
export type MangaCopy = {
  coverAlt: string
  coverCaption: string
  summaryAlt: string
  archiveTag: string
  completeBody: string
  language?: 'en'
}

export type MangaConfig = {
  id: string
  title: string
  subtitle: string
  intro: string
  coverImage: string
  coverWidth: number
  coverHeight: number
  summaryImage: string
  summaryWidth: number
  summaryHeight: number
  pagesAvailable: boolean
  summaryUploaded: boolean
  storageKey: string
  chapters: readonly MangaChapter[]
  copy?: MangaCopy
}

export const MANGA_ASSET_ROOT = '/manga/opportunity'

const chapterPdf = (root: string, n: number) => `${root}/chapter-${String(n).padStart(2, '0')}.pdf`

export const OPPORTUNITY_MANGA: MangaConfig = {
  id: 'opportunity',
  title: 'Opportunity',
  subtitle: 'The Journey Beyond 90 Days',
  intro:
    'Built to survive 90 Martian days, the Opportunity rover kept driving for nearly fifteen years. This illustrated story follows its journey across Meridiani Planum, from its first landing to the final transmission.',
  coverImage: `${MANGA_ASSET_ROOT}/cover.jpg`,
  coverWidth: 843,
  coverHeight: 1264,
  summaryImage: `${MANGA_ASSET_ROOT}/summary.jpg`,
  summaryWidth: 1254,
  summaryHeight: 1254,
  pagesAvailable: true,
  summaryUploaded: true,
  storageKey: 'last-signal:manga:opportunity:v1',
  chapters: [
    { number: 1, firstPage: 1, lastPage: 8, pdf: chapterPdf(MANGA_ASSET_ROOT, 1) },
    { number: 2, firstPage: 9, lastPage: 21, pdf: chapterPdf(MANGA_ASSET_ROOT, 2) },
    { number: 3, firstPage: 22, lastPage: 23, pdf: chapterPdf(MANGA_ASSET_ROOT, 3) },
    { number: 4, firstPage: 24, lastPage: 40, pdf: chapterPdf(MANGA_ASSET_ROOT, 4) },
  ],
}

const INSIGHT_ASSET_ROOT = '/nasa-data/insight/manga'

export const INSIGHT_MANGA: MangaConfig = {
  id: 'insight',
  title: 'InSight',
  subtitle: 'Heart of Mars',
  intro:
    'InSight never roamed Mars. It landed at Elysium Planitia and stayed still so it could listen to the planet itself. This illustrated story follows the lander from launch and landing to its first marsquakes, the heat-probe struggle, the discoveries about the core, and its final signal in December 2022.',
  coverImage: `${INSIGHT_ASSET_ROOT}/cover.jpg`,
  coverWidth: 1000,
  coverHeight: 1080,
  summaryImage: `${INSIGHT_ASSET_ROOT}/summary.jpg`,
  summaryWidth: 1193,
  summaryHeight: 1280,
  pagesAvailable: true,
  summaryUploaded: true,
  storageKey: 'last-signal:manga:insight:v1',
  chapters: [
    { number: 1, firstPage: 1, lastPage: 5, pdf: chapterPdf(INSIGHT_ASSET_ROOT, 1), title: 'The Mission Begins' },
    { number: 2, firstPage: 6, lastPage: 10, pdf: chapterPdf(INSIGHT_ASSET_ROOT, 2), title: 'Listening to Mars' },
    { number: 3, firstPage: 11, lastPage: 15, pdf: chapterPdf(INSIGHT_ASSET_ROOT, 3), title: 'The Heat of Mars' },
    { number: 4, firstPage: 16, lastPage: 20, pdf: chapterPdf(INSIGHT_ASSET_ROOT, 4), title: 'The Final Signal' },
  ],
  copy: {
    language: 'en',
    coverAlt:
      'Opening page of InSight: Heart of Mars. Mars rises in space, a young NASA scientist looks up in a mission control room, and a screen reads "One mission will listen to the heart of the Red Planet"',
    coverCaption: 'Chapter 1 · Opening Page',
    summaryAlt:
      'Twenty-panel story summary of InSight: launch on May 5, 2018, landing on November 26, 2018, the SEIS seismometer and HP3 heat probe on the surface, the discovery of a thin crust, deep mantle and metallic core, dust storms covering the solar panels, the mission ending in December 2022, and its lasting scientific legacy',
    archiveTag: 'INSIGHT · ILLUSTRATED ARCHIVE',
    completeBody: 'All 4 chapters and 20 pages of InSight have been read. Your progress is saved on this device.',
  },
}

export const MANGA_BY_MISSION = {
  opportunity: OPPORTUNITY_MANGA,
  insight: INSIGHT_MANGA,
} as const

export const totalPages = (manga: MangaConfig) => manga.chapters[manga.chapters.length - 1].lastPage

export const pageCount = (c: MangaChapter) => c.lastPage - c.firstPage + 1

export const chapterForPage = (manga: MangaConfig, page: number): MangaChapter =>
  manga.chapters.find((c) => page >= c.firstPage && page <= c.lastPage) ?? manga.chapters[0]
