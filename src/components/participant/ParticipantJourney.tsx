import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpenText, Check, Compass, LockKey, MapTrifold, Medal, Sparkle, UserCircle, XCircle } from '@phosphor-icons/react';
import type { Dispatch, SetStateAction } from 'react';
import type { FutureBase, PathCode, Submission, UserRole } from '../../types';
import { OFFICIAL_PATHS, STAGE_BOSS_MISSIONS, STAGE_QUIZZES, TRACK_STAGE_FOCUS } from '../../data/mockQuests';
import { DEFAULT_DEMO_ACCESS, getStageAccess, PARTICIPANT_STAGES, trackLabel, type DemoAccessState, type ParticipantStage, type StageOrdinal, type StageGate } from '../../data/participantStages';
import { BossMissionModal } from '../modals/BossMissionModal';
import { InteractiveQuizModal } from '../modals/InteractiveQuizModal';
import { JourneyDialog } from '../ui/JourneyDialog';
import { GameWorld } from '../../ui/game-world';

import type { ParticipantDemoState } from '../../lib/progress';

export function ParticipantJourney({
  currentPath,
  currentRole,
  demo,
  setDemo,
  onCompleteOnboarding,
  onSelectStage,
  onRoleChange,
  allowStaffDemo = true,
  onNavigate,
  storageScope,
  storageError,
}: {
  currentPath: PathCode;
  currentRole: UserRole;
  demo: ParticipantDemoState;
  setDemo: Dispatch<SetStateAction<ParticipantDemoState>>;
  onCompleteOnboarding: (path: PathCode, futureBase: FutureBase) => void;
  onSelectStage: (stage: StageOrdinal) => void;
  onRoleChange: (role: UserRole) => void;
  allowStaffDemo?: boolean;
  onNavigate: (screen: ParticipantDemoState['screen']) => void;
  storageScope: string;
  storageError: string | null;
}) {
  const [selectedPreview, setSelectedPreview] = useState<StageOrdinal>(1);
  const [pauseOpen, setPauseOpen] = useState(false);
  const openPause = useCallback(() => setPauseOpen(true), []);
  const [boardOpen, setBoardOpen] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<(typeof STAGE_QUIZZES)[number] | null>(null);
  const [activeMission, setActiveMission] = useState<(typeof STAGE_BOSS_MISSIONS)[number] | null>(null);
  const [returnToBoard, setReturnToBoard] = useState(false);
  const totalXp = useMemo(() => Object.values(demo.xpAwards).reduce((sum, amount) => sum + amount, 0), [demo.xpAwards]);
  const activeStage = PARTICIPANT_STAGES.find(stage => stage.ordinal === demo.currentStage) || PARTICIPANT_STAGES[0];
  const activeGate = getStageAccess(activeStage.ordinal, demo.access);
  const introOpen = demo.screen === 'stage' && !demo.introducedStages.includes(activeStage.ordinal);
  const beginStage = () => setDemo(current => ({ ...current, introducedStages: current.introducedStages.includes(activeStage.ordinal) ? current.introducedStages : [...current.introducedStages, activeStage.ordinal] }));
  const nextQuiz = STAGE_QUIZZES.find(quiz => quiz.stageOrdinal === activeStage.ordinal && !demo.quizAttempts.includes(quiz.id));
  const submission = demo.submissions[activeStage.ordinal];
  const objective = nextQuiz ? `Kerjakan kuis: ${nextQuiz.title}`
    : (submission?.status === 'changes_requested' || (submission?.status === 'draft' && submission.review?.decision === 'changes_requested')) ? 'Revisi misi mengikuti masukan mentor.'
    : ['submitted', 'in_review'].includes(submission?.status || '') ? 'Kiriman tersimpan. Tunggu hasil review mentor.'
    : submission?.status === 'reviewed' ? 'Stage selesai. Pilih stage berikutnya di peta ekspedisi.'
    : `Selesaikan misi: ${STAGE_BOSS_MISSIONS[activeStage.ordinal].title}`;
  const openBoard = useCallback(() => setBoardOpen(true), []);


  const enterStage = (stage: ParticipantStage) => {
    const access = getStageAccess(stage.ordinal, demo.access);
    setSelectedPreview(stage.ordinal);
    if (!access.unlocked) return;
    onSelectStage(stage.ordinal);
    setDemo(current => ({ ...current, currentStage: stage.ordinal, screen: 'stage' }));
  };

  const markQuizAttempt = (quizId: string) => setDemo(current => {
    if (current.quizAttempts.includes(quizId)) return current;
    return {
      ...current,
      quizAttempts: [...current.quizAttempts, quizId],
      xpAwards: { ...current.xpAwards, [`quiz:${quizId}`]: 10 },
    };
  });

  const saveMission = useCallback((submission: Submission) => setDemo(current => ({
    ...current,
    submissions: { ...current.submissions, [submission.stageOrdinal]: submission },
  })), [setDemo]);

  const updateGate = (ordinal: 2 | 3, patch: Partial<StageGate>) => setDemo(current => ({
    ...current,
    access: {
      ...current.access,
      [ordinal === 2 ? 'stage2' : 'stage3']: { ...current.access[ordinal === 2 ? 'stage2' : 'stage3'], ...patch },
    },
  }));

  const toggleView = (screen: ParticipantDemoState['screen']) => onNavigate(screen);

  return (
    <div className={`participant-shell ${demo.screen === "stage" ? "is-playing" : ""}`}>
      <header className="participant-topbar">
        <img className="brand-mark" src="/assets/ecc-logo.png" alt="" />
        <div className="brand-copy"><span>ECC · SIAP IMPACT 2026</span><strong>FUTURE QUEST</strong></div>
        <div className="topbar-spacer" />
        {demo.onboarded && <span className="track-chip"><span />{trackLabel(currentPath)}</span>}
        {allowStaffDemo && <label className="workspace-picker"><UserCircle size={17} /><span>Demo peran</span>
          <select aria-label="Pilih workspace" value={currentRole} onChange={event => onRoleChange(event.target.value as UserRole)}>
            <option value="participant">Peserta</option><option value="mentor">Mentor</option><option value="admin">Admin</option>
          </select>
        </label>}
      </header>

      <main className={`participant-main ${demo.screen === 'stage' ? 'has-game' : ''}`}>
        {!demo.onboarded ? (
          <Onboarding currentPath={currentPath} onContinue={onCompleteOnboarding} />
        ) : demo.screen === 'stage' ? (
          <section className="stage-screen">
            <header className="stage-toolbar">
              <button className="button button-quiet stage-return" aria-label="Kembali ke peta ekspedisi" onClick={() => toggleView('expedition')}><ArrowLeft size={18} /><span>Peta ekspedisi</span></button>
              <div className="stage-toolbar-title"><strong>{activeStage.phase} {activeStage.name}</strong><small>{trackLabel(currentPath)}</small></div>
              <div className="stage-actions"><button className="button button-quiet" onClick={() => toggleView('passport')} aria-label="Buka Future Passport"><BookOpenText size={18} /><span>Passport</span></button><button className="button button-quiet" onClick={openPause}>Jeda <kbd>Esc</kbd></button></div>
            </header>
            <GameWorld key={activeStage.ordinal} stage={activeStage} readOnly={activeGate.readOnly} objective={objective} paused={introOpen || pauseOpen || boardOpen || Boolean(activeQuiz) || Boolean(activeMission)} onOpenBoard={openBoard} onPause={openPause} />
            {introOpen && <JourneyDialog titleId="stage-intro-title" className="stage-intro-dialog" onClose={beginStage}>
              <p className="dialog-stage-label">{activeStage.phase} {activeStage.name}</p><h2 id="stage-intro-title">{activeStage.description}</h2><p>{TRACK_STAGE_FOCUS[currentPath][activeStage.ordinal]}</p>
              <div className="stage-first-step"><Compass size={24} /><div><strong>Temukan {activeStage.boardName}</strong><p>Papan berada {activeStage.boardHint}. Dekati papan lalu tekan E atau sentuh tombol interaksi untuk membuka tugas.</p></div></div>
              <ControlsGuide />
              <footer className="dialog-actions"><span className="demo-note">Progres belajar disimpan sebagai simulasi di browser ini.</span><button className="button button-gold" onClick={beginStage}>Mulai menjelajah</button></footer>
            </JourneyDialog>}
            {pauseOpen && <JourneyDialog titleId="pause-title" className="pause-dialog" onClose={() => setPauseOpen(false)}>
              <p className="dialog-stage-label">{activeStage.phase} {activeStage.name}</p><h2 id="pause-title">Permainan dijeda</h2><p>{objective}</p><ControlsGuide />
              <p className="pause-instruction">Semua tugas dibuka dari {activeStage.boardName} {activeStage.boardHint}. Kamu bisa kembali ke peta kapan pun untuk berpindah stage.</p>
              <footer className="pause-actions"><button className="button button-gold" onClick={() => setPauseOpen(false)}>Lanjutkan permainan</button><button className="button button-quiet" onClick={() => { setPauseOpen(false); toggleView('expedition'); }}>Kembali ke peta ekspedisi</button></footer>
            </JourneyDialog>}
            <QuestBoard
              isOpen={boardOpen}
              stage={activeStage}
              currentPath={currentPath}
              readOnly={activeGate.readOnly}
              quizAttempts={demo.quizAttempts}
              submission={demo.submissions[activeStage.ordinal]}
              onClose={() => setBoardOpen(false)}
              onSelectQuiz={quiz => { setBoardOpen(false); setReturnToBoard(true); setActiveQuiz(quiz); }}
              onSelectMission={mission => { setBoardOpen(false); setReturnToBoard(true); setActiveMission(mission); }}
            />
            <InteractiveQuizModal
              key={activeQuiz?.id || 'no-quiz'}
              quiz={activeQuiz}
              currentPath={currentPath}
              trackFocus={TRACK_STAGE_FOCUS[currentPath][activeStage.ordinal]}
              alreadyAttempted={Boolean(activeQuiz && demo.quizAttempts.includes(activeQuiz.id))}
              readOnly={activeGate.readOnly}
              onClose={() => { setActiveQuiz(null); setBoardOpen(returnToBoard); setReturnToBoard(false); }}
              onSubmit={markQuizAttempt}
            />
            <BossMissionModal
              key={activeMission?.id || 'no-mission'}
              mission={activeMission}
              storageScope={storageScope}
              saveError={storageError}
              currentSubmission={demo.submissions[activeStage.ordinal]}
              currentPath={currentPath}
              trackFocus={TRACK_STAGE_FOCUS[currentPath][activeStage.ordinal]}
              readOnly={activeGate.readOnly}
              onClose={() => { setActiveMission(null); setBoardOpen(returnToBoard); setReturnToBoard(false); }}
              onSubmitMission={saveMission}
            />
          </section>
        ) : demo.screen === 'passport' ? (
          <PassportPage
            currentPath={currentPath}
            demo={demo}
            totalXp={totalXp}
            onBack={() => toggleView('expedition')}
            onUpdateGate={updateGate}
          />
        ) : (
          <ExpeditionMap
            currentPath={currentPath}
            demo={demo}
            totalXp={totalXp}
            selectedPreview={selectedPreview}
            onPreview={setSelectedPreview}
            onEnter={enterStage}
            onPassport={() => toggleView('passport')}
            onUpdateGate={updateGate}
          />
        )}
      </main>
    </div>
  );
}

