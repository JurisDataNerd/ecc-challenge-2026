import React, { useState } from 'react';
import { 
  UserGear, 
  CheckCircle, 
  FileText, 
  ArrowSquareOut,
  ListChecks,
  ChatCircleText
} from '@phosphor-icons/react';
import { Submission } from '../../types';
import { STAGE_BOSS_MISSIONS } from '../../data/mockQuests';
import { PixelModalFrame } from '../ui/PixelModalFrame';

interface MentorReviewPanelProps {
  isOpen: boolean;
  onClose: () => void;
  submission: Submission | null;
  onFinalizeReview: (scores: Record<string, number>, feedback: string, decision: 'accepted' | 'changes_requested') => void;
}

export const MentorReviewPanel: React.FC<MentorReviewPanelProps> = ({
  isOpen,
  onClose,
  submission,
  onFinalizeReview
}) => {
  if (!isOpen) return null;

  const stageOrdinal = submission?.stageOrdinal || 1;
  const mission = STAGE_BOSS_MISSIONS[stageOrdinal] || STAGE_BOSS_MISSIONS[1];
  const reviewFinalized = submission?.status === 'reviewed';

  const [scores, setScores] = useState<Record<string, number>>(() => {
    const initScores: Record<string, number> = {};
    mission.rubricCriteria.forEach(c => {
      initScores[c.key] = submission?.review?.scores[c.key] ?? Math.round(c.maxScore * 0.85);
    });
    return initScores;
  });

  const [feedback, setFeedback] = useState<string>(
    submission?.review?.feedback || 'Bukti wawancara sangat autentik dan mencerminkan empati mendalam terhadap kendala responden.'
  );

  const handleScoreChange = (key: string, val: number) => {
    setScores(prev => ({ ...prev, [key]: val }));
  };

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  const handleSave = (decision: 'accepted' | 'changes_requested') => {
    if (reviewFinalized) return;
    onFinalizeReview(scores, feedback, decision);
    onClose();
  };

  return (
    <PixelModalFrame
      title={reviewFinalized ? 'HASIL REVIEW · DEMO' : 'DEMO REVIEW · MENTOR'}
      subtitle={`Penilaian rubrik tugas Tahap ${stageOrdinal}: ${mission.title}`}
      badge={`TAHAP ${stageOrdinal}`}
      badgeColor="#38bdf8"
      icon={<UserGear size={20} weight="fill" />}
      onClose={onClose}
      variant="gold"
      maxWidth="max-w-4xl"
      footer={
        <>
          {reviewFinalized ? <button onClick={onClose} className="rpg-btn rpg-btn-slate px-4 py-2 text-xs cursor-pointer">TUTUP HASIL</button> : <>
            <button onClick={onClose} className="rpg-btn rpg-btn-slate px-4 py-2 text-xs cursor-pointer">BATAL</button>
            <button onClick={() => handleSave('changes_requested')} className="rpg-btn rpg-btn-slate px-4 py-2 text-xs cursor-pointer">MINTA REVISI</button>
            <button onClick={() => handleSave('accepted')} className="rpg-btn rpg-btn-emerald px-5 py-2 text-xs flex items-center gap-2 cursor-pointer shadow-pixel">
              <CheckCircle size={16} weight="fill" /><span>TERIMA MISI</span>
            </button>
          </>}
        </>
      }
    >
      {/* Submission Overview */}
      <div className="p-3.5 bg-[#060913] border-2 border-slate-700 shadow-pixel-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-pixel text-[8px] text-amber-400 uppercase">
            TUGAS PESERTA:
          </span>
          <span className="font-pixel text-[8px] px-2 py-0.5 bg-emerald-950/80 border border-emerald-500 text-emerald-300">
            STATUS: {submission?.status?.toUpperCase() || 'SUBMITTED'}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="font-pixel text-[7px] text-slate-400 uppercase">RINGKASAN TEMUAN:</span>
          <p className="text-xs text-slate-200 bg-[#03060c] p-2.5 border border-slate-800 leading-relaxed font-sans">
            {submission?.summary || 'Tiga narasumber pelaku UMKM mengeluhkan kendala integrasi pembukuan harian dengan faktur manual, yang memicu keterlambatan rekonsiliasi kas mingguan.'}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <span className="font-pixel text-[7px] text-slate-400 uppercase">REFLEKSI PEMBELAJARAN:</span>
          <p className="text-xs text-slate-200 bg-[#03060c] p-2.5 border border-slate-800 leading-relaxed font-sans">
            {submission?.reflection || 'Asumsi awal kami bahwa UMKM enggan menggunakan teknologi terbantahkan; kendala utama sebetulnya adalah bahasa istilah akuntansi yang terlalu rumit.'}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="font-pixel text-[7px] text-slate-400 uppercase">BERKAS BUKTI TERLAMPIR:</span>
          <div className="flex flex-wrap gap-2">
            {submission?.files.map(file => (
                <a
                  key={file.id}
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-2.5 py-1.5 bg-[#03060c] border border-slate-700 text-xs text-amber-300 hover:border-amber-400 transition-colors font-mono shadow-pixel-sm"
                >
                  <FileText size={15} />
                  <span className="truncate max-w-[200px]">{file.name}</span>
                  <ArrowSquareOut size={13} />
                </a>
              ))}
            {submission?.evidenceLinks.map((link, index) => (
              <a
                key={link}
                href={link}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-2.5 py-1.5 bg-[#03060c] border border-slate-700 text-xs text-amber-300 hover:border-amber-400 transition-colors font-mono shadow-pixel-sm"
              >
                <FileText size={15} />
                <span className="truncate max-w-[200px]">Tautan bukti {index + 1}</span>
                <ArrowSquareOut size={13} />
              </a>
            ))}
            {!submission?.files.length && !submission?.evidenceLinks.length && (
              <p className="text-xs text-slate-400">Belum ada berkas atau tautan bukti.</p>
            )}
          </div>
        </div>
      </div>

      {/* Rubric Evaluation Form */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-pixel text-[8px] text-amber-400">
            <ListChecks size={16} weight="bold" />
            <span>RUBRIK PENILAIAN:</span>
          </div>
          <div className="font-pixel text-[9px] text-amber-300 px-2.5 py-1 bg-amber-950/80 border border-amber-500 shadow-pixel-sm">
            TOTAL SKOR: {totalScore} / 100
          </div>
        </div>

        <div className="space-y-2.5">
          {mission.rubricCriteria.map(criterion => {
            const currentVal = scores[criterion.key] || 0;
            return (
              <div 
                key={criterion.key}
                className="p-3 bg-[#060913] border-2 border-slate-800 flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-200 font-sans">{criterion.label}</span>
                  <span className="font-pixel text-[8px] text-amber-400">
                  {currentVal} / {criterion.maxScore}
                  </span>
                </div>

                <input
                  type="range"
                  min={0}
                  max={criterion.maxScore}
                  value={currentVal}
                  onChange={(e) => handleScoreChange(criterion.key, Number(e.target.value))}
                  disabled={reviewFinalized}
                  aria-label={criterion.label}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Qualitative Feedback */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 font-pixel text-[8px] text-amber-400">
          <ChatCircleText size={16} weight="bold" />
          <span>FEEDBACK / MASUKAN UNTUK PESERTA:</span>
        </div>
        <textarea
          rows={3}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          readOnly={reviewFinalized}
          placeholder="Tuliskan catatan evaluasi dan saran pengembangan untuk peserta..."
          className="w-full px-3 py-2 bg-[#060913] border-2 border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 resize-none font-sans shadow-[inset_1px_1px_0_#000]"
        />
      </div>
    </PixelModalFrame>
  );
};
