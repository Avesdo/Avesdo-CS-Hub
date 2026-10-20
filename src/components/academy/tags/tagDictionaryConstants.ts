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
    {
      label: 'Developer 4',
      value: 'd4',
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
  'Assignees (Form Selection)': [
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
  ],
  'Assignees (Deal Participants)': [
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
    {
      label: 'Assignee 4 (Deal Participants)',
      value: 'o4',
    },
  ],
  'Purchaser or Assignee': [
    {
      label: 'Purchaser or Assignee 1',
      value: 'co1',
    },
    {
      label: 'Purchaser or Assignee 2',
      value: 'co2',
    },
    {
      label: 'Purchaser or Assignee 3',
      value: 'co3',
    },
    {
      label: 'Purchaser or Assignee 4',
      value: 'co4',
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

export const DEFAULT_CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'Listing Information':
    'Property, suite, address, and custom inventory fields pulled directly from the Listing Setup uploaded to the project.',
  'Deal Information':
    'Financial figures, inclusions, upgrades, commissions, deposits, and payment receipt details specific to the transaction.',
  'Deal Participants':
    'Contact details, identification, corporate signer fields, and signature/initial tags for everyone involved in the deal. Use the participant selector to switch prefixes.',
  Dates:
    'Dynamic date and time tags for contract creation, deal milestones, deposit schedules, and participant signing timestamps.',
  Special:
    'Advanced template builders for combining multiple tags, inserting spacing, counting participants, and writing conditional or math expressions.',
  'Formatting Tags':
    'Prefix modifiers that format numbers, currency, written-out dollar amounts, and dates when placed directly in front of another tag.',
};

export const DEFAULT_SUBCATEGORY_DESCRIPTIONS: Record<string, Record<string, string>> = {
  'Listing Information': {
    'Listing Information':
      'Details from the Listing Setup uploaded to the project. Contains suite numbers, civic and legal addresses, floor plan specifications, strata fees, and custom listing columns (PropExtraTag1–10).',
    'Property & Unit Details':
      'Details from the Listing Setup uploaded to the project. Contains suite numbers, civic and legal addresses, floor plan specifications, strata fees, and custom listing columns (PropExtraTag1–10).',
  },
  'Deal Information': {
    Parking:
      'Included and additional parking stall counts, prices, stall-type labels, and checkbox tags.',
    Storage:
      'Included and additional storage locker counts, prices, locker-type labels, and checkbox tags.',
    'Bike Locker':
      'Included and additional bike locker counts, prices, locker-type labels, and checkbox tags.',
    'Colour Scheme':
      'Selected interior colour scheme name, upgrade cost, and checkbox tags for specific scheme options.',
    Options: 'Custom upgrade options and option pricing configured on the project.',
    Commissions:
      'Buyer realtor commission percentages, tiered dollar amounts, flat bonuses, and realtor-to-purchaser credits.',
    'Realtor Commission':
      'Buyer realtor commission percentages, tiered dollar amounts, flat bonuses, and realtor-to-purchaser credits.',
    'Seller Commission':
      'Seller / listing brokerage commission percentages, tiered dollar amounts, and total seller commission calculations.',
    'Disclosure of Remuneration':
      'Remuneration disclosure figures, combined commission amounts, and net proceeds calculations.',
    Notes: 'Subject notes and custom transaction remarks entered on the deal.',
    'Purchase Price':
      'Base purchase price, total purchase price with upgrades, and net-of-tax calculations.',
    Deposits:
      'Individual deposit installment amounts (Deposit1–Deposit5) and occupancy deposit amounts.',
    Amounts:
      'Other financial amounts from the Deal Details, including credits/decorating allowances, total upgrade costs, additional costs, assignment fees, and GST rebates.',
    'EFT Receipts':
      'Electronic Funds Transfer (EFT) deposit receipt details, including issued dates, due dates, amounts, and account holder names.',
  },
  'Deal Participants': {
    Purchasers:
      'Primary and co-purchaser (c1–c6) contact info, citizenship, ID verification, corporate fields, and signature/initial tags (including Purchaser witness tags w1–w6).',
    Realtors:
      'External buyer realtor (r1–r3) contact details, brokerage information, tax numbers (GST/HST/Tax), and license numbers.',
    'Sales Rep':
      'In-house project sales representative (s1) contact details, brokerage info, and signature/initial tags.',
    'Realtor or Sales Rep':
      "Fallback tags that automatically populate the Buyer Realtor's info if present on the deal, or the Sales Rep's info if no Realtor is attached.",
    Developers: 'Developer authorized signatory (d1–d4) signature and initial tags.',
    Assignors:
      'Original purchaser / assignor (FromAssignor1–3) contact details, ID fields, and signature/initial tags for assignment agreements (including Assignor witness tags).',
    'Assignees (Form Selection)':
      'New buyer / assignee (FromAssignee1–3) contact details, ID fields, and signature/initial tags for forms generated via Form Selection (including Assignee witness tags).',
    'Assignees (Deal Participants)':
      'New buyer / assignee (o1–o4) contact details, ID fields, and signature/initial tags pulled from the Deal Participants tab (including Assignee witness tags v1–v4).',
    'Purchaser or Assignee':
      'Dynamic participant tags (co1–co4) and witness tags (cow1–cow4) that populate either the Purchaser or the Assignee depending on whether the deal has been assigned.',
    'Managing Broker':
      'Managing Broker (ps-managing broker) name, contact details, and signature/initial tags.',
    Guarantors: 'Deal Guarantor (ps-guarantor) name, contact details, and signature/initial tags.',
    Transferor: 'Transferor (ps-transferor) name, contact details, and signature/initial tags.',
  },
  Dates: {
    "Today's Date": 'Populates the current date or time at the moment the document is generated.',
    'Contract Date':
      'Populates the date the contract was originally created (CreatedFull, day, month, and year breakdowns).',
    'Deposit Dates': 'Scheduled due dates for deposits and the Occupancy Deposit.',
    'Deal Dates':
      'Key transaction milestone dates including Accepted Date, Rescission Expiry, Completion, Estimated Completion, Possession, and Adjustment dates.',
    'Offer Open for Acceptance Dates':
      "Expiration date and time breakdowns for how long the buyer's offer remains open for acceptance.",
    'Subject Dates': 'Subject removal and condition expiry dates configured on the deal.',
    'Form Dates':
      'Custom date fields captured on a form (form[Example]Full, day, month, and year breakdowns).',
    'Formatting Dates & Times':
      'Prefix modifiers (fdateshort_, fdatefull_, fdatetime_, etc.) placed in front of any date tag to reformat how the date or time displays.',
    'Future Dates':
      'Delayed-evaluation wrapper tags (future_[signature]_[datetag]) that wait to populate a date until a specific participant signs the document.',
    'Sign Dates':
      'Participant contract signing dates (SignDate) and relative future dates calculated 30 to 720 days after signing (SignDate30–SignDate720). Can be split by using fdate tags (e.g., future_c1s_fdateday_SignDate).',
    'Contract Signing Dates':
      'Timestamps for when the original contract or subsequent addenda were signed by the Purchaser or Developer.',
  },
  Special: {
    'Combining Tags & Spacing':
      "Connectors (_, ,, _B[1-9]_) for joining multiple tags into a single field, plus CXContractName to list all purchasers separated by 'and'.",
    'Special Tags':
      'Deal participant counters (CountPurchaser, CountRealtor, CountAssignee), realtor presence checkboxes, static text (text_), and blank addendum fields.',
    'Agency Disclosure Tags':
      'Conditional prefixes (da and cr) that only populate the attached tag depending on whether a Designated Realtor is on the deal.',
    'Math & Logic Tags':
      'Formula prefixes (math_ and logic_) for performing arithmetic across price tags or displaying conditional values based on deal rules.',
  },
  'Formatting Tags': {
    'Formatting Numbers & Currency':
      'Prefix modifiers (fn0_, fc2_, fspell_, fupper_, etc.) for rounding numbers, adding dollar signs/decimals, or spelling numbers out in words.',
    'Formatting Dates & Times':
      'Prefix modifiers (fdateshort_, fdatefull_, fdatetime_, etc.) placed in front of any date tag to customize its date or time format.',
  },
};

export function getDefaultCategoryDescription(primary: string): string | undefined {
  if (DEFAULT_CATEGORY_DESCRIPTIONS[primary]) return DEFAULT_CATEGORY_DESCRIPTIONS[primary];
  const normalizedPrimary = primary.trim().toLowerCase();
  return Object.entries(DEFAULT_CATEGORY_DESCRIPTIONS).find(
    ([k]) => k.trim().toLowerCase() === normalizedPrimary
  )?.[1];
}

export function getDefaultSubcategoryDescription(primary: string, sub: string): string | undefined {
  const primaryMap =
    DEFAULT_SUBCATEGORY_DESCRIPTIONS[primary] ||
    Object.entries(DEFAULT_SUBCATEGORY_DESCRIPTIONS).find(
      ([k]) => k.toLowerCase() === primary.trim().toLowerCase()
    )?.[1];
  if (!primaryMap) return undefined;
  if (primaryMap[sub]) return primaryMap[sub];
  const normalizedSub = sub.trim().toLowerCase();
  return Object.entries(primaryMap).find(([k]) => k.trim().toLowerCase() === normalizedSub)?.[1];
}