function Onboarding({ currentPath, onContinue }: { currentPath: PathCode; onContinue: (path: PathCode, futureBase: FutureBase) => void }) {
  const [path, setPath] = useState<PathCode>(currentPath);
  const [direction, setDirection] = useState('');
  const [target90d, setTarget90d] = useState('');
  const selected = OFFICIAL_PATHS[path];

  return (
    <section className="onboarding-layout">
      <div className="onboarding-art">
        <div className="onboarding-art-shade" />
        <div className="onboarding-copy"><span className="eyebrow">Future Base · sebelum bootcamp</span>
          <h1>Siapkan perjalananmu.</h1>
          <p>Pilih fokus belajar dan tuliskan tujuanmu. Setelah ini, kamu bisa menjelajahi ketiga stage.</p>
          <div className="onboarding-sequence"><span className="sequence-active">01 Future Base</span><i /><span>02 L1 Discover</span><i /><span>03 L2 Build</span><i /><span>04 L3 Pitch</span></div>
        </div>
        
      </div>
      <form className="onboarding-form" onSubmit={event => { event.preventDefault(); if (!direction.trim() || !target90d.trim()) return; onContinue(path, { direction: direction.trim(), target90d: target90d.trim(), skills: [], support: '' }); }}>
        
        <h2>Pilih jalur perjalanan</h2>
        <p className="muted-copy">Tentukan fokusmu, lalu catat satu komitmen untuk 90 hari ke depan.</p>
        <div className="track-options" role="radiogroup" aria-label="Pilih track program">
          {Object.values(OFFICIAL_PATHS).map(option => <button type="button" key={option.code} className={`track-option ${path === option.code ? 'selected' : ''}`} onClick={() => setPath(option.code)} role="radio" aria-checked={path === option.code}>
            <span className="track-option-icon" style={{ color: option.themeColor }}>{path === option.code ? <Check size={18} /> : <Compass size={18} />}</span>
            <span><strong>{option.title}</strong><small>{option.subtitle}</small></span>
          </button>)}
        </div>
        <label className="form-field">Arah yang ingin kamu bangun<textarea rows={2} required value={direction} onChange={event => setDirection(event.target.value)} placeholder={`Fokus ${selected.title.toLowerCase()} yang ingin kamu kembangkan`} /></label>
        <label className="form-field">Target 90 hari<textarea rows={2} required value={target90d} onChange={event => setTarget90d(event.target.value)} placeholder="Tuliskan hasil nyata yang ingin kamu capai" /></label>
        <div className="onboarding-note"><Sparkle size={16} /><span>Future Base adalah milestone onboarding, bukan bootcamp stage dan tidak membuka akses seleksi.</span></div>
        <button className="button button-gold onboarding-submit" type="submit" disabled={!direction.trim() || !target90d.trim()}>Simpan & buka peta <ArrowRight size={17} /></button>
      </form>
    </section>
  );
}

