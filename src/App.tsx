import { useState, useEffect } from 'react';
import { PhaserGame } from './game/PhaserGame';
import { GameEventBus } from './game/GameEventBus';
import { GameHUD } from './components/game/GameHUD';
import { InteractiveQuizModal } from './components/modals/InteractiveQuizModal';
import { BossMissionModal } from './components/modals/BossMissionModal';
import { PathSelectionModal } from './components/onboarding/PathSelectionModal';
import { MentorReviewPanel } from './components/mentor/MentorReviewPanel';
import { SelectionManager } from './components/admin/SelectionManager';
import { TalentPoolView } from './components/talent/TalentPoolView';
import { LeaderboardModal } from './components/modals/LeaderboardModal';
import { PathCode, UserRole, QuizQuestion, BossMission, Submission, FutureBase } from './types';
import { INITIAL_TALENT_POOL, TalentProfile } from './data/mockParticipants';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('participant');
  const [currentPath, setCurrentPath] = useState<PathCode>('professional');
  const [isPathModalOpen, setIsPathModalOpen] = useState<boolean>(false);
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [totalXp, setTotalXp] = useState<number>(360);
  const [playerHp, setPlayerHp] = useState<number>(100);

  // Active Modals
  const [activeQuiz, setActiveQuiz] = useState<QuizQuestion | null>(null);
  const [activeBossMission, setActiveBossMission] = useState<BossMission | null>(null);
  const [isMentorOpen, setIsMentorOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isTalentPoolOpen, setIsTalentPoolOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);

  // Submissions state per stage
  const [submissions, setSubmissions] = useState<Record<number, Submission>>({});
  const [talentPool, setTalentPool] = useState<TalentProfile[]>(INITIAL_TALENT_POOL);

  // Listen to Phaser Game events
  useEffect(() => {
    const unsubQuiz = GameEventBus.on('TRIGGER_QUIZ', (quiz: QuizQuestion) => {
      setActiveQuiz(quiz);
    });

    const unsubBoss = GameEventBus.on('TRIGGER_BOSS_MISSION', (boss: BossMission) => {
      setActiveBossMission(boss);
    });

    return () => {
      unsubQuiz();
      unsubBoss();
    };
  }, []);

  const handleSelectStage = (stageOrdinal: number) => {
    setCurrentStage(stageOrdinal);
    GameEventBus.emit('SET_STAGE', stageOrdinal);
  };

  const handleConfirmPath = (pathCode: PathCode, _fb: FutureBase) => {
    setCurrentPath(pathCode);
    setIsPathModalOpen(false);
    GameEventBus.emit('SET_PATH', pathCode);
  };

  const handleQuizSuccess = (quizId: string, xpReward: number) => {
    setTotalXp(prev => prev + xpReward);
    // Slight HP recovery on triumph
    setPlayerHp(prev => Math.min(100, prev + 15));
    GameEventBus.emit('ENEMY_DEFEATED', quizId);
  };

  const handleBossSubmit = (submission: Submission) => {
    setSubmissions(prev => ({ ...prev, [submission.stageOrdinal]: submission }));
    setTotalXp(prev => prev + 150);
  };

  const handleFinalizeMentorReview = (scores: Record<string, number>, feedback: string) => {
    const currentSub = submissions[currentStage];
    if (currentSub) {
      const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
      const updatedSub: Submission = {
        ...currentSub,
        status: 'reviewed',
        review: {
          mentorId: 'mentor_01',
          mentorName: 'Dr. Handoko M.Sc',
          scores,
          totalScore,
          feedback,
          finalizedAt: new Date().toISOString()
        }
      };
      setSubmissions(prev => ({ ...prev, [currentStage]: updatedSub }));
    }
  };

  const currentSubmission = submissions[currentStage];

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-[#3f739e] select-none">
      
      {/* 100% Fullscreen RPG Canvas */}
      <main className="absolute inset-0 w-full h-full z-0">
        <PhaserGame
          currentPath={currentPath}
          currentStage={currentStage}
        />
      </main>

      {/* Floating Top HUD over canvas (pointer-events-none on wrapper, pointer-events-auto on HUD) */}
      <div className="absolute top-3 left-3 right-3 z-30 pointer-events-none flex justify-center">
        <div className="w-full max-w-5xl pointer-events-auto">
          <GameHUD
            currentRole={currentRole}
            setCurrentRole={setCurrentRole}
            currentPath={currentPath}
            currentStage={currentStage}
            onSelectStage={handleSelectStage}
            totalXp={totalXp}
            playerHp={playerHp}
            onOpenTalentPool={() => setIsTalentPoolOpen(true)}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
            onOpenMentorPanel={() => setIsMentorOpen(true)}
            onOpenAdminPanel={() => setIsAdminOpen(true)}
            onOpenPathModal={() => setIsPathModalOpen(true)}
          />
        </div>
      </div>

      {/* Modals on top (z-50) */}
      <InteractiveQuizModal
        quiz={activeQuiz}
        currentPath={currentPath}
        onClose={() => setActiveQuiz(null)}
        onSuccess={handleQuizSuccess}
      />

      <BossMissionModal
        mission={activeBossMission}
        currentSubmission={currentSubmission}
        currentPath={currentPath}
        onClose={() => setActiveBossMission(null)}
        onSubmitMission={handleBossSubmit}
      />

      <PathSelectionModal
        isOpen={isPathModalOpen}
        onConfirmPath={handleConfirmPath}
        onClose={() => setIsPathModalOpen(false)}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        currentUserPath={currentPath}
      />

      <MentorReviewPanel
        isOpen={isMentorOpen}
        onClose={() => setIsMentorOpen(false)}
        submission={currentSubmission}
        onFinalizeReview={handleFinalizeMentorReview}
      />

      <SelectionManager
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onUpdateTalentPool={setTalentPool}
      />

      <TalentPoolView
        isOpen={isTalentPoolOpen}
        onClose={() => setIsTalentPoolOpen(false)}
        talentPool={talentPool}
      />
    </div>
  );
}
