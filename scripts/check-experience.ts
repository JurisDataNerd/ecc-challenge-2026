import assert from 'node:assert/strict';
import { INITIAL_PARTICIPANT_DEMO, journeyRoute, loadProgress, saveProgress } from '../src/lib/progress';
const values = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', { value: { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) }, configurable: true });
const progress = structuredClone(INITIAL_PARTICIPANT_DEMO);
assert.equal(journeyRoute('/demo/stage/3', '/demo', progress).redirect, '/demo/intro');
progress.onboarded = true;
progress.futureBase = { direction: 'Learn', target90d: 'Build', skills: [], support: '' };
progress.quizAttempts = ['q1'];
progress.xpAwards = { 'quiz:q1': 10 };
assert.equal(saveProgress('demo', 'business', progress), null);
assert.equal(loadProgress('demo').path, 'business');
assert.equal(loadProgress('demo').progress.xpAwards['quiz:q1'], 10);
assert.equal(loadProgress('participant:someone').progress.onboarded, false);
for (const stage of [1, 2, 3]) {
  const route = journeyRoute(`/demo/stage/${stage}`, '/demo', progress);
  assert.equal(route.screen, 'stage'); assert.equal(route.stage, stage); assert.equal(route.redirect, null);
}
assert.equal(journeyRoute('/demo/intro', '/demo', progress).redirect, '/demo/expedition');
assert.equal(journeyRoute('/play/admin', '/play', progress).role, 'participant');
assert.equal(journeyRoute('/play/admin', '/play', progress).redirect, '/play/expedition');
assert.equal(journeyRoute('/demo/mentor', '/demo', progress).role, 'mentor');
progress.access.stage2.resultPublished = false;
assert.equal(journeyRoute('/demo/stage/2', '/demo', progress).redirect, '/demo/expedition');
values.set('fq:progress:v1:broken', '{bad json');
assert.ok(loadProgress('broken').error);
assert.ok(saveProgress('broken', 'professional', progress));
assert.equal(values.get('fq:progress:v1:broken'), '{bad json');
for (const invalid of [{ ...progress, xpAwards: { x: '10' } }, { ...progress, access: { stage2: {}, stage3: {} } }, { ...progress, submissions: { 1: { files: null } } }]) {
  values.set('fq:progress:v1:invalid', JSON.stringify({ version: 1, path: 'professional', progress: invalid }));
  assert.ok(loadProgress('invalid').error);
}
console.log('Experience storage and route boundaries passed');
