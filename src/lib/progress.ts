import type { FutureBase, PathCode, Submission } from '../types';
import { DEFAULT_DEMO_ACCESS, getStageAccess, type DemoAccessState, type StageOrdinal } from '../data/participantStages';

export type ParticipantDemoState = {
  screen: 'onboarding' | 'expedition' | 'stage' | 'passport';
  onboarded: boolean;
  futureBase: FutureBase | null;
  currentStage: StageOrdinal;
  access: DemoAccessState;
  quizAttempts: string[];
  quizDefeats: string[];
  introducedStages: StageOrdinal[];
  submissions: Record<number, Submission>;
  xpAwards: Record<string, number>;
};
export const INITIAL_PARTICIPANT_DEMO: ParticipantDemoState = {
  screen: 'onboarding', onboarded: false, futureBase: null, currentStage: 1,
  access: DEFAULT_DEMO_ACCESS, quizAttempts: [], quizDefeats: [], introducedStages: [], submissions: {}, xpAwards: {},
};
const key = (scope: string) => `fq:progress:v1:${scope}`;
const object = (value: unknown): value is Record<string, any> => !!value && typeof value === 'object' && !Array.isArray(value);
const strings = (value: unknown): value is string[] => Array.isArray(value) && value.every(item => typeof item === 'string');
const numbers = (value: unknown) => object(value) && Object.values(value).every(item => typeof item === 'number' && Number.isFinite(item) && item >= 0);
export const isEvidenceLink = (value: string) => {
  try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
};
function validProgress(p: unknown, scope: string): p is ParticipantDemoState {
  if (!object(p) || typeof p.onboarded !== 'boolean' || ![1, 2, 3, 4].includes(p.currentStage)
    || !['onboarding', 'expedition', 'stage', 'passport'].includes(p.screen)
    || (p.introducedStages !== undefined && (!Array.isArray(p.introducedStages) || !p.introducedStages.every((stage: unknown) => [1,2,3,4].includes(stage as number))))
    || !strings(p.quizAttempts) || (p.quizDefeats !== undefined && !strings(p.quizDefeats))
    || !object(p.submissions) || !numbers(p.xpAwards) || !object(p.access)) return false;
  if (!['stage2', 'stage3'].every(name => {
    const gate = p.access[name];
    return object(gate) && typeof gate.resultPublished === 'boolean' && typeof gate.scheduledOpen === 'boolean'
      && ['advance', 'not-advanced'].includes(gate.decision);
  })) return false;
  if (p.futureBase !== null && (!object(p.futureBase) || typeof p.futureBase.direction !== 'string'
    || typeof p.futureBase.target90d !== 'string' || !strings(p.futureBase.skills) || typeof p.futureBase.support !== 'string')) return false;
  if (p.onboarded && p.futureBase === null) return false;
  return Object.entries(p.submissions).every(([stage, s]) => {
    if (!['1', '2', '3', '4'].includes(stage) || !object(s) || s.stageOrdinal !== Number(stage)
      || !['draft', 'submitted', 'in_review', 'changes_requested', 'reviewed'].includes(s.status)
      || !['id', 'enrollmentId', 'summary', 'reflection'].every(name => typeof s[name] === 'string')
      || !strings(s.evidenceLinks) || (s.status !== 'draft' && !s.evidenceLinks.every(isEvidenceLink)) || !Array.isArray(s.files)) return false;
    if (!s.files.every((file: unknown) => object(file) && ['id', 'name', 'type', 'url'].every(name => typeof file[name] === 'string')
      && typeof file.size === 'number' && file.size >= 0 && file.size <= 20 * 1024 * 1024
      && (file.storageKey === undefined || (typeof file.storageKey === 'string' && file.storageKey.startsWith(`${scope}:`))))) return false;
    if (s.submittedAt !== undefined && typeof s.submittedAt !== 'string') return false;
    const r = s.review;
    return r === undefined || (object(r) && ['mentorId', 'mentorName', 'feedback', 'finalizedAt'].every(name => typeof r[name] === 'string')
      && (r.decision === undefined || ['accepted', 'changes_requested'].includes(r.decision))
      && numbers(r.scores) && typeof r.totalScore === 'number' && Number.isFinite(r.totalScore));
  });
}
export function loadProgress(scope: string): { path: PathCode; progress: ParticipantDemoState; error: string | null } {
  const fallback = { path: 'professional' as PathCode, progress: structuredClone(INITIAL_PARTICIPANT_DEMO), error: null as string | null };
  try {
    const raw = localStorage.getItem(key(scope));
    if (!raw) return fallback;
    const record = JSON.parse(raw);
    if (record.version !== 1 || !['professional', 'social_impact', 'business'].includes(record.path) || !validProgress(record.progress, scope)) throw new Error();
    record.progress.introducedStages ??= [];
    record.progress.quizDefeats ??= [];
    // Stored URLs are never trusted. Attachments are restored from their scoped IndexedDB keys.
    for (const submission of Object.values(record.progress.submissions) as Submission[]) {
      for (const file of submission.files) file.url = '';
    }
    return { path: record.path, progress: record.progress, error: null };
  } catch {
    return { ...fallback, error: 'Progres tersimpan tidak bisa dibuka. Data lama tetap disimpan; progres sesi ini belum tersimpan.' };
  }
}
export function saveProgress(scope: string, path: PathCode, progress: ParticipantDemoState): string | null {
  try {
    if (localStorage.getItem(key(scope)) && loadProgress(scope).error) return 'Data lama perlu dipulihkan sebelum progres baru dapat disimpan.';
    if (!validProgress(progress, scope)) return 'Progres belum dapat disimpan. Periksa data kiriman dan tautan bukti.';
    localStorage.setItem(key(scope), JSON.stringify({ version: 1, path, progress }, (name, value) => name === 'url' ? '' : value));
    return null;
  } catch { return 'Browser tidak dapat menyimpan progres. Tetap di halaman ini dan coba lagi setelah ruang penyimpanan tersedia.'; }
}
export function journeyRoute(path: string, base: '/demo' | '/play', progress: ParticipantDemoState) {
  const suffix = path.split('?')[0].slice(base.length);
  const role = base === '/demo' && suffix === '/mentor' ? 'mentor' : base === '/demo' && suffix === '/admin' ? 'admin' : 'participant';
  const match = /^\/stage\/([1234])$/.exec(suffix);
  const stage = match ? Number(match[1]) as StageOrdinal : progress.currentStage;
  const screen = !progress.onboarded ? 'onboarding' : match ? 'stage' : suffix === '/passport' ? 'passport' : 'expedition';
  let redirect: string | null = null;
  if (role === 'participant') {
    if (!progress.onboarded && suffix !== '/intro') redirect = `${base}/intro`;
    else if (progress.onboarded && ((!match && !['/expedition', '/passport'].includes(suffix)) || (match && !getStageAccess(stage, progress.access).unlocked))) redirect = `${base}/expedition`;
  }
  return { role, stage, screen, redirect } as const;
}
