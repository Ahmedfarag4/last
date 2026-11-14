export type MissionId = 'opportunity' | 'insight' | 'apollo'

export type Mission = {
  id: MissionId
  index: string
  name: string
  site: string
  body: string
  image: string
  imageAlt: string
  featured: boolean
}

export const MISSIONS: Mission[] = [
  {
    id: 'insight',
    index: 'MISSION 02',
    name: 'InSight',
    site: 'Elysium Planitia',
    body: 'Mars',
    image: '/images/archives/insight.png',
    imageAlt: 'Artistic render of a stationary lander with round solar arrays on a flat Martian plain',
    featured: false,
  },
  {
    id: 'opportunity',
    index: 'MISSION 01',
    name: 'Opportunity',
    site: 'Meridiani Planum',
    body: 'Mars',
    image: '/images/archives/opportunity.png',
    imageAlt: 'Artistic render of a six-wheeled rover on the dusty orange plains of Mars at sunset',
    featured: true,
  },
  {
    id: 'apollo',
    index: 'MISSION 03',
    name: 'Apollo',
    site: 'Tranquility Base',
    body: 'Moon',
    image: '/images/archives/apollo.png',
    imageAlt: 'Artistic render of a lunar module and an astronaut on the grey lunar surface with Earth in the sky',
    featured: false,
  },
]

export const MISSION_BLURBS: Record<MissionId, string> = {
  opportunity:
    'Fourteen years after touching down, the rover’s transmissions fell silent during a planet-wide dust storm. Trace the final signals and reconstruct what it saw in its last days on the plains.',
  insight:
    'A stationary lander that listened to the interior of Mars, recording more than 1,300 marsquakes before dust ended its power supply.',
  apollo:
    'The first crewed landing on another world. Retrace the hours Eagle spent on the Sea of Tranquility.',
}

/** Publicly documented NASA/JPL mission history for the Mars Exploration Rover Opportunity (MER-B). */
export const OPPORTUNITY_FACTS = [
  { label: 'Launch', value: 'July 7, 2003' },
  { label: 'Landing', value: 'January 25, 2004' },
  { label: 'Last communication', value: 'June 10, 2018' },
  { label: 'Planned mission', value: '90 sols' },
]

export const OPPORTUNITY_OVERVIEW =
  'Opportunity was the second of NASA’s twin Mars Exploration Rovers. It launched from Cape Canaveral aboard a Delta II rocket, landed inside Eagle crater on Meridiani Planum, and was designed for a 90-sol mission. It kept operating for more than fourteen years, until a planet-encircling dust storm in 2018 cut off its solar power.'

export const OPPORTUNITY_OBJECTIVES = [
  'Search for rocks and soils that hold clues to past water activity on Mars.',
  'Determine the distribution and composition of minerals, rocks, and soils near the landing site.',
  'Study the geologic processes that shaped the local terrain.',
  'Assess whether past environments could have been suitable for life.',
]

export const OPPORTUNITY_ROVER = [
  { label: 'Designation', value: 'MER-B' },
  { label: 'Mission', value: 'Mars Exploration Rover' },
  { label: 'Power', value: 'Solar arrays + batteries' },
  { label: 'Mobility', value: 'Six-wheel rocker-bogie' },
  { label: 'Operated by', value: 'NASA / JPL' },
  { label: 'Mission end', value: 'Declared Feb 13, 2019' },
]

export const OPPORTUNITY_INSTRUMENTS = [
  { name: 'Pancam', detail: 'Panoramic stereo color cameras on the mast for landscape and geology imaging.' },
  { name: 'Mini-TES', detail: 'Miniature Thermal Emission Spectrometer for identifying minerals from a distance.' },
  { name: 'Mössbauer Spectrometer', detail: 'Arm-mounted instrument for identifying iron-bearing minerals.' },
  { name: 'APXS', detail: 'Alpha Particle X-ray Spectrometer for measuring elemental composition.' },
  { name: 'Microscopic Imager', detail: 'Close-up camera for examining fine-scale rock and soil textures.' },
  { name: 'Rock Abrasion Tool', detail: 'Grinder that exposed fresh rock interiors for study.' },
]

export const OPPORTUNITY_CONTEXT =
  'Opportunity and its twin, Spirit, followed Sojourner (1997) as NASA’s next rovers on Mars. Opportunity’s discovery of hematite-rich spherules, nicknamed “blueberries,” helped establish that liquid water once existed at Meridiani Planum. Its endurance set the record for the longest distance driven on another world at the time.'

export type TraverseStop = {
  year: string
  site: string
  note: string
}