function ExpeditionMap({ currentPath, demo, totalXp, selectedPreview, onPreview, onEnter, onPassport, onUpdateGate }: {
  currentPath: PathCode;
  demo: ParticipantDemoState;
  totalXp: number;
  selectedPreview: StageOrdinal;
  onPreview: (stage: StageOrdinal) => void;
  onEnter: (stage: ParticipantStage) => void;
  onPassport: () => void;
  onUpdateGate: (ordinal: 2 | 3, patch: Partial<StageGate>) => void;
}) {
  const stage = PARTICIPANT_STAGES.find(item => item.ordinal === selectedPreview) || PARTICIPANT_STAGES[0];
  const access = getStageAccess(stage.ordinal, demo.access);
  const next = PARTICIPANT_STAGES.find(item => getStageAccess(item.ordinal, demo.access).unlocked && !isStageComplete(item, demo)) || PARTICIPANT_STAGES[0];
  return (
    <div className="expedition-layout">
      <section className="expedition-content">
        <div className="page-kicker"><MapTrifold size={16} /> SIAP IMPACT 2026 <span>·</span> DEMO DATA</div>
        <div className="expedition-heading"><div><h1>Peta Ekspedisi</h1><p>Mulai dari Discover atau lanjutkan stage yang ingin kamu kerjakan. Progresmu tersimpan di browser ini.</p></div><button className="button button-quiet" onClick={onPassport}><BookOpenText size={17} /> Future Passport</button></div>
        <div className="next-step"><div><strong>{demo.quizAttempts.length || Object.keys(demo.submissions).length ? "Lanjutkan perjalanan" : "Siap mulai?"}</strong><p>{next.phase} {next.name}: {next.description}</p></div><button className="button button-gold" onClick={() => onEnter(next)}>Masuk {next.phase} <ArrowRight size={17} /></button></div>
        <div className="route-panel">
          <div className="route-panel-top"><span>BOOTCAMP · 3 STAGE</span><span className="demo-pill">STATUS SIMULASI</span></div>
          <div className="stage-route" aria-label="Tiga stage bootcamp">
            {PARTICIPANT_STAGES.map((item, index) => {
              const itemAccess = getStageAccess(item.ordinal, demo.access);
              const complete = isStageComplete(item, demo);
              const active = selectedPreview === item.ordinal;
              const status = itemAccess.readOnly ? 'Hanya lihat' : complete ? 'Selesai' : itemAccess.unlocked ? 'Tersedia' : 'Terkunci';
              return <div className="route-stop" key={item.ordinal}>
                {index > 0 && <span className={`route-connector ${itemAccess.unlocked ? 'connector-open' : ''}`} aria-hidden="true" />}
                <button className={`stage-card ${active ? 'stage-card-selected' : ''} ${itemAccess.unlocked ? '' : 'stage-card-locked'}`} style={{ '--stage-accent': item.accent } as React.CSSProperties} onClick={() => { onPreview(item.ordinal); onEnter(item); }} aria-label={`${item.phase} ${item.name}, ${status}`}>
                  <span className="stage-card-image" style={{ backgroundImage: `linear-gradient(180deg,rgba(3,10,18,.02),rgba(3,10,18,.92)),url('${item.mapPath}')` }} />
                  <span className="stage-card-top"><span>{item.phase}</span>{itemAccess.unlocked ? <span className="stage-lock-open">OPEN</span> : <LockKey size={16} />}</span>
                  <span className="stage-card-body"><strong>{item.name}</strong><small>{item.description}</small><span className={`stage-status ${itemAccess.unlocked ? 'status-open' : ''}`}>{complete ? <Check size={13} /> : itemAccess.unlocked ? <Compass size={13} /> : <LockKey size={13} />}{status}</span></span>
                  <span className="stage-card-action">{itemAccess.unlocked ? 'Masuk stage' : 'Lihat status'} <ArrowRight size={14} /></span>
                </button>
              </div>;
            })}
          </div>
          <div className="route-summary"><span className="route-summary-dot" />{stage.phase} · {stage.name}<span>{access.unlocked ? (access.readOnly ? 'Akses hanya baca' : 'Siap dijelajahi') : lockMessage(access.reason)}</span></div>
        </div>

        <AccessControls access={demo.access} onUpdateGate={onUpdateGate} />
      </section>
      <aside className="passport-rail">
        <PassportSummary currentPath={currentPath} demo={demo} totalXp={totalXp} onOpen={onPassport} />
        <div className="rail-note"><span className="eyebrow">CATATAN DEMO</span><p>Hasil, jadwal, status review, dan XP di layar ini adalah simulasi lokal.</p></div>
      </aside>
    </div>
  );
}

