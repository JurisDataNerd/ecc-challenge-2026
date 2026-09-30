import { useState } from 'react';
import { CheckCircle, Circle, XCircle } from '@phosphor-icons/react';
import type { PathCode, QuizQuestion } from '../../types';
import { trackLabel } from '../../data/participantStages';

export function InteractiveQuizModal({
  quiz,
  currentPath = 'professional',
  trackFocus,
  alreadyAttempted,
  readOnly = false,
  onClose,
  onSubmit,
  onCorrect,
}: {
  quiz: QuizQuestion | null;
  currentPath?: PathCode;
  trackFocus: string;
  alreadyAttempted: boolean;
  readOnly?: boolean;
  onClose: () => void;
  onSubmit: (quizId: string) => void;
  onCorrect?: (quizId: string) => void;
}) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [earnedXp, setEarnedXp] = useState(false);

  if (!quiz) return null;
  const selected = quiz.options.find(option => option.id === selectedOptionId);
  const submitAnswer = () => {
    if (!selected || readOnly) return;
    setSubmitted(true);
    setEarnedXp(current => current || !alreadyAttempted);
    onSubmit(quiz.id);
    if (selected.isCorrect) onCorrect?.(quiz.id);
  };

  return (
    <div className="journey-scrim" onMouseDown={onClose}>
      <section className="journey-dialog quiz-dialog" role="dialog" aria-modal="true" aria-labelledby="quiz-title" onMouseDown={event => event.stopPropagation()}>
        <header className="dialog-heading">
          <div><span className="eyebrow">L{quiz.stageOrdinal} · QUIZ <i>DEMO</i></span><h2 id="quiz-title">{quiz.title}</h2></div>
          <button className="icon-button" onClick={onClose} aria-label="Tutup kuis"><XCircle size={22} /></button>
        </header>
        <p className="dialog-context"><strong>{trackLabel(currentPath)}:</strong> {trackFocus}</p>
        <div className="quiz-scenario"><span className="eyebrow">STUDI KASUS</span><p>{quiz.scenario}</p></div>
        <h3 className="quiz-question">{quiz.question}</h3>
        <div className="quiz-options" role="radiogroup" aria-label="Pilih satu jawaban">
          {quiz.options.map(option => {
            const chosen = selectedOptionId === option.id;
            const correctResult = submitted && option.isCorrect;
            const wrongResult = submitted && chosen && !option.isCorrect;
            return (
              <button
                type="button"
                key={option.id}
                className={`quiz-option ${chosen ? 'is-selected' : ''} ${correctResult ? 'is-correct' : ''} ${wrongResult ? 'is-wrong' : ''}`}
                onClick={() => !readOnly && setSelectedOptionId(option.id)}
                role="radio"
                aria-checked={chosen}
                disabled={readOnly}
              >
                {correctResult ? <CheckCircle size={20} weight="fill" /> : wrongResult ? <XCircle size={20} weight="fill" /> : chosen ? <CheckCircle size={20} /> : <Circle size={20} />}
                <span>{option.text}</span>
              </button>
            );
          })}
        </div>
        {submitted && selected && (
          <div className={`quiz-feedback ${selected.isCorrect ? 'feedback-good' : 'feedback-retry'}`} role="status">
            <strong>{selected.isCorrect ? 'Jawaban tepat' : 'Belum tepat'}</strong>
            <p>{selected.isCorrect ? selected.explanation : `Jawaban terbaik: ${quiz.options.find(option => option.isCorrect)?.text}`}</p>
            {earnedXp && <span>+10 XP · tercatat pada pengiriman pertama</span>}
            {!earnedXp && alreadyAttempted && <span>Pengiriman valid sudah pernah dicatat · tidak ada XP ulang</span>}
          </div>
        )}
        {readOnly && <p className="read-only-note">Hasil seleksi demo sudah dipublikasikan. Kuis ini hanya bisa dilihat.</p>}
        <footer className="dialog-actions">
          <span className="demo-note">{readOnly ? 'Mode lihat · tidak ada XP baru · DEMO' : 'XP hanya untuk percobaan pertama · DEMO'}</span>
          <div>
            <button className="button button-quiet" onClick={onClose}>{submitted ? 'Selesai' : 'Kembali'}</button>
            {readOnly ? <button className="button button-gold" onClick={onClose}>Tutup tampilan</button> : !submitted ? (
              <button className="button button-gold" onClick={submitAnswer} disabled={!selected || readOnly}>Kirim jawaban <span>+10 XP</span></button>
            ) : selected?.isCorrect ? (
              <button className="button button-gold" onClick={onClose}>Lanjutkan</button>
            ) : (
              <button className="button button-gold" onClick={() => { setSubmitted(false); setSelectedOptionId(null); }}>Coba jawaban lain <span>tanpa XP ulang</span></button>
            )}
          </div>
        </footer>
      </section>
    </div>
  );
}