export const TRAVERSE: TraverseStop[] = [
  { year: '2004', site: 'Eagle crater', note: 'Landing site. Layered outcrop and hematite spherules observed.' },
  { year: '2004', site: 'Endurance crater', note: 'Months spent studying exposed sedimentary layers.' },
  { year: '2005', site: 'Purgatory dune', note: 'Rover embedded in a sand ripple for weeks before driving free.' },
  { year: '2006–2008', site: 'Victoria crater', note: 'Explored the rim and descended into the crater.' },
  { year: '2011', site: 'Endeavour crater', note: 'Arrived after a multi-year drive across the plains.' },
  { year: '2018', site: 'Perseverance Valley', note: 'Final work site on Endeavour’s western rim.' },
]

export const TRAVERSE_DISTANCE = '45.16 km (28.06 mi)'

export type SignalLog = {
  id: string
  stamp: string
  kind: 'history' | 'fiction'
  title: string
  body: string
  /** NASA/JPL primary reference for documented events; absent for fictional events. */
  sourceUrl?: string
  sourceLabel?: string
}

/** Public NASA/JPL mission chronology. Narrative fiction is explicitly separated. */
export const SIGNAL_LOGS: SignalLog[] = [
  {
    id: 'storm-onset',
    stamp: '2018-05-30',
    kind: 'history',
    title: 'Dust storm begins to darken the sky',
    body: 'Atmospheric opacity increased as a regional dust storm grew. Reduced sunlight meant less electrical energy could be generated by Opportunity’s solar arrays.',
    sourceUrl: 'https://science.nasa.gov/resource/on-mars-light-is-energy/',
    sourceLabel: 'NASA Science · On Mars, Light Is Energy',
  },
  {
    id: 'last',
    stamp: '2018-06-10 · SOL 5111',
    kind: 'history',
    title: 'Last communication received',
    body: 'Opportunity transmitted an incomplete Pancam image of the darkened sky through Mars Reconnaissance Orbiter. The image reached Earth at about 10:05 a.m. PDT. No subsequent communication was received.',
    sourceUrl: 'https://www.jpl.nasa.gov/images/pia22929-opportunitys-last-message/',
    sourceLabel: 'NASA/JPL · Opportunity’s Last Message',
  },
  {
    id: 'low-power',
    stamp: '2018-06-10',
    kind: 'history',
    title: 'Power falls as dust opacity rises',
    body: 'NASA’s published graphic shows atmospheric opacity reaching Tau 10.5 and available energy falling to 21 watt-hours on Sol 5111. The rover’s internal status after the final transmission could not be verified.',
    sourceUrl: 'https://science.nasa.gov/resource/on-mars-light-is-energy/',
    sourceLabel: 'NASA Science · Power and atmospheric opacity graphic',
  },
  {
    id: 'recovery-september',
    stamp: '2018-09-11',
    kind: 'history',
    title: 'Recovery efforts intensify',
    body: 'As the atmosphere cleared, JPL increased command attempts from three times per week to multiple times per day while continuing passive listening for a possible rover signal.',
    sourceUrl: 'https://www.jpl.nasa.gov/news/update-on-opportunity-rover-recovery-efforts/',
    sourceLabel: 'NASA/JPL · Update on Recovery Efforts',
  },
  {
    id: 'recovery-january',
    stamp: '2019-01',
    kind: 'history',
    title: 'Alternative communication strategies',
    body: 'Engineers sent additional commands addressing potential radio faults or an offset mission clock, alongside existing sweep-and-beep recovery techniques. None restored contact.',
    sourceUrl: 'https://www.jpl.nasa.gov/news/rover-team-beaming-new-commands-to-opportunity-on-mars/',
    sourceLabel: 'NASA/JPL · New Commands to Opportunity',
  },
  {
    id: 'last-command',
    stamp: '2019-02-12',
    kind: 'history',
    title: 'Final commands transmitted',
    body: 'Late on February 12, mission controllers at JPL transmitted the final commands asking Opportunity to contact Earth. No response was received.',
    sourceUrl: 'https://science.nasa.gov/resource/last-commands-to-opportunity/',
    sourceLabel: 'NASA Science · Last Commands to Opportunity',
  },
  {
    id: 'end',
    stamp: '2019-02-13',
    kind: 'history',
    title: 'Mission declared complete',
    body: 'NASA announced the end of Opportunity’s mission after almost 15 years on Mars and more than 1,000 unsuccessful commands to reestablish contact.',
    sourceUrl: 'https://www.jpl.nasa.gov/news/nasas-opportunity-rover-mission-on-mars-comes-to-end/',
    sourceLabel: 'NASA/JPL · End of Mission',
  },
  {
    id: 'm07-echo',
    stamp: 'M-07 // CYCLE 0',
    kind: 'fiction',
    title: 'Echo detected — fictional investigation',
    body: 'In the fictional story of The Last Signal, Outpost M-07 detects an unexplained echo. This is a game narrative, not a real NASA transmission.',
  },
]