function PassportSummary({ currentPath, demo, totalXp, onOpen }: { currentPath: PathCode; demo: ParticipantDemoState; totalXp: number; onOpen: () => void }) {
  const milestones = PARTICIPANT_STAGES.map(stage => isStageComplete(stage, demo));
  return <section className="passport-card">
    <div className="passport-title"><span>FUTURE PASSPORT</span><span className="demo-pill">DEMO</span></div>
    <div className="passport-track"><span>PROGRAM TRACK</span><strong>{trackLabel(currentPath)}</strong></div>
    <div className="passport-xp"><span>XP TOTAL <small>NONSPENDABLE</small></span><strong>{totalXp.toLocaleString('id-ID')} <i>XP</i></strong><div className="xp-track"><span style={{ width: `${Math.min(totalXp, 100)}%` }} /></div><small>Progres ilustrasi saja · tidak memengaruhi akses</small></div>
    <BaseMilestones milestones={milestones} />
    <button className="passport-open" onClick={onOpen}>Buka passport lengkap <ArrowRight size={15} /></button>
  </section>;
}

function PassportPage({ currentPath, demo, totalXp, onBack, onUpdateGate }: {
  currentPath: PathCode;
  demo: ParticipantDemoState;
  totalXp: number;
  onBack: () => void;
  onUpdateGate: (ordinal: 2 | 3, patch: Partial<StageGate>) => void;
}) {
  const milestones = PARTICIPANT_STAGES.map(stage => isStageComplete(stage, demo));
  return <div className="passport-page">
    <div className="passport-page-heading"><div><span className="page-kicker"><BookOpenText size={16} /> INDIVIDUAL PROGRESS · DEMO</span><h1>Future Passport</h1><p>Track, XP nonspendable, dan milestone stage milikmu.</p></div><button className="button button-quiet" onClick={onBack}><ArrowLeft size={17} /> Kembali ke Peta</button></div>
    {demo.futureBase && <section className="future-base-summary"><h2>Tujuan perjalananmu</h2><p>{demo.futureBase.direction}</p><strong>Target 90 hari</strong><p>{demo.futureBase.target90d}</p></section>}
    <div className="passport-page-grid">
      <section className="passport-large-card"><span className="eyebrow">PROGRAM TRACK</span><strong className="passport-track-name">{trackLabel(currentPath)}</strong><span className="passport-track-description">{OFFICIAL_PATHS[currentPath].subtitle}</span><div className="passport-total"><span>XP DEMO · NONSPENDABLE</span><strong>{totalXp.toLocaleString('id-ID')} <i>XP</i></strong><div className="xp-track"><span style={{ width: `${Math.min(totalXp, 100)}%` }} /></div><small>Bar ilustrasi dari 0–100 XP. XP tidak mengubah hasil seleksi atau akses stage.</small></div></section>
      <section className="passport-large-card base-card"><span className="eyebrow">PERSONAL BASE · MILESTONE</span><h2>Bangun dari hasil kerjamu</h2><p>Satu milestone tampil untuk setiap stage yang selesai.</p><BaseMilestones milestones={milestones} large /></section>
    </div>
    <div className="passport-stage-list">{PARTICIPANT_STAGES.map(stage => {
      const done = isStageComplete(stage, demo);
      const status = getStageAccess(stage.ordinal, demo.access);
      return <div className="passport-stage-row" key={stage.ordinal}><span className={`milestone-icon ${done ? 'milestone-done' : ''}`}>{done ? <Check size={17} /> : <Medal size={17} />}</span><div><strong>{stage.phase} · {stage.name}</strong><small>{done ? 'Stage selesai' : status.readOnly ? 'Akses sebelumnya · hanya baca' : status.unlocked ? 'Tersedia pada simulasi ini' : lockMessage(status.reason)}</small></div><span className="demo-pill">DEMO</span></div>;
    })}</div>
    <AccessControls access={demo.access} onUpdateGate={onUpdateGate} />
  </div>;
}

