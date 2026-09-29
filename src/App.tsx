import { useState } from 'react';
import { ParticipantJourney, INITIAL_PARTICIPANT_DEMO } from './components/participant/ParticipantJourney';
import type { ParticipantDemoState } from './components/participant/ParticipantJourney';
import { StaffWorkspace } from './components/staff/StaffWorkspace';
import { MentorReviewPanel } from './components/mentor/MentorReviewPanel';
import { SelectionManager } from './components/admin/SelectionManager';
import { STAGE_BOSS_MISSIONS } from './data/mockQuests';
import { PathCode, Submission, UserRole } from './types';
import { INITIAL_TALENT_POOL, TalentProfile } from './data/mockParticipants';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('participant');
  const [currentPath, setCurrentPath] = useState<PathCode>('professional');
  const [currentStage, setCurrentStage] = useState<1 | 2 | 3>(1);
  const [participantDemo, setParticipantDemo] = useState<ParticipantDemoState>(INITIAL_PARTICIPANT_DEMO);
  const [isMentorOpen, setIsMentorOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [talentPool, setTalentPool] = useState<TalentProfile[]>(INITIAL_TALENT_POOL);
  const currentSubmission = participantDemo.submissions[currentStage] || null;

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

  if (currentRole === 'participant') {
    return <ParticipantJourney
      currentPath={currentPath}
      currentRole={currentRole}
      demo={participantDemo}
      setDemo={setParticipantDemo}
      onCompleteOnboarding={(path, futureBase) => {
        setCurrentPath(path);
        setParticipantDemo(current => ({ ...current, onboarded: true, futureBase, screen: 'expedition' }));
      }}
      onSelectStage={stage => setCurrentStage(stage)}
      onRoleChange={setCurrentRole}
    />;
  }

  return <>
    <StaffWorkspace
      role={currentRole}
      currentPath={currentPath}
      submissions={participantDemo.submissions}
      onRoleChange={setCurrentRole}
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
