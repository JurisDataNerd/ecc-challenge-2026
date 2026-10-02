import { useEffect, useRef, useState } from 'react';
import { FileText, LinkSimple, UploadSimple, XCircle } from '@phosphor-icons/react';
import type { BossMission, PathCode, Submission, SubmissionFile } from '../../types';
import { isEvidenceLink } from '../../lib/progress';
import { removeFile, storeFile } from '../../lib/local-files';
import { JourneyDialog } from '../ui/JourneyDialog';
import { trackLabel } from '../../data/participantStages';

export function BossMissionModal({
  mission,
  storageScope,
  saveError,
  currentSubmission,
  currentPath = 'professional',
  trackFocus,
  readOnly = false,
  onClose,
  onSubmitMission,
}: {
  mission: BossMission | null;
  storageScope: string;
  saveError: string | null;
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
  const [storing, setStoring] = useState(false);
  const temporaryFiles = useRef<SubmissionFile[]>([]);
  const draftSignature = useRef('');
  const locked = readOnly || ['submitted', 'in_review', 'reviewed'].includes(currentSubmission?.status || '');
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; temporaryFiles.current.forEach(file => { void removeFile(file).catch(() => undefined); }); };
  }, []);
  useEffect(() => {
    if (!mission || locked || storing || (!summary && !reflection && !evidenceLink && !files.length && !currentSubmission)) return;
    const signature=JSON.stringify([summary,reflection,evidenceLink,files]);
    if (signature===draftSignature.current) return;
    draftSignature.current=signature;
    onSubmitMission({ id:currentSubmission?.id || `demo-${crypto.randomUUID()}`, enrollmentId:'participant_demo', stageOrdinal:mission.stageOrdinal, status:'draft', summary, reflection, evidenceLinks:evidenceLink.trim()?[evidenceLink.trim()]:[], files, review:currentSubmission?.review });
    temporaryFiles.current=[];
  }, [mission,locked,storing,summary,reflection,evidenceLink,files,onSubmitMission]);
  if (!mission) return null;
  const needsRevision = currentSubmission?.status === 'changes_requested' || (currentSubmission?.status === 'draft' && currentSubmission.review?.decision === 'changes_requested');
  const evidenceCriterion = mission.rubricCriteria.find(criterion => criterion.key === 'evidence_quality');
  const evidenceScore = evidenceCriterion ? currentSubmission?.review?.scores[evidenceCriterion.key] || 0 : 0;
  const evidenceBonus = Boolean(evidenceCriterion && evidenceScore >= evidenceCriterion.maxScore * 0.8);
  const handleFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = [...(event.target.files || [])];
    event.target.value = '';
    if (files.length + selected.length > mission.maxFiles) return setError(`Maksimal ${mission.maxFiles} berkas.`);
    const valid = selected.filter(file => file.size <= 20 * 1024 * 1024 && mission.allowedFormats.includes(file.type));
    if (valid.length !== selected.length) return setError('Gunakan format yang diterima, maksimal 20 MB per berkas.');
    setError('');
    setStoring(true);
    const added: SubmissionFile[] = [];
    try {
      for (const file of valid) added.push(await storeFile(storageScope, file));
      if (!mounted.current) { added.forEach(file => { void removeFile(file); }); return; }
      temporaryFiles.current.push(...added);
      setFiles(current => [...current, ...added]);
    } catch {
      await Promise.allSettled(added.map(removeFile));
      if (mounted.current) setError('Bukti belum tersimpan. Periksa ruang penyimpanan browser lalu coba lagi.');
    } finally { if (mounted.current) setStoring(false); }
  };

  const save = (status: Submission['status']) => {
    if (status === 'submitted' && (!summary.trim() || !reflection.trim() || (!files.some(file => file.url) && !evidenceLink.trim()))) {
      setError('Lengkapi ringkasan, refleksi, dan lampirkan satu bukti sebelum mengirim.');
      return;
    }
    if (storing) return;
    if (status === 'submitted' && evidenceLink.trim()) {
      try {
        if (!isEvidenceLink(evidenceLink.trim())) throw new Error();
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
    temporaryFiles.current = [];
    onClose();
  };

  return (
    <JourneyDialog titleId="mission-title" className="mission-dialog" onClose={() => { if (storing) setError("Tunggu hingga bukti selesai disimpan."); else onClose(); }}>
        <header className="dialog-heading">
          <div><span className="eyebrow">L{mission.stageOrdinal} · MISI <i>DEMO</i></span><h2 id="mission-title">{mission.title}</h2></div>
          <button className="icon-button" onClick={onClose} disabled={storing} aria-label="Tutup misi"><XCircle size={22} /></button>
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
            {currentSubmission.files.map(file => <li key={file.id}>{file.url ? <a href={file.url} target="_blank" rel="noreferrer">{file.name}</a> : <span>{file.name} ? berkas tidak tersedia di browser ini</span>}</li>)}
            {currentSubmission.evidenceLinks.map((link, index) => <li key={link}>{isEvidenceLink(link) ? <a href={link} target="_blank" rel="noreferrer">Tautan bukti {index + 1}</a> : <span>Tautan bukti {index + 1} belum valid</span>}</li>)}
            {!currentSubmission.files.length && !currentSubmission.evidenceLinks.length && <li>Belum ada bukti yang dilampirkan.</li>}
          </ul></div>
        </section>}

        {!locked && <div className="mission-form">
          <label>Ringkasan temuan<textarea value={summary} onChange={event => setSummary(event.target.value)} rows={3} placeholder="Apa yang kamu temukan?" /></label>
          <label>Refleksi pembelajaran<textarea value={reflection} onChange={event => setReflection(event.target.value)} rows={3} placeholder="Apa yang berubah dari asumsi awalmu?" /></label>
          <label>Tautan bukti (opsional jika unggah file)<span className="input-with-icon"><LinkSimple size={17} /><input type="url" value={evidenceLink} onChange={event => setEvidenceLink(event.target.value)} placeholder="https://…" /></span></label>
          <label className="file-drop"><UploadSimple size={18} /><span>Tambah bukti · maks {mission.maxFiles} berkas, 20 MB per file</span><input type="file" multiple accept={mission.allowedFormats.join(',')} onChange={handleFiles} disabled={storing} /></label>
          {!!files.length && <div className="file-list">{files.map(file => <div key={file.id}><FileText size={16} /><span>{file.name}{!file.url && " ? unggah ulang"}</span><button type="button" onClick={() => { setFiles(current => current.filter(item => item.id !== file.id)); }} aria-label={`Hapus ${file.name}`}>×</button></div>)}</div>}
        </div>}
        {storing && <p role="status">Menyimpan bukti di browser?</p>}
        {saveError && <p className="form-error" role="alert">{saveError}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <footer className="dialog-actions">
          <span className="demo-note">{!locked ? saveError ? "Draft belum tersimpan" : "Draft disimpan otomatis di browser" : readOnly ? 'Mode lihat · tidak ada XP baru · DEMO' : '20 XP setelah kiriman pertama diterima · DEMO'}</span>
          <div>
            <button className="button button-quiet" disabled={storing} onClick={onClose}>Kembali ke papan</button>
            {!locked && <>
              <button className="button button-quiet" disabled={storing} onClick={() => save('draft')}>Simpan draft</button>
              <button className="button button-gold" disabled={storing} onClick={() => save('submitted')}>{needsRevision ? 'Kirim revisi' : 'Kirim ke Mentor'}</button>
            </>}
          </div>
        </footer>
    </JourneyDialog>
  );
}