function BaseMilestones({ milestones, large = false }: { milestones: boolean[]; large?: boolean }) {
  return <div className={`base-milestones ${large ? 'base-milestones-large' : ''}`} aria-label={`${milestones.filter(Boolean).length} dari 3 milestone selesai`}>
    {PARTICIPANT_STAGES.map((stage, index) => <div className={`base-milestone ${milestones[index] ? 'milestone-complete' : ''}`} key={stage.ordinal}>
      <div className={`base-layer layer-${index + 1}`}>{milestones[index] ? <Check size={15} weight="bold" /> : <span>{String(index + 1).padStart(2, '0')}</span>}</div><strong>{stage.phase}</strong><small>{stage.name}</small>
    </div>)}
  </div>;
}

function AccessControls({ access, onUpdateGate }: { access: DemoAccessState; onUpdateGate: (ordinal: 2 | 3, patch: Partial<StageGate>) => void }) {
  return <details className="access-controls">
    <summary><span><LockKey size={16} /> Simulasi akses stage</span><span className="demo-pill">DEMO DATA</span></summary>
    <p>Ubah nilai simulasi untuk melihat gate hasil dan jadwal. Ini tidak terhubung ke keputusan ECC.</p>
    {([2, 3] as const).map(ordinal => {
      const gate = access[ordinal === 2 ? 'stage2' : 'stage3'];
      return <fieldset className="gate-row" key={ordinal}><legend>L{ordinal} · {ordinal === 2 ? 'Hasil L1' : 'Hasil L2'}</legend>
        <label className="gate-check"><input type="checkbox" checked={gate.resultPublished} onChange={event => onUpdateGate(ordinal, { resultPublished: event.target.checked })} /><span>Hasil dipublikasikan</span></label>
        <label className="gate-select"><span>Keputusan</span><select aria-label={`Keputusan akses L${ordinal}`} value={gate.decision} onChange={event => onUpdateGate(ordinal, { decision: event.target.value as StageGate['decision'] })}><option value="advance">Maju</option><option value="not-advanced">Tidak maju</option></select></label>
        <label className="gate-check"><input type="checkbox" checked={gate.scheduledOpen} onChange={event => onUpdateGate(ordinal, { scheduledOpen: event.target.checked })} /><span>Jadwal pembukaan tiba</span></label>
      </fieldset>;
    })}
  </details>;
}