export type MediaItem = {
  src: string
  title: string
  caption: string
  credit: string
  camera: 'Pancam' | 'Navcam'
  sourceUrl: string
  displayFit?: 'contain'
}

/** Original NASA mission imagery uploaded to public/data/opportunity/images. */
export const MEDIA: MediaItem[] = [
  {
    src: '/data/opportunity/images/PIA-22908-LegacyPan-ANNOTATED-NASA-1.jpg',
    title: 'Opportunity’s Final Panorama',
    caption: 'Annotated panorama of Perseverance Valley assembled from Pancam images recorded during the rover’s final weeks on Mars in 2018.',
    credit: 'NASA / JPL-Caltech / Cornell / ASU · PIA22908',
    camera: 'Pancam',
    sourceUrl: 'https://science.nasa.gov/resource/opportunity-rovers-final-mars-images/',
    displayFit: 'contain',
  },
  {
    src: '/data/opportunity/images/42559_PIA22929_PANCAMSOL5111_1P581919922EFFD2FCP2682L8M1.jpg',
    title: 'Final Downlinked Pancam Frame',
    caption: 'A dark, incomplete frame from Opportunity’s last communication on June 10, 2018 (Sol 5111). The missing image area is part of the received frame.',
    credit: 'NASA / JPL-Caltech / Cornell · PIA22929',
    camera: 'Pancam',
    sourceUrl: 'https://science.nasa.gov/resource/opportunitys-last-message/',
    displayFit: 'contain',
  },
  {
    src: '/data/opportunity/images/PIA22930.jpg',
    title: 'Last Images of the Sun',
    caption: 'Two small Pancam frames of the Sun through the dust-filled Martian sky, used to estimate atmospheric opacity near the end of the mission. Original downlinked resolution: 224 × 96 pixels.',
    credit: 'NASA / JPL-Caltech / Cornell · PIA22930',
    camera: 'Pancam',
    sourceUrl: 'https://science.nasa.gov/photojournal/last-images-opportunity-took/',
    displayFit: 'contain',
  },
  {
    src: '/data/opportunity/images/8846_PIA21725_SOL4793-ncam-full2.jpg',
    title: 'Looking Back Uphill',
    caption: 'Navcam view looking back uphill after Opportunity entered Perseverance Valley on Sol 4793 (July 18, 2017); part of the rover’s deck is visible in the foreground.',
    credit: 'NASA / JPL-Caltech · PIA21725',
    camera: 'Navcam',
    sourceUrl: 'https://science.nasa.gov/resource/view-back-uphill-after-entering-perseverance-valley/',
    displayFit: 'contain',
  },
  {
    src: '/data/opportunity/images/22508_PIA23246-800w.jpg',
    title: 'Tracks in Perseverance Valley',
    caption: 'Navcam view of the terrain and wheel tracks in Perseverance Valley, documenting Opportunity’s traverse before the 2018 dust storm.',
    credit: 'NASA / JPL-Caltech · PIA23246',
    camera: 'Navcam',
    sourceUrl: 'https://science.nasa.gov/resource/opportunitys-tracks-in-perseverance-valley/',
    displayFit: 'contain',
  },
]

export type Dossier = {
  index: string
  facts: { label: string; value: string }[]
  overview: string
  objectives: string[]
  craftTitle: string
  craft: { label: string; value: string }[]
  instruments: { name: string; detail: string }[]
  context: string
  fiction: string
  hasArchive: boolean
}

