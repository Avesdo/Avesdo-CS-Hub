export interface ParticipantPrefixOption {
  label: string;
  value: string;
}

export const participantPrefixes: Record<string, ParticipantPrefixOption[]> = {
  Purchasers: [
    {
      label: 'Purchaser 1',
      value: 'c1',
    },
    {
      label: 'Purchaser 2',
      value: 'c2',
    },
    {
      label: 'Purchaser 3',
      value: 'c3',
    },
    {
      label: 'Purchaser 4',
      value: 'c4',
    },
    {
      label: 'Purchaser 5',
      value: 'c5',
    },
    {
      label: 'Purchaser 6',
      value: 'c6',
    },
  ],
  Realtors: [
    {
      label: 'Realtor 1',
      value: 'r1',
    },
    {
      label: 'Realtor 2',
      value: 'r2',
    },
    {
      label: 'Realtor 3',
      value: 'r3',
    },
  ],
  'Sales Rep': [
    {
      label: 'Sales Rep 1',
      value: 's1',
    },
  ],
  Developers: [
    {
      label: 'Developer 1',
      value: 'd1',
    },
    {
      label: 'Developer 2',
      value: 'd2',
    },
    {
      label: 'Developer 3',
      value: 'd3',
    },
  ],
  Assignors: [
    {
      label: 'Assignor 1 (Form Selection)',
      value: 'FromAssignor1',
    },
    {
      label: 'Assignor 2 (Form Selection)',
      value: 'FromAssignor2',
    },
    {
      label: 'Assignor 3 (Form Selection)',
      value: 'FromAssignor3',
    },
  ],
  Assignees: [
    {
      label: 'Assignee 1 (Form Selection)',
      value: 'FromAssignee1',
    },
    {
      label: 'Assignee 2 (Form Selection)',
      value: 'FromAssignee2',
    },
    {
      label: 'Assignee 3 (Form Selection)',
      value: 'FromAssignee3',
    },
    {
      label: 'Assignee 1 (Deal Participants)',
      value: 'o1',
    },
    {
      label: 'Assignee 2 (Deal Participants)',
      value: 'o2',
    },
    {
      label: 'Assignee 3 (Deal Participants)',
      value: 'o3',
    },
  ],
  'Managing Broker': [
    {
      label: 'Managing Broker',
      value: 'ps-managing broker',
    },
  ],
  Guarantors: [
    {
      label: 'Guarantor 1',
      value: 'ps-guarantor',
    },
    {
      label: 'Guarantor 2',
      value: 'ps-guarantor 2',
    },
  ],
  Transferor: [
    {
      label: 'Transferor',
      value: 'ps-transferor',
    },
  ],
};

export const allParticipants: ParticipantPrefixOption[] = Object.values(participantPrefixes).flat();