function QuestBoard({ isOpen, stage, currentPath, readOnly, quizAttempts, submission, onClose, onSelectQuiz, onSelectMission }: {
  isOpen: boolean;
  stage: ParticipantStage;
  currentPath: PathCode;
  readOnly: boolean;
  quizAttempts: string[];
  submission?: Submission;
  onClose: () => void;
  onSelectQuiz: (quiz: (typeof STAGE_QUIZZES)[number]) => void;
  onSelectMission: (mission: (typeof STAGE_BOSS_MISSIONS)[number]) => void;
}) {
  if (!isOpen) return null;
  const quizzes = STAGE_QUIZZES.filter(quiz => quiz.stageOrdinal === stage.ordinal);
  const mission = STAGE_BOSS_MISSIONS[stage.ordinal];
  return <JourneyDialog titleId="board-title" className="board-dialog" onClose={onClose}>
      <header className="dialog-heading"><div><span className="eyebrow">{stage.phase} · PAPAN QUEST <i>DEMO</i></span><h2 id="board-title">{stage.boardName}</h2></div><button className="icon-button" onClick={onClose} aria-label="Tutup papan quest"><XCircle size={22} /></button></header>
      <p className="dialog-context"><strong>{trackLabel(currentPath)}:</strong> {TRACK_STAGE_FOCUS[currentPath][stage.ordinal]}</p>
      {readOnly && <div className="read-only-note">Stage sebelumnya tetap bisa dilihat setelah hasil tidak maju. Pengiriman baru ditutup.</div>}
      <div className="quest-board-list">
        {quizzes.map(quiz => <article className="quest-board-row" key={quiz.id}><span className="quest-type">QUIZ</span><div><strong>{quiz.title}</strong><small>{readOnly ? 'Mode lihat · tidak ada XP baru' : quizAttempts.includes(quiz.id) ? 'Percobaan tercatat · +10 XP hanya sekali' : 'Kirim satu jawaban · +10 XP percobaan pertama'}</small></div><button className="button button-outline" onClick={() => onSelectQuiz(quiz)}>{readOnly ? 'Lihat' : quizAttempts.includes(quiz.id) ? 'Ulangi' : 'Mulai'} <ArrowRight size={15} /></button></article>)}
        {mission && <article className="quest-board-row"><span className="quest-type mission-type">MISI</span><div><strong>{mission.title}</strong><small>{readOnly ? `${missionState(submission)} · mode lihat` : `${missionState(submission)} · +20 XP setelah review diterima`}</small></div><button className="button button-outline" onClick={() => onSelectMission(mission)}>{readOnly ? 'Lihat' : submission?.status === 'changes_requested' ? 'Revisi' : submission?.status === 'draft' ? 'Lanjutkan draft' : submission?.status === 'reviewed' ? 'Lihat hasil' : submission ? 'Lihat kiriman' : 'Buka misi'} <ArrowRight size={15} /></button></article>}
      </div>
      <footer className="dialog-actions"><span className="demo-note">Percobaan, review, dan XP adalah simulasi lokal</span><button className="button button-quiet" onClick={onClose}>Kembali ke scene</button></footer>
  </JourneyDialog>;
}

