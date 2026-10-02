// Run with FQ_BROWSER_CDP from agent-browser: bun scripts/check-journey-browser.mjs [demo|invite|recovery|production]
// Uses the browser already opened by agent-browser. No separate browser or automation dependency.
import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
const url = process.env.FQ_BROWSER_CDP;
if (!url?.startsWith('ws://127.0.0.1:')) throw new Error('Supply the local agent-browser CDP URL in FQ_BROWSER_CDP');
const socket = new WebSocket(url);
await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
let nextId = 0;
const pending = new Map();
const errors = [];
socket.onmessage = event => {
  const result = JSON.parse(event.data);
  if (result.method === 'Runtime.exceptionThrown') errors.push(result.params.exceptionDetails.exception?.description || result.params.exceptionDetails.text);
  const request = pending.get(result.id);
  if (!request) return;
  pending.delete(result.id);
  if (result.error) request.reject(new Error(result.error.message)); else request.resolve(result.result);
};
function send(method, params = {}, sessionId) {
  return new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params, sessionId }));
  });
}
try {
  await mkdir('.scratch/game-experience-overhaul/evidence', {recursive:true});
  const { targetInfos } = await send('Target.getTargets');
  const target = targetInfos.find(item => item.type === 'page' && item.url.startsWith('http://localhost:'));
  assert.ok(target);
  const { sessionId } = await send('Target.attachToTarget', { targetId: target.targetId, flatten: true });
  const command = (method, params={}) => send(method,params,sessionId);
  await command('Runtime.enable');
  const evaluate = async expression => {
    const response = await command('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
    if(response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text);
    return response.result.value;
  };
  const wait = predicate => evaluate(`new Promise((resolve,reject)=>{const start=performance.now();const check=()=>{if(${predicate})resolve(true);else if(performance.now()-start>15000)reject(new Error('Expected UI did not appear'));else setTimeout(check,25)};check()})`);
  const ready = selector => wait(`document.querySelector(${JSON.stringify(selector)})`);
  const origin=process.argv[2]==='production'?'http://localhost:4173':'http://localhost:5173';
  const go = async path => {await command('Page.navigate',{url:path.startsWith('http')?path:`${origin}${path}`});await ready('main, .game-viewport, .account-panel');};
  const click = async selector => {
    await ready(selector);
    const point=await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
    await command('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});
    await command('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point});
  };
  const fill = async (selector,value) => {
    await ready(selector);
    await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});Object.getOwnPropertyDescriptor(Object.getPrototypeOf(e),'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));return true})()`);
  };
  const key=async(name,code,number)=>{await command('Input.dispatchKeyEvent',{type:'keyDown',key:name,code,windowsVirtualKeyCode:number});await command('Input.dispatchKeyEvent',{type:'keyUp',key:name,code,windowsVirtualKeyCode:number});};
  const progress=()=>evaluate(`JSON.parse(localStorage.getItem('fq:progress:v1:demo')).progress`);
  const stage=async ordinal=>{
    await go(`/demo/stage/${ordinal}`);
    await wait(`document.querySelector('.phaser-mount')?.__game?.scene?.getScenes(true)[0]?.player`);
    if(await evaluate(`!!document.querySelector('.stage-intro-dialog')`))await click('.stage-intro-dialog .button-gold');
    await wait(`!document.querySelector('dialog[open]')`);
  };
  const board=async()=>{
    if(await evaluate(`!!document.querySelector('.board-dialog')`)){await key('Escape','Escape',27);await wait(`!document.querySelector('dialog[open]')`);}
    await evaluate(`(()=>{const s=document.querySelector('.phaser-mount').__game.scene.getScenes(true)[0];s.player.setPosition(s.stage.board.x,s.stage.board.y);document.querySelector('.game-viewport').focus();return true})()`);
    await ready('.interact-button');
    assert.equal(await evaluate(`!!document.querySelector('dialog[open]')`),false,'Board contact must not open a task');
    await key('e','KeyE',69);await ready('.board-dialog');
  };
  const screenshot=async name=>{const result=await command('Page.captureScreenshot',{format:'png'});await writeFile(`.scratch/game-experience-overhaul/evidence/06-${name}.png`,Buffer.from(result.data,'base64'));};
  const mode=process.argv[2]||'demo';
  if(mode==='production'){
    await go('/');await ready('.entry-actions');await click('.entry-actions a[href="/demo"]');
    await wait(`document.querySelector('.onboarding-submit, .expedition-heading')`);
    if(await evaluate(`!!document.querySelector('.onboarding-submit')`)){
      await fill('.form-field textarea','Production smoke journey');await fill('.form-field:nth-of-type(2) textarea','Complete the three stages');await click('.onboarding-submit');
    }
    await ready('.expedition-heading');
    for(let ordinal=1;ordinal<=3;ordinal++){
      await click(`.stage-card[aria-label^="L${ordinal}"]`);await ready('.phaser-mount canvas');
      if(await evaluate(`!!document.querySelector('.stage-intro-dialog')`))await click('.stage-intro-dialog .button-gold');
      await wait(`document.querySelector('.phaser-mount canvas') && !document.querySelector('.loading-note')`);
      assert.equal(await evaluate(`!!document.querySelector('.phaser-mount').__game`),false,'Production must not expose development diagnostics');
      await click('.stage-actions .button:last-child');await ready('.pause-dialog');await click('.pause-actions .button-quiet');await ready('.expedition-heading');
    }
    await screenshot('production-expedition');console.log('PASS: built landing, introduction, all 3 rendered maps, pause/return; development diagnostics absent.');
  }else if(mode==='demo'){
    await go('/');await ready('.entry-actions a[href="/demo"]');await click('.entry-actions a[href="/demo"]');
    await wait(`document.querySelector('.onboarding-submit, .expedition-heading')`);
    if(await evaluate(`!!document.querySelector('.onboarding-submit')`)){
      await fill('.form-field textarea','QA journey direction');await fill('.form-field:nth-of-type(2) textarea','QA ninety day target');await click('.onboarding-submit');
    }
    await ready('.expedition-heading');
    const correct=[[1],[0,0],[0,1,0]];
    for(let ordinal=1;ordinal<=3;ordinal++){
      await stage(ordinal);await board();
      await key('Tab','Tab',9);
      assert.equal(await evaluate(`!!document.activeElement.closest('dialog')`),true,'Dialog contains keyboard focus');
      await key('Escape','Escape',27);await wait(`!document.querySelector('dialog[open]')`);
      assert.equal(await evaluate(`document.activeElement.classList.contains('game-viewport')`),true,'Escape restores game focus');
      for(let q=0;q<ordinal;q++){
        await board();await click(`.quest-board-row:nth-child(${q+1}) button`);await ready('.quiz-dialog');
        await click(`.quiz-option:nth-child(${correct[ordinal-1][q]+1})`);await click('.quiz-dialog .button-gold');await ready('.quiz-feedback');
        assert.equal(await evaluate(`document.querySelector('.quiz-feedback strong').textContent`),'Jawaban tepat');
        await click('.quiz-dialog .button-gold');await wait(`!document.querySelector('.quiz-dialog')`);
      }
      const before=(await progress()).xpAwards;
      await board();await click('.quest-board-row:first-child button');await ready('.quiz-dialog');
      await click(`.quiz-option:nth-child(${correct[ordinal-1][0]===0?2:1})`);await click('.quiz-dialog .button-gold');await ready('.feedback-retry');
      await click('.quiz-dialog .button-gold');await click(`.quiz-option:nth-child(${correct[ordinal-1][0]+1})`);await click('.quiz-dialog .button-gold');await ready('.feedback-good');
      assert.deepEqual((await progress()).xpAwards,before,'Retry cannot duplicate XP');await click('.quiz-dialog .button-gold');
      await board();await click('.quest-board-row:last-child button');await ready('.mission-dialog');
      if(ordinal===3)assert.match(await evaluate(`document.querySelector('.mission-deliverables').textContent`),/pitch|slide|90/i);
      if((await progress()).submissions[ordinal]?.status!=='reviewed'){
        await fill('.mission-form textarea:first-of-type',`QA L${ordinal}: validated observations and next action.`);
        await fill('.mission-form label:nth-child(2) textarea','QA reflection: assumptions checked against evidence.');
        await fill('.mission-form input[type="url"]','https://example.com/qa-evidence');
        await wait(`JSON.parse(localStorage.getItem('fq:progress:v1:demo')).progress.submissions[${ordinal}]?.reflection.includes('QA reflection')`);
        await command('Page.reload');await stage(ordinal);await board();await click('.quest-board-row:last-child button');await ready('.mission-form');
        assert.match(await evaluate(`document.querySelector('.mission-form textarea').value`),/QA/);
        await click('.mission-dialog .button-gold');await wait(`!document.querySelector('.mission-dialog')`);
        await go('/demo/mentor');await ready('.staff-submissions');await click(`.staff-submission:nth-child(${ordinal}) button`);await ready('.review-feedback');
        await fill('.review-feedback textarea',`QA L${ordinal}: evidence and reflection match the submitted result.`);
        const ranges=await evaluate(`document.querySelectorAll('.review-rubric input').length`);
        for(let i=1;i<=ranges;i++)await fill(`.review-rubric label:nth-of-type(${i}) input`,await evaluate(`document.querySelector('.review-rubric label:nth-of-type(${i}) input').max`));
        await click('dialog .button-gold');await wait(`!document.querySelector('dialog[open]')`);
      }else await key('Escape','Escape',27);
    }
    await go('/demo/passport');await ready('.passport-page-heading');
    const saved=await progress();assert.equal(saved.quizAttempts.length,6);assert.equal(Object.values(saved.xpAwards).reduce((a,b)=>a+b,0),150);assert.ok([1,2,3].every(n=>saved.submissions[n].status==='reviewed'));
    await screenshot('all-stages-complete');
    await command('Page.reload');await ready('.passport-page-heading');assert.deepEqual(await progress(),saved);
    await click('.passport-page-heading button');await ready('.expedition-heading');await click('.stage-card');await ready('.game-viewport');
    await evaluate('history.back();true');await ready('.expedition-heading');
    await go('/demo/stage/3');await wait(`document.querySelector('.phaser-mount')?.__game?.scene?.getScenes(true)[0]?.player`);
    assert.equal(await evaluate(`!!document.querySelector('dialog[open]')`),false,'Stage switch must not leak a task dialog');
    console.log('PASS: visitor demo, all 6 quizzes, retries, all 3 missions/reviews, final pitch, 150 XP, reload/Back/stage switching, focus and dialog resume.');
  }else{
    const fixture=JSON.parse(await readFile('.scratch/auth-fixture.local','utf8'));
    const recovery=mode==='recovery';
    await go(recovery?fixture.recoveryUrl:fixture.inviteUrl);await ready('#account-confirmation');await wait(`!document.querySelector('#account-confirmation').disabled`);
    assert.equal(await evaluate(`!!location.search || !!location.hash`),false,'Callback removes credentials from address');
    const password=recovery?fixture.nextPassword:fixture.password;
    await fill('#account-password',password);await fill('#account-confirmation',password);await click('.account-form button[type="submit"]');
    if(recovery){await wait(`location.pathname==='/login' && location.search.includes('updated')`);await ready('[role="status"]');}
    else{
      await ready('.onboarding-submit');assert.equal(await evaluate(`!!document.querySelector('[aria-label="Pilih workspace"]')`),false);
      await fill('.form-field textarea','Individual authenticated QA direction');await fill('.form-field:nth-of-type(2) textarea','Individual 90 day goal');await click('.onboarding-submit');await ready('.expedition-heading');
      await command('Page.reload');await ready('.expedition-heading');
      const isolated=await evaluate(`JSON.parse(localStorage.getItem('fq:progress:v1:participant:${fixture.userId}')).progress`);assert.equal(isolated.quizAttempts.length,0);assert.equal((await progress()).quizAttempts.length,6);
      await click('.experience-session button');await wait(`location.pathname==='/login'`);await go('/play/stage/3');await ready('#account-email');
    }
    await fill('#account-email',fixture.email);await fill('#account-password','incorrect-password');await click('.account-form button[type="submit"]');await ready('.account-error');
    await fill('#account-password',password);await click('.account-form button[type="submit"]');await ready('.expedition-heading');
    await command('Page.reload');await ready('.expedition-heading');await click('.experience-session button');await wait(`location.pathname==='/login'`);
    await go(recovery?fixture.recoveryUrl:fixture.inviteUrl);await ready('.account-error');assert.equal(await evaluate(`document.querySelector('#account-password').disabled`),true,'Consumed links cannot reset passwords');
    console.log(`PASS: ${recovery?'password recovery, success notice':'invitation, isolated progress'}; invalid/valid login, restored session, logout/protected route, consumed link rejected.`);
  }
  assert.deepEqual(errors,[],'No page exceptions in exercised flows');
  await writeFile(`.scratch/game-experience-overhaul/evidence/06-${mode}-checks.json`,JSON.stringify({mode,result:'passed',pageExceptions:errors},null,2));
}finally{socket.close();}
