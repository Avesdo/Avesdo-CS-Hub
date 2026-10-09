/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import OnboardingCsatFormModal from '../OnboardingCsatFormModal';
import { useAppStore } from '../../../store/useAppStore';
import { exportFormToCSV } from '../../../utils/exportUtils';

vi.mock('../../../store/useAppStore');
vi.mock('../../../api/dbService', () => ({
  updateProjectRecord: vi.fn().mockResolvedValue({ success: true }),
}));
vi.mock('../../../utils/exportUtils', () => ({
  exportFormToCSV: vi.fn(),
}));

const mockTemplate = {
  id: 'onboardingCsat',
  name: 'Onboarding CSAT',
  type: 'form',
  fields: [
    {
      id: 'q1_satisfaction',
      type: 'radio',
      label: 'Overall Onboarding Experience',
      required: true,
      options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'],
    },
    {
      id: 'q2_satisfaction',
      type: 'radio',
      label: 'Data Migration Quality',
      required: true,
      options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'],
    },
    {
      id: 'q3_satisfaction',
      type: 'radio',
      label: 'Training and Support',
      required: true,
      options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'],
    },
    {
      id: 'q4_agreement',
      type: 'radio',
      label: 'Launch Readiness Achieved',
      required: true,
      options: ['Strongly Agree', 'Agree', 'Neither', 'Disagree', 'Strongly Disagree'],
    },
    { id: 'q5_recommend', type: 'nps', label: 'Likelihood to Recommend Avesdo', required: true },
    { id: 'q6_feedback', type: 'long_text', label: 'Additional Comments', required: false },
  ],
};

