import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScheduleSettingsTab } from '../ScheduleSettingsTab';
import { useAppStore } from '../../../store/useAppStore';
import { usePermissions } from '../../../hooks/usePermissions';
import { saveSettings } from '../../../api/dbService';

// Mock child components to isolate ScheduleSettingsTab unit tests
vi.mock('../../../store/useAppStore');
vi.mock('../../../hooks/usePermissions');
vi.mock('../../../api/dbService', () => ({
  saveSettings: vi.fn().mockResolvedValue(true),
  saveTimeOff: vi.fn().mockResolvedValue(true),
  deleteTimeOff: vi.fn().mockResolvedValue(true),
  saveStatutoryHoliday: vi.fn().mockResolvedValue(true),
  deleteStatutoryHoliday: vi.fn().mockResolvedValue(true),
}));

vi.mock('../../../components/ui/MultiSelect', () => ({
  MultiSelect: ({ options, values, onChange, disabled, placeholder }: any) => (
    <div data-testid="mock-multiselect" data-disabled={disabled}>
      <button
        type="button"
        disabled={disabled}
        aria-label={placeholder}
        onClick={() => {
          if (disabled) return;
          const next = options.find((o: any) => !values.includes(o.value));
          if (next) onChange([...values, next.value]);
        }}
      >
        {placeholder}
      </button>
      <div data-testid="select-options">
        {options.map((o: any) => (
          <span key={o.value} data-testid={`opt-${o.value}`}>
            {o.label}
          </span>
        ))}
      </div>
    </div>
  ),
}));

describe('ScheduleSettingsTab', () => {
  const mockSettings = {
    id: 'default',
    estManagers: ['user-1'],
    pstManagers: [],
    pstWedSatManagers: ['user-2', 'user-3'],
    pstSunWedManagers: [],
    timeOff: [{ startDate: '2099-01-01', endDate: '2099-01-05', manager: 'user-1' }],
    statHolidays: [{ date: '2099-12-25', name: 'Christmas Day' }],
  };

  const mockUsers = [
    { uid: 'user-1', name: 'Alice Smith', email: 'alice@example.com', isAccountManager: true },
    { uid: 'user-2', name: 'Bob Jones', email: 'bob@example.com', isAccountManager: true },
    { uid: 'user-3', name: 'Charlie Brown', email: 'charlie@example.com', isAccountManager: true },
    { uid: 'user-4', name: 'David Miller', email: 'david@example.com', isAccountManager: false }, // Not an AM
    {
      uid: 'user-5',
      name: 'Eve White',
      email: 'eve@example.com',
      isAccountManager: true,
      isDeactivated: true,
    }, // Deactivated
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    (usePermissions as any).mockReturnValue({
      hasPermission: vi.fn((perm) => perm === 'edit_schedule'),
    });

    (useAppStore as any).mockImplementation((selector: any) =>
      selector({
        settings: mockSettings,
        users: mockUsers,
      })
    );
  });

  it('renders shift cards correctly with status badges', () => {
    render(<ScheduleSettingsTab />);

    expect(screen.getByText('Shift Coverage Assignments')).toBeInTheDocument();
    expect(screen.getByText('Mon–Fri • 9:00 AM – 5:00 PM EST')).toBeInTheDocument();
    expect(screen.getByText('Mon–Fri • 9:00 AM – 5:00 PM PST')).toBeInTheDocument();
    expect(screen.getByText('Wed–Sat • 8:00 AM – 6:00 PM PST')).toBeInTheDocument();
    expect(screen.getByText('Sun–Wed • 8:00 AM – 6:00 PM PST')).toBeInTheDocument();

    // 9-5 EST has 1 manager
    expect(screen.getByText('1 Manager')).toBeInTheDocument();

    // 8-6 PST (Wed-Sat) has 2 managers
    expect(screen.getByText('2 Managers')).toBeInTheDocument();

    // 9-5 PST and 8-6 PST (Sun-Wed) are unassigned
    const unassignedBadges = screen.getAllByText('Unassigned');
    expect(unassignedBadges).toHaveLength(2);
  });

  it('does NOT render the Assigned Team label anywhere', () => {
    render(<ScheduleSettingsTab />);
    expect(screen.queryByText(/Assigned Team/i)).not.toBeInTheDocument();
  });

  it('filters accountManagerOptions to only active account managers', () => {
    render(<ScheduleSettingsTab />);

    // Should contain Alice, Bob, Charlie (active AMs)
    const activeAmAlice = screen.getAllByTestId('opt-user-1');
    expect(activeAmAlice.length).toBeGreaterThan(0);
    expect(activeAmAlice[0]).toHaveTextContent('Alice Smith');

    const activeAmBob = screen.getAllByTestId('opt-user-2');
    expect(activeAmBob.length).toBeGreaterThan(0);

    const activeAmCharlie = screen.getAllByTestId('opt-user-3');
    expect(activeAmCharlie.length).toBeGreaterThan(0);

    // Should NOT contain David Miller (not AM) or Eve White (deactivated)
    expect(screen.queryByTestId('opt-user-4')).not.toBeInTheDocument();
    expect(screen.queryByTestId('opt-user-5')).not.toBeInTheDocument();
  });

  it('calls saveSettings when updating shift members via MultiSelect', () => {
    render(<ScheduleSettingsTab />);

    // Trigger change on 9-5 PST multi-select button
    const buttons = screen.getAllByRole('button', { name: /Assign managers.../i });
    // PST is the second shift (index 1)
    fireEvent.click(buttons[1]);

    expect(saveSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        pstManagers: ['user-1'],
      })
    );
  });

  it('renders time off records and statutory holidays', () => {
    render(<ScheduleSettingsTab />);

    expect(screen.getByText('Time Off Records')).toBeInTheDocument();
    expect(screen.getByText('Statutory Holidays')).toBeInTheDocument();
    expect(screen.getByText('Christmas Day')).toBeInTheDocument();
  });

  it('disables controls when user lacks edit_schedule permission', () => {
    (usePermissions as any).mockReturnValue({
      hasPermission: vi.fn(() => false),
    });

    render(<ScheduleSettingsTab />);

    const disabledMultiSelects = screen.getAllByTestId('mock-multiselect');
    disabledMultiSelects.forEach((ms) => {
      expect(ms).toHaveAttribute('data-disabled', 'true');
    });

    // Add buttons should not be present when canEdit is false
    expect(screen.queryByText('Add Time Off')).not.toBeInTheDocument();
    expect(screen.queryByText('Add Holiday')).not.toBeInTheDocument();
  });
});
