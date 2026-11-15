'use client'

import { DarkeningSkyPuzzle } from './darkening-sky-puzzle'
import { LastTransmissionPuzzle } from './last-transmission-puzzle'
import { MissionFileScreen, type AnalysisRegistry } from './dossier/mission-file-screen'
import { OPPORTUNITY_FILE } from './dossier/missions/opportunity'

const OPPORTUNITY_ANALYSES: AnalysisRegistry = {
  'darkening-sky': DarkeningSkyPuzzle,
  'last-transmission': LastTransmissionPuzzle,
}

export function InvestigationScreen({ onBack }: { onBack: () => void }) {
  return <MissionFileScreen file={OPPORTUNITY_FILE} analyses={OPPORTUNITY_ANALYSES} onBack={onBack} />
}