export const DOSSIERS: Record<MissionId, Dossier> = {
  opportunity: {
    index: 'MISSION 01',
    facts: OPPORTUNITY_FACTS,
    overview: OPPORTUNITY_OVERVIEW,
    objectives: OPPORTUNITY_OBJECTIVES,
    craftTitle: 'Rover',
    craft: OPPORTUNITY_ROVER,
    instruments: OPPORTUNITY_INSTRUMENTS,
    context: OPPORTUNITY_CONTEXT,
    fiction:
      'Years after the mission ended, the fictional research station Outpost M-07 detects a faint echo on a frequency once used by the rover. Your investigation begins here.',
    hasArchive: true,
  },
  insight: {
    index: 'MISSION 02',
    facts: [
      { label: 'Launch', value: 'May 5, 2018' },
      { label: 'Landing', value: 'November 26, 2018' },
      { label: 'Last communication', value: 'December 15, 2022' },
      { label: 'Planned mission', value: '1 Mars year' },
    ],
    overview:
      'InSight (Interior Exploration using Seismic Investigations, Geodesy and Heat Transport) launched from Vandenberg Space Force Base aboard an Atlas V — the first interplanetary launch from the U.S. West Coast. It landed on Elysium Planitia and became the first mission dedicated to studying the deep interior of Mars.',
    objectives: [
      'Measure seismic activity to determine the size and structure of the Martian crust, mantle, and core.',
      'Measure the rate of heat flowing out of the planet’s interior.',
      'Track the wobble of Mars’ rotation to constrain the size and state of its core.',
      'Understand how rocky planets like Earth and Mars formed and evolved.',
    ],
    craftTitle: 'Lander',
    craft: [
      { label: 'Type', value: 'Stationary lander' },
      { label: 'Heritage', value: 'Phoenix lander design' },
      { label: 'Power', value: 'Two solar arrays' },
      { label: 'Landing site', value: 'Elysium Planitia' },
      { label: 'Operated by', value: 'NASA / JPL' },
      { label: 'Mission end', value: 'Declared Dec 21, 2022' },
    ],
    instruments: [
      { name: 'SEIS', detail: 'Seismometer placed on the surface that recorded more than 1,300 marsquakes.' },
      { name: 'HP³', detail: 'Self-hammering heat-flow probe, nicknamed “the mole.”' },
      { name: 'RISE', detail: 'Radio science experiment tracking the planet’s rotational wobble.' },
      { name: 'TWINS', detail: 'Temperature and wind sensors monitoring local weather.' },
      { name: 'IDA', detail: 'Robotic arm that deployed instruments onto the ground.' },
      { name: 'IDC / ICC', detail: 'Arm-mounted and body-mounted cameras for context imaging.' },
    ],
    context:
      'InSight was accompanied by MarCO-A and MarCO-B, the first CubeSats sent into deep space, which relayed its landing data. Its seismic recordings gave scientists the first direct measurements of the Martian core. Dust gradually covered its solar arrays until the lander could no longer communicate.',
    fiction:
      'Outpost M-07 picks up a faint pattern resembling InSight’s seismic telemetry, long after the lander went quiet. The source has not been identified.',
    hasArchive: false,
  },
  apollo: {
    index: 'MISSION 03',
    facts: [
      { label: 'Launch', value: 'July 16, 1969' },
      { label: 'Landing', value: 'July 20, 1969' },
      { label: 'Lunar liftoff', value: 'July 21, 1969' },
      { label: 'Splashdown', value: 'July 24, 1969' },
    ],
    overview:
      'Apollo 11 launched from Kennedy Space Center aboard a Saturn V rocket. The Lunar Module Eagle touched down in the Sea of Tranquility, and Neil Armstrong and Buzz Aldrin became the first people to walk on the Moon while Michael Collins orbited in the Command Module Columbia.',
    objectives: [
      'Perform a crewed lunar landing and return the crew safely to Earth.',
      'Collect samples of lunar rock and soil.',
      'Deploy surface experiments at the landing site.',
      'Photograph the landing area and the lunar surface.',
    ],
    craftTitle: 'Spacecraft',
    craft: [
      { label: 'Launch vehicle', value: 'Saturn V' },
      { label: 'Lunar Module', value: 'Eagle' },
      { label: 'Command Module', value: 'Columbia' },
      { label: 'Crew', value: 'Armstrong, Aldrin, Collins' },
      { label: 'Operated by', value: 'NASA' },
      { label: 'Surface samples', value: '21.5 kg returned' },
    ],
    instruments: [
      { name: 'Passive Seismic Experiment', detail: 'Seismometer that detected moonquakes and impacts.' },
      { name: 'Laser Ranging Retroreflector', detail: 'Mirror array still used to measure the Earth–Moon distance.' },
      { name: 'Solar Wind Composition', detail: 'Aluminum foil sheet that captured particles from the solar wind.' },
      { name: 'Sample containers', detail: 'Sealed boxes that returned lunar rock and soil to Earth.' },
    ],
    context:
      'Apollo 11 fulfilled the goal set by President John F. Kennedy in 1961 of landing a person on the Moon and returning them safely before the end of the decade. Armstrong and Aldrin spent about two and a half hours outside the Lunar Module.',
    fiction:
      'A fragment of voice-loop audio, timestamped to Tranquility Base, surfaces in Outpost M-07’s signal buffer. Nobody knows how it got there.',
    hasArchive: false,
  },
}
