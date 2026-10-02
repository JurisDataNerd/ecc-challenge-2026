import { ArrowRight, ClipboardText, Scales, UserCircle } from '@phosphor-icons/react';
import type { PathCode, Submission, UserRole } from '../../types';
import { PARTICIPANT_STAGES, trackLabel, type StageOrdinal } from '../../data/participantStages';
import { STAGE_BOSS_MISSIONS } from '../../data/mockQuests';

export function StaffWorkspace({ role, currentPath, submissions, onRoleChange, onReview, onOpenAdmin }: {
  role: Extract<UserRole, 'mentor' | 'admin'>;
  currentPath: PathCode;
  submissions: Record<number, Submission>;
  onRoleChange: (role: UserRole) => void;
  onReview: (stage: StageOrdinal) => void;
  onOpenAdmin: () => void;
}) {
  return <div className="participant-shell staff-shell">
    <header className="participant-topbar">
      <img className="brand-mark" src="/assets/ecc-logo.png" alt="" />
      <div className="brand-copy"><span>ECC · SIAP IMPACT 2026</span><strong>FUTURE QUEST</strong></div>
      <div className="topbar-spacer" />
      <span className="track-chip"><span />{trackLabel(currentPath)}</span>
      <label className="workspace-picker"><UserCircle size={17} /><span>Workspace</span>
        <select aria-label="Pilih workspace" value={role} onChange={event => onRoleChange(event.target.value as UserRole)}>
          <option value="participant">Peserta</option><option value="mentor">Mentor</option><option value="admin">Admin</option>
        </select>
      </label>
    </header>
    <main className="staff-main">
      <div className="staff-heading">
        <div><span className="page-kicker">{role === 'mentor' ? <ClipboardText size={16} /> : <Scales size={16} />} STAFF WORKSPACE · DEMO</span>
          <h1>{role === 'mentor' ? 'Meja Mentor' : 'Ruang Admin'}</h1>
          <p>{role === 'mentor' ? 'Tinjau kiriman stage, minta revisi, atau terima hasil dalam simulasi lokal.' : 'Kelola data seleksi melalui workspace admin yang tersedia.'}</p>
        </div>
      </div>
      {role === 'mentor' ? <section className="staff-card">
        <div className="staff-card-heading"><div><span className="eyebrow">ANTREAN TUGAS · MOCK DATA</span><h2>Kiriman peserta</h2></div><span className="demo-pill">DEMO</span></div>
        <div className="staff-submissions">
          {PARTICIPANT_STAGES.map(stage => {
            const submission = submissions[stage.ordinal];
            const action = submission?.status === 'reviewed' ? 'Lihat review'
              : submission && ['submitted', 'in_review'].includes(submission.status) ? 'Review'
                : null;
            return <article className="staff-submission" key={stage.ordinal}>
              <div className="staff-stage-mark">{stage.phase}</div>
              <div className="staff-submission-copy"><strong>{STAGE_BOSS_MISSIONS[stage.ordinal].title}</strong><small>{submission ? submissionState(submission) : 'Belum ada kiriman demo'}</small>
                {submission?.review?.feedback && <p>{submission.review.feedback}</p>}
              </div>
              {action && <button className="button button-outline" onClick={() => onReview(stage.ordinal as StageOrdinal)}>{action} <ArrowRight size={15} /></button>}
            </article>;
          })}
        </div>
        <p className="staff-footnote">Review dan XP pada layar ini hanya demo; penilaian ini tidak menulis ke Supabase.</p>
      </section> : <section className="staff-card admin-card">
        <div className="staff-card-heading"><div><span className="eyebrow">PROGRAM OPERATIONS</span><h2>Selection manager</h2></div><Scales size={22} className="staff-card-icon" /></div>
        <p>Gunakan workspace seleksi untuk meninjau hasil stage. Data layar tetap berupa demo dan tidak membuka akses stage Participant secara langsung.</p>
        <button className="button button-gold" onClick={onOpenAdmin}>Buka Selection Manager <ArrowRight size={16} /></button>
      </section>}
    </main>
  </div>;
}

function submissionState(submission: Submission) {
  if (submission.status === 'reviewed') return 'Diterima · review demo';
  if (submission.status === 'changes_requested') return 'Perlu revisi · review demo';
  if (submission.status === 'draft') return 'Draft demo · belum dikirim';
  return 'Menunggu review demo';
}
