export type MangaChapter = {
  number: number
  firstPage: number
  lastPage: number
}

export const MANGA_ASSET_ROOT = '/manga/opportunity'

export const OPPORTUNITY_MANGA = {
  title: 'Opportunity',
  subtitle: 'The Journey Beyond 90 Days',
  intro:
    'Built to survive 90 Martian days, the Opportunity rover kept driving for nearly fifteen years. This illustrated story follows its journey across Meridiani Planum, from its first landing to the final transmission.',
  coverImage: `${MANGA_ASSET_ROOT}/cover.jpg`,
  coverWidth: 843,
  coverHeight: 1264,
  summaryImage: `${MANGA_ASSET_ROOT}/summary.jpg`,
  // Flip to true in Phase 2 once the summary image and page files are uploaded.
  assetsUploaded: false,
  chapters: [
    { number: 1, firstPage: 1, lastPage: 8 },
    { number: 2, firstPage: 9, lastPage: 21 },
    { number: 3, firstPage: 22, lastPage: 23 },
    { number: 4, firstPage: 24, lastPage: 40 },
  ] satisfies MangaChapter[],
} as const

export const pageCount = (c: MangaChapter) => c.lastPage - c.firstPage + 1

export const pagePath = (page: number) => `${MANGA_ASSET_ROOT}/pages/page-${String(page).padStart(2, '0')}.jpg`
