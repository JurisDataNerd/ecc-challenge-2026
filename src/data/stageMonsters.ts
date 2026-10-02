import type { StageOrdinal } from './participantStages';

export type StageMonster = { quizId: string; art: string; x: number; y: number; boss?: true };

export const STAGE_MONSTERS: Record<StageOrdinal, readonly StageMonster[]> = {
  1: [
    { quizId: 'quiz-s1-e1', art: 'enemy019', x: 1940, y: 1040 },
    { quizId: 'quiz-s1-e2', art: 'enemy016', x: 1600, y: 100 },
    { quizId: 'quiz-s1-e3', art: 'boss002', x: 1040, y: 150, boss: true },
  ],
  2: [
    { quizId: 'quiz-s2-e1', art: 'enemy013', x: 1000, y: 1440 },
    { quizId: 'quiz-s2-e2', art: 'enemy033', x: 1200, y: 1000 },
    { quizId: 'quiz-s2-e3', art: 'boss004', x: 1560, y: 910, boss: true },
  ],
  3: [
    { quizId: 'quiz-s3-e1', art: 'enemy025', x: 600, y: 1150 },
    { quizId: 'quiz-s3-e2', art: 'enemy026', x: 1460, y: 1150 },
    { quizId: 'quiz-s3-e3', art: 'boss001', x: 1024, y: 1360, boss: true },
  ],
  4: [
    { quizId: 'quiz-s4-e1', art: 'enemy012', x: 600, y: 1220 },
    { quizId: 'quiz-s4-e2', art: 'enemy022', x: 1440, y: 1220 },
    { quizId: 'quiz-s4-e3', art: 'boss003', x: 1024, y: 900, boss: true },
  ],
};

export const monsterArtPath = (art: string) => `/assets/monsters/${art}.png`;
