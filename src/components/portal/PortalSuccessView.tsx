import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface PortalSuccessViewProps {
  activeFormType: string | null;
  onNavigate: (viewState: 'dashboard') => void;
}

export function PortalSuccessView({ activeFormType, onNavigate }: PortalSuccessViewProps) {
  const successTitle = 'Thank You!';
  let successMsg = 'Your submission has been received. We appreciate your partnership!';

  if (activeFormType === 'onboardingCsat') {
    successMsg = 'Thank you for your valuable feedback. We truly appreciate your partnership!';
  } else if (activeFormType === 'survey') {
    successMsg =
      'Your onboarding survey has been successfully submitted. We will review the details shortly to begin configuration.';
  } else if (activeFormType === 'clientQA') {
    successMsg =
      'Your quality assurance review has been submitted. Our team will review your feedback and reach out shortly.';
  } else if (activeFormType === 'certification') {
    successMsg = 'Your project certification has been successfully updated.';
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
      <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md w-full mx-4 border border-slate-200 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">{successTitle}</h2>
        <p className="text-slate-600 mb-8">{successMsg}</p>
        <button
          onClick={() => onNavigate('dashboard')}
          className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-6 rounded-xl transition-colors duration-200 shadow-sm"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
