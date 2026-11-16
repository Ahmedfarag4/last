import type { MissionFile, DossierBlock } from './types'

/** Localized display copy only. Evidence IDs, source data, assets and save keys are untouched. */
const ar: Record<string, string> = {
  'Classified':'سري',
  'Mission Profile':'ملف المهمة',
  'Main Objectives':'الأهداف الرئيسية',
  'Key Hardware':'المعدات الأساسية',
  'Landing Site':'موقع الهبوط',
  'Traverse Record':'سجل الرحلة',
  'Final Work Site':'موقع العمل الأخير',
  'Opacity Surge':'ارتفاع العتامة الجوية',
  'Measurement Gap':'فجوة القياسات',
  'Last Contact':'آخر اتصال',
  'Recovery Campaign':'محاولات استعادة الاتصال',
  'Solar Dependency':'الاعتماد على الطاقة الشمسية',
  'Valley Imagery':'صور الوادي',
  'Evidence 01 · Darkening Sky':'الدليل 01 · السماء المظلمة',
  'Evidence 02 · Last Transmission':'الدليل 02 · الإرسال الأخير',
  'Twin Mars Exploration Rover, designed for 90 sols, operated for more than fourteen years.':'إحدى مركبتي استكشاف المريخ التوأم؛ صُممت لمهمة مدتها 90 يومًا مريخيًا، لكنها عملت لأكثر من أربعة عشر عامًا.',
  'Search rocks and soils for evidence of past water activity at Meridiani Planum.':'البحث في الصخور والتربة عن أدلة على نشاط المياه قديمًا في سهول ميريدياني.',
  'Solar arrays and batteries power a six-wheel rocker-bogie rover carrying Pancam and arm instruments.':'تزود الألواح الشمسية والبطاريات مركبة بست عجلات بالطاقة، وتحمل كاميرات بانكام وأجهزة على الذراع الآلية.',
  'Eagle crater, Meridiani Planum — landed January 25, 2004.':'فوهة إيجل في ميريدياني بلانوم — هبطت في 25 يناير 2004.',
  'Perseverance Valley, on the western rim of Endeavour crater (2018).':'وادي بيرسيفيرانس على الحافة الغربية لفوهة إنديفور (2018).',
  'Direct Pancam readings show Tau rising sharply in the final recorded sols.':'تظهر قراءات بانكام المباشرة ارتفاعًا حادًا في عتامة الغلاف الجوي خلال آخر الأيام المريخية المسجلة.',
  'The last direct Tau reading is Sol 5105.61 — six sols before last contact.':'آخر قراءة مباشرة للعتامة عند اليوم المريخي 5105.61، قبل آخر اتصال بستة أيام مريخية.',
  'June 10, 2018 · Sol 5111 — an incomplete Pancam frame relayed via MRO.':'10 يونيو 2018 · اليوم المريخي 5111 — صورة جزئية من بانكام نُقلت عبر مدار المريخ الاستطلاعي.',
  'More than 1,000 commands were sent before the mission ended on February 13, 2019.':'أُرسل أكثر من ألف أمر قبل إعلان نهاية المهمة في 13 فبراير 2019.',
  'Every watt-hour depended on sunlight reaching the arrays; dust cut both light and power.':'كل واط-ساعة كان يعتمد على وصول ضوء الشمس للألواح؛ فقلل الغبار الضوء والطاقة.',
  'Navcam views document Perseverance Valley terrain before the storm.':'توثق صور نافكام تضاريس وادي بيرسيفيرانس قبل العاصفة.',
  'Dust opacity rose, sunlight fell, solar power collapsed.':'ازدادت العتامة بالغبار، وانخفض ضوء الشمس، ثم تدهورت الطاقة الشمسية.',
  'Verified chronology of last contact and recovery attempts.':'تسلسل زمني موثق لآخر اتصال ومحاولات استعادته.',
  'Overview':'نظرة عامة','Timeline':'التسلسل الزمني','Telemetry':'القياسات عن بُعد','Signal Logs':'سجلات الإشارات',
  'Field Notes':'الملاحظات الميدانية','Evidence':'الأدلة','Summary':'الملخص',
  'Mission Overview':'نظرة عامة على المهمة','Traverse Timeline':'الخط الزمني للرحلة','Telemetry Data':'بيانات القياسات عن بُعد',
  'Evidence Locker':'ملف الأدلة','Case Summary':'خلاصة القضية',
  'Mission file · Opportunity (MER-B)':'ملف المهمة · أوبورتيونيتي (MER-B)',
  'Section 02 · Chronology':'القسم 02 · التسلسل الزمني','Section 03 · Atmospheric data':'القسم 03 · بيانات الغلاف الجوي',
  'Section 04 · Communications':'القسم 04 · الاتصالات','Section 05 · Analyst annotations':'القسم 05 · ملاحظات المحلّل',
  'Section 06 · Case evidence':'القسم 06 · أدلة القضية','Section 07 · Case summary':'القسم 07 · ملخص القضية',
  'Opportunity was the second of NASA’s twin Mars Exploration Rovers. It launched from Cape Canaveral aboard a Delta II rocket, landed inside Eagle crater on Meridiani Planum, and was designed for a 90-sol mission. It kept operating for more than fourteen years, until a planet-encircling dust storm in 2018 cut off its solar power.':'كانت أوبورتيونيتي ثاني مركبتي ناسا التوأم لاستكشاف المريخ. انطلقت من كيب كانافيرال بصاروخ دلتا 2، وهبطت داخل فوهة إيجل في سهول ميريدياني. صُممت للعمل 90 يومًا مريخيًا، لكنها استمرت أكثر من أربعة عشر عامًا حتى أدت عاصفة ترابية شملت الكوكب عام 2018 إلى انقطاع الطاقة الشمسية عنها.',
  'Key information':'معلومات أساسية','Launch date':'تاريخ الإطلاق','Landing date':'تاريخ الهبوط','Landing site':'موقع الهبوط',
  'Mission duration':'مدة المهمة','Planned mission':'المدة المخططة',
  'July 7, 2003':'7 يوليو 2003','January 25, 2004':'25 يناير 2004',
  'Eagle crater, Meridiani Planum':'فوهة إيجل، ميريدياني بلانوم',
  '5,111 sols (≈ 14 years)':'5111 يومًا مريخيًا (نحو 14 عامًا)','90 sols':'90 يومًا مريخيًا',
  'MER-B · artistic render':'MER-B · تصوير فني','Primary objectives':'الأهداف الرئيسية',
  'Search for rocks and soils that hold clues to past water activity on Mars.':'البحث عن صخور وتربة تحمل أدلة على وجود الماء قديمًا على المريخ.',
  'Determine the distribution and composition of minerals, rocks, and soils near the landing site.':'تحديد توزيع المعادن والصخور والتربة وتركيبها قرب موقع الهبوط.',
  'Study the geologic processes that shaped the local terrain.':'دراسة العمليات الجيولوجية التي شكلت التضاريس المحلية.',
  'Assess whether past environments could have been suitable for life.':'تقييم مدى ملاءمة البيئات القديمة لوجود الحياة.',
  'Rover hardware':'معدات المركبة','Power':'الطاقة','Solar arrays + batteries':'ألواح شمسية وبطاريات','Mobility':'الحركة',
  'Six-wheel rocker-bogie':'نظام حركة بست عجلات','Imaging':'التصوير',
  'Fourteen years of driving across Meridiani Planum, from a 90-sol mission to a marathon on another world.':'أربعة عشر عامًا من السير عبر سهول ميريدياني، من مهمة مخططة لتسعين يومًا مريخيًا إلى رحلة طويلة على عالم آخر.',
  'Distance driven':'المسافة المقطوعة',
  'Atmospheric opacity (Tau) recorded by Pancam at 880 nm during the final months before loss of contact.':'عتامة الغلاف الجوي (تاو) المقاسة بواسطة بانكام عند طول موجي 880 نانومتر خلال الأشهر الأخيرة قبل فقد الاتصال.',
  'Atmospheric opacity (Tau)':'عتامة الغلاف الجوي (تاو)',
  'NASA PDS · MER1 Pancam 880 nm. Line connects recorded samples only.':'أرشيف ناسا PDS · بانكام 880 نانومتر. الخط يصل بين القراءات المسجلة فقط.',
  'Observation':'الملاحظة',
  'A rapid increase in opacity marks the planet-encircling dust storm. NASA later published an estimate of Tau ≈ 10.5 on Sol 5111 — a separate source, not a direct reading in this series.':'يشير ارتفاع العتامة السريع إلى العاصفة الترابية التي أحاطت بالكوكب. نشرت ناسا لاحقًا تقديرًا للعتامة يبلغ نحو 10.5 في اليوم المريخي 5111، وهو مصدر منفصل وليس قراءة مباشرة من هذه السلسلة.',
  'Analysis · The Darkening Sky':'تحليل · السماء المظلمة',
  'Inspect the original readings, find the data gap and rebuild the cause-and-effect chain to secure Evidence 01.':'افحص القراءات الأصلية وحدد فجوة البيانات وأعد بناء تسلسل السبب والنتيجة للحصول على الدليل 01.',
  'Documented NASA/JPL communication records. A command sent from Earth is not a reply from the rover.':'سجلات اتصالات موثقة من ناسا ومختبر الدفع النفاث. إرسال أمر من الأرض لا يعني تلقي رد من المركبة.',
  'Analysis · The Last Transmission':'تحليل · الإرسال الأخير',
  'Identify the final received signal and restore the record sequence to secure Evidence 02.':'حدد الإشارة الأخيرة التي تم استقبالها، ورتب السجلات زمنيًا للحصول على الدليل 02.',
  'Working notes attached to the file by the M-07 investigation desk.':'ملاحظات عمل أضافها مكتب التحقيق M-07 إلى الملف.',
  'Opportunity had no nuclear power source. Every operation — heaters, radio, drive — depended on sunlight reaching its solar arrays.':'لم تكن أوبورتيونيتي تملك مصدر طاقة نووية؛ فالتدفئة والاتصالات والحركة اعتمدت كلها على ضوء الشمس الواصل إلى ألواحها.',
  'Check telemetry: if opacity rises faster than power can be stored, the rover enters low-power fault mode and waits for the sky to clear.':'راجع القياسات: إذا ارتفعت العتامة أسرع من قدرة المركبة على تخزين الطاقة، تدخل وضع انخفاض الطاقة وتنتظر صفاء السماء.',
  'Valley imagery shows the terrain the rover was exploring when the storm arrived. No damage is visible — the threat was the sky, not the ground.':'تُظهر صور الوادي التضاريس التي كانت المركبة تستكشفها عند وصول العاصفة. لا يظهر ضرر واضح؛ كان الخطر في السماء لا على الأرض.',
  'Evidence is secured only by completing the analyses in Telemetry and Signal Logs.':'لا تُحفظ الأدلة إلا بعد إكمال التحليلات في قسم القياسات وسجلات الإشارات.',
  'Chain of custody':'سلسلة توثيق الأدلة',
  'Direct instrument measurements, published NASA graphics and documented history are kept as separate categories in this file.':'تُحفظ القياسات المباشرة والرسوم المنشورة من ناسا والسجلات التاريخية الموثقة كفئات منفصلة في هذا الملف.',
  'A planet-encircling dust storm raised atmospheric opacity until sunlight could no longer power Opportunity. The rover’s last transmission arrived on June 10, 2018 (Sol 5111). Months of recovery commands received no reply, and NASA declared the mission complete on February 13, 2019.':'رفعت عاصفة ترابية شملت المريخ عتامة الغلاف الجوي حتى لم يعد ضوء الشمس كافيًا لتشغيل أوبورتيونيتي. وصل آخر إرسال في 10 يونيو 2018 (اليوم المريخي 5111). ولم تتلق ناسا ردًا على أشهر من محاولات إعادة الاتصال، فأعلنت انتهاء المهمة في 13 فبراير 2019.',
  'The rover’s internal state after Sol 5111 was never verified. Anything beyond the documented record belongs to the fiction of The Last Signal.':'لم يُتحقق من الحالة الداخلية للمركبة بعد اليوم المريخي 5111. وكل ما يتجاوز السجل الموثق يُعد جزءًا من الخيال القصصي للعبة The Last Signal.',
  'Last image received · Sol 5111':'آخر صورة مستقبلة · اليوم المريخي 5111',
  'Eagle crater':'فوهة إيجل','Landing site. Layered outcrop and hematite spherules observed.':'موقع الهبوط، حيث لوحظت طبقات صخرية مكشوفة وحبيبات هيماتيت كروية.',
  'Endurance crater':'فوهة إنديورانس','Months spent studying exposed sedimentary layers.':'قضت المركبة أشهرًا تدرس الطبقات الرسوبية المكشوفة.',
  'Purgatory dune':'كثيب بورجاتوري','Rover embedded in a sand ripple for weeks before driving free.':'علقت المركبة في تموج رملي لأسابيع قبل أن تتمكن من الخروج.',
  'Victoria crater':'فوهة فيكتوريا','Explored the rim and descended into the crater.':'استكشفت الحافة ونزلت إلى داخل الفوهة.',
  'Endeavour crater':'فوهة إنديفور','Arrived after a multi-year drive across the plains.':'وصلت إليها بعد رحلة امتدت لسنوات عبر السهول.',
  'Perseverance Valley':'وادي بيرسيفيرانس','Final work site on Endeavour’s western rim.':'آخر موقع عمل على الحافة الغربية لفوهة إنديفور.',
  'Dust storm begins to darken the sky':'بداية العاصفة الترابية وحجب الضوء',
  'Atmospheric opacity increased as a regional dust storm grew. Reduced sunlight meant less electrical energy could be generated by Opportunity’s solar arrays.':'ازدادت عتامة الغلاف الجوي مع نمو عاصفة ترابية إقليمية؛ وأدى انخفاض ضوء الشمس إلى تقليل الطاقة التي تنتجها الألواح الشمسية.',
  'Last communication received':'استقبال آخر اتصال',
  'Opportunity transmitted an incomplete Pancam image of the darkened sky through Mars Reconnaissance Orbiter. The image reached Earth at about 10:05 a.m. PDT. No subsequent communication was received.':'أرسلت أوبورتيونيتي صورة غير مكتملة للسماء المظلمة عبر المركبة المدارية الاستطلاعية للمريخ. وصلت الصورة إلى الأرض نحو الساعة 10:05 صباحًا بتوقيت المحيط الهادئ، ولم يُستقبل أي اتصال بعدها.',
  'Power falls as dust opacity rises':'انخفاض الطاقة مع ارتفاع العتامة',
  'NASA’s published graphic shows atmospheric opacity reaching Tau 10.5 and available energy falling to 21 watt-hours on Sol 5111. The rover’s internal status after the final transmission could not be verified.':'يُظهر رسم ناسا المنشور وصول العتامة إلى 10.5 وانخفاض الطاقة المتاحة إلى 21 واط-ساعة في اليوم المريخي 5111. ولم يمكن التحقق من الحالة الداخلية للمركبة بعد الإرسال الأخير.',
  'Recovery efforts intensify':'تكثيف محاولات استعادة الاتصال',
  'As the atmosphere cleared, JPL increased command attempts from three times per week to multiple times per day while continuing passive listening for a possible rover signal.':'مع صفاء الجو، زاد مختبر الدفع النفاث محاولات إرسال الأوامر من ثلاث مرات أسبوعيًا إلى مرات متعددة يوميًا، مع مواصلة الاستماع لأي إشارة محتملة.',
  'Alternative communication strategies':'استراتيجيات اتصال بديلة',
  'Engineers sent additional commands addressing potential radio faults or an offset mission clock, alongside existing sweep-and-beep recovery techniques. None restored contact.':'أرسل المهندسون أوامر إضافية لمعالجة أعطال راديوية محتملة أو انحراف ساعة المهمة، إلى جانب أساليب البحث المعتادة. ولم تستعد أي محاولة الاتصال.',
  'Final commands transmitted':'إرسال الأوامر الأخيرة',
  'Late on February 12, mission controllers at JPL transmitted the final commands asking Opportunity to contact Earth. No response was received.':'في وقت متأخر من 12 فبراير أرسل مراقبو المهمة الأوامر الأخيرة إلى أوبورتيونيتي للاتصال بالأرض، من دون تلقي استجابة.',
  'Mission declared complete':'الإعلان عن نهاية المهمة',
  'NASA announced the end of Opportunity’s mission after almost 15 years on Mars and more than 1,000 unsuccessful commands to reestablish contact.':'أعلنت ناسا انتهاء مهمة أوبورتيونيتي بعد نحو 15 عامًا على المريخ وأكثر من ألف أمر لم ينجح في استعادة الاتصال.',
  'Echo detected — fictional investigation':'رصد صدى — تحقيق خيالي',
  'In the fictional story of The Last Signal, Outpost M-07 detects an unexplained echo. This is a game narrative, not a real NASA transmission.':'في قصة The Last Signal الخيالية، ترصد المحطة M-07 صدى غامضًا. هذا عنصر قصصي داخل اللعبة وليس إرسالًا حقيقيًا من ناسا.',
}

