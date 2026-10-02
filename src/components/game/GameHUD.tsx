import React from 'react';
import { 
  Sparkle, 
  Heart, 
  Trophy, 
  UsersThree
} from '@phosphor-icons/react';
import { PathCode, UserRole } from '../../types';
import { OFFICIAL_PATHS, STAGE_CONFIGS } from '../../data/mockQuests';

interface GameHUDProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentPath: PathCode;
  currentStage: number;
  onSelectStage: (stage: number) => void;
  totalXp: number;
  playerHp?: number;
  onOpenTalentPool: () => void;
  onOpenLeaderboard: () => void;
  onOpenMentorPanel: () => void;
  onOpenAdminPanel: () => void;
  onOpenPathModal?: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  currentRole,
  setCurrentRole,
  currentPath,
  currentStage,
  onSelectStage,
  totalXp,
  playerHp = 100,
  onOpenTalentPool,
  onOpenLeaderboard,
  onOpenMentorPanel,
  onOpenAdminPanel,
  onOpenPathModal
}) => {
  const pathInfo = OFFICIAL_PATHS[currentPath];

  const classTitleMap: Record<PathCode, { roleTitle: string; badgeColor: string }> = {
    professional: { roleTitle: 'Ksatria Strategis (Knight)', badgeColor: '#38bdf8' },
    social_impact: { roleTitle: 'Mistikus Dampak (Mage)', badgeColor: '#34d399' },
    business: { roleTitle: 'Inovator Lincah (Assassin)', badgeColor: '#fbbf24' }
  };

  const currentClass = classTitleMap[currentPath] || classTitleMap.professional;
  const currentLevel = Math.max(1, Math.floor(totalXp / 200) + 1);
  const xpInCurrentLevel = totalXp % 200;
  const xpProgressPercent = Math.min(100, Math.round((xpInCurrentLevel / 200) * 100));

  const heroSpriteSrc = currentPath === 'social_impact'
    ? '/assets/dungeon/hero_mage_spritesheet.png'
    : currentPath === 'business'
    ? '/assets/dungeon/hero_assassin_spritesheet.png'
    : '/assets/dungeon/hero_knight_spritesheet.png';

  return (
    <header className="w-full flex items-center justify-between gap-3 p-2.5 md:p-3 bg-[#090e1a]/95 border-2 border-slate-700 shadow-pixel-lg relative select-none">
      {/* 4 Corner Studs */}
      <span className="rpg-corner-stud-tl" />
      <span className="rpg-corner-stud-tr" />
      <span className="rpg-corner-stud-bl" />
      <span className="rpg-corner-stud-br" />

      {/* Left: Hero Status & Pixel Portrait */}
      <div className="flex items-center gap-3">
        {/* Pixel Avatar Frame */}
        <div 
          onClick={onOpenPathModal}
          className="relative cursor-pointer hover:scale-105 active:scale-95 transition-transform"
          title="Klik untuk ganti jalur atau role karakter"
        >
          <div 
            className="w-12 h-12 flex items-center justify-center border-2 border-amber-500/80 shadow-[inset_0_0_8px_rgba(0,0,0,0.8),2px_2px_0px_#000] overflow-hidden relative"
            style={{ 
              backgroundColor: currentPath === 'social_impact' ? '#064e3b' : currentPath === 'business' ? '#4c0519' : '#1e3a8a' 
            }}
          >
            {/* Animated pixel art portrait frame */}
            <div 
              className="w-12 h-12 origin-center scale-[1.4] translate-y-1"
              style={{
                backgroundImage: `url('${heroSpriteSrc}')`,
                backgroundPosition: '0px 0px',
                backgroundRepeat: 'no-repeat',
                imageRendering: 'pixelated',
                animation: 'hudAvatarAnim 0.8s steps(4) infinite'
              }}
            />
          </div>

          <div className="absolute -bottom-1 -right-1 bg-slate-950 text-amber-400 font-pixel text-[8px] px-1 py-0.5 border border-amber-600 shadow-[1px_1px_0_#000] z-10">
            LV.{currentLevel}
          </div>
          <style>{`
            @keyframes hudAvatarAnim {
              from { background-position-x: 0px; }
              to { background-position-x: -192px; }
            }
          `}</style>
        </div>

        {/* Hero Name, Class & Vitals */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-rpg text-base md:text-lg font-bold text-amber-300 drop-shadow-[0_1px_0_#000]">
              FAUZAN
            </span>
            <button 
              onClick={onOpenPathModal}
              className="font-pixel text-[8px] px-1.5 py-0.5 border shadow-[1px_1px_0_#000] cursor-pointer hover:brightness-125 transition-all"
              style={{
                backgroundColor: `${currentClass.badgeColor}20`,
                borderColor: currentClass.badgeColor,
                color: currentClass.badgeColor
              }}
              title="Ganti Jalur"
            >
              {pathInfo.title}
            </button>
            <span className="text-[10px] font-mono text-slate-400 hidden lg:inline">
              ({currentClass.roleTitle})
            </span>
          </div>

          {/* Retro Pixel HP & XP Gauges */}
          <div className="flex items-center gap-3">
            {/* HP Bar */}
            <div className="flex items-center gap-1.5" title="Kesehatan (HP)">
              <Heart size={14} weight="fill" className="text-red-500 animate-pulse" />
              <div className="w-20 md:w-24 h-2.5 bg-slate-950 border border-slate-700 shadow-[inset_1px_1px_0_#000] p-0.5">
                <div 
                  className="bg-gradient-to-r from-red-600 to-rose-400 h-full transition-all duration-300"
                  style={{ width: `${playerHp}%` }}
                />
              </div>
              <span className="font-pixel text-[8px] text-red-400">
                {playerHp}
              </span>
            </div>

            {/* XP Bar */}
            <div className="flex items-center gap-1.5" title="Poin Pengalaman (XP)">
              <Sparkle size={14} weight="fill" className="text-amber-400" />
              <div className="w-20 md:w-24 h-2.5 bg-slate-950 border border-slate-700 shadow-[inset_1px_1px_0_#000] p-0.5">
                <div 
                  className="bg-gradient-to-r from-amber-600 to-yellow-300 h-full transition-all duration-300"
                  style={{ width: `${xpProgressPercent}%` }}
                />
              </div>
              <span className="font-pixel text-[8px] text-amber-400">
                {totalXp} XP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Center: Stage Switcher */}
      <div className="hidden md:flex items-center gap-1 p-1 bg-slate-950/80 border border-slate-800">
        {STAGE_CONFIGS.map(stage => {
          const isActive = stage.ordinal === currentStage;
          return (
            <button
              key={stage.ordinal}
              onClick={() => onSelectStage(stage.ordinal)}
              className={`px-2.5 py-1 text-xs font-rpg font-bold uppercase transition-all cursor-pointer ${
                isActive
                  ? 'rpg-btn rpg-btn-gold text-[11px]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
            >
              <span>TAHAP {stage.ordinal}</span>
            </button>
          );
        })}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Leaderboard Button */}
        <button
          onClick={onOpenLeaderboard}
          className="rpg-btn rpg-btn-gold px-2.5 py-1 text-xs flex items-center gap-1.5 cursor-pointer shadow-pixel-sm"
          title="Buka Papan Peringkat"
        >
          <Trophy size={14} weight="fill" className="text-slate-950" />
          <span className="font-rpg text-xs hidden sm:inline">PERINGKAT</span>
        </button>

        {/* Talent Pool Button */}
        <button
          onClick={onOpenTalentPool}
          className="rpg-btn rpg-btn-sapphire px-2.5 py-1 text-xs flex items-center gap-1.5 cursor-pointer shadow-pixel-sm"
          title="Buka Direktori Talenta"
        >
          <UsersThree size={14} weight="bold" />
          <span className="font-rpg text-xs hidden md:inline">TALENTA</span>
        </button>

        {/* Role Switcher */}
        <div className="flex items-center gap-0.5 bg-slate-950 p-1 border border-slate-800">
          <button
            onClick={() => setCurrentRole('participant')}
            className={`px-1.5 py-0.5 text-[10px] font-rpg uppercase transition-all cursor-pointer ${
              currentRole === 'participant' 
                ? 'bg-amber-500 text-slate-950 font-bold border border-amber-300' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            PESERTA
          </button>
          <button
            onClick={() => {
              setCurrentRole('mentor');
              onOpenMentorPanel();
            }}
            className={`px-1.5 py-0.5 text-[10px] font-rpg uppercase transition-all cursor-pointer ${
              currentRole === 'mentor' 
                ? 'bg-emerald-500 text-slate-950 font-bold border border-emerald-300' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            JURI
          </button>
          <button
            onClick={() => {
              setCurrentRole('admin');
              onOpenAdminPanel();
            }}
            className={`px-1.5 py-0.5 text-[10px] font-rpg uppercase transition-all cursor-pointer ${
              currentRole === 'admin' 
                ? 'bg-rose-500 text-slate-950 font-bold border border-rose-300' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ADMIN
          </button>
        </div>
      </div>
    </header>
  );
};
