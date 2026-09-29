import { useState } from 'react';
import { FileText, LinkSimple, UploadSimple, XCircle } from '@phosphor-icons/react';
import type { BossMission, PathCode, Submission, SubmissionFile } from '../../types';
import { trackLabel } from '../../data/participantStages';

export function BossMissionModal({
  mission,
  currentSubmission,
  currentPath = 'professional',
  trackFocus,
  readOnly = false,
  onClose,
  onSubmitMission,
}: {
  mission: BossMission | null;
  currentSubmission?: Submission;
  currentPath?: PathCode;
  trackFocus: string;
  readOnly?: boolean;
  onClose: () => void;
  onSubmitMission: (submission: Submission) => void;
}) {
  const [summary, setSummary] = useState(currentSubmission?.summary || '');
  const [reflection, setReflection] = useState(currentSubmission?.reflection || '');
  const [evidenceLink, setEvidenceLink] = useState(currentSubmission?.evidenceLinks?.[0] || '');
  const [files, setFiles] = useState<SubmissionFile[]>(currentSubmission?.files || []);
  const [error, setError] = useState('');
  if (!mission) return null;

  const locked = readOnly || ['submitted', 'in_review', 'reviewed'].includes(currentSubmission?.status || '');
  const needsRevision = currentSubmission?.status === 'changes_requested';
  const evidenceCriterion = mission.rubricCriteria.find(criterion => criterion.key === 'evidence_quality');
  const evidenceScore = evidenceCriterion ? currentSubmission?.review?.scores[evidenceCriterion.key] || 0 : 0;
  const evidenceBonus = Boolean(evidenceCriterion && evidenceScore >= evidenceCriterion.maxScore * 0.8);
  const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = [...(event.target.files || [])];
    event.target.value = '';
    if (files.length + selected.length > mission.maxFiles) return setError(`Maksimal ${mission.maxFiles} berkas.`);
    const valid = selected.filter(file => file.size <= 20 * 1024 * 1024 && mission.allowedFormats.includes(file.type));
    if (valid.length !== selected.length) return setError('Gunakan format yang diterima, maksimal 20 MB per berkas.');
    setError('');
    setFiles(current => [...current, ...valid.map((file, index) => ({
      id: `${Date.now()}-${index}`, name: file.name, size: file.size, type: file.type, url: URL.createObjectURL(file),
    }))]);
  };

  const save = (status: Submission['status']) => {
    if (status === 'submitted' && (!summary.trim() || !reflection.trim() || (!files.length && !evidenceLink.trim()))) {
      setError('Lengkapi ringkasan, refleksi, dan lampirkan satu bukti sebelum mengirim.');
      return;
    }
    if (status === 'submitted' && evidenceLink.trim()) {
      try {
        if (!['http:', 'https:'].includes(new URL(evidenceLink.trim()).protocol)) throw new Error();
      } catch {
        setError('Tautan bukti harus menggunakan alamat http:// atau https://.');
        return;
      }
    }
    setError('');
    onSubmitMission({
      id: currentSubmission?.id || `demo-${Date.now()}`,
      enrollmentId: 'participant_demo',
      stageOrdinal: mission.stageOrdinal,
      status,
      summary: summary.trim(),
      reflection: reflection.trim(),
      evidenceLinks: evidenceLink.trim() ? [evidenceLink.trim()] : [],
      files,
      submittedAt: status === 'submitted' ? new Date().toISOString() : currentSubmission?.submittedAt,
      review: currentSubmission?.review,
    });
    onClose();
  };

  return (
    <div className="journey-scrim" onMouseDown={onClose}>
      <section className="journey-dialog mission-dialog" role="dialog" aria-modal="true" aria-labelledby="mission-title" onMouseDown={event => event.stopPropagation()}>
        <header className="dialog-heading">
          <div><span className="eyebrow">L{mission.stageOrdinal} · MISI <i>DEMO</i></span><h2 id="mission-title">{mission.title}</h2></div>
          <button className="icon-button" onClick={onClose} aria-label="Tutup misi"><XCircle size={22} /></button>
        </header>
        <p className="dialog-context"><strong>{trackLabel(currentPath)}:</strong> {trackFocus}</p>
        <p className="mission-instructions">{mission.instructions}</p>
        <div className="mission-deliverables"><strong>Yang perlu dikirim</strong>{mission.deliverables.map(item => <span key={item}>• {item}</span>)}</div>
        {needsRevision && currentSubmission?.review?.feedback && (
          <div className="revision-note"><strong>Perlu revisi · demo</strong><p>{currentSubmission.review.feedback}</p></div>
        )}
        {currentSubmission?.status === 'submitted' && <div className="review-pending">Menunggu penilaian Mentor. Belum ada XP misi yang diberikan.</div>}
        {currentSubmission?.status === 'reviewed' && <div className="review-accepted">Misi diterima · +20 XP demo{evidenceBonus ? ' dan bonus bukti +10 XP' : ''}.</div>}
        {readOnly && <div className="read-only-note">Tahap ini hanya dapat dilihat karena keputusan akses demo belum membuka pengiriman.</div>}
        {locked && currentSubmission && <section className="mission-submission-preview" aria-label="Kiriman tersimpan">
          <h3>Kiriman tersimpan <span>DEMO</span></h3>
          <div><strong>Ringkasan temuan</strong><p>{currentSubmission.summary || 'Belum ada ringkasan.'}</p></div>
          <div><strong>Refleksi pembelajaran</strong><p>{currentSubmission.reflection || 'Belum ada refleksi.'}</p></div>
          <div><strong>Bukti</strong><ul>
            {currentSubmission.files.map(file => <li key={file.id}><a href={file.url} target="_blank" rel="noreferrer">{file.name}</a></li>)}
            {currentSubmission.evidenceLinks.map((link, index) => <li key={link}><a href={link} target="_blank" rel="noreferrer">Tautan bukti {index + 1}</a></li>)}
            {!currentSubmission.files.length && !currentSubmission.evidenceLinks.length && <li>Belum ada bukti yang dilampirkan.</li>}
          </ul></div>
        </section>}

        {!locked && <div className="mission-form">
          <label>Ringkasan temuan<textarea value={summary} onChange={event => setSummary(event.target.value)} rows={3} placeholder="Apa yang kamu temukan?" /></label>
          <label>Refleksi pembelajaran<textarea value={reflection} onChange={event => setReflection(event.target.value)} rows={3} placeholder="Apa yang berubah dari asumsi awalmu?" /></label>
          <label>Tautan bukti (opsional jika unggah file)<span className="input-with-icon"><LinkSimple size={17} /><input type="url" value={evidenceLink} onChange={event => setEvidenceLink(event.target.value)} placeholder="https://…" /></span></label>
          <label className="file-drop"><UploadSimple size={18} /><span>Tambah bukti · maks {mission.maxFiles} berkas, 20 MB per file</span><input type="file" multiple accept={mission.allowedFormats.join(',')} onChange={handleFiles} /></label>
          {!!files.length && <div className="file-list">{files.map(file => <div key={file.id}><FileText size={16} /><span>{file.name}</span><button type="button" onClick={() => { URL.revokeObjectURL(file.url); setFiles(current => current.filter(item => item.id !== file.id)); }} aria-label={`Hapus ${file.name}`}>×</button></div>)}</div>}
        </div>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <footer className="dialog-actions">
          <span className="demo-note">{readOnly ? 'Mode lihat · tidak ada XP baru · DEMO' : '20 XP setelah kiriman pertama diterima · DEMO'}</span>
          <div>
            <button className="button button-quiet" onClick={onClose}>Kembali</button>
            {!locked && <>
              <button className="button button-quiet" onClick={() => save('draft')}>Simpan draft</button>
              <button className="button button-gold" onClick={() => save('submitted')}>{needsRevision ? 'Kirim revisi' : 'Kirim ke Mentor'}</button>
            </>}
          </div>
        </footer>
      </section>
    </div>
  );
}
