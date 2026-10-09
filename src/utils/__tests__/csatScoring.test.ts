import { describe, it, expect } from 'vitest';
import { extractCsatMetrics, parseLikertValue } from '../qualityUtils';
import { calculateProjectHealth } from '../scoringUtils';

describe('CSAT and Sentiment Scoring Logic', () => {
  describe('parseLikertValue', () => {
    it('handles satisfaction options correctly', () => {
      expect(parseLikertValue('Extremely Satisfied')).toBe(100);
      expect(parseLikertValue('Very Satisfied')).toBe(100);
      expect(parseLikertValue('Somewhat Satisfied')).toBe(75);
      expect(parseLikertValue('Satisfied')).toBe(75);
      expect(parseLikertValue('Neither')).toBe(50);
      expect(parseLikertValue('Neutral')).toBe(50);
      expect(parseLikertValue('Acceptable')).toBe(50);
      expect(parseLikertValue('Somewhat Dissatisfied')).toBe(25);
      expect(parseLikertValue('Dissatisfied')).toBe(25);
      expect(parseLikertValue('Extremely Dissatisfied')).toBe(0);
      expect(parseLikertValue('Very Dissatisfied')).toBe(0);
    });

    it('handles agreement options correctly', () => {
      expect(parseLikertValue('Strongly Agree')).toBe(100);
      expect(parseLikertValue('Somewhat Agree')).toBe(75);
      expect(parseLikertValue('Agree')).toBe(75);
      expect(parseLikertValue('Neither Agree nor Disagree')).toBe(50);
      expect(parseLikertValue('Somewhat Disagree')).toBe(25);
      expect(parseLikertValue('Disagree')).toBe(25);
      expect(parseLikertValue('Strongly Disagree')).toBe(0);
    });

    it('handles general performance options correctly', () => {
      expect(parseLikertValue('Excellent')).toBe(100);
      expect(parseLikertValue('Great')).toBe(100);
      expect(parseLikertValue('Good')).toBe(75);
      expect(parseLikertValue('Fair')).toBe(50);
      expect(parseLikertValue('Average')).toBe(50);
      expect(parseLikertValue('Poor')).toBe(25);
      expect(parseLikertValue('Terrible')).toBe(0);
      expect(parseLikertValue('Very Poor')).toBe(0);
      expect(parseLikertValue('Yes')).toBe(100);
      expect(parseLikertValue('No')).toBe(0);
    });

    it('ignores unanswered / NA / empty values', () => {
      expect(parseLikertValue('Unanswered')).toBeNull();
      expect(parseLikertValue('N/A')).toBeNull();
      expect(parseLikertValue('none')).toBeNull();
      expect(parseLikertValue('')).toBeNull();
    });
  });

  describe('extractCsatMetrics', () => {
    it('correctly scores the prompt verification scenario to 76 (3.8 / 5)', () => {
      const responseData = {
        id: 'submission_123',
        submittedAt: '2026-10-01T10:00:00Z',
        submittedBy: 'Client Champion',
        projectId: 'project_avesdo_1',
        status: 'Completed',
        createdAt: '2026-10-01T10:00:00Z',
        q1_satisfaction: 'Satisfied', // 75
        q2_satisfaction: 'Satisfied', // 75
        q3_satisfaction: 'Satisfied', // 75
        q4_agreement: 'Agree', // 75
        q5_recommend: '8', // 80 (10-point scale)
        q6_feedback: 'Unanswered', // filtered out comment/unanswered
      };

      const result = extractCsatMetrics(responseData);
      expect(result.validScore).toBe(76);
      expect(result.count).toBe(5);

      const scoreOut5 = ((result.validScore / 100) * 5).toFixed(1);
      expect(scoreOut5).toBe('3.8');
    });

    it('handles direct numeric ratings on 5-point and 10-point scales', () => {
      // 5-point scale when <= 5 and not nps/10/recommend
      const csat5 = {
        q1: 5, // 100
        q2: 4, // 80
        q3: 3, // 60
      };
      expect(extractCsatMetrics(csat5).validScore).toBe(80);

      // 10-point scale when > 5 or key contains recommend / nps / 10
      const csat10 = {
        recommendation: 8, // (8/10)*100 = 80
        nps_score: 9, // (9/10)*100 = 90
        q_rating_10: 7, // (7/10)*100 = 70
      };
      expect(extractCsatMetrics(csat10).validScore).toBe(80);

      // Numbers > 10 treated as existing percentages
      const csatPct = {
        scoreA: 80,
        scoreB: 90,
      };
      expect(extractCsatMetrics(csatPct).validScore).toBe(85);
    });

    it('handles numeric prefix strings and fractions', () => {
      const responses = {
        q1: '5 - Excellent', // 100 (5-point)
        q2: '4 / 5', // 80 (fraction)
        q3: '8 / 10', // 80 (fraction)
        q4: '8 - Very Likely', // 80 (10-point because 8 > 5)
      };
      // (100 + 80 + 80 + 80) / 4 = 340 / 4 = 85
      expect(extractCsatMetrics(responses).validScore).toBe(85);
    });

    it('filters out metadata keys and comment fields from quantitative average and captures comments', () => {
      const data = {
        id: 'doc_1',
        submittedAt: '2026-05-01',
        updatedAt: '2026-05-02',
        submittedBy: 'John',
        projectId: 'p_1',
        status: 'Done',
        createdAt: '2026-05-01',
        score: 999, // Should be ignored in favor of questions
        q1: 'Very Satisfied', // 100
        q2: 'Satisfied', // 75
        comment: 'Great onboarding experience!',
        additional_notes: 'Keep up the good work.',
        recognize_shoutout: 'Jane was super helpful.',
      };

      const result = extractCsatMetrics(data);
      // (100 + 75) / 2 = 87.5 -> 88
      expect(result.validScore).toBe(88);
      expect(result.count).toBe(2);
      expect(result.comments).toContain('Great onboarding experience!');
      expect(result.comments).toContain('Keep up the good work.');
      expect(result.comments).toContain('Jane was super helpful.');
    });

    it('supports legacy objects with only score field', () => {
      expect(extractCsatMetrics({ score: 4 }).validScore).toBe(80);
      expect(extractCsatMetrics({ score: '85' }).validScore).toBe(85);
      expect(extractCsatMetrics({ score: 5, comments: 'Good job' }).comments).toBe('Good job');
    });
  });

  describe('calculateProjectHealth integration', () => {
    const mockSettings: any = {
      features: ['feature1', 'feature2'],
      scoring: {
        weights: {
          opActivity: 35,
          featAdoption: 25,
          userVol: 15,
          financial: 15,
          csat: 10,
        },
      },
    };

    it('calculates CSAT identically to extractCsatMetrics for project.health.onboardingCsat', () => {
      const project: any = {
        id: 'p1',
        name: 'Alpha Project',
        projectStatus: 'Active',
        opActivity: 80,
        userVol: 80,
        features: ['feature1'],
        health: {
          onboardingCsat: {
            submittedAt: '2026-10-01T10:00:00Z',
            q1: 'Satisfied', // 75
            q2: 'Satisfied', // 75
            q3: 'Satisfied', // 75
            q4: 'Agree', // 75
            recommend: '8', // 80
            notes: 'Unanswered',
          },
        },
      };

      const health = calculateProjectHealth(project, mockSettings);
      expect(health.csat).toBe(76);
    });
  });
});
