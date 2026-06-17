import React, { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { updateProjectRecord, addProjectAutoLog } from '../../../api/dbService';
import { useAppStore } from '../../../store/useAppStore';
import { Select } from '../../ui/Select';
import toast from 'react-hot-toast';

interface OnboardingCsatModalProps {
  project: any;
  onClose: () => void;
}

const standardOptions = [
  'Extremely satisfied',
  'Somewhat satisfied',
  'Neither Satisfied nor dissatisfied',
  'Somewhat dissatisfied',
  'Extremely dissatisfied',
];

const recommendationOptions = [
  'Definitely would',
  'Probably would',
  'Not Sure',
  'Probably would not',
  'Definitely would not',
];

const getScoreFromAnswer = (answer: string) => {
  if (['Extremely satisfied', 'Definitely would'].includes(answer)) return 100;
  if (['Somewhat satisfied', 'Probably would'].includes(answer)) return 75;
  if (['Neither Satisfied nor dissatisfied', 'Not Sure'].includes(answer)) return 50;
  if (['Somewhat dissatisfied', 'Probably would not'].includes(answer)) return 25;
  if (['Extremely dissatisfied', 'Definitely would not'].includes(answer)) return 0;
  return 0;
};

export default function OnboardingCsatModal({ project, onClose }: OnboardingCsatModalProps) {
  const { user } = useAppStore();

  const existing = project?.onboardingCsat || {};

  const [quality, setQuality] = useState(existing.quality || '');
  const [planning, setPlanning] = useState(existing.planning || '');
  const [communication, setCommunication] = useState(existing.communication || '');
  const [knowledge, setKnowledge] = useState(existing.knowledge || '');
  const [recommendation, setRecommendation] = useState(existing.recommendation || '');
  const [comments, setComments] = useState(existing.comments || '');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quality || !planning || !communication || !knowledge || !recommendation) {
      toast.error('Please answer all 5 questions.');
      return;
    }

    setIsSubmitting(true);

    const scores = [
      getScoreFromAnswer(quality),
      getScoreFromAnswer(planning),
      getScoreFromAnswer(communication),
      getScoreFromAnswer(knowledge),
      getScoreFromAnswer(recommendation),
    ];

    const finalScore = Math.round(scores.reduce((a, b) => a + b, 0) / 5);

    const onboardingCsat = {
      quality,
      planning,
      communication,
      knowledge,
      recommendation,
      comments,
      score: finalScore,
      submittedAt: new Date().toISOString(),
    };

    // Calculate a legacy CSAT string for backwards compatibility, if desired,
    // or just leave project.csat alone. We'll set project.csat based on finalScore.
    let legacyCsat = 'Neutral';
    if (finalScore >= 75) legacyCsat = 'Satisfied';
    else if (finalScore < 50) legacyCsat = 'Dissatisfied';

    const updatedNotes = [...(project.notes || [])];
    if (comments.trim() && comments.trim() !== existing.comments?.trim()) {
      updatedNotes.unshift({
        id: crypto.randomUUID(),
        text: `Onboarding CSAT Additional Comments:\n"${comments.trim()}"`,
        timestamp: new Date().getTime(),
        author: user?.name || 'System',
        isSystem: false,
      });
    }

    const updatedProject = {
      ...project,
      csat: legacyCsat,
      onboardingCsat,
      notes: updatedNotes,
    };

    const success = await updateProjectRecord(updatedProject, {
      successMsg: 'Onboarding CSAT successfully recorded.',
      errorMsg: 'Failed to record Onboarding CSAT.',
    });

    if (success) {
      await addProjectAutoLog(
        project.id,
        `Recorded Onboarding CSAT (Score: ${finalScore})`,
        user?.name || 'System'
      );
      onClose();
    }

    setIsSubmitting(false);
  };

  const renderSelect = (
    label: string,
    question: string,
    value: string,
    setter: (val: string) => void,
    options: string[]
  ) => (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-800">
        {label}
        <p className="text-xs font-normal text-muted-foreground mt-0.5">{question}</p>
      </label>
      <div className="relative">
        <Select
          value={value}
          onChange={setter}
          options={options.map((opt) => ({ label: opt, value: opt }))}
          trigger={
            <button
              type="button"
              className="w-full flex items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm transition-all duration-200 active:scale-95 hover:bg-slate-50 hover:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary min-h-[38px]"
            >
              <span
                className={`truncate ${value ? 'font-semibold text-foreground' : 'text-slate-400'}`}
              >
                {value || 'Select an option...'}
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          }
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {existing.quality ? 'Edit Onboarding CSAT' : 'Record Onboarding CSAT'}
            </h2>
            <p className="text-sm text-muted-foreground">Project: {project?.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <form id="csat-form" onSubmit={handleSubmit} className="space-y-6">
            {renderSelect(
              '1. Quality',
              'Overall, how satisfied are you with your project onboarding experience with our Customer Success team?',
              quality,
              setQuality,
              standardOptions
            )}

            {renderSelect(
              '2. Planning/Timelines',
              'How satisfied were you with the project planning and timelines during onboarding?',
              planning,
              setPlanning,
              standardOptions
            )}

            {renderSelect(
              '3. Communication',
              'How satisfied were you with communication and weekly touchpoints during onboarding?',
              communication,
              setCommunication,
              standardOptions
            )}

            {renderSelect(
              '4. Knowledge',
              'How satisfied are you with the Customer Success team’s knowledge and guidance during onboarding?',
              knowledge,
              setKnowledge,
              standardOptions
            )}

            {renderSelect(
              '5. Recommendation',
              'How likely are you to recommend our products or services based on your onboarding experience?',
              recommendation,
              setRecommendation,
              recommendationOptions
            )}

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-800">
                Additional Comments
                <p className="text-xs font-normal text-muted-foreground mt-0.5">
                  If you would like to share any further feedback about your project onboarding
                  experience, please enter it below.
                </p>
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-y"
                placeholder="Optional comments..."
              />
            </div>
          </form>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border bg-slate-50 shrink-0 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="csat-form"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-md shadow-sm transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : existing.quality ? 'Update CSAT' : 'Save CSAT'}
          </button>
        </div>
      </div>
    </div>
  );
}
