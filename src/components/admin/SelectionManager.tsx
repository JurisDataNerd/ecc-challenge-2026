import React, { useState } from 'react';
import { 
  Crown, 
  ArrowsDownUp
} from '@phosphor-icons/react';
import confetti from 'canvas-confetti';
import { SelectionCandidate, PathCode } from '../../types';
import { TalentProfile } from '../../data/mockParticipants';
import { OFFICIAL_PATHS } from '../../data/mockQuests';
import { PixelModalFrame } from '../ui/PixelModalFrame';

interface SelectionManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateTalentPool: (pool: TalentProfile[]) => void;
}

export const SelectionManager: React.FC<SelectionManagerProps> = ({
  isOpen,
  onClose,
  onUpdateTalentPool: _onUpdateTalentPool
}) => {
  if (!isOpen) return null;

  const [selectedPathFilter, setSelectedPathFilter] = useState<PathCode | 'all'>('all');

  const [candidates, setCandidates] = useState<SelectionCandidate[]>([
    { enrollmentId: 'enr-p1', participantName: 'Raden Arya Baskoro', city: 'Yogyakarta', pathCode: 'professional', quizScore: 95, missionScore: 92, compositeScore: 93.2, decision: 'finalist', rankInPath: 1 },
    { enrollmentId: 'enr-p2', participantName: 'Dian Permata Kusuma', city: 'Surabaya', pathCode: 'professional', quizScore: 90, missionScore: 89, compositeScore: 89.4, decision: 'finalist', rankInPath: 2 },
    { enrollmentId: 'enr-p3', participantName: 'Hendra Gunawan', city: 'Bandung', pathCode: 'professional', quizScore: 88, missionScore: 87, compositeScore: 87.4, decision: 'finalist', rankInPath: 3 },
    { enrollmentId: 'enr-p4', participantName: 'Taufiq Hidayat', city: 'Semarang', pathCode: 'professional', quizScore: 78, missionScore: 75, compositeScore: 76.2, decision: 'eliminated', rankInPath: 4 },
    { enrollmentId: 'enr-p5', participantName: 'Rian Syahputra', city: 'Balikpapan', pathCode: 'professional', quizScore: 70, missionScore: 68, compositeScore: 68.8, decision: 'eliminated', rankInPath: 5 },

    { enrollmentId: 'enr-s1', participantName: 'Siti Nur Aisyah', city: 'Malang', pathCode: 'social_impact', quizScore: 96, missionScore: 94, compositeScore: 94.8, decision: 'finalist', rankInPath: 1 },
    { enrollmentId: 'enr-s2', participantName: 'Fauzi Rahman', city: 'Semarang', pathCode: 'social_impact', quizScore: 92, missionScore: 88, compositeScore: 89.6, decision: 'finalist', rankInPath: 2 },
    { enrollmentId: 'enr-s3', participantName: 'Nadia Safitri', city: 'Makassar', pathCode: 'social_impact', quizScore: 89, missionScore: 86, compositeScore: 87.2, decision: 'finalist', rankInPath: 3 },
    { enrollmentId: 'enr-s4', participantName: 'Dewi Lestari Utami', city: 'Denpasar', pathCode: 'social_impact', quizScore: 80, missionScore: 74, compositeScore: 76.4, decision: 'eliminated', rankInPath: 4 },
    { enrollmentId: 'enr-s5', participantName: 'Fitria Handayani', city: 'Padang', pathCode: 'social_impact', quizScore: 72, missionScore: 70, compositeScore: 70.8, decision: 'eliminated', rankInPath: 5 },

    { enrollmentId: 'enr-b1', participantName: 'Bima Satria Wicaksono', city: 'Jakarta', pathCode: 'business', quizScore: 98, missionScore: 95, compositeScore: 96.2, decision: 'finalist', rankInPath: 1 },
    { enrollmentId: 'enr-b2', participantName: 'Anisa Ristiyani', city: 'Solo', pathCode: 'business', quizScore: 91, missionScore: 90, compositeScore: 90.4, decision: 'finalist', rankInPath: 2 },
    { enrollmentId: 'enr-b3', participantName: 'Kuncoro Adi Pratama', city: 'Medan', pathCode: 'business', quizScore: 88, missionScore: 88, compositeScore: 88.0, decision: 'finalist', rankInPath: 3 },
    { enrollmentId: 'enr-b4', participantName: 'Gilang Ramadhan', city: 'Palembang', pathCode: 'business', quizScore: 76, missionScore: 72, compositeScore: 73.6, decision: 'eliminated', rankInPath: 4 },
    { enrollmentId: 'enr-b5', participantName: 'Yoga Pratama', city: 'Cirebon', pathCode: 'business', quizScore: 71, missionScore: 69, compositeScore: 69.8, decision: 'eliminated', rankInPath: 5 }
  ]);

  const handleRecalculateSelection = () => {
    const grouped: Record<PathCode, SelectionCandidate[]> = {
      professional: [],
      social_impact: [],
      business: []
    };

    candidates.forEach(c => {
      const comp = Number(((c.quizScore * 0.4) + (c.missionScore * 0.6)).toFixed(1));
      grouped[c.pathCode].push({ ...c, compositeScore: comp });
    });

    const newCandidates: SelectionCandidate[] = [];

    (Object.keys(grouped) as PathCode[]).forEach(pathCode => {
      const sorted = grouped[pathCode].sort((a, b) => b.compositeScore - a.compositeScore);
      sorted.forEach((item, index) => {
        const rank = index + 1;
        const decision = rank <= 3 ? 'finalist' : 'eliminated';
        newCandidates.push({
          ...item,
          rankInPath: rank,
          decision
        });
      });
    });

    setCandidates(newCandidates);

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const filteredCandidates = candidates.filter(c => {
    if (selectedPathFilter === 'all') return true;
    return c.pathCode === selectedPathFilter;
  });

  const finalistCount = candidates.filter(c => c.decision === 'finalist').length;
  const eliminatedCount = candidates.filter(c => c.decision === 'eliminated').length;

  return (
    <PixelModalFrame
      title="PANEL SELEKSI & FINALIS"
      subtitle="Kalkulasi kelulusan peserta dan penetapan 9 finalis pitching di Jakarta (3 per jalur)."
      badge="ADMIN SELEKSI"
      badgeColor="#e11d48"
      icon={<Crown size={20} weight="fill" />}
      onClose={onClose}
      variant="gold"
      maxWidth="max-w-5xl"
      footer={
        <>
          <div className="flex items-center gap-2">
            <span className="font-pixel text-[8px] text-amber-300">
              STATUS: {finalistCount} FINALIS TERPILIH (3 PER JALUR)
            </span>
          </div>

          <button
            onClick={onClose}
            className="rpg-btn rpg-btn-slate px-4 py-2 text-xs cursor-pointer"
          >
            TUTUP
          </button>
        </>
      }
    >
      {/* Stats Banner */}
      <div className="p-3 bg-[#060913] border-2 border-slate-700 shadow-pixel-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col">
            <span className="font-pixel text-[7px] text-slate-400 uppercase">KUOTA FINALIS:</span>
            <span className="font-pixel text-[10px] text-amber-400 font-bold">
              {finalistCount} FINALIS
            </span>
          </div>

          <div className="h-6 w-0.5 bg-slate-800 hidden sm:block" />

          <div className="flex flex-col">
            <span className="font-pixel text-[7px] text-slate-400 uppercase">TALENT POOL:</span>
            <span className="font-pixel text-[10px] text-slate-300 font-bold">
              {eliminatedCount} PESERTA
            </span>
          </div>

          <div className="h-6 w-0.5 bg-slate-800 hidden sm:block" />

          <div className="flex flex-col">
            <span className="font-pixel text-[7px] text-slate-400 uppercase">BOBOT NILAI:</span>
            <span className="font-mono text-xs text-amber-300">
              40% Kuis + 60% Tugas Juri
            </span>
          </div>
        </div>

        <button
          onClick={handleRecalculateSelection}
          className="rpg-btn rpg-btn-gold px-3.5 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer shadow-pixel-sm"
        >
          <ArrowsDownUp size={14} weight="bold" />
          <span>HITUNG ULANG NILAI</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-[#060913] border border-slate-800">
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => setSelectedPathFilter('all')}
            className={`px-2.5 py-1 text-xs font-rpg uppercase transition-all cursor-pointer ${
              selectedPathFilter === 'all'
                ? 'rpg-btn rpg-btn-gold text-[11px]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            SEMUA JALUR
          </button>
          {(Object.keys(OFFICIAL_PATHS) as PathCode[]).map(pCode => (
            <button
              key={pCode}
              onClick={() => setSelectedPathFilter(pCode)}
              className={`px-2.5 py-1 text-xs font-rpg uppercase transition-all cursor-pointer ${
                selectedPathFilter === pCode
                  ? 'rpg-btn rpg-btn-gold text-[11px]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {OFFICIAL_PATHS[pCode].title.toUpperCase()}
            </button>
          ))}
        </div>

        <span className="font-pixel text-[8px] text-slate-400">
          TOTAL: {filteredCandidates.length} PESERTA
        </span>
      </div>

      {/* Table */}
      <div className="border-2 border-slate-700 bg-[#060913] overflow-hidden shadow-pixel">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-700 bg-slate-950 font-pixel text-[8px] text-amber-400">
              <th className="p-2.5 text-center w-14">RANK</th>
              <th className="p-2.5">NAMA PESERTA</th>
              <th className="p-2.5 hidden sm:table-cell">KOTA</th>
              <th className="p-2.5">JALUR</th>
              <th className="p-2.5 text-right hidden md:table-cell">KUIS (40%)</th>
              <th className="p-2.5 text-right hidden md:table-cell">TUGAS (60%)</th>
              <th className="p-2.5 text-right">TOTAL SKOR</th>
              <th className="p-2.5 text-center">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 font-sans">
            {filteredCandidates.map(c => {
              const pathInfo = OFFICIAL_PATHS[c.pathCode];
              const isFinalist = c.decision === 'finalist';

              return (
                <tr 
                  key={c.enrollmentId}
                  className={`transition-colors ${
                    isFinalist ? 'bg-amber-950/40 text-amber-100' : 'hover:bg-slate-900/60 text-slate-300'
                  }`}
                >
                  <td className="p-2.5 text-center font-pixel text-[8px]">
                    <span className={isFinalist ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                      #{c.rankInPath}
                    </span>
                  </td>

                  <td className="p-2.5 font-semibold text-slate-100">
                    {c.participantName}
                  </td>

                  <td className="p-2.5 text-slate-400 hidden sm:table-cell font-mono text-[11px]">
                    {c.city}
                  </td>

                  <td className="p-2.5">
                    <span 
                      className="font-pixel text-[7px] px-1.5 py-0.5 border"
                      style={{
                        backgroundColor: `${pathInfo.themeColor}20`,
                        borderColor: pathInfo.themeColor,
                        color: pathInfo.themeColor
                      }}
                    >
                      {pathInfo.title}
                    </span>
                  </td>

                  <td className="p-2.5 text-right font-mono text-slate-300 hidden md:table-cell">
                    {c.quizScore}
                  </td>

                  <td className="p-2.5 text-right font-mono text-slate-300 hidden md:table-cell">
                    {c.missionScore}
                  </td>

                  <td className="p-2.5 text-right font-pixel text-[9px] text-amber-400">
                    {c.compositeScore}
                  </td>

                  <td className="p-2.5 text-center">
                    {isFinalist ? (
                      <span className="font-pixel text-[7px] px-2 py-0.5 bg-amber-500 text-slate-950 border border-amber-300 font-bold shadow-pixel-sm">
                        FINALIS 2026
                      </span>
                    ) : (
                      <span className="font-pixel text-[7px] px-1.5 py-0.5 bg-slate-800 text-slate-400 border border-slate-700">
                        TALENT POOL
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PixelModalFrame>
  );
};
