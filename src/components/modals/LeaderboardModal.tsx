import React, { useState } from 'react';
import { 
  Trophy, 
  Crown, 
  Sparkle, 
  Medal
} from '@phosphor-icons/react';
import { PathCode } from '../../types';
import { OFFICIAL_PATHS } from '../../data/mockQuests';
import { PixelModalFrame } from '../ui/PixelModalFrame';

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
  if (!isOpen) return null;

  const [activeFilter, setActiveFilter] = useState<PathCode | 'all'>('all');

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
    <PixelModalFrame
      title="PAPAN PERINGKAT (LEADERBOARD)"
      subtitle="Akumulasi skor XP kuis dan tugas peserta SIAP IMPACT 2026"
      badge="LEADERBOARD"
      badgeColor="#f59e0b"
      icon={<Trophy size={20} weight="fill" />}
      onClose={onClose}
      variant="gold"
      maxWidth="max-w-4xl"
      footer={
        <>
          <span className="font-pixel text-[8px] text-amber-400">
            3 PERINGKAT TERATAS PER JALUR BERPELUANG MENUJU FINAL JAKARTA
          </span>
          <button
            onClick={onClose}
            className="rpg-btn rpg-btn-slate px-4 py-1.5 text-xs cursor-pointer"
          >
            TUTUP
          </button>
        </>
      }
    >
      {/* Track Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-[#060913] border-2 border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 text-xs font-rpg uppercase transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'rpg-btn rpg-btn-gold text-[11px]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
            }`}
          >
            SEMUA JALUR
          </button>
          {(Object.keys(OFFICIAL_PATHS) as PathCode[]).map(pCode => (
            <button
              key={pCode}
              onClick={() => setActiveFilter(pCode)}
              className={`px-3 py-1 text-xs font-rpg uppercase transition-all cursor-pointer ${
                activeFilter === pCode
                  ? 'rpg-btn rpg-btn-gold text-[11px]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
            >
              {OFFICIAL_PATHS[pCode].title.toUpperCase()}
            </button>
          ))}
        </div>

        <span className="font-pixel text-[8px] text-slate-400 hidden sm:inline">
          TOTAL: {filteredList.length} PESERTA
        </span>
      </div>

      {/* Top 3 Champions Podium Display */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 md:gap-3 p-3 bg-[#060913] border-2 border-amber-600/60 shadow-pixel-sm">
          {/* 2nd Place */}
          <div className="flex flex-col items-center justify-end p-2.5 bg-slate-950 border border-slate-600 shadow-[inset_1px_1px_0_#000]">
            <div className="w-8 h-8 flex items-center justify-center bg-slate-800 border border-slate-400 text-slate-200 shadow-pixel-sm mb-1">
              <Medal size={18} weight="fill" />
            </div>
            <span className="font-pixel text-[8px] text-slate-300">#2 PERINGKAT 2</span>
            <span className="font-rpg text-xs md:text-sm font-bold text-slate-100 text-center truncate max-w-full">
              {top3[1].name}
            </span>
            <span className="font-pixel text-[8px] text-amber-400 mt-0.5">
              {top3[1].totalXp} XP
            </span>
          </div>

          {/* 1st Place Champion */}
          <div className="flex flex-col items-center justify-end p-3 bg-amber-950/40 border-2 border-amber-400 shadow-pixel">
            <div className="w-9 h-9 flex items-center justify-center bg-amber-500 border-2 border-amber-300 text-slate-950 shadow-pixel-sm mb-1 animate-bounce">
              <Crown size={20} weight="fill" />
            </div>
            <span className="font-pixel text-[9px] text-amber-300 font-bold">#1 JUARA 1</span>
            <span className="font-rpg text-sm md:text-base font-bold text-amber-200 text-center truncate max-w-full">
              {top3[0].name}
            </span>
            <span className="font-pixel text-[9px] text-amber-300 font-bold mt-0.5">
              {top3[0].totalXp} XP
            </span>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center justify-end p-2.5 bg-slate-950 border border-amber-800 shadow-[inset_1px_1px_0_#000]">
            <div className="w-8 h-8 flex items-center justify-center bg-amber-900 border border-amber-600 text-amber-200 shadow-pixel-sm mb-1">
              <Medal size={18} weight="fill" />
            </div>
            <span className="font-pixel text-[8px] text-amber-600">#3 PERINGKAT 3</span>
            <span className="font-rpg text-xs md:text-sm font-bold text-slate-100 text-center truncate max-w-full">
              {top3[2].name}
            </span>
            <span className="font-pixel text-[8px] text-amber-400 mt-0.5">
              {top3[2].totalXp} XP
            </span>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="border-2 border-slate-700 bg-[#060913] overflow-hidden shadow-pixel">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-700 bg-slate-950 font-pixel text-[8px] text-amber-400">
              <th className="p-2.5 text-center w-14">RANK</th>
              <th className="p-2.5">NAMA PESERTA</th>
              <th className="p-2.5 hidden sm:table-cell">KOTA</th>
              <th className="p-2.5">JALUR</th>
              <th className="p-2.5 text-center hidden md:table-cell">TUGAS</th>
              <th className="p-2.5 text-right">TOTAL XP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 font-sans">
            {filteredList.map((entry) => {
              const pathInfo = OFFICIAL_PATHS[entry.pathCode];

              return (
                <tr 
                  key={`${entry.name}-${entry.rank}`}
                  className={`transition-colors ${
                    entry.isCurrentUser 
                      ? 'bg-amber-950/50 border-l-4 border-l-amber-400 text-amber-100' 
                      : 'hover:bg-slate-900/60 text-slate-200'
                  }`}
                >
                  <td className="p-2.5 text-center font-pixel text-[8px]">
                    {entry.displayRank === 1 ? (
                      <span className="text-amber-400">#1</span>
                    ) : entry.displayRank === 2 ? (
                      <span className="text-slate-300">#2</span>
                    ) : entry.displayRank === 3 ? (
                      <span className="text-amber-600">#3</span>
                    ) : (
                      <span className="text-slate-500">#{entry.displayRank}</span>
                    )}
                  </td>

                  <td className="p-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{entry.name}</span>
                      {entry.isCurrentUser && (
                        <span className="font-pixel text-[7px] px-1 py-0.5 bg-amber-500 text-slate-950 border border-amber-300 font-bold">
                          ANDA
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="p-2.5 text-slate-400 hidden sm:table-cell font-mono text-[11px]">
                    {entry.city}
                  </td>

                  <td className="p-2.5">
                    <span 
                      className="font-pixel text-[8px] px-1.5 py-0.5 border shadow-pixel-sm"
                      style={{
                        backgroundColor: `${pathInfo.themeColor}20`,
                        borderColor: pathInfo.themeColor,
                        color: pathInfo.themeColor
                      }}
                    >
                      {pathInfo.title}
                    </span>
                  </td>

                  <td className="p-2.5 text-center font-pixel text-[8px] text-slate-400 hidden md:table-cell">
                    {entry.missionsCompleted}/3
                  </td>

                  <td className="p-2.5 text-right font-pixel text-[9px] text-amber-400">
                    <span className="flex items-center justify-end gap-1">
                      <Sparkle size={12} weight="fill" className="text-amber-400" />
                      <span>{entry.totalXp} XP</span>
                    </span>
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
