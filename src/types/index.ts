export type UserRole = 'participant' | 'mentor' | 'admin';

export type PathCode = 'professional' | 'social_impact' | 'business';

export interface PathInfo {
  code: PathCode;
  title: string;
  subtitle: string;
  description: string;
  themeColor: string;
  accentBadge: string;
  archetypeRole: string; // Internal lore flavor
  statHighlight: string;
}

export interface FutureBase {
  direction: string;
  target90d: string;
  skills: string[];
  support: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  city?: string;
  avatarUrl?: string;
}

export interface Enrollment {
  id: string;
  profileId: string;
  pathCode: PathCode | null;
  isPathLocked: boolean;
  status: 'active' | 'eliminated' | 'finalist';
  totalXp: number;
  currentStageOrdinal: number; // 1, 2, 3
  futureBase?: FutureBase;
}

export interface QuizQuestion {
  id: string;
  stageOrdinal: number;
  enemyId: string;
  enemyName: string;
  title: string;
  scenario: string;
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  xpReward: number;
}

export interface BossMission {
  id: string;
  stageOrdinal: number;
  bossName: string;
  bossTitle: string;
  title: string;
  instructions: string;
  deliverables: string[];
  maxFiles: number;
  allowedFormats: string[];
  rubricCriteria: {
    key: string;
    label: string;
    maxScore: number;
  }[];
}

export interface SubmissionFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface Submission {
  id: string;
  enrollmentId: string;
  stageOrdinal: number;
  status: 'draft' | 'submitted' | 'in_review' | 'changes_requested' | 'reviewed';
  summary: string;
  reflection: string;
  evidenceLinks: string[];
  files: SubmissionFile[];
  submittedAt?: string;
  review?: {
    mentorId: string;
    mentorName: string;
    decision?: 'accepted' | 'changes_requested';
    scores: Record<string, number>;
    totalScore: number;
    feedback: string;
    finalizedAt: string;
  };
}

export interface SelectionCandidate {
  enrollmentId: string;
  participantName: string;
  city: string;
  pathCode: PathCode;
  quizScore: number; // Max 100
  missionScore: number; // Max 100
  compositeScore: number; // Weighted
  decision: 'advance' | 'eliminated' | 'finalist';
  rankInPath: number;
}
