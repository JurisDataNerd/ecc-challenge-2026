import { useState } from 'react';
import { XCircle } from '@phosphor-icons/react';
import type { Submission } from '../../types';
import { STAGE_BOSS_MISSIONS } from '../../data/mockQuests';
import { isEvidenceLink } from '../../lib/progress';
import { JourneyDialog } from '../ui/JourneyDialog';

export function MentorReviewPanel({ onClose, submission, onFinalizeReview }: {
  isOpen: boolean;
  onClose: () => void;
  submission: Submission | null;
  onFinalizeReview: (scores: Record<string, number>, feedback: string, decision: 'accepted' | 'changes_requested') => void;
}) {
  const mission = STAGE_BOSS_MISSIONS[submission?.stageOrdinal || 1];
  const finalized = submission?.status === 'reviewed';
  const [scores, setScores] = useState<Record<string, number>>(() => Object.fromEntries(mission.rubricCriteria.map(c => [c.key, submission?.review?.scores[c.key] ?? 0])));
  const [feedback, setFeedback] = useState(submission?.review?.feedback || '');
  const total = Object.values(scores).reduce((sum, value) => sum + value, 0);
  const save = (decision: 'accepted' | 'changes_requested') => {
    if (finalized || !feedback.trim() || !submission) return;
    onFinalizeReview(scores, feedback.trim(), decision);
    onClose();
  };
  return <JourneyDialog titleId="mentor-review-title" className="review-dialog" onClose={onClose}>
    <header className="dialog-heading"><div><p className="dialog-stage-label">L{submission?.stageOrdinal} · Review simulasi</p><h2 id="mentor-review-title">{finalized ? 'Hasil review' : 'Tinjau kiriman'}</h2></div><button className="icon-button" aria-label="Tutup review" onClick={onClose}><XCircle size={22} /></button></header>
    <p><strong>{mission.title}</strong></p>
    <section className="review-evidence"><h3>Ringkasan</h3><p>{submission?.summary || 'Belum ada ringkasan.'}</p><h3>Refleksi</h3><p>{submission?.reflection || 'Belum ada refleksi.'}</p><h3>Bukti</h3><ul>
      {submission?.files.map(file => <li key={file.id}>{file.url ? <a href={file.url} target="_blank" rel="noreferrer">{file.name}</a> : `${file.name} — berkas tidak tersedia`}</li>)}
      {submission?.evidenceLinks.filter(isEvidenceLink).map((link, index) => <li key={link}><a href={link} target="_blank" rel="noreferrer">Tautan bukti {index + 1}</a></li>)}
    </ul></section>
    <section className="review-rubric"><h3>Penilaian rubrik <span>{total} / 100</span></h3>{mission.rubricCriteria.map(c => <label key={c.key}><span>{c.label}<strong>{scores[c.key]} / {c.maxScore}</strong></span><input type="range" aria-label={c.label} min={0} max={c.maxScore} value={scores[c.key]} disabled={finalized} onChange={event => setScores(current => ({ ...current, [c.key]: Number(event.target.value) }))} /></label>)}</section>
    <label className="review-feedback">Masukan untuk peserta<textarea rows={4} value={feedback} readOnly={finalized} onChange={event => setFeedback(event.target.value)} placeholder="Sebutkan temuan dari bukti dan langkah perbaikan yang perlu dilakukan." /></label>
    <footer className="dialog-actions"><span className="demo-note">Simulasi lokal. Keputusan ini tidak dikirim ke ECC.</span><div><button className="button button-quiet" onClick={onClose}>{finalized ? 'Tutup hasil' : 'Batal'}</button>{!finalized && <><button className="button button-quiet" disabled={!feedback.trim()} onClick={() => save('changes_requested')}>Minta revisi</button><button className="button button-gold" disabled={!feedback.trim()} onClick={() => save('accepted')}>Terima misi</button></>}</div></footer>
  </JourneyDialog>;
}