const translated = (value: string) => ar[value] ?? value

function translateBlock(block: DossierBlock): DossierBlock {
  switch (block.type) {
    case 'text': return { ...block, body: translated(block.body) }
    case 'facts': return { ...block, title: translated(block.title), rows: block.rows.map(row => ({ label: translated(row.label), value: translated(row.value) })) }
    case 'list': return { ...block, title: translated(block.title), items: block.items.map(translated) }
    case 'photo': return { ...block, alt: translated(block.alt), caption: translated(block.caption) }
    case 'timeline': return { ...block, title: block.title && translated(block.title), entries: block.entries.map(e => ({ ...e, title: translated(e.title), body: translated(e.body) })) }
    case 'logs': return { ...block, title: block.title && translated(block.title), entries: block.entries.map(e => ({ ...e, title: translated(e.title), body: translated(e.body) })) }
    case 'chart': return { ...block, title: translated(block.title), caption: block.caption && translated(block.caption) }
    case 'callout': return { ...block, title: translated(block.title), body: translated(block.body) }
    case 'note': return { ...block, body: translated(block.body) }
    case 'analysis': return { ...block, title: translated(block.title), body: translated(block.body) }
    case 'summary': return { ...block, conclusion: translated(block.conclusion), caveat: block.caveat && translated(block.caveat) }
    default: return block
  }
}

export function localizeOpportunity(file: MissionFile, language: 'en' | 'ar'): MissionFile {
  if (language !== 'ar' || file.id !== 'opportunity') return file
  return {
    ...file,
    clearance: translated(file.clearance),
    items: file.items.map(item => ({ ...item, label: translated(item.label), detail: translated(item.detail) })),
    pages: file.pages.map(page => ({
      ...page,
      tab: translated(page.tab),
      kicker: translated(page.kicker),
      title: translated(page.title),
      lede: page.lede && translated(page.lede),
      left: page.left.map(translateBlock),
      right: page.right.map(translateBlock),
    })),
  }
}
