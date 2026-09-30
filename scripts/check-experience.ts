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
import { movementInput, movePlayer, touchesTerrain } from '../src/game/terrain';
const zero = { x: 0, y: 0 };
assert.deepEqual(movementInput({ x: 1, y: 1 }, { x: 1, y: 1 }, true), zero);
assert.ok(Math.abs(Math.hypot(...Object.values(movementInput({ x: 1, y: 1 }, zero, false)))-1) < 1e-12);
const point = { x: 500, y: 500 };
const axial = movePlayer(point, movementInput({ x: 1, y: 0 }, zero, false), 50, 1280, () => false);
const diagonal = movePlayer(point, movementInput({ x: 1, y: 1 }, zero, false), 50, 1280, () => false);
assert.ok(Math.abs(Math.hypot(diagonal.x-point.x, diagonal.y-point.y)-(axial.x-point.x)) < 1e-9);
assert.deepEqual(movePlayer(point, zero, 50, 1280, () => false), point);
assert.deepEqual(movePlayer(point, { x:1, y:1 }, 50, 1280, p => p.x > 500), {x:500,y:509.5});
assert.equal(touchesTerrain(1, 2, { x: 210, y: 300 }, null, 640, 640), true); // Mixel wall.
assert.equal(touchesTerrain(1, 2, { x: 896, y: 880 }, null, 640, 640), false); // Spawn/stair path.
assert.equal(touchesTerrain(2, 2, { x: 400, y: 1500 }, null, 1024, 1024), true); // House.
assert.equal(touchesTerrain(2, 2, { x: 576, y: 504 }, null, 1024, 1024), true); // Visible tree trunk.
assert.equal(touchesTerrain(2, 2, { x: 928, y: 1080 }, null, 1024, 1024), false); // Ladder crossing.
assert.equal(touchesTerrain(3, 2, { x: 1800, y: 500 }, null, 1024, 1024), true); // Building.
const water = new Uint8ClampedArray(1024*1024*4);
for (let y=500;y<560;y++) for (let x=360;x<530;x++) water.set([80,140,230,255],(y*1024+x)*4);
assert.equal(touchesTerrain(3, 2, { x: 850, y: 1020 }, water, 1024, 1024), true);
assert.equal(touchesTerrain(3, 2, { x: 850, y: 1070 }, water, 1024, 1024), false); // Rendered footbridge.
console.log('Movement, paused input, and collision boundaries passed');

