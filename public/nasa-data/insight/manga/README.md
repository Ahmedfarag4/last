# InSight Manga — English

InSight: Heart of Mars — 4 chapters, 5 pages each (20 pages total).

The manga uses the same reader as the Opportunity archive (`components/game/archives/manga-reader.tsx`),
which renders each chapter PDF page with pdf.js. Configuration lives in `INSIGHT_MANGA`
(`components/game/archives/manga-data.ts`).

```
public/nasa-data/insight/manga/
├── chapter-01.pdf   pages 1–5    The Mission Begins
├── chapter-02.pdf   pages 6–10   Listening to Mars
├── chapter-03.pdf   pages 11–15  The Heat of Mars
├── chapter-04.pdf   pages 16–20  The Final Signal
├── cover.jpg        opening page of chapter 1 (overview cover)
└── summary.jpg      20-panel illustrated story summary
```

Access: Mission Archives → InSight → Read Manga.
