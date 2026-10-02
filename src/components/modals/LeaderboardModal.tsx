import React, { useEffect, useState } from 'react';
import { 
  Trophy, 
  Crown, 
  Sparkle, 
  Medal,
  X
} from '@phosphor-icons/react';
import { PathCode } from '../../types';
import { OFFICIAL_PATHS } from '../../data/mockQuests';

interface LeaderboardEntry {
  rank: number;
  name: string;
  city: string;
  pathCode: PathCode;
  totalXp: number;
  missionsCompleted: number;
  stageReached: number;
  isCurrentUser?: boolean;
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'Bima Satria Wicaksono', city: 'Jakarta', pathCode: 'business', totalXp: 995, missionsCompleted: 3, stageReached: 3 },
  { rank: 2, name: 'Siti Nur Aisyah', city: 'Malang', pathCode: 'social_impact', totalXp: 990, missionsCompleted: 3, stageReached: 3 },
  { rank: 3, name: 'Raden Arya Baskoro', city: 'Yogyakarta', pathCode: 'professional', totalXp: 980, missionsCompleted: 3, stageReached: 3 },
  { rank: 4, name: 'Anisa Ristiyani', city: 'Solo', pathCode: 'business', totalXp: 960, missionsCompleted: 3, stageReached: 3 },
  { rank: 5, name: 'Fauzi Rahman', city: 'Semarang', pathCode: 'social_impact', totalXp: 950, missionsCompleted: 3, stageReached: 3 },
  { rank: 6, name: 'Dian Permata Kusuma', city: 'Surabaya', pathCode: 'professional', totalXp: 940, missionsCompleted: 3, stageReached: 3 },
  { rank: 7, name: 'Kuncoro Adi Pratama', city: 'Medan', pathCode: 'business', totalXp: 935, missionsCompleted: 3, stageReached: 3 },
  { rank: 8, name: 'Hendra Gunawan', city: 'Bandung', pathCode: 'professional', totalXp: 920, missionsCompleted: 3, stageReached: 3 },
  { rank: 9, name: 'Nadia Safitri', city: 'Makassar', pathCode: 'social_impact', totalXp: 910, missionsCompleted: 3, stageReached: 3 },
  { rank: 10, name: 'Fauzan Putra', city: 'Surabaya', pathCode: 'professional', totalXp: 510, missionsCompleted: 1, stageReached: 1, isCurrentUser: true },
  { rank: 11, name: 'Taufiq Hidayat', city: 'Semarang', pathCode: 'professional', totalXp: 480, missionsCompleted: 1, stageReached: 1 },
  { rank: 12, name: 'Dewi Lestari Utami', city: 'Denpasar', pathCode: 'social_impact', totalXp: 450, missionsCompleted: 1, stageReached: 1 },
  { rank: 13, name: 'Gilang Ramadhan', city: 'Palembang', pathCode: 'business', totalXp: 430, missionsCompleted: 1, stageReached: 1 }
];

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserPath: PathCode;
  currentUserTotalXp?: number;
  currentUserName?: string;
  currentUserCity?: string;
  currentUserStageReached?: number;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  currentUserPath,
  currentUserTotalXp = 50,
  currentUserName = 'Anda (Peserta)',
  currentUserCity = 'Yogyakarta',
  currentUserStageReached = 1
}) => {
  const [activeFilter, setActiveFilter] = useState<PathCode | 'all'>('all');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentEntry: LeaderboardEntry = {
    rank: 0,
    name: currentUserName,
    city: currentUserCity,
    pathCode: currentUserPath,
    totalXp: currentUserTotalXp,
    missionsCompleted: Math.min(4, currentUserStageReached),
    stageReached: currentUserStageReached,
    isCurrentUser: true
  };

  const combinedList = [
    ...MOCK_LEADERBOARD.filter(e => !e.isCurrentUser),
    currentEntry
  ];

  const filteredList = combinedList
    .filter(entry => activeFilter === 'all' || entry.pathCode === activeFilter)
    .sort((a, b) => b.totalXp - a.totalXp)
    .map((item, idx) => ({ ...item, displayRank: idx + 1 }));

  const top3 = filteredList.slice(0, 3);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-[#0b2d54]/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-4xl bg-white rounded-xl border-2 border-[#dce2ea] shadow-[0_20px_50px_rgba(11,45,84,0.25)] flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#f8fafc] border-b border-[#dce2ea] shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#fff8f5] border border-[#fbd38d] text-[#f26f21] flex items-center justify-center shadow-sm">
              <Trophy size={22} weight="fill" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-rpg text-xs font-bold uppercase px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-700">
                  LEADERBOARD
                </span>
                <span className="text-[11px] text-[#3b4f6d] font-sans hidden sm:inline">
                  SIAP IMPACT 2026
                </span>
              </div>
              <h2 className="font-rpg text-xl md:text-2xl font-bold text-[#0b2d54] tracking-wide mt-0.5">
                PAPAN PERINGKAT (LEADERBOARD)
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            title="Tutup (ESC)"
            className="w-9 h-9 rounded-lg bg-white border border-[#dce2ea] text-[#3b4f6d] hover:text-[#0b2d54] hover:border-[#f26f21] flex items-center justify-center transition-all cursor-pointer shadow-sm"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Track Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 bg-[#f8fafc] border-b border-[#dce2ea] shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3.5 py-1.5 text-xs font-rpg font-bold uppercase transition-all rounded-lg cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-[#f26f21] text-white border-2 border-[#d05814] shadow-[1px_1px_0_#0b2d54]'
                  : 'bg-white text-[#3b4f6d] hover:text-[#0b2d54] hover:bg-[#edf2f7] border border-[#dce2ea]'
              }`}
            >
              SEMUA JALUR
            </button>
            {(Object.keys(OFFICIAL_PATHS) as PathCode[]).map(pCode => (
              <button
                key={pCode}
                onClick={() => setActiveFilter(pCode)}
                className={`px-3.5 py-1.5 text-xs font-rpg font-bold uppercase transition-all rounded-lg cursor-pointer ${
                  activeFilter === pCode
                    ? 'bg-[#f26f21] text-white border-2 border-[#d05814] shadow-[1px_1px_0_#0b2d54]'
                    : 'bg-white text-[#3b4f6d] hover:text-[#0b2d54] hover:bg-[#edf2f7] border border-[#dce2ea]'
                }`}
              >
                {OFFICIAL_PATHS[pCode].title.toUpperCase()}
              </button>
            ))}
          </div>

          <span className="font-rpg text-xs text-[#3b4f6d] font-bold hidden sm:inline tracking-wider">
            TOTAL: {filteredList.length} PESERTA
          </span>
        </div>

        {/* Top 3 Champions Podium Display */}
        {top3.length >= 3 && (
          <div className="px-6 py-4 bg-[#f8fafc] border-b border-[#dce2ea] shrink-0">
            <div className="grid grid-cols-3 gap-3 md:gap-4 items-end">
              {/* 2nd Place */}
              <div className="flex flex-col items-center justify-center p-3 bg-white border-2 border-[#cbd5e1] rounded-xl shadow-sm">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 border border-slate-300 text-slate-600 mb-1.5">
                  <Medal size={18} weight="fill" />
                </div>
                <span className="font-rpg text-xs text-slate-600 font-bold tracking-wide">#2 PERINGKAT 2</span>
                <span className="font-rpg text-sm font-bold text-[#0b2d54] text-center truncate max-w-full mt-0.5">
                  {top3[1].name}
                </span>
                <span className="font-rpg text-xs text-[#f26f21] font-bold mt-1 bg-[#fff8f5] px-2 py-0.5 rounded-full border border-[#fbd38d]">
                  {top3[1].totalXp} XP
                </span>
              </div>

              {/* 1st Place Champion */}
              <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#fffaf0] to-white border-2 border-[#f6ad55] rounded-xl shadow-md relative -translate-y-1">
                <div className="w-9 h-9 rounded-full flex items-center justify-center bg-amber-500 border-2 border-amber-300 text-white shadow-sm mb-1.5">
                  <Crown size={20} weight="fill" />
                </div>
                <span className="font-rpg text-xs text-[#c05621] font-bold tracking-wide">#1 JUARA 1</span>
                <span className="font-rpg text-base font-bold text-[#0b2d54] text-center truncate max-w-full mt-0.5">
                  {top3[0].name}
                </span>
                <span className="font-rpg text-sm text-[#f26f21] font-bold mt-1 bg-[#fff8f5] px-3 py-0.5 rounded-full border border-[#fbd38d]">
                  {top3[0].totalXp} XP
                </span>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center justify-center p-3 bg-white border-2 border-[#cbd5e1] rounded-xl shadow-sm">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-amber-100 border border-amber-300 text-amber-800 mb-1.5">
                  <Medal size={18} weight="fill" />
                </div>
                <span className="font-rpg text-xs text-amber-800 font-bold tracking-wide">#3 PERINGKAT 3</span>
                <span className="font-rpg text-sm font-bold text-[#0b2d54] text-center truncate max-w-full mt-0.5">
                  {top3[2].name}
                </span>
                <span className="font-rpg text-xs text-[#f26f21] font-bold mt-1 bg-[#fff8f5] px-2 py-0.5 rounded-full border border-[#fbd38d]">
                  {top3[2].totalXp} XP
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="overflow-y-auto flex-1 p-6 bg-white">
          <div className="border border-[#dce2ea] rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-[#dce2ea] bg-[#f8fafc] font-rpg text-xs font-bold tracking-wider text-[#3b4f6d] uppercase">
                  <th className="p-3 text-center w-14">RANK</th>
                  <th className="p-3">NAMA PESERTA</th>
                  <th className="p-3 hidden sm:table-cell">KOTA</th>
                  <th className="p-3">JALUR</th>
                  <th className="p-3 text-center hidden md:table-cell">TUGAS</th>
                  <th className="p-3 text-right">TOTAL XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf2f7]">
                {filteredList.map((entry) => {
                  const pathInfo = OFFICIAL_PATHS[entry.pathCode];

                  return (
                    <tr 
                      key={`${entry.name}-${entry.rank}`}
                      className={`transition-colors ${
                        entry.isCurrentUser 
                          ? 'bg-[#fff8f5] border-l-4 border-l-[#f26f21] text-[#0b2d54] font-semibold' 
                          : 'hover:bg-[#f8fafc] text-[#0b2d54]'
                      }`}
                    >
                      <td className="p-3 text-center font-rpg text-sm font-bold">
                        {entry.displayRank === 1 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-800">#1</span>
                        ) : entry.displayRank === 2 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-700">#2</span>
                        ) : entry.displayRank === 3 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-100 text-orange-800">#3</span>
                        ) : (
                          <span className="text-[#718096]">#{entry.displayRank}</span>
                        )}
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-rpg text-sm font-bold text-[#0b2d54]">{entry.name}</span>
                          {entry.isCurrentUser && (
                            <span className="font-rpg text-[11px] px-2 py-0.5 rounded bg-[#f26f21] text-white font-bold shadow-sm">
                              ANDA
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3 text-[#4a5568] hidden sm:table-cell font-sans text-xs">
                        {entry.city}
                      </td>

                      <td className="p-3">
                        <span 
                          className="font-rpg text-xs font-bold px-2.5 py-1 rounded-full border shadow-sm"
                          style={{
                            backgroundColor: `${pathInfo.themeColor}15`,
                            borderColor: `${pathInfo.themeColor}40`,
                            color: pathInfo.themeColor
                          }}
                        >
                          {pathInfo.title}
                        </span>
                      </td>

                      <td className="p-3 text-center font-rpg text-xs font-bold text-[#4a5568] hidden md:table-cell">
                        {entry.missionsCompleted}/3
                      </td>

                      <td className="p-3 text-right font-rpg text-sm font-bold text-[#f26f21]">
                        <span className="flex items-center justify-end gap-1">
                          <Sparkle size={14} weight="fill" className="text-[#f26f21]" />
                          <span>{entry.totalXp} XP</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-[#f8fafc] border-t border-[#dce2ea] shrink-0">
          <span className="font-rpg text-xs text-[#b94d0d] font-bold tracking-wide">
            ★ 3 PERINGKAT TERATAS PER JALUR BERPELUANG MENUJU FINAL JAKARTA
          </span>
          <button
            onClick={onClose}
            className="button button-quiet px-5 py-2 text-xs font-rpg font-bold cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
