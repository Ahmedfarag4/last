import {
  MEDIA,
  OPPORTUNITY_OBJECTIVES,
  OPPORTUNITY_OVERVIEW,
  SIGNAL_LOGS,
  TRAVERSE,
  TRAVERSE_DISTANCE,
} from '../../archives/archive-data'
import type { MissionFile } from '../types'

const media = (title: string) => {
  const item = MEDIA.find((m) => m.title === title)
  if (!item) throw new Error(`Missing NASA media record: ${title}`)
  return item
}

const finalFrame = media('Final Downlinked Pancam Frame')
const lastSun = media('Last Images of the Sun')
const panorama = media('Opportunity’s Final Panorama')
const uphill = media('Looking Back Uphill')
const tracks = media('Tracks in Perseverance Valley')

export const OPPORTUNITY_FILE: MissionFile = {
  id: 'opportunity',
  code: 'MER-B',
  name: 'Opportunity',
  designation: 'Mars Exploration Rover · B',
  agency: 'NASA / Jet Propulsion Laboratory',
  clearance: 'Classified',
  cover: {
    src: '/images/archives/opportunity.png',
    alt: 'Artistic render of a six-wheeled rover on the dusty orange plains of Mars at sunset',
    caption: 'Artistic render · MER-B',
  },
  backdrop: '/images/opportunity-mission-control-final.webp',
  items: [
    { id: 'mission-profile', pageId: 'overview', kind: 'text', label: 'Mission Profile', detail: 'Twin Mars Exploration Rover, designed for 90 sols, operated for more than fourteen years.' },
    { id: 'objectives', pageId: 'overview', kind: 'text', label: 'Main Objectives', detail: 'Search rocks and soils for evidence of past water activity at Meridiani Planum.' },
    { id: 'key-hardware', pageId: 'overview', kind: 'data', label: 'Key Hardware', detail: 'Solar arrays and batteries power a six-wheel rocker-bogie rover carrying Pancam and arm instruments.' },
    { id: 'landing-site', pageId: 'overview', kind: 'media', label: 'Landing Site', detail: 'Eagle crater, Meridiani Planum — landed January 25, 2004.' },
    { id: 'traverse-record', pageId: 'timeline', kind: 'data', label: 'Traverse Record', detail: `Total distance driven: ${TRAVERSE_DISTANCE}.` },
    { id: 'final-worksite', pageId: 'timeline', kind: 'text', label: 'Final Work Site', detail: 'Perseverance Valley, on the western rim of Endeavour crater (2018).' },
    { id: 'tau-rise', pageId: 'telemetry', kind: 'data', label: 'Opacity Surge', detail: 'Direct Pancam readings show Tau rising sharply in the final recorded sols.' },
    { id: 'data-gap', pageId: 'telemetry', kind: 'data', label: 'Measurement Gap', detail: 'The last direct Tau reading is Sol 5105.61 — six sols before last contact.' },
    { id: 'last-contact', pageId: 'signals', kind: 'signal', label: 'Last Contact', detail: 'June 10, 2018 · Sol 5111 — an incomplete Pancam frame relayed via MRO.' },
    { id: 'recovery-effort', pageId: 'signals', kind: 'signal', label: 'Recovery Campaign', detail: 'More than 1,000 commands were sent before the mission ended on February 13, 2019.' },
    { id: 'solar-dependency', pageId: 'notes', kind: 'note', label: 'Solar Dependency', detail: 'Every watt-hour depended on sunlight reaching the arrays; dust cut both light and power.' },
    { id: 'valley-imagery', pageId: 'notes', kind: 'media', label: 'Valley Imagery', detail: 'Navcam views document Perseverance Valley terrain before the storm.' },
    { id: 'evidence-01', pageId: 'evidence', kind: 'evidence', label: 'Evidence 01 · Darkening Sky', detail: 'Dust opacity rose, sunlight fell, solar power collapsed.', externalKey: 'last-signal.opportunity.evidence-01.v1' },
    { id: 'evidence-02', pageId: 'evidence', kind: 'evidence', label: 'Evidence 02 · Last Transmission', detail: 'Verified chronology of last contact and recovery attempts.', externalKey: 'last-signal.opportunity.evidence-02.v1' },
  ],
  pages: [
    {
      id: 'overview',
      tab: 'Overview',
      kicker: 'Mission file · Opportunity (MER-B)',
      title: 'Mission Overview',
      left: [
        { type: 'text', lead: true, body: OPPORTUNITY_OVERVIEW },
        {
          type: 'facts',
          title: 'Key information',
          rows: [
            { label: 'Launch date', value: 'July 7, 2003' },
            { label: 'Landing date', value: 'January 25, 2004' },
            { label: 'Landing site', value: 'Eagle crater, Meridiani Planum' },
            { label: 'Mission duration', value: '5,111 sols (≈ 14 years)' },
            { label: 'Planned mission', value: '90 sols' },
          ],
        },
        { type: 'clue', itemId: 'mission-profile' },
        { type: 'clue', itemId: 'landing-site' },
      ],
      right: [
        { type: 'photo', src: '/images/archives/opportunity.png', alt: 'Artistic render of the Opportunity rover on the Martian plains', caption: 'MER-B · artistic render', tilt: 2 },
        { type: 'list', title: 'Primary objectives', items: OPPORTUNITY_OBJECTIVES },
        { type: 'clue', itemId: 'objectives' },
        {
          type: 'facts',
          title: 'Rover hardware',
          rows: [
            { label: 'Power', value: 'Solar arrays + batteries' },
            { label: 'Mobility', value: 'Six-wheel rocker-bogie' },
            { label: 'Imaging', value: 'Pancam · Navcam' },
          ],
        },
        { type: 'clue', itemId: 'key-hardware' },
      ],
    },
    {
      id: 'timeline',
      tab: 'Timeline',
      kicker: 'Section 02 · Chronology',
      title: 'Traverse Timeline',
      lede: 'Fourteen years of driving across Meridiani Planum, from a 90-sol mission to a marathon on another world.',
      left: [{ type: 'timeline', entries: TRAVERSE.map((t) => ({ stamp: t.year, title: t.site, body: t.note })) }],
      right: [
        { type: 'photo', src: tracks.src, alt: tracks.title, caption: tracks.title, credit: tracks.credit, tilt: -1.5, fit: 'cover' },
        { type: 'callout', title: 'Distance driven', body: `${TRAVERSE_DISTANCE} — the longest distance driven on another world at the time.` },
        { type: 'clue', itemId: 'traverse-record' },
        { type: 'clue', itemId: 'final-worksite' },
      ],
    },
    {
      id: 'telemetry',
      tab: 'Telemetry',
      kicker: 'Section 03 · Atmospheric data',
      title: 'Telemetry Data',
      lede: 'Atmospheric opacity (Tau) recorded by Pancam at 880 nm during the final months before loss of contact.',
      left: [
        { type: 'chart', chartId: 'opportunity-tau', title: 'Atmospheric opacity (Tau)', caption: 'NASA PDS · MER1 Pancam 880 nm. Line connects recorded samples only.' },
        { type: 'clue', itemId: 'tau-rise' },
        { type: 'clue', itemId: 'data-gap' },
      ],
      right: [
        { type: 'photo', src: lastSun.src, alt: lastSun.title, caption: lastSun.title, credit: lastSun.credit, tilt: 1.5, fit: 'contain' },
        {
          type: 'callout',
          title: 'Observation',
          body: 'A rapid increase in opacity marks the planet-encircling dust storm. NASA later published an estimate of Tau ≈ 10.5 on Sol 5111 — a separate source, not a direct reading in this series.',
        },
        {
          type: 'analysis',
          analysisId: 'darkening-sky',
          itemId: 'evidence-01',
          title: 'Analysis · The Darkening Sky',
          body: 'Inspect the original readings, find the data gap and rebuild the cause-and-effect chain to secure Evidence 01.',
        },
      ],
    },
    {
      id: 'signals',
      tab: 'Signal Logs',
      kicker: 'Section 04 · Communications',
      title: 'Signal Logs',
      lede: 'Documented NASA/JPL communication records. A command sent from Earth is not a reply from the rover.',
      left: [{ type: 'logs', entries: SIGNAL_LOGS }],
      right: [
        { type: 'photo', src: finalFrame.src, alt: finalFrame.title, caption: finalFrame.title, credit: finalFrame.credit, tilt: -2, fit: 'contain' },
        { type: 'clue', itemId: 'last-contact' },
        { type: 'clue', itemId: 'recovery-effort' },
        {
          type: 'analysis',
          analysisId: 'last-transmission',
          itemId: 'evidence-02',
          title: 'Analysis · The Last Transmission',
          body: 'Identify the final received signal and restore the record sequence to secure Evidence 02.',
        },
      ],
    },
    {
      id: 'notes',
      tab: 'Field Notes',
      kicker: 'Section 05 · Analyst annotations',
      title: 'Field Notes',
      lede: 'Working notes attached to the file by the M-07 investigation desk.',
      left: [
        { type: 'note', body: 'Opportunity had no nuclear power source. Every operation — heaters, radio, drive — depended on sunlight reaching its solar arrays.', signature: 'M-07 / desk 4' },
        { type: 'note', body: 'Check telemetry: if opacity rises faster than power can be stored, the rover enters low-power fault mode and waits for the sky to clear.', signature: 'M-07 / desk 4' },
        { type: 'clue', itemId: 'solar-dependency' },
        { type: 'photo', src: uphill.src, alt: uphill.title, caption: uphill.title, credit: uphill.credit, tilt: -1, fit: 'cover' },
      ],
      right: [
        { type: 'photo', src: tracks.src, alt: tracks.title, caption: `${tracks.title} · pre-storm`, credit: tracks.credit, tilt: 2, fit: 'cover' },
        { type: 'note', body: 'Valley imagery shows the terrain the rover was exploring when the storm arrived. No damage is visible — the threat was the sky, not the ground.', signature: 'M-07 / desk 2' },
        { type: 'clue', itemId: 'valley-imagery' },
      ],
    },
    {
      id: 'evidence',
      tab: 'Evidence',
      kicker: 'Section 06 · Case evidence',
      title: 'Evidence Locker',
      lede: 'Evidence is secured only by completing the analyses in Telemetry and Signal Logs.',
      left: [{ type: 'evidence', itemIds: ['evidence-01', 'evidence-02'] }],
      right: [
        { type: 'photo', src: panorama.src, alt: panorama.title, caption: panorama.title, credit: panorama.credit, tilt: 1, fit: 'contain' },
        { type: 'callout', title: 'Chain of custody', body: 'Direct instrument measurements, published NASA graphics and documented history are kept as separate categories in this file.' },
      ],
    },
    {
      id: 'summary',
      tab: 'Summary',
      kicker: 'Section 07 · Case summary',
      title: 'Case Summary',
      left: [
        {
          type: 'summary',
          conclusion:
            'A planet-encircling dust storm raised atmospheric opacity until sunlight could no longer power Opportunity. The rover’s last transmission arrived on June 10, 2018 (Sol 5111). Months of recovery commands received no reply, and NASA declared the mission complete on February 13, 2019.',
          caveat: 'The rover’s internal state after Sol 5111 was never verified. Anything beyond the documented record belongs to the fiction of The Last Signal.',
        },
      ],
      right: [{ type: 'photo', src: finalFrame.src, alt: finalFrame.title, caption: 'Last image received · Sol 5111', credit: finalFrame.credit, tilt: -1.5, fit: 'contain' }],
    },
  ],
}
