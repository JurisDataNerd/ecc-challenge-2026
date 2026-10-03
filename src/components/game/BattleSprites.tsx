import React from 'react';
import { PathCode, HeroGender } from '../../types';
import { getHeroCombatSprite, getSavedHeroGender } from '../../data/heroCharacters';

interface HeroBattleSpriteProps {
  pathCode: PathCode;
  gender?: HeroGender;
  actionState?: 'idle' | 'attack' | 'hit' | 'victory';
  size?: number;
}

export const HeroBattleSprite: React.FC<HeroBattleSpriteProps> = ({
  pathCode,
  gender,
  actionState = 'idle',
  size = 120
}) => {
  const activeGender = gender || getSavedHeroGender();
  const spriteUrl = getHeroCombatSprite(pathCode, activeGender);
  const isAttack = actionState === 'attack';
  const isHit = actionState === 'hit';
  const isVictory = actionState === 'victory';

  // Combat sheet rows: idle, attack, hit, victory.
  const rowY = isAttack ? -96 : isHit ? -192 : isVictory ? -288 : 0;
  const scale = (size / 96) * 1.5;

  return (
    <div 
      className={`relative flex items-center justify-center overflow-visible select-none ${
        isHit ? 'animate-bounce brightness-150' : ''
      } ${isVictory ? 'animate-pulse' : ''}`}
      style={{ width: size, height: size }}
    >
      {/* Subtle class-colored ground shadow */}
      <div 
        className="absolute bottom-2 w-16 h-4 rounded-full blur-[1px] opacity-40"
        style={{
          backgroundColor: pathCode === 'social_impact' ? '#059669' : pathCode === 'business' ? '#d97706' : '#2563eb'
        }}
      />

      {/* Dynamic Animated Pixel Art Sprite */}
      <div 
        className="w-40 h-24 origin-center"
        style={{
          transform: `translateX(-18px) scale(${scale})`,
          backgroundImage: `url('${spriteUrl}')`,
          backgroundPosition: `0px ${rowY}px`,
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
          animation: isAttack || isHit
            ? 'heroBattleAttack 0.45s steps(4) infinite'
            : 'heroBattleIdle 0.75s steps(4) infinite'
        }}
      />
      <style>{`
        @keyframes heroBattleIdle {
          from { background-position-x: 0px; }
          to { background-position-x: -640px; }
        }
        @keyframes heroBattleAttack {
          from { background-position-x: 0px; }
          to { background-position-x: -640px; }
        }
      `}</style>
    </div>
  );
};

interface EnemyBattleSpriteProps {
  enemyName: string;
  stageOrdinal: number;
  size?: number;
}

export const EnemyBattleSprite: React.FC<EnemyBattleSpriteProps> = ({
  enemyName,
  stageOrdinal,
  size = 115
}) => {
  // Stage 1: Challenger Asumsi (Magma Stone Golem)
  if (stageOrdinal === 1) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-xl animate-pulse">
        <ellipse cx="50" cy="90" rx="30" ry="7" fill="rgba(15,23,42,0.3)" />
        {/* Massive Rocky Torso */}
        <polygon points="30,30 70,30 80,75 20,75" fill="#475569" stroke="#1e293b" strokeWidth="2.5" />
        {/* Magma Fissures */}
        <path d="M38 35 Q44 50 36 65" stroke="#ea580c" strokeWidth="3" fill="none" />
        <path d="M60 38 Q52 54 62 70" stroke="#f59e0b" strokeWidth="3" fill="none" />
        {/* Stone Boulder Shoulders */}
        <circle cx="20" cy="38" r="14" fill="#334155" stroke="#1e293b" strokeWidth="2" />
        <circle cx="80" cy="38" r="14" fill="#334155" stroke="#1e293b" strokeWidth="2" />
        {/* Stone Head with Glowing Fiery Eyes */}
        <polygon points="40,15 60,15 66,32 34,32" fill="#1e293b" />
        <circle cx="45" cy="24" r="3" fill="#fde047" />
        <circle cx="55" cy="24" r="3" fill="#fde047" />
        {/* Massive Stone Fist */}
        <rect x="12" y="54" width="16" height="24" rx="4" fill="#334155" />
        <rect x="72" y="54" width="16" height="24" rx="4" fill="#334155" />
      </svg>
    );
  }

  // Stage 2: Phantom Armor / Clockwork
  if (stageOrdinal === 2) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-xl">
        <ellipse cx="50" cy="90" rx="26" ry="6" fill="rgba(15,23,42,0.25)" />
        {/* Spectral Indigo Mist */}
        <circle cx="50" cy="48" r="36" fill="none" stroke="#818cf8" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.6" />
        {/* Floating Phantom Knight Plate */}
        <path d="M34 32 L66 32 L62 68 L38 68 Z" fill="#312e81" stroke="#818cf8" strokeWidth="2" />
        {/* Spiked Dark Pauldrons */}
        <polygon points="26,26 36,36 22,42" fill="#4338ca" />
        <polygon points="74,26 64,36 78,42" fill="#4338ca" />
        {/* Spectral Visor */}
        <rect x="42" y="16" width="16" height="14" rx="3" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5" />
        <line x1="45" y1="23" x2="55" y2="23" stroke="#67e8f9" strokeWidth="2" />
        {/* Ghostly Claymore */}
        <path d="M74 10 L78 8 L82 10 L79 74 L75 74 Z" fill="#c7d2fe" stroke="#6366f1" strokeWidth="1.5" />
      </svg>
    );
  }

  // Stage 3: Dark Archon Sorcerer / Crypt Dragon
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-xl">
      <ellipse cx="50" cy="90" rx="28" ry="7" fill="rgba(15,23,42,0.3)" />
      {/* Void aura spikes */}
      <polygon points="50,4 42,22 58,22" fill="#581c87" />
      <polygon points="26,16 38,28 30,36" fill="#6b21a8" />
      <polygon points="74,16 62,28 70,36" fill="#6b21a8" />
      {/* Dark Cowl and Robes */}
      <path d="M32 34 Q18 72 24 88 L76 88 Q82 72 68 34 Z" fill="#2e1065" stroke="#a855f7" strokeWidth="2" />
      {/* Glowing purple eye within darkness */}
      <ellipse cx="50" cy="28" rx="10" ry="8" fill="#0f0728" />
      <circle cx="50" cy="28" r="3" fill="#e9d5ff" />
      {/* Floating Ancient Dark Grimoire */}
      <rect x="64" y="44" width="18" height="24" rx="2" fill="#4a044e" stroke="#f472b6" strokeWidth="1.5" transform="rotate(15 64 44)" />
    </svg>
  );
};

