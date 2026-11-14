export type MangaChapter = {
  number: number
  firstPage: number
  lastPage: number
  pdf: string
}

export const MANGA_ASSET_ROOT = '/manga/opportunity'

const chapterPdf = (n: number) => `${MANGA_ASSET_ROOT}/chapter-${String(n).padStart(2, '0')}.pdf`

export const OPPORTUNITY_MANGA = {
  title: 'Opportunity',
  subtitle: 'The Journey Beyond 90 Days',
  intro:
    'Built to survive 90 Martian days, the Opportunity rover kept driving for nearly fifteen years. This illustrated story follows its journey across Meridiani Planum, from its first landing to the final transmission.',
  coverImage: `${MANGA_ASSET_ROOT}/cover.jpg`,
  coverWidth: 843,
  coverHeight: 1264,
  summaryImage: `${MANGA_ASSET_ROOT}/summary.jpg`,
  pagesAvailable: true,
  // Flip to true once the story summary image is uploaded.
  summaryUploaded: false,
  chapters: [
    { number: 1, firstPage: 1, lastPage: 8, pdf: chapterPdf(1) },
    { number: 2, firstPage: 9, lastPage: 21, pdf: chapterPdf(2) },
    { number: 3, firstPage: 22, lastPage: 23, pdf: chapterPdf(3) },
    { number: 4, firstPage: 24, lastPage: 40, pdf: chapterPdf(4) },
  ] satisfies MangaChapter[],
} as const

export const TOTAL_PAGES = OPPORTUNITY_MANGA.chapters[OPPORTUNITY_MANGA.chapters.length - 1].lastPage

export const pageCount = (c: MangaChapter) => c.lastPage - c.firstPage + 1

export const chapterForPage = (page: number): MangaChapter =>
  OPPORTUNITY_MANGA.chapters.find((c) => page >= c.firstPage && page <= c.lastPage) ?? OPPORTUNITY_MANGA.chapters[0]
