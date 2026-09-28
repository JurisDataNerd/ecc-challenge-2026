import React, { useState } from 'react';
import { 
  Sword, 
  Sparkle, 
  CheckCircle, 
  X, 
  Lightning
} from '@phosphor-icons/react';
import confetti from 'canvas-confetti';
import { QuizQuestion, PathCode } from '../../types';
import { HeroBattleSprite, CraftpixCultistBattleSprite } from '../game/BattleSprites';

interface InteractiveQuizModalProps {
  quiz: QuizQuestion | null;
  currentPath?: PathCode;
  onClose: () => void;
  onSuccess: (quizId: string, xpReward: number) => void;
}

export const InteractiveQuizModal: React.FC<InteractiveQuizModalProps> = ({
  quiz,
  currentPath = 'professional',
  onClose,
  onSuccess
}) => {
  if (!quiz) return null;

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [playerHp, setPlayerHp] = useState<number>(100);
  const [enemyHp, setEnemyHp] = useState<number>(100);
  const [battleLog, setBattleLog] = useState<string>(
    `${quiz.enemyName} muncul! Pilih jawaban yang paling tepat untuk mengalahkannya.`
  );
  const [playerActionState, setPlayerActionState] = useState<'idle' | 'attack' | 'hit'>('idle');
  const [enemyActionState, setEnemyActionState] = useState<'idle' | 'attack' | 'hit' | 'defeated'>('idle');
  const [damageNumber, setDamageNumber] = useState<{ text: string; color: string; isCrit?: boolean } | null>(null);
  const [slashEffect, setSlashEffect] = useState<boolean>(false);
  const [hasResolved, setHasResolved] = useState<boolean>(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);

  const selectedOption = quiz.options.find(o => o.id === selectedOptionId);

  const handleSelectOption = (optionId: string) => {
    if (hasResolved && isAnswerCorrect) return;
    setSelectedOptionId(optionId);
  };

  const handleExecuteAttack = () => {
    if (!selectedOption) return;

    const correct = selectedOption.isCorrect;
    setIsAnswerCorrect(correct);

    if (correct) {
      setPlayerActionState('attack');
      setBattleLog(`Fauzan menjawab: "${selectedOption.text.substring(0, 50)}..."`);

      setTimeout(() => {
        setSlashEffect(true);
        setEnemyActionState('hit');
        setDamageNumber({ text: 'BENAR!', color: '#16a34a', isCrit: true });
        setEnemyHp(0);

        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.5 }
        });

        setTimeout(() => {
          setSlashEffect(false);
          setPlayerActionState('idle');
          setEnemyActionState('defeated');
          setDamageNumber(null);
          setBattleLog(`Jawaban benar! ${quiz.enemyName} berhasil dikalahkan.`);
          setHasResolved(true);
        }, 500);
      }, 350);

    } else {
      setPlayerActionState('attack');
      setBattleLog(`Jawaban kurang tepat. Periksa kembali pertanyaan studi kasusnya.`);

      setTimeout(() => {
        setPlayerActionState('idle');
        setEnemyActionState('attack');

        setTimeout(() => {
          setEnemyActionState('idle');
          setPlayerActionState('hit');
          setDamageNumber({ text: 'SALAH (-25 HP)', color: '#ea580c' });
          setPlayerHp(prev => Math.max(15, prev - 25));

          setTimeout(() => {
            setPlayerActionState('idle');
            setDamageNumber(null);
            setBattleLog(`Jawaban salah! HP berkurang 25. Silakan pilih jawaban lain.`);
            setHasResolved(true);
          }, 450);
        }, 350);
      }, 300);
    }
  };

  const handleClaimVictory = () => {
    onSuccess(quiz.id, quiz.xpReward);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-5 bg-slate-950/85 backdrop-blur-sm select-none">
      <div className="w-full max-w-4xl rpg-window-gold rounded-none flex flex-col max-h-[96vh] overflow-hidden text-slate-100">
        
        {/* 4 Golden Corner Rivets */}
        <span className="rpg-corner-stud-tl" />
        <span className="rpg-corner-stud-tr" />
        <span className="rpg-corner-stud-bl" />
        <span className="rpg-corner-stud-br" />

        {/* Top Arena Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b-2 border-amber-600/70 bg-gradient-to-r from-[#172033] via-[#0f172a] to-[#172033]">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 bg-red-500 animate-ping shadow-[0_0_8px_#ef4444]" />
            <span className="font-pixel text-[9px] uppercase tracking-wider text-amber-400 font-bold">
              KUIS TAHAP {quiz.stageOrdinal}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-pixel text-[9px] text-amber-300 bg-amber-950/80 border border-amber-600 px-2.5 py-1 shadow-pixel-sm">
              +{quiz.xpReward} XP
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

        {/* Turn-Based Battle Stage (Classic Final Fantasy Layout) */}
        <div 
          className="relative w-full h-64 md:h-72 bg-slate-950 border-b-2 border-slate-700 overflow-hidden flex items-center justify-between px-8 md:px-16 bg-cover bg-center"
          style={{ backgroundImage: "url('/assets/dungeon/custom_battle_bg.png')" }}
        >
          {/* Dungeon Arena Environment Props */}
          <div className="absolute left-6 top-6 flex flex-col items-center opacity-70">
            <div className="w-3.5 h-5 bg-amber-500 rounded-full blur-[2px] animate-pulse" />
            <div className="w-4 h-24 bg-slate-800 border-x border-slate-700" />
          </div>
          <div className="absolute right-6 top-6 flex flex-col items-center opacity-70">
            <div className="w-3.5 h-5 bg-amber-500 rounded-full blur-[2px] animate-pulse" />
            <div className="w-4 h-24 bg-slate-800 border-x border-slate-700" />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/90 to-transparent border-t border-slate-700/40" />

          {/* SISI KIRI: MUSUH (ENEMY SIDE) */}
          <div className="relative z-10 flex flex-col items-center gap-2">
            
            {/* Enemy HP Plate */}
            <div className="bg-slate-950 border-2 border-red-700/80 px-3 py-1.5 shadow-pixel flex flex-col gap-1 w-44">
              <div className="flex items-center justify-between font-pixel text-[8px]">
                <span className="text-red-400 truncate max-w-[100px] uppercase">{quiz.enemyName}</span>
                <span className="text-slate-300">{enemyHp}/100</span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 overflow-hidden border border-slate-700 p-0.5">
                <div 
                  className="bg-gradient-to-r from-red-600 to-amber-500 h-full transition-all duration-500"
                  style={{ width: `${enemyHp}%` }}
                />
              </div>
            </div>

            {/* Enemy Battle Sprite */}
            <div className={`relative transition-all duration-300 ${
              enemyActionState === 'attack' ? 'translate-x-12 scale-110' : ''
            } ${enemyActionState === 'hit' ? '-translate-x-4 brightness-150' : ''} ${
              enemyActionState === 'defeated' ? 'opacity-20 scale-75 blur-sm' : ''
            }`}>
              <CraftpixCultistBattleSprite stageOrdinal={quiz.stageOrdinal} size={135} />
              
              {/* Slash Strike Animation Over Enemy */}
              {slashEffect && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-36 h-2 bg-white shadow-[0_0_20px_#38bdf8] rotate-45 transform animate-ping" />
                  <div className="w-36 h-2 bg-amber-400 shadow-[0_0_20px_#f59e0b] -rotate-45 transform animate-ping" />
                </div>
              )}

              {/* Damage Floating Indicator */}
              {damageNumber && damageNumber.isCrit && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-emerald-600 text-white font-pixel text-[10px] px-2.5 py-1 shadow-pixel-lg border-2 border-amber-300 animate-bounce">
                  {damageNumber.text}
                </div>
              )}
            </div>
          </div>

          {/* SISI KANAN: HERO (PLAYER SIDE) */}
          <div className="relative z-10 flex flex-col items-center gap-2">
            
            {/* Player HP Plate */}
            <div className="bg-slate-950 border-2 border-emerald-700/80 px-3 py-1.5 shadow-pixel flex flex-col gap-1 w-44">
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

            {/* Hero Battle Sprite */}
            <div className={`relative transition-all duration-300 ${
              playerActionState === 'attack' ? '-translate-x-16 scale-110' : ''
            } ${playerActionState === 'hit' ? 'translate-x-4 brightness-150' : ''}`}>
              <HeroBattleSprite pathCode={currentPath} actionState={playerActionState} size={125} />

              {/* Player Damage Indicator */}
              {damageNumber && !damageNumber.isCrit && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-orange-600 text-white font-pixel text-[9px] px-2 py-0.5 border border-white shadow-pixel animate-bounce">
                  {damageNumber.text}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Retro Dialogue Battle Log Box */}
        <div className="px-5 py-2.5 bg-[#050811] border-b-2 border-slate-800 flex items-center gap-2.5 text-xs font-mono text-amber-200">
          <Lightning size={16} weight="fill" className="text-amber-400 shrink-0" />
          <span className="font-rpg text-sm tracking-wide text-amber-300 truncate">
            {battleLog}
          </span>
        </div>

        {/* Command Menu & Tactics Selection */}
        <div className="p-4 md:p-5 overflow-y-auto flex flex-col gap-3.5 bg-[#0a0f1d] flex-1">
          
          {/* Question Prompt */}
          <div className="p-3 bg-[#060913] border-2 border-slate-700 shadow-pixel-sm flex flex-col gap-1">
            <span className="font-pixel text-[8px] text-amber-400 uppercase tracking-wider">
              PERTANYAAN:
            </span>
            <p className="text-xs md:text-sm font-medium text-slate-100 leading-relaxed font-sans">
              {quiz.question}
            </p>
          </div>

          {/* Options List */}
          <div className="flex flex-col gap-2">
            <span className="font-pixel text-[8px] text-slate-400 uppercase tracking-wider">
              PILIHAN JAWABAN:
            </span>

            {quiz.options.map(option => {
              const isSelected = selectedOptionId === option.id;
              let cardClass = 'bg-[#060913] border-2 border-slate-800 hover:border-slate-600 hover:bg-slate-900/80';

              if (isSelected) {
                cardClass = 'bg-amber-950/40 border-2 border-amber-500 shadow-pixel text-amber-100';
              }

              if (hasResolved && option.isCorrect) {
                cardClass = 'bg-emerald-950/60 border-2 border-emerald-400 text-emerald-200 shadow-pixel';
              }

              return (
                <button
                  key={option.id}
                  onClick={() => handleSelectOption(option.id)}
                  disabled={hasResolved && isAnswerCorrect === true}
                  className={`w-full text-left p-2.5 md:p-3 transition-all flex items-start justify-between gap-3 text-xs md:text-sm cursor-pointer ${cardClass}`}
                >
                  <div className="flex items-start gap-2.5">
                    {/* Retro Pointer Cursor */}
                    <span className="font-pixel text-[9px] text-amber-400 shrink-0 mt-0.5">
                      {isSelected ? '▶' : ' '}
                    </span>

                    <span className="font-pixel text-[8px] px-1.5 py-0.5 bg-slate-900 border border-slate-700 text-amber-400 shrink-0 mt-0.5">
                      {option.id.replace('opt-', '').toUpperCase()}
                    </span>

                    <span className="leading-relaxed text-slate-200 font-sans">
                      {option.text}
                    </span>
                  </div>
                  {hasResolved && option.isCorrect && (
                    <CheckCircle size={18} weight="fill" className="text-emerald-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation if answered */}
          {hasResolved && selectedOption && (
            <div className="p-3 bg-[#061e14] border-2 border-emerald-600/70 text-emerald-200 text-xs leading-relaxed flex flex-col gap-1 shadow-pixel-sm">
              <span className="font-pixel text-[8px] text-emerald-400 flex items-center gap-1.5">
                <CheckCircle size={14} weight="fill" />
                <span>PENJELASAN JAWABAN:</span>
              </span>
              <p className="font-sans">{selectedOption.explanation}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t-2 border-slate-800 bg-[#060913] flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="rpg-btn rpg-btn-slate px-4 py-2 text-xs cursor-pointer"
          >
            TUTUP
          </button>

          {!hasResolved || !isAnswerCorrect ? (
            <button
              onClick={handleExecuteAttack}
              disabled={!selectedOptionId}
              className="rpg-btn rpg-btn-gold px-5 py-2.5 text-xs flex items-center gap-2 cursor-pointer disabled:opacity-40"
            >
              <Sword size={16} weight="bold" />
              <span>JAWAB / SERANG</span>
            </button>
          ) : (
            <button
              onClick={handleClaimVictory}
              className="rpg-btn rpg-btn-emerald px-6 py-2.5 text-xs flex items-center gap-2 cursor-pointer shadow-pixel animate-pulse"
            >
              <Sparkle size={16} weight="fill" />
              <span>SELESAI (KLAIM +{quiz.xpReward} XP)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
