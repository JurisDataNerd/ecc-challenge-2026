import React, { useState } from 'react';
import { 
  Lock, 
  ArrowRight,
  Target,
  Compass
} from '@phosphor-icons/react';
import { PathCode, FutureBase } from '../../types';
import { OFFICIAL_PATHS } from '../../data/mockQuests';
import { PixelModalFrame } from '../ui/PixelModalFrame';

interface PathSelectionModalProps {
  isOpen: boolean;
  onConfirmPath: (pathCode: PathCode, futureBase: FutureBase) => void;
  onClose?: () => void;
}

export const PathSelectionModal: React.FC<PathSelectionModalProps> = ({
  isOpen,
  onConfirmPath,
  onClose
}) => {
  if (!isOpen) return null;

  const [selectedPath, setSelectedPath] = useState<PathCode>('professional');
  const [direction, setDirection] = useState<string>('Mengembangkan kepemimpinan operasional dan manajemen strategis');
  const [target90d, setTarget90d] = useState<string>('Menyelesaikan program percontohan dengan validasi lapangan');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['Analisis Masalah', 'Kepemimpinan']);
  const [isLockedWarningAccepted, setIsLockedWarningAccepted] = useState<boolean>(false);

  const availableSkillOptions = [
    'Analisis Masalah',
    'Kepemimpinan',
    'Wawancara Lapangan',
    'Perancangan Prototipe',
    'Model Bisnis Terukur',
    'Pengukuran Dampak SROI',
    'Presentasi Eksekutif',
    'Manajemen Risiko'
  ];

  const handleToggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(prev => prev.filter(s => s !== skill));
    } else {
      if (selectedSkills.length < 4) {
        setSelectedSkills(prev => [...prev, skill]);
      }
    }
  };

  const handleConfirm = () => {
    if (!isLockedWarningAccepted) return;
    onConfirmPath(selectedPath, {
      direction,
      target90d,
      skills: selectedSkills,
      support: 'Bimbingan mentor berkala dan akses jaringan industri'
    });
  };

  return (
    <PixelModalFrame
      title="PILIH JALUR & ROLE KARAKTER"
      subtitle="Pilih jalur spesialisasi Anda di SIAP IMPACT 2026. Karakter game akan berubah sesuai jalur yang dipilih."
      badge="ONBOARDING"
      badgeColor="#38bdf8"
      icon={<Compass size={20} weight="fill" />}
      onClose={onClose || (() => {})}
      variant="gold"
      maxWidth="max-w-5xl"
      footer={
        <>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <Lock size={15} className="text-amber-400" />
            <span className="font-pixel text-[8px] text-amber-300">
              JALUR DIPILIH: {OFFICIAL_PATHS[selectedPath].title.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {onClose && (
              <button
                onClick={onClose}
                className="rpg-btn rpg-btn-slate px-4 py-2 text-xs cursor-pointer"
              >
                KEMBALI
              </button>
            )}

            <button
              onClick={handleConfirm}
              disabled={!isLockedWarningAccepted}
              className="rpg-btn rpg-btn-emerald px-5 py-2 text-xs flex items-center gap-2 cursor-pointer disabled:opacity-40 shadow-pixel"
            >
              <span>SIMPAN & MULAI</span>
              <ArrowRight size={14} weight="bold" />
            </button>
          </div>
        </>
      }
    >
      {/* 3 RPG Class Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        {Object.values(OFFICIAL_PATHS).map((path) => {
          const isSelected = selectedPath === path.code;
          const spriteSrc = path.code === 'social_impact'
            ? '/assets/dungeon/hero_mage_spritesheet.png'
            : path.code === 'business'
            ? '/assets/dungeon/hero_assassin_spritesheet.png'
            : '/assets/dungeon/hero_knight_spritesheet.png';

          return (
            <div
              key={path.code}
              onClick={() => setSelectedPath(path.code)}
              className={`p-3.5 border-2 cursor-pointer transition-all flex flex-col justify-between relative ${
                isSelected
                  ? 'bg-slate-900 border-amber-400 shadow-pixel ring-1 ring-amber-400/50'
                  : 'bg-[#060913] border-slate-800 hover:border-slate-600'
              }`}
            >
              {/* Selected Tag */}
              {isSelected && (
                <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-amber-500 text-slate-950 font-pixel text-[7px] font-bold border border-amber-300 shadow-pixel-sm">
                  PILIHAN
                </div>
              )}

              <div>
                <span 
                  className="font-pixel text-[8px] uppercase px-1.5 py-0.5 border shadow-[1px_1px_0_#000]"
                  style={{ 
                    backgroundColor: `${path.themeColor}20`,
                    borderColor: path.themeColor,
                    color: path.themeColor
                  }}
                >
                  {path.accentBadge}
                </span>

                <h3 className="font-rpg text-base md:text-lg font-bold text-amber-300 mt-2 drop-shadow-[0_1px_0_#000]">
                  {path.title}
                </h3>
                <p className="font-pixel text-[8px] text-slate-400 mt-0.5">
                  ROLE: {path.archetypeRole.toUpperCase()}
                </p>

                {/* Animated Class Pixel Sprite Preview */}
                <div className="my-3 flex items-center justify-center h-24 bg-[#03060c] border-2 border-slate-700 shadow-[inset_1px_1px_0_#000] relative overflow-hidden">
                  <div 
                    className="w-12 h-12 origin-center scale-[1.75]"
                    style={{
                      backgroundImage: `url('${spriteSrc}')`,
                      backgroundPosition: '0px 0px',
                      backgroundRepeat: 'no-repeat',
                      imageRendering: 'pixelated',
                      animation: 'cardAvatarAnim 0.75s steps(4) infinite'
                    }}
                  />
                </div>

                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {path.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between font-mono text-[10px] text-slate-400">
                <span>Fokus:</span>
                <span className="font-semibold text-amber-400">{path.subtitle}</span>
              </div>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes cardAvatarAnim {
          from { background-position-x: 0px; }
          to { background-position-x: -192px; }
        }
      `}</style>

      {/* Future Base Form Inputs */}
      <div className="p-4 bg-[#060913] border-2 border-slate-800 flex flex-col gap-3 shadow-pixel-sm">
        <div className="flex items-center gap-2 font-pixel text-[8px] text-amber-400">
          <Target size={16} weight="bold" />
          <span>KOMITMEN 90 HARI (FUTURE BASE):</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="font-pixel text-[8px] text-slate-300 uppercase">
              ARAH KARIER / INISIATIF *
            </label>
            <input
              type="text"
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              placeholder="Contoh: Mengembangkan inisiatif produk digital..."
              className="px-3 py-2 bg-[#03060c] border-2 border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 shadow-[inset_1px_1px_0_#000] font-sans"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-pixel text-[8px] text-slate-300 uppercase">
              TARGET CAPAIAN 90 HARI *
            </label>
            <input
              type="text"
              value={target90d}
              onChange={(e) => setTarget90d(e.target.value)}
              placeholder="Contoh: Menguji prototipe dengan 30 pengguna nyata..."
              className="px-3 py-2 bg-[#03060c] border-2 border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 shadow-[inset_1px_1px_0_#000] font-sans"
            />
          </div>
        </div>

        {/* Priority Skills Badges */}
        <div className="flex flex-col gap-1.5">
          <label className="font-pixel text-[8px] text-slate-300 uppercase">
            PILIH 2 - 4 KEAHLIAN YANG INGIN DIKEMBANGKAN:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {availableSkillOptions.map(skill => {
              const isChecked = selectedSkills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleToggleSkill(skill)}
                  className={`px-2.5 py-1 text-xs font-mono transition-all cursor-pointer ${
                    isChecked
                      ? 'rpg-btn rpg-btn-emerald text-[11px]'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-700'
                  }`}
                >
                  {skill}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Confirmation Notice */}
      <div className="p-3 bg-amber-950/40 border-2 border-amber-600/70 flex items-start gap-3 shadow-pixel-sm">
        <Lock size={20} weight="bold" className="text-amber-400 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1.5">
          <span className="font-pixel text-[8px] text-amber-300 font-bold">
            KONFIRMASI PEMILIHAN JALUR:
          </span>
          <p className="text-xs text-amber-200/90 leading-relaxed font-sans">
            Jalur <strong className="text-amber-300 font-bold">{OFFICIAL_PATHS[selectedPath].title}</strong> akan disimpan di profil Anda. Karakter di dalam peta game akan langsung menyesuaikan wujud dan role pilihan ini.
          </p>
          <label className="flex items-center gap-2 cursor-pointer mt-1">
            <input
              type="checkbox"
              checked={isLockedWarningAccepted}
              onChange={(e) => setIsLockedWarningAccepted(e.target.checked)}
              className="w-4 h-4 bg-slate-900 border-2 border-amber-500 rounded-none cursor-pointer"
            />
            <span className="text-xs text-amber-100 font-semibold font-sans">
              Saya mengonfirmasi pilihan jalur ini dan siap memulai misi.
            </span>
          </label>
        </div>
      </div>
    </PixelModalFrame>
  );
};
