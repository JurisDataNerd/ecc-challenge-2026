import React, { useState } from 'react';
import { 
  UsersThree, 
  MagnifyingGlass, 
  MapPin, 
  Sparkle, 
  Crown, 
  Target
} from '@phosphor-icons/react';
import { TalentProfile } from '../../data/mockParticipants';
import { PathCode } from '../../types';
import { OFFICIAL_PATHS } from '../../data/mockQuests';
import { PixelModalFrame } from '../ui/PixelModalFrame';

interface TalentPoolViewProps {
  isOpen: boolean;
  onClose: () => void;
  talentPool: TalentProfile[];
}

export const TalentPoolView: React.FC<TalentPoolViewProps> = ({
  isOpen,
  onClose,
  talentPool
}) => {
  if (!isOpen) return null;

  const [selectedPathFilter, setSelectedPathFilter] = useState<PathCode | 'all'>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'finalist' | 'eliminated'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTalents = talentPool.filter(t => {
    if (selectedPathFilter !== 'all' && t.pathCode !== selectedPathFilter) return false;
    if (selectedStatusFilter !== 'all' && t.status !== selectedStatusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = t.name.toLowerCase().includes(q);
      const matchCity = t.city.toLowerCase().includes(q);
      const matchSkills = t.skills.some(s => s.toLowerCase().includes(q));
      if (!matchName && !matchCity && !matchSkills) return false;
    }
    return true;
  });

  return (
    <PixelModalFrame
      title="DIREKTORI TALENTA (TALENT POOL)"
      subtitle="Daftar profil dan portofolio peserta SIAP IMPACT 2026 (Mitra Rekrutmen & Alumni)"
      badge="TALENT POOL"
      badgeColor="#38bdf8"
      icon={<UsersThree size={20} weight="fill" />}
      onClose={onClose}
      variant="gold"
      maxWidth="max-w-6xl"
      footer={
        <>
          <span className="font-pixel text-[8px] text-slate-400">
            SELURUH PESERTA TERDAFTAR MEMILIKI REKAM JEJAK PORTOFOLIO RESMI ECC
          </span>
          <button
            onClick={onClose}
            className="rpg-btn rpg-btn-slate px-4 py-2 text-xs cursor-pointer"
          >
            TUTUP
          </button>
        </>
      }
    >
      {/* Search and Filters Bar */}
      <div className="p-3 bg-[#060913] border-2 border-slate-700 shadow-pixel-sm flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative min-w-[240px] flex-1 max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama peserta, kota, keahlian..."
            className="w-full pl-8 pr-3 py-1.5 bg-[#03060c] border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 shadow-[inset_1px_1px_0_#000] font-sans"
          />
          <MagnifyingGlass size={15} className="absolute left-2.5 top-2 text-slate-400" />
        </div>

        {/* Path Filter Tabs */}
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

        {/* Status Filter */}
        <div className="flex items-center gap-0.5 bg-slate-950 p-1 border border-slate-800">
          <button
            onClick={() => setSelectedStatusFilter('all')}
            className={`px-2 py-0.5 text-[10px] font-rpg uppercase transition-all cursor-pointer ${
              selectedStatusFilter === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold border border-amber-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            SEMUA
          </button>
          <button
            onClick={() => setSelectedStatusFilter('finalist')}
            className={`px-2 py-0.5 text-[10px] font-rpg uppercase transition-all cursor-pointer ${
              selectedStatusFilter === 'finalist'
                ? 'bg-amber-500 text-slate-950 font-bold border border-amber-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            9 FINALIS
          </button>
          <button
            onClick={() => setSelectedStatusFilter('eliminated')}
            className={`px-2 py-0.5 text-[10px] font-rpg uppercase transition-all cursor-pointer ${
              selectedStatusFilter === 'eliminated'
                ? 'bg-amber-500 text-slate-950 font-bold border border-amber-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ALUMNI
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 overflow-y-auto">
        {filteredTalents.map(talent => {
          const pathInfo = OFFICIAL_PATHS[talent.pathCode];
          const isFinalist = talent.status === 'finalist';

          return (
            <div
              key={talent.id}
              className={`p-3.5 border-2 flex flex-col justify-between gap-3 relative transition-all ${
                isFinalist 
                  ? 'bg-slate-950 border-amber-500/90 shadow-pixel' 
                  : 'bg-[#060913] border-slate-800 hover:border-slate-700 shadow-pixel-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span 
                    className="font-pixel text-[8px] px-1.5 py-0.5 border"
                    style={{
                      backgroundColor: `${pathInfo.themeColor}20`,
                      borderColor: pathInfo.themeColor,
                      color: pathInfo.themeColor
                    }}
                  >
                    {pathInfo.title}
                  </span>

                  {isFinalist ? (
                    <span className="flex items-center gap-1 font-pixel text-[7px] px-1.5 py-0.5 bg-amber-500 text-slate-950 border border-amber-300 font-bold">
                      <Crown size={12} weight="fill" />
                      <span>9 FINALIS</span>
                    </span>
                  ) : (
                    <span className="font-pixel text-[7px] px-1.5 py-0.5 bg-slate-900 text-slate-400 border border-slate-700">
                      ALUMNI TAHAP {talent.stageReached}
                    </span>
                  )}
                </div>

                <div className="mt-2.5">
                  <h4 className="font-rpg text-base font-bold text-slate-100">
                    {talent.name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 font-mono">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-amber-500" />
                      <span>{talent.city}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-pixel text-[8px] text-amber-400">
                      <Sparkle size={12} weight="fill" />
                      <span>{talent.totalXp} XP</span>
                    </span>
                  </div>
                </div>

                {/* Direction Card */}
                <div className="mt-2.5 p-2 bg-[#03060c] border border-slate-800 flex flex-col gap-0.5">
                  <div className="flex items-center gap-1 font-pixel text-[7px] text-amber-400 uppercase">
                    <Target size={11} weight="bold" />
                    <span>FOKUS INISIATIF:</span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans line-clamp-2 leading-relaxed">
                    {talent.direction}
                  </p>
                </div>

                {/* Skills Chips */}
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {talent.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="font-pixel text-[7px] px-1.5 py-0.5 bg-slate-900 border border-slate-700 text-slate-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Badges footer */}
              <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-1">
                {talent.badges.map((b, bIdx) => (
                  <span 
                    key={bIdx}
                    className="font-pixel text-[7px] px-1.5 py-0.5 bg-emerald-950/60 border border-emerald-600/60 text-emerald-300"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </PixelModalFrame>
  );
};
