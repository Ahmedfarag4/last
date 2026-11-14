export type Language = 'en' | 'ar'

export const LANGUAGES: { id: Language; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'ar', label: 'العربية' },
]

const en = {
  menuNav: 'Main menu',
  menuStart: 'Start Investigation',
  menuArchives: 'Mission Archives',
  menuSettings: 'Settings',
  menuAbout: 'About / Credits',
  tagline: 'Echoes of Exploration.',
  hudStatus: 'MARS INVESTIGATION · ONLINE',
  hudSignal: 'SIGNAL LOCK · SIMULATED',
  hudFooter: 'ARCHIVAL SIGNALS • VERIFIED MISSION RECORDS',
  skipIntro: 'SKIP INTRO',
  close: 'Close',

  settingsEyebrow: 'SYSTEM CONFIGURATION',
  settingsTitle: 'SETTINGS',
  language: 'Language',
  languageDesc: 'Interface display language.',
  soundEffects: 'Sound effects',
  soundEffectsDesc: 'Spacecraft interface audio.',
  sfxVolume: 'SFX volume',
  reducedMotion: 'Reduced motion',
  reducedMotionDesc: 'Pauses ambient animation and particles.',
  fullscreen: 'Fullscreen',
  fullscreenDesc: 'Immersive full-screen display.',
  fullscreenUnavailable: 'Unavailable in this view.',
  savedOnDevice: 'Preferences are saved on this device.',

  aboutEyebrow: 'ABOUT / CREDITS',
  aboutIntro:
    'A cinematic investigation game set at a remote Mars outpost. Piece together fading transmissions, recover mission records, and uncover the story behind the last signal.',
  aboutDisclaimer:
    'Fan-made prototype. Not affiliated with or endorsed by NASA or JPL. All in-game telemetry is simulated.',
  creditDirection: 'Game Direction',
  creditDesign: 'Design & Development',
  creditNarrative: 'Narrative',
  creditAudio: 'Audio',
  creditInspiration: 'Inspiration',
  creditAudioEntry: 'Interface sounds synthesized in real time with the Web Audio API',
  creditInspirationEntry: 'The real-world Mars Exploration Rover missions and the people who operated them',
}

export type Dictionary = typeof en

const ar: Dictionary = {
  menuNav: 'القائمة الرئيسية',
  menuStart: 'ابدأ التحقيق',
  menuArchives: 'أرشيف المهمات',
  menuSettings: 'الإعدادات',
  menuAbout: 'حول / الشكر',
  tagline: 'أصداء الاستكشاف.',
  hudStatus: 'تحقيق المريخ · متصل',
  hudSignal: 'تثبيت الإشارة · محاكاة',
  hudFooter: 'إشارات أرشيفية • سجلات مهمات موثّقة',
  skipIntro: 'تخطي المقدمة',
  close: 'إغلاق',

  settingsEyebrow: 'تهيئة النظام',
  settingsTitle: 'الإعدادات',
  language: 'اللغة',
  languageDesc: 'لغة عرض الواجهة.',
  soundEffects: 'المؤثرات الصوتية',
  soundEffectsDesc: 'أصوات واجهة المركبة الفضائية.',
  sfxVolume: 'مستوى صوت المؤثرات',
  reducedMotion: 'تقليل الحركة',
  reducedMotionDesc: 'يوقف الرسوم المتحركة المحيطة والجسيمات.',
  fullscreen: 'ملء الشاشة',
  fullscreenDesc: 'عرض غامر بملء الشاشة.',
  fullscreenUnavailable: 'غير متاح في هذا العرض.',
  savedOnDevice: 'تُحفظ التفضيلات على هذا الجهاز.',

  aboutEyebrow: 'حول / الشكر',
  aboutIntro:
    'لعبة تحقيق سينمائية تدور أحداثها في محطة نائية على سطح المريخ. اجمع شتات البث المتلاشي، واستعد سجلات المهمات، واكشف القصة وراء الإشارة الأخيرة.',
  aboutDisclaimer:
    'نموذج أولي من إنتاج المعجبين. غير تابع لوكالة ناسا أو مختبر الدفع النفاث ولا يحظى بتأييدهما. جميع بيانات القياس داخل اللعبة محاكاة.',
  creditDirection: 'إخراج اللعبة',
  creditDesign: 'التصميم والتطوير',
  creditNarrative: 'السرد القصصي',
  creditAudio: 'الصوت',
  creditInspiration: 'الإلهام',
  creditAudioEntry: 'أصوات الواجهة مُولَّدة لحظيًا باستخدام Web Audio API',
  creditInspirationEntry: 'مهمات مركبات استكشاف المريخ الحقيقية والأشخاص الذين قاموا بتشغيلها',
}

export const DICTIONARIES: Record<Language, Dictionary> = { en, ar }

export const languageAttrs = (language: Language) =>
  ({ lang: language, dir: language === 'ar' ? 'rtl' : 'ltr' }) as const
