/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ScoringSettingsTab } from '../ScoringSettingsTab';
import { useAppStore } from '../../../store/useAppStore';
import { usePermissions } from '../../../hooks/usePermissions';
import { saveSettings } from '../../../api/dbService';

vi.mock('../../../store/useAppStore');
vi.mock('../../../hooks/usePermissions');
vi.mock('../../../api/dbService', () => ({
  saveSettings: vi.fn().mockResolvedValue({ success: true }),
}));
vi.mock('../../../utils/toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    promise: vi.fn(async (promise) => await promise),
  },
}));

// Mock DonutChart to simplify DOM
vi.mock('../../ui/DonutChart', () => ({
  DonutChart: ({ total }: any) => <div data-testid="donut-chart">Total: {total}</div>,
}));

// Mock DualThumbSlider
vi.mock('../../ui/DualThumbSlider', () => ({
  DualThumbSlider: ({ value, onChange, disabled }: any) => (
    <div data-testid="dual-thumb-slider">
      <button
        data-testid="slider-change"
        disabled={disabled}
        onClick={() => onChange({ warning: 45, healthy: 85 })}
      >
        Change Thresholds
      </button>
      <span data-testid="warning-val">{value.warning}</span>
      <span data-testid="healthy-val">{value.healthy}</span>
    </div>
  ),
}));

describe('ScoringSettingsTab', () => {
  const initialSettings = {
    scoring: {
      weights: {
        opActivity: 35,
        featAdoption: 25,
        userVol: 15,
        financial: 15,
        csat: 10,
      },
      thresholds: {
        healthy: 80,
        warning: 50,
      },
    },
  };

  let mockStore: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockStore = {
      settings: initialSettings,
      setAppState: vi.fn((newState) => {
        mockStore = newState;
      }),
    };

    (useAppStore as any).mockImplementation((selector: any) => selector(mockStore));
    (useAppStore as any).getState = () => mockStore;
    (usePermissions as any).mockReturnValue({
      hasPermission: () => true,
    });
  });

  it('renders initial weights and balanced guidance indicator', () => {
    render(<ScoringSettingsTab />);

    expect(screen.getByText('Total: 100% (Balanced)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save weights/i })).toBeDisabled();
    expect(screen.queryByRole('button', { name: /discard changes/i })).not.toBeInTheDocument();
  });

  it('allows direct number inputs and updates total guidance dynamically', () => {
    render(<ScoringSettingsTab />);

    const numberInputs = screen.getAllByRole('spinbutton');
    expect(numberInputs).toHaveLength(5);

    // Change first input from 35 to 25 (total becomes 90%)
    fireEvent.change(numberInputs[0], { target: { value: '25' } });

    expect(screen.getByText('Total: 90% (10% remaining)')).toBeInTheDocument();
    // Save Weights should be disabled because total !== 100
    expect(screen.getByRole('button', { name: /save weights/i })).toBeDisabled();
    // Discard Changes button should appear
    expect(screen.getByRole('button', { name: /discard changes/i })).toBeInTheDocument();

    // Change another input to make total > 100%
    fireEvent.change(numberInputs[1], { target: { value: '45' } });
    expect(screen.getByText('Total: 110% (10% over)')).toBeInTheDocument();
  });

  it('discards weights changes when Discard Changes is clicked', () => {
    render(<ScoringSettingsTab />);

    const numberInputs = screen.getAllByRole('spinbutton');
    fireEvent.change(numberInputs[0], { target: { value: '20' } });

    expect(screen.getByText('Total: 85% (15% remaining)')).toBeInTheDocument();

    const discardBtn = screen.getByRole('button', { name: /discard changes/i });
    fireEvent.click(discardBtn);

    expect(screen.getByText('Total: 100% (Balanced)')).toBeInTheDocument();
    expect(numberInputs[0]).toHaveValue(35);
  });

  it('enables Save Weights when dirty and balanced at 100%, and calls saveSettings with silent: true', async () => {
    render(<ScoringSettingsTab />);

    const numberInputs = screen.getAllByRole('spinbutton');
    // Shift 5% from opActivity to featAdoption: 35 -> 30, 25 -> 30 (sum still 100%)
    fireEvent.change(numberInputs[0], { target: { value: '30' } });
    fireEvent.change(numberInputs[1], { target: { value: '30' } });

    expect(screen.getByText('Total: 100% (Balanced)')).toBeInTheDocument();
    const saveBtn = screen.getByRole('button', { name: /save weights/i });
    expect(saveBtn).toBeEnabled();

    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(saveSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          scoring: expect.objectContaining({
            weights: expect.objectContaining({
              opActivity: 30,
              featAdoption: 30,
            }),
          }),
        }),
        { silent: true }
      );
    });

    // Optimistic update should have been called on store
    expect(mockStore.setAppState).toHaveBeenCalled();
  });

  it('does NOT overwrite in-progress weight edits when background sync updates other settings', () => {
    const { rerender } = render(<ScoringSettingsTab />);

    const numberInputs = screen.getAllByRole('spinbutton');
    // Edit opActivity to 40
    fireEvent.change(numberInputs[0], { target: { value: '40' } });
    expect(numberInputs[0]).toHaveValue(40);

    // Simulate background store update (e.g. client/project sync that creates new settings object)
    mockStore = {
      ...mockStore,
      settings: {
        ...mockStore.settings,
        statuses: [{ name: 'New Status' }],
      },
    };
    (useAppStore as any).mockImplementation((selector: any) => selector(mockStore));
    (useAppStore as any).getState = () => mockStore;

    rerender(<ScoringSettingsTab />);

    // In-progress edit MUST be preserved!
    expect(numberInputs[0]).toHaveValue(40);
  });

  it('handles KPI threshold edits, discard and save', async () => {
    render(<ScoringSettingsTab />);

    const sliderChangeBtn = screen.getByTestId('slider-change');
    fireEvent.click(sliderChangeBtn);

    // Thresholds changed to 45 and 85
    expect(screen.getByTestId('warning-val')).toHaveTextContent('45');
    expect(screen.getByTestId('healthy-val')).toHaveTextContent('85');

    const saveThresholdsBtn = screen.getByRole('button', { name: /save thresholds/i });
    expect(saveThresholdsBtn).toBeEnabled();

    fireEvent.click(saveThresholdsBtn);

    await waitFor(() => {
      expect(saveSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          scoring: expect.objectContaining({
            thresholds: { warning: 45, healthy: 85 },
          }),
        }),
        { silent: true }
      );
    });
  });
});
