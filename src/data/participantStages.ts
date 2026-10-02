import type { PathCode } from '../types';

export type StageOrdinal = 1 | 2 | 3 | 4;

export interface ParticipantStage {
  ordinal: StageOrdinal;
  name: string;
  phase: string;
  description: string;
  mapPath: string;
  mapScale: number;
  worldSize: number;
  spawn: { x: number; y: number };
  board: { x: number; y: number };
  accent: string;
  boardName: string;
  boardHint: string;
}

export const PARTICIPANT_STAGES: ParticipantStage[] = [
  {
    ordinal: 1,
    name: 'Discover',
    phase: 'L1',
    description: 'Temukan akar masalah dari pengalaman nyata.',
    mapPath: '/assets/dungeon/map_stage3_interior.png',
    mapScale: 2,
    worldSize: 2048,
    spawn: { x: 1856, y: 816 },
    board: { x: 1772, y: 732 },
    accent: '#e9b95b',
    boardName: 'Jurnal Lapangan',
    boardHint: 'di halaman rumah beratap biru',
  },
  {
    ordinal: 2,
    name: 'Build',
    phase: 'L2',
    description: 'Bangun dan uji prototipe dari temuan lapangan.',
    mapPath: '/assets/dungeon/map_stage2_castle.png',
    mapScale: 2,
    worldSize: 2048,
    spawn: { x: 1000, y: 1660 },
    board: { x: 890, y: 1230 },
    accent: '#61c6b1',
    boardName: 'Bengkel Prototipe',
    boardHint: 'di bengkel kastil, dekat meja kerja & blueprint',
  },
  {
    ordinal: 3,
    name: 'Pitch',
    phase: 'L3',
    description: 'Uji, sempurnakan, dan siapkan presentasi final.',
    mapPath: '/assets/dungeon/map_stage3_ice.png',
    mapScale: 2,
    worldSize: 2048,
    spawn: { x: 1024, y: 1860 },
    board: { x: 1024, y: 1150 },
    accent: '#d6a8ea',
    boardName: 'Paviliun Pitch',
    boardHint: 'di depan panggung presentasi benteng es',
  },
  {
    ordinal: 4,
    name: 'Impact',
    phase: 'L4',
    description: 'Rayakan dampak dan kelulusan perjalananmu di kayangan.',
    mapPath: '/assets/dungeon/map_stage4_celestial.png',
    mapScale: 2,
    worldSize: 2048,
    spawn: { x: 1024, y: 1880 },
    board: { x: 1024, y: 760 },
    accent: '#38bdf8',
    boardName: 'Altar Kayangan',
    boardHint: 'di depan altar agung bersayap emas',
  },
];

export type AccessDecision = 'advance' | 'not-advanced';

export interface StageGate {
  resultPublished: boolean;
  decision: AccessDecision;
  scheduledOpen: boolean;
}

export interface DemoAccessState {
  stage2: StageGate;
  stage3: StageGate;
}

export const DEFAULT_DEMO_ACCESS: DemoAccessState = {
  stage2: { resultPublished: true, decision: 'advance', scheduledOpen: true },
  stage3: { resultPublished: true, decision: 'advance', scheduledOpen: true },
};

export function getStageAccess(ordinal: StageOrdinal, access: DemoAccessState) {
  if (ordinal === 4) {
    return { unlocked: true, readOnly: false, reason: null } as const;
  }

  const ready = (gate: StageGate) => gate.resultPublished && gate.decision === 'advance' && gate.scheduledOpen;
  const priorGate = ordinal === 3 ? access.stage2 : null;
  const gate = ordinal === 2 ? access.stage2 : ordinal === 3 ? access.stage3 : null;

  if (ordinal === 1) {
    const readOnly = (access.stage2.resultPublished && access.stage2.decision === 'not-advanced')
      || (ready(access.stage2) && access.stage3.resultPublished && access.stage3.decision === 'not-advanced');
    return { unlocked: true, readOnly, reason: readOnly ? 'not-advanced' : null } as const;
  }

  if (priorGate && !ready(priorGate)) {
    return { unlocked: false, readOnly: false, reason: 'previous-stage-locked' } as const;
  }

  if (!gate?.resultPublished) return { unlocked: false, readOnly: false, reason: 'result-pending' } as const;
  if (gate.decision === 'not-advanced') return { unlocked: false, readOnly: false, reason: 'not-advanced' } as const;
  if (!gate.scheduledOpen) return { unlocked: false, readOnly: false, reason: 'schedule-pending' } as const;

  const nextGate = ordinal === 2 ? access.stage3 : null;
  const readOnly = Boolean(nextGate?.resultPublished && nextGate.decision === 'not-advanced');
  return { unlocked: true, readOnly, reason: readOnly ? 'not-advanced' : null } as const;
}

export function canEnterStage(ordinal: StageOrdinal, access: DemoAccessState) {
  return getStageAccess(ordinal, access).unlocked;
}

export function trackLabel(path: PathCode) {
  return {
    professional: 'Professional',
    social_impact: 'Social Impact',
    business: 'Bisnis',
  }[path];
}
