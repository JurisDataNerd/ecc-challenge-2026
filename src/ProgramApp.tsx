import { useEffect, useState } from 'react';
import { ParticipantJourney } from './components/participant/ParticipantJourney';
import type { ParticipantDemoState } from './lib/progress';
import { StaffWorkspace } from './components/staff/StaffWorkspace';
import { MentorReviewPanel } from './components/mentor/MentorReviewPanel';
import { SelectionManager } from './components/admin/SelectionManager';
import { STAGE_BOSS_MISSIONS } from './data/mockQuests';
import { PathCode, Submission, UserRole } from './types';
import { navigate, useLocation } from './lib/navigation';
import { journeyRoute, loadProgress, saveProgress } from './lib/progress';
import { restoreFiles } from './lib/local-files';
import { INITIAL_TALENT_POOL, TalentProfile } from './data/mockParticipants';

export default function ProgramApp({ mode = 'demo', participantId }: { mode?: 'demo' | 'participant'; participantId?: string }) {
  const scope = mode === 'demo' ? 'demo' : `participant:${participantId}`;
  const [saved] = useState(() => loadProgress(scope));
  const [storageError, setStorageError] = useState(saved.error);
  const location = useLocation();
  const base = mode === 'demo' ? '/demo' : '/play';
  const [hydrated, setHydrated] = useState(false);
  const [currentPath, setCurrentPath] = useState<PathCode>(saved.path);
  const [currentStage, setCurrentStage] = useState<1 | 2 | 3>(1);
  const [participantDemo, setParticipantDemo] = useState<ParticipantDemoState>(saved.progress);
  const [isMentorOpen, setIsMentorOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [talentPool, setTalentPool] = useState<TalentProfile[]>(INITIAL_TALENT_POOL);
  const route = journeyRoute(location, base, participantDemo);
  const currentRole = route.role;
  const currentSubmission = participantDemo.submissions[currentStage] || null;
  useEffect(() => {
    let cancelled = false;
    let urls: string[] = [];
    restoreFiles(saved.progress).then(result => {
      urls = Object.values(result.progress.submissions).flatMap(s => s.files.map(file => file.url)).filter(Boolean);
      if (cancelled) { urls.forEach(URL.revokeObjectURL); return; }
      setParticipantDemo(result.progress);
      if (result.error) setStorageError(result.error);
      setHydrated(true);
    });
    return () => { cancelled = true; urls.forEach(URL.revokeObjectURL); };
  }, [saved]);
  useEffect(() => {
    if (!hydrated) return;
    const error = saveProgress(scope, currentPath, participantDemo);
    if (error) setStorageError(error);
  }, [scope, currentPath, participantDemo, hydrated]);
  useEffect(() => {
    if (hydrated && route.redirect) navigate(route.redirect, true);
  }, [hydrated, route.redirect]);
  const changeRole = (role: UserRole) => navigate(`${base}/${role === 'participant' ? 'expedition' : role}`);
  const notice = storageError ? <div className="session-error" role="alert">{storageError}</div> : null;

  const handleFinalizeMentorReview = (scores: Record<string, number>, feedback: string, decision: 'accepted' | 'changes_requested') => {
    if (!currentSubmission || !['submitted', 'in_review'].includes(currentSubmission.status)) return;
    const mission = STAGE_BOSS_MISSIONS[currentStage];
    const evidence = mission.rubricCriteria.find(criterion => criterion.key === 'evidence_quality');
    const evidenceScore = evidence ? scores[evidence.key] || 0 : 0;
    const updatedSubmission: Submission = {
      ...currentSubmission,
      status: decision === 'accepted' ? 'reviewed' : 'changes_requested',
      review: {
        mentorId: 'mentor_demo',
        mentorName: 'Mentor demo',
        decision,
        scores,
        totalScore: Object.values(scores).reduce((total, score) => total + score, 0),
        feedback,
        finalizedAt: new Date().toISOString(),
      },
    };

    setParticipantDemo(current => {
      const xpAwards = { ...current.xpAwards };
      if (decision === 'accepted') {
        xpAwards[`mission:${currentStage}`] ??= 20;
        if (evidence && evidenceScore >= evidence.maxScore * 0.8) xpAwards[`evidence:${currentStage}`] ??= 10;
      }
      return { ...current, submissions: { ...current.submissions, [currentStage]: updatedSubmission }, xpAwards };
    });
  };

  if (!hydrated || route.redirect) return <div className="experience-loading" role="status">Memulihkan perjalanan?</div>;

  if (currentRole === 'participant') {
    return <>{notice}<ParticipantJourney
      currentPath={currentPath}
      currentRole={currentRole}
      demo={{ ...participantDemo, screen: route.screen, currentStage: route.stage }}
      storageScope={scope}
      setDemo={setParticipantDemo}
      onCompleteOnboarding={(path, futureBase) => {
        setCurrentPath(path);
        setParticipantDemo(current => ({ ...current, onboarded: true, futureBase, screen: 'expedition' }));
        navigate(`${base}/expedition`);
      }}
      onSelectStage={stage => { setCurrentStage(stage); navigate(`${base}/stage/${stage}`); }}
      onNavigate={screen => navigate(`${base}/${screen === 'onboarding' ? 'intro' : screen}`)}
      onRoleChange={mode === 'demo' ? changeRole : () => undefined}
      allowStaffDemo={mode === 'demo'}
    /></>;
  }

  return <>
    {notice}<StaffWorkspace
      role={currentRole}
      currentPath={currentPath}
      submissions={participantDemo.submissions}
      onRoleChange={changeRole}
      onReview={stage => { setCurrentStage(stage); setIsMentorOpen(true); }}
      onOpenAdmin={() => setIsAdminOpen(true)}
    />
    {isMentorOpen && <MentorReviewPanel
      isOpen={isMentorOpen}
      onClose={() => setIsMentorOpen(false)}
      submission={currentSubmission}
      onFinalizeReview={handleFinalizeMentorReview}
    />}
    {isAdminOpen && <SelectionManager
      isOpen={isAdminOpen}
      onClose={() => setIsAdminOpen(false)}
      onUpdateTalentPool={setTalentPool}
    />}
  </>;
}