interface BossBattleSpriteProps {
  bossName: string;
  stageOrdinal: number;
  size?: number;
}

export const BossBattleSprite: React.FC<BossBattleSpriteProps> = ({
  bossName,
  stageOrdinal,
  size = 145
}) => {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className="drop-shadow-2xl">
      {/* Giant Shadow */}
      <ellipse cx="60" cy="110" rx="42" ry="9" fill="rgba(15,23,42,0.35)" />
      
      {/* Radiant Golden Divine Wings */}
      <path d="M60 45 Q20 10 10 35 Q15 70 54 65" fill="#f59e0b" opacity="0.85" stroke="#b45309" strokeWidth="2" />
      <path d="M60 45 Q100 10 110 35 Q105 70 66 65" fill="#f59e0b" opacity="0.85" stroke="#b45309" strokeWidth="2" />

      {/* Megalithic Armor Torso */}
      <polygon points="40,36 80,36 88,88 32,88" fill="#1e293b" stroke="#f59e0b" strokeWidth="2.5" />
      {/* Heart Furnace / Runic Core */}
      <circle cx="60" cy="56" r="14" fill="#059669" stroke="#34d399" strokeWidth="2.5" />
      <circle cx="60" cy="56" r="6" fill="#fef08a" />

      {/* Massive Stone Pauldrons */}
      <circle cx="28" cy="44" r="15" fill="#334155" stroke="#f59e0b" strokeWidth="2" />
      <circle cx="92" cy="44" r="15" fill="#334155" stroke="#f59e0b" strokeWidth="2" />

      {/* Crowned Archon Head */}
      <polygon points="50,14 70,14 74,34 46,34" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
      {/* Sun Ray Halo Crown */}
      <circle cx="60" cy="12" r="7" fill="#fef08a" />
      <polygon points="60,2 57,8 63,8" fill="#f59e0b" />
      <polygon points="48,5 50,11 55,9" fill="#f59e0b" />
      <polygon points="72,5 65,9 70,11" fill="#f59e0b" />

      {/* Great Scepter of Trials */}
      <rect x="96" y="16" width="6" height="84" rx="3" fill="#b45309" />
      <circle cx="99" cy="14" r="8" fill="#f59e0b" stroke="#fef08a" strokeWidth="2" />
    </svg>
  );
};

export const CraftpixCultistBattleSprite: React.FC<{ stageOrdinal: number; size?: number }> = ({ 
  stageOrdinal, 
  size = 125 
}) => {
  const cultistIdx = Math.min(6, Math.max(1, stageOrdinal));
  return (
    <div 
      className="relative flex items-center justify-center overflow-hidden drop-shadow-xl"
      style={{ width: size, height: size }}
    >
      <div 
        className="w-8 h-8 scale-[3.8] origin-center"
        style={{
          backgroundImage: `url('/assets/dungeon/Cultist${cultistIdx}_Idle.png')`,
          backgroundPosition: '0px 0px',
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated'
        }}
      />
    </div>
  );
};

export const CraftpixBossBattleSprite: React.FC<{ size?: number; isSummon?: boolean }> = ({ 
  size = 145, 
  isSummon = false 
}) => {
  return (
    <div 
      className="relative flex items-center justify-center overflow-hidden drop-shadow-2xl"
      style={{ width: size, height: size }}
    >
      <div 
        className="w-8 h-8 scale-[4.6] origin-center animate-pulse"
        style={{
          backgroundImage: isSummon 
            ? `url('/assets/dungeon/Leader_summon.png')` 
            : `url('/assets/dungeon/Leader_Idle.png')`,
          backgroundPosition: '0px 0px',
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated'
        }}
      />
    </div>
  );
};

export const CraftpixHeroBattleSprite: React.FC<{ pathCode?: PathCode; size?: number; actionState?: 'idle' | 'attack' }> = ({ 
  pathCode = 'professional', 
  size = 125,
  actionState = 'idle'
}) => {
  return <HeroBattleSprite pathCode={pathCode} size={size} actionState={actionState} />;
};