function missionState(submission?: Submission) {
  if (!submission) return 'Siap dikerjakan';
  if (submission.status === 'reviewed') return 'Diterima · review demo';
  if (submission.status === 'changes_requested') return 'Perlu revisi · review demo';
  if (submission.status === 'draft') return 'Draft tersimpan';
  return 'Menunggu Mentor · demo';
}

function isStageComplete(stage: ParticipantStage, demo: ParticipantDemoState) {
  const quizzesDone = STAGE_QUIZZES.filter(quiz => quiz.stageOrdinal === stage.ordinal).every(quiz => demo.quizAttempts.includes(quiz.id));
  return quizzesDone && demo.submissions[stage.ordinal]?.status === 'reviewed';
}

function lockMessage(reason: ReturnType<typeof getStageAccess>['reason']) {
  if (reason === 'not-advanced') return 'Hasil demo: tidak maju · sebelumnya hanya baca';
  if (reason === 'schedule-pending') return 'Menunggu jadwal pembukaan demo';
  if (reason === 'previous-stage-locked') return 'Hasil stage sebelumnya belum memenuhi gate demo';
  return 'Menunggu hasil seleksi demo dipublikasikan';
}

function ControlsGuide() {
  return <div className="controls-guide"><div><kbd>W A S D</kbd><span>atau tombol panah untuk bergerak</span></div><div><kbd>E</kbd><span>interaksi di dekat papan misi</span></div><div><kbd>Esc</kbd><span>jeda dan lanjutkan permainan</span></div><p>Di ponsel: gunakan joystick di kiri dan tombol interaksi di kanan. Mainkan dalam posisi lanskap.</p></div>;
}