describe('OnboardingCsatFormModal', () => {
  let mockStore: any;
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockStore = {
      settings: {
        templates: {
          onboardingCsat: mockTemplate,
        },
      },
    };

    (useAppStore as any).mockImplementation((selector: any) => selector(mockStore));
    (useAppStore as any).getState = () => mockStore;
  });

  describe('Realistic Survey Responses (Verification Scenario)', () => {
    const realisticProject = {
      id: 'proj_real_1',
      name: 'Oakwood Estates',
      slug: 'oakwood-estates',
      onboardingCsat: {
        q1_satisfaction: 'Satisfied',
        q2_satisfaction: 'Satisfied',
        q3_satisfaction: 'Satisfied',
        q4_agreement: 'Agree',
        q5_recommend: '8',
        q6_feedback: 'Unanswered',
        submittedAt: '2026-09-15T14:30:00.000Z',
      },
    };

    it('renders the correct score banner (3.8 / 5, 76%) for legacy realistic survey responses', () => {
      render(<OnboardingCsatFormModal project={realisticProject} onClose={mockOnClose} />);

      // Verify the banner header and legacy source note
      expect(screen.getByText('Overall Satisfaction Score')).toBeInTheDocument();
      expect(screen.getByText(/calculated based on legacy data/i)).toBeInTheDocument();

      // Verify exact calculated score values
      expect(screen.getByText('3.8')).toBeInTheDocument();
      expect(screen.getByText('/ 5')).toBeInTheDocument();
      expect(screen.getByText('76%')).toBeInTheDocument();

      // Verify Legacy badge in header
      expect(screen.getByText('Legacy')).toBeInTheDocument();
    });

    it('renders the correct score banner (3.8 / 5, 76%) for health/dynamic realistic survey responses', () => {
      const modernProject = {
        id: 'proj_real_2',
        name: 'Horizon Tower',
        health: {
          onboardingCsat: {
            q1_satisfaction: 'Satisfied',
            q2_satisfaction: 'Satisfied',
            q3_satisfaction: 'Satisfied',
            q4_agreement: 'Agree',
            q5_recommend: '8',
            q6_feedback: 'Unanswered',
            submittedAt: '2026-09-15T14:30:00.000Z',
          },
        },
      };

      render(<OnboardingCsatFormModal project={modernProject} onClose={mockOnClose} />);

      expect(screen.getByText('Overall Satisfaction Score')).toBeInTheDocument();
      expect(screen.getByText(/calculated based on form responses/i)).toBeInTheDocument();
      expect(screen.getByText('3.8')).toBeInTheDocument();
      expect(screen.getByText('/ 5')).toBeInTheDocument();
      expect(screen.getByText('76%')).toBeInTheDocument();
      expect(screen.queryByText('Legacy')).not.toBeInTheDocument();
    });
  });

  describe('Perfect Score Responses', () => {
    it('renders 100% (5.0 / 5) for all "Very Satisfied" / 10 rating responses', () => {
      const perfectProject = {
        id: 'proj_perfect_1',
        name: 'Pinnacle Ridge',
        health: {
          onboardingCsat: {
            q1_satisfaction: 'Very Satisfied',
            q2_satisfaction: 'Very Satisfied',
            q3_satisfaction: 'Very Satisfied',
            q4_agreement: 'Strongly Agree',
            q5_recommend: '10',
            q6_feedback: 'Flawless launch and exceptional onboarding experience!',
          },
        },
      };

      render(<OnboardingCsatFormModal project={perfectProject} onClose={mockOnClose} />);

      expect(screen.getByText('Overall Satisfaction Score')).toBeInTheDocument();
      expect(screen.getByText('5.0')).toBeInTheDocument();
      expect(screen.getByText('/ 5')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  describe('Unanswered and Legacy Data Rendering', () => {
    it('renders "Unanswered" and legacy data cleanly', () => {
      const legacyProject = {
        id: 'proj_legacy_mixed',
        name: 'Grandview Heights',
        onboardingCsat: {
          q1_satisfaction: 'Satisfied',
          q2_ease_of_use: 'Unanswered',
          q3_support: null,
          q4_additional_notes: 'Everything went smoothly.',
        },
      };

      render(<OnboardingCsatFormModal project={legacyProject} onClose={mockOnClose} />);

      // Verify legacy badge
      expect(screen.getByText('Legacy')).toBeInTheDocument();

      // Check field labels formatted nicely from snake_case
      expect(screen.getByText(/q1 satisfaction/i)).toBeInTheDocument();
      expect(screen.getByText(/q2 ease of use/i)).toBeInTheDocument();
      expect(screen.getByText(/q3 support/i)).toBeInTheDocument();
      expect(screen.getByText(/q4 additional notes/i)).toBeInTheDocument();

      // Answered values
      expect(screen.getByText('Satisfied')).toBeInTheDocument();
      expect(screen.getByText('Everything went smoothly.')).toBeInTheDocument();

      // Both explicit "Unanswered" and null values render as italicized "Unanswered"
      const unansweredBadges = screen.getAllByText('Unanswered');
      expect(unansweredBadges.length).toBeGreaterThanOrEqual(2);
      unansweredBadges.forEach((badge) => {
        expect(badge).toHaveClass('italic');
        expect(badge).toHaveClass('text-slate-400');
      });
    });

    it('renders legacy data even when template is not configured in settings', () => {
      // Remove template from store
      mockStore.settings.templates = {};

      const legacyProject = {
        id: 'proj_legacy_notemplate',
        name: 'Pinecrest Valley',
        onboardingCsat: {
          experienceRating: 4,
          feedbackNotes: 'Legacy submission works great.',
        },
      };

      render(<OnboardingCsatFormModal project={legacyProject} onClose={mockOnClose} />);

      // Should render the legacy form data and banner instead of "No Template Found"
      expect(screen.queryByText('No Template Found')).not.toBeInTheDocument();
      expect(screen.getByText('Overall Satisfaction Score')).toBeInTheDocument();
      expect(screen.getByText('4.0')).toBeInTheDocument();
      expect(screen.getByText('80%')).toBeInTheDocument();
      expect(screen.getByText('Legacy submission works great.')).toBeInTheDocument();
    });
  });

  describe('Graceful Handling of validScore === 0 and Missing Data', () => {
    it('gracefully handles validScore === 0 when no valid answers exist', () => {
      const emptyResponsesProject = {
        id: 'proj_no_valid',
        name: 'Clearwater Creek',
        onboardingCsat: {
          q1: 'Unanswered',
          q2: '',
          notes: 'Just notes without any quantitative score',
        },
      };

      render(<OnboardingCsatFormModal project={emptyResponsesProject} onClose={mockOnClose} />);

      // Banner should render 0.0 / 5 and 0% cleanly without crashing or displaying NaN
      expect(screen.getByText('Overall Satisfaction Score')).toBeInTheDocument();
      expect(screen.getByText('0.0')).toBeInTheDocument();
      expect(screen.getByText('/ 5')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('gracefully handles all extreme negative ratings resulting in validScore === 0', () => {
      const extremeNegativeProject = {
        id: 'proj_zero_ratings',
        name: 'Northstar Village',
        health: {
          onboardingCsat: {
            q1: 'Extremely Dissatisfied',
            q2: 'Very Dissatisfied',
            q3: 'Strongly Disagree',
            q4: '0',
          },
        },
      };

      render(<OnboardingCsatFormModal project={extremeNegativeProject} onClose={mockOnClose} />);

      expect(screen.getByText('Overall Satisfaction Score')).toBeInTheDocument();
      expect(screen.getByText('0.0')).toBeInTheDocument();
      expect(screen.getByText('/ 5')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('gracefully handles projects without existing CSAT data (new submission mode)', () => {
      const newProject = {
        id: 'proj_fresh_1',
        name: 'New Horizon Estates',
      };

      render(<OnboardingCsatFormModal project={newProject} onClose={mockOnClose} />);

      // Score banner should not be present when no submission exists yet
      expect(screen.queryByText('Overall Satisfaction Score')).not.toBeInTheDocument();

      // Submit button should be ready for dynamic data entry
      expect(screen.getByRole('button', { name: /submit csat/i })).toBeInTheDocument();
    });
  });

  describe('User Interactions and Modal Controls', () => {
    it('calls onClose when close button is clicked', () => {
      const project = { id: 'p1', name: 'Test Project' };
      render(<OnboardingCsatFormModal project={project} onClose={mockOnClose} />);

      const closeButtons = screen.getAllByRole('button');
      // The X close button in the header
      const xButton = closeButtons.find((btn) => btn.querySelector('svg.lucide-x'));
      expect(xButton).toBeDefined();
      if (xButton) fireEvent.click(xButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('triggers CSV download when Download CSV is clicked', () => {
      const projectWithCsat = {
        id: 'proj_csv',
        name: 'CSV Test Tower',
        onboardingCsat: {
          overallScore: 85,
        },
      };

      render(<OnboardingCsatFormModal project={projectWithCsat} onClose={mockOnClose} />);

      const csvButton = screen.getByRole('button', { name: /download csv/i });
      fireEvent.click(csvButton);

      expect(exportFormToCSV).toHaveBeenCalledWith(
        'Onboarding CSAT',
        projectWithCsat,
        projectWithCsat.onboardingCsat,
        mockTemplate
      );
    });

    it('copies client portal link to clipboard', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      const project = { id: 'p_link', slug: 'link-project', name: 'Link Project' };
      render(<OnboardingCsatFormModal project={project} onClose={mockOnClose} />);

      const copyButton = screen.getByRole('button', { name: /copy client link/i });
      fireEvent.click(copyButton);

      expect(writeTextMock).toHaveBeenCalledWith(
        expect.stringContaining('/portal/link-project?form=feedback')
      );
    });
  });
});
