import React, { useState } from 'react';
import { 
  UploadSimple, 
  FileText, 
  Trash, 
  X, 
  Link as LinkIcon, 
  Sparkle, 
  Sword, 
  Lightning, 
  ShieldCheck,
  WarningCircle
} from '@phosphor-icons/react';
import confetti from 'canvas-confetti';
import { BossMission, Submission, SubmissionFile, PathCode } from '../../types';
import { uploadSubmissionFile } from '../../lib/supabase';
import { GameEventBus } from '../../game/GameEventBus';
import { HeroBattleSprite, CraftpixBossBattleSprite } from '../game/BattleSprites';

interface BossMissionModalProps {
  mission: BossMission | null;
  currentSubmission?: Submission;
  currentPath?: PathCode;
  onClose: () => void;
  onSubmitMission: (submission: Submission) => void;
}

export const BossMissionModal: React.FC<BossMissionModalProps> = ({
  mission,
  currentSubmission,
  currentPath = 'professional',
  onClose,
  onSubmitMission
}) => {
  if (!mission) return null;

  const [summary, setSummary] = useState<string>(currentSubmission?.summary || '');
  const [reflection, setReflection] = useState<string>(currentSubmission?.reflection || '');
  const [evidenceLink, setEvidenceLink] = useState<string>(currentSubmission?.evidenceLinks?.[0] || '');
  const [files, setFiles] = useState<SubmissionFile[]>(currentSubmission?.files || []);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  const isAlreadySubmitted = currentSubmission?.status === 'submitted' || currentSubmission?.status === 'reviewed';
  const [bossHp, setBossHp] = useState<number>(isAlreadySubmitted ? 0 : 300);
  const [playerHp] = useState<number>(100);
  const [battleState, setBattleState] = useState<'idle' | 'charging' | 'ultimate' | 'victory'>(
    isAlreadySubmitted ? 'victory' : 'idle'
  );
  const [damagePopup, setDamagePopup] = useState<string | null>(null);
  const [battleLog, setBattleLog] = useState<string>(
    isAlreadySubmitted 
      ? `Tugas tahap ini sudah berhasil dikumpulkan dan tersimpan di sistem.`
      : `Selesaikan tugas besar Tahap ${mission.stageOrdinal} dan kumpulkan berkas untuk dinilai mentor.`
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    if (files.length + selectedFiles.length > mission.maxFiles) {
      setErrorMsg(`Maksimal ${mission.maxFiles} berkas untuk misi ini.`);
      return;
    }

    setErrorMsg('');
    setIsUploading(true);

    try {
      const newFiles: SubmissionFile[] = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        if (file.size > 20 * 1024 * 1024) {
          setErrorMsg(`Ukuran berkas "${file.name}" melebihi batas 20MB.`);
          continue;
        }

        const uploaded = await uploadSubmissionFile(file, 'participant_active', mission.stageOrdinal);
        newFiles.push({
          id: `file_${Date.now()}_${i}`,
          name: uploaded.name,
          size: uploaded.size,
          type: uploaded.type,
          url: uploaded.url
        });
      }
      setFiles(prev => [...prev, ...newFiles]);
    } catch {
      setErrorMsg('Gagal mengunggah berkas. Silakan coba kembali.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleExecuteBossSubmission = (isDraft: boolean = false) => {
    if (!isDraft) {
      if (!summary.trim() || !reflection.trim()) {
        setErrorMsg('Harap lengkapi Ringkasan Temuan dan Refleksi sebelum mengumpulkan tugas.');
        return;
      }
      if (files.length === 0 && !evidenceLink.trim()) {
        setErrorMsg('Harap lampirkan minimal satu berkas bukti tugas atau tautan bukti.');
        return;
      }
    }

    const submissionData: Submission = {
      id: currentSubmission?.id || `sub_${Date.now()}`,
      enrollmentId: 'participant_active',
      stageOrdinal: mission.stageOrdinal,
      status: isDraft ? 'draft' : 'submitted',
      summary,
      reflection,
      evidenceLinks: evidenceLink.trim() ? [evidenceLink.trim()] : [],
      files,
      submittedAt: new Date().toISOString()
    };

    if (isDraft) {
      onSubmitMission(submissionData);
      onClose();
      return;
    }

    // Submit animation
    setBattleState('charging');
    setBattleLog('Mengunggah berkas dan memproses data tugas...');

    setTimeout(() => {
      setBattleState('ultimate');
      setBattleLog(`Tugas Tahap ${mission.stageOrdinal} berhasil dikumpulkan!`);
      setDamagePopup('TUGAS TERKIRIM!');
      setBossHp(0);

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 }
      });

      GameEventBus.emit('BOSS_DEFEATED', mission.stageOrdinal);
      onSubmitMission(submissionData);

      setTimeout(() => {
        setBattleState('victory');
        setDamagePopup(null);
        setBattleLog(`Berhasil! Tugas Anda resmi masuk ke antrean penilaian mentor dan juri.`);
      }, 700);
    }, 550);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-5 bg-slate-950/85 backdrop-blur-sm select-none">
      <div className="w-full max-w-4xl rpg-window-gold rounded-none flex flex-col max-h-[96vh] overflow-hidden text-slate-100">
        
        {/* 4 Golden Corner Rivets */}
        <span className="rpg-corner-stud-tl" />
        <span className="rpg-corner-stud-tr" />
        <span className="rpg-corner-stud-bl" />
        <span className="rpg-corner-stud-br" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b-2 border-amber-600/70 bg-gradient-to-r from-[#172033] via-[#0f172a] to-[#172033]">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 bg-amber-500 animate-ping shadow-[0_0_8px_#f59e0b]" />
            <span className="font-pixel text-[9px] uppercase tracking-wider text-amber-400 font-bold">
              TUGAS BESAR • TAHAP {mission.stageOrdinal}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-pixel text-[8px] text-amber-300 bg-amber-950/80 border border-amber-600 px-2.5 py-1 shadow-pixel-sm">
              {mission.bossTitle}
            </span>
            <button
              onClick={onClose}
              className="rpg-btn rpg-btn-crimson px-2 py-0.5 text-xs flex items-center gap-1 cursor-pointer"
              title="Tutup (ESC)"
            >
              <X size={14} weight="bold" />
              <span className="font-pixel text-[8px]">ESC</span>
            </button>
          </div>
        </div>

        {/* Boss Battle Arena (Classic Final Fantasy Layout) */}
        <div 
          className="relative w-full h-64 md:h-72 bg-slate-950 border-b-2 border-slate-700 overflow-hidden flex items-center justify-between px-8 md:px-16 bg-cover bg-center"
          style={{ backgroundImage: "url('/assets/dungeon/custom_battle_bg.png')" }}
        >
          {/* Dungeon Ambience Torches */}
          <div className="absolute left-6 top-6 flex flex-col items-center opacity-70">
            <div className="w-3.5 h-5 bg-amber-500 rounded-full blur-[2px] animate-pulse" />
            <div className="w-4 h-24 bg-slate-800 border-x border-slate-700" />
          </div>
          <div className="absolute right-6 top-6 flex flex-col items-center opacity-70">
            <div className="w-3.5 h-5 bg-amber-500 rounded-full blur-[2px] animate-pulse" />
            <div className="w-4 h-24 bg-slate-800 border-x border-slate-700" />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/90 to-transparent border-t border-slate-700/40" />

          {/* SISI KIRI: BOSS */}
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="bg-slate-950 border-2 border-amber-600 px-3.5 py-1.5 shadow-pixel flex flex-col gap-1 w-48">
              <div className="flex items-center justify-between font-pixel text-[8px]">
                <span className="text-amber-400 truncate max-w-[110px] uppercase">{mission.bossName}</span>
                <span className="text-slate-300">{bossHp}/300</span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 overflow-hidden border border-slate-700 p-0.5">
                <div 
                  className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-300 h-full transition-all duration-500"
                  style={{ width: `${(bossHp / 300) * 100}%` }}
                />
              </div>
            </div>

            <div className={`relative transition-all duration-300 ${
              battleState === 'ultimate' ? 'translate-x-6 scale-95 brightness-150' : ''
            } ${battleState === 'victory' ? 'opacity-20 scale-75 blur-sm' : ''}`}>
              <CraftpixBossBattleSprite size={150} isSummon={battleState === 'ultimate'} />
              
              {damagePopup && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white font-pixel text-[10px] px-3 py-1 shadow-pixel-lg border-2 border-amber-300 animate-bounce">
                  {damagePopup}
                </div>
              )}
            </div>
          </div>

          {/* SISI KANAN: HERO */}
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="bg-slate-950 border-2 border-emerald-700/80 px-3.5 py-1.5 shadow-pixel flex flex-col gap-1 w-44">
              <div className="flex items-center justify-between font-pixel text-[8px]">
                <span className="text-emerald-400">FAUZAN</span>
                <span className="text-slate-300">{playerHp}/100</span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 overflow-hidden border border-slate-700 p-0.5">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300"
                  style={{ width: `${playerHp}%` }}
                />
              </div>
            </div>

            <div className={`relative transition-all duration-300 ${
              battleState === 'charging' ? 'scale-110 ring-2 ring-amber-400 p-1' : ''
            } ${battleState === 'ultimate' ? '-translate-x-20 scale-125' : ''}`}>
              <HeroBattleSprite pathCode={currentPath} actionState={battleState === 'ultimate' ? 'attack' : 'idle'} size={125} />
            </div>
          </div>
        </div>

        {/* Dialogue Box */}
        <div className="px-5 py-2.5 bg-[#050811] border-b-2 border-slate-800 flex items-center gap-2.5 text-xs font-mono text-amber-200">
          <Lightning size={16} weight="fill" className="text-amber-400 shrink-0" />
          <span className="font-rpg text-sm tracking-wide text-amber-300 truncate">
            {battleLog}
          </span>
        </div>

        {/* Mission Submission Console */}
        <div className="p-4 md:p-5 overflow-y-auto flex flex-col gap-3.5 bg-[#0a0f1d] flex-1">
          
          {/* Deliverables Card */}
          <div className="p-3 bg-[#060913] border-2 border-slate-700 shadow-pixel-sm flex flex-col gap-1">
            <div className="flex items-center gap-2 font-pixel text-[8px] text-amber-400 uppercase">
              <ShieldCheck size={16} weight="bold" />
              <span>PETUNJUK & SYARAT TUGAS:</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {mission.instructions}
            </p>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-pixel text-[8px] text-amber-400 uppercase">
                1. RINGKASAN TUGAS & TEMUAN *
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Tuliskan ringkasan tugas dan temuan utama..."
                rows={3}
                className="w-full px-3 py-2 bg-[#060913] border-2 border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 resize-none shadow-[inset_1px_1px_0_#000] font-sans"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-pixel text-[8px] text-amber-400 uppercase">
                2. REFLEKSI PEMBELAJARAN *
              </label>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="Tuliskan refleksi dan pembelajaran yang didapatkan..."
                rows={3}
                className="w-full px-3 py-2 bg-[#060913] border-2 border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 resize-none shadow-[inset_1px_1px_0_#000] font-sans"
              />
            </div>
          </div>

          {/* Evidence Link */}
          <div className="flex flex-col gap-1">
            <label className="font-pixel text-[8px] text-amber-400 uppercase">
              3. TAUTAN TAMBAHAN (GOOGLE DRIVE, FIGMA, VIDEO PITCH)
            </label>
            <div className="relative">
              <input
                type="url"
                value={evidenceLink}
                onChange={(e) => setEvidenceLink(e.target.value)}
                placeholder="https://drive.google.com/... atau tautan lainnya"
                className="w-full pl-8 pr-3 py-2 bg-[#060913] border-2 border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 shadow-[inset_1px_1px_0_#000] font-sans"
              />
              <LinkIcon size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
            </div>
          </div>

          {/* File Upload Component */}
          <div className="flex flex-col gap-1.5">
            <label className="font-pixel text-[8px] text-amber-400 uppercase flex items-center justify-between">
              <span>4. UNGGAH BERKAS BUKTI (PDF, DOCX, PPTX, GAMBAR)</span>
              <span className="text-[9px] text-slate-400 font-mono">MAKS 20MB ({files.length}/{mission.maxFiles})</span>
            </label>

            <div className="border-2 border-dashed border-slate-700 hover:border-amber-500 p-3.5 flex flex-col items-center justify-center gap-1 bg-[#060913] hover:bg-slate-900 transition-all cursor-pointer relative shadow-[inset_1px_1px_0_#000]">
              <input 
                type="file" 
                multiple
                onChange={handleFileUpload}
                disabled={files.length >= mission.maxFiles || isUploading}
                className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <div className="p-1.5 bg-slate-900 text-amber-400 border border-slate-700 shadow-pixel-sm">
                <UploadSimple size={16} weight="bold" />
              </div>
              <span className="font-rpg text-xs text-slate-300">
                {isUploading ? 'SEDANG MENGUNGGAH BERKAS...' : 'KLIK ATAU TARIK BERKAS TUGAS KE SINI'}
              </span>
            </div>

            {files.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {files.map(file => (
                  <div 
                    key={file.id} 
                    className="flex items-center gap-2 p-1.5 px-2.5 bg-[#060913] border border-slate-700 text-xs text-slate-200 shadow-pixel-sm"
                  >
                    <FileText size={15} className="text-amber-400 shrink-0" />
                    <span className="truncate max-w-[180px] font-sans text-xs">{file.name}</span>
                    <button
                      onClick={() => handleRemoveFile(file.id)}
                      className="text-slate-400 hover:text-red-400 p-0.5 ml-1 cursor-pointer"
                      title="Hapus berkas"
                    >
                      <Trash size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-2.5 bg-red-950/80 border-2 border-red-700 text-red-200 text-xs font-mono shadow-pixel">
              <WarningCircle size={16} weight="bold" className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t-2 border-slate-800 bg-[#060913] flex items-center justify-between shrink-0">
          <button
            onClick={() => handleExecuteBossSubmission(true)}
            className="rpg-btn rpg-btn-slate px-3.5 py-2 text-xs cursor-pointer"
          >
            SIMPAN DRAFT
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="rpg-btn rpg-btn-slate px-3.5 py-2 text-xs cursor-pointer"
            >
              KEMBALI
            </button>

            {battleState !== 'victory' ? (
              <button
                onClick={() => handleExecuteBossSubmission(false)}
                disabled={isUploading}
                className="rpg-btn rpg-btn-gold px-5 py-2.5 text-xs flex items-center gap-2 cursor-pointer shadow-pixel disabled:opacity-40"
              >
                <Sword size={16} weight="bold" />
                <span>KUMPULKAN TUGAS (SUBMIT)</span>
              </button>
            ) : (
              <button
                onClick={onClose}
                className="rpg-btn rpg-btn-emerald px-5 py-2.5 text-xs flex items-center gap-2 cursor-pointer shadow-pixel animate-pulse"
              >
                <Sparkle size={16} weight="fill" />
                <span>KEMBALI KE MAP</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
