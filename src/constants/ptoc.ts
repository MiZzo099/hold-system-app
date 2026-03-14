export const DEFAULT_SPREADSHEET_ID = '1uFGDw1pzpukKtirExoGRbMLrqSvbf1aWlLlxrNM6JyM';

export interface HoldReasonDefinition {
  category: string;
  label: string;
  note: string;
  routing: 'referral' | 'benefits' | 'customercare' | 'clinic';
  isDynamic?: boolean;
}

export const PTOC_USER_NAMES: Record<string, string> = {
  'auth28@cobsolution.com': 'Mostafa Hassan',
  'auth29@cobsolution.com': 'Omar Abdullah',
  'menna.sayed@cobsolution.com': 'Menna Sayed',
  'billing35@cobsolution.com': 'Aya Mohamed',
  'auth19@cobsolution.com': 'Rashwan',
  'ali.esmail@cobsolution.com': 'Ali Esmail',
  'billing52@cobsolution.com': 'Shaimaa Khaled',
  'billing11@cobsolution.com': 'Menna Bassem',
  'auth21@cobsolution.com': 'Osama Nabil',
  'billing37@cobsolution.com': 'Moustafa Ghareeb',
  'billing55@cobsolution.com': 'Nada Mohamed',
  'mohamed.elsamman@cobsolution.com': 'Samman',
  'khloud.waleed@cobsolution.com': 'Laylah',
  'billing44@cobsolution.com': 'Osama Mohsen',
  'enas.abbas@cobsolution.com': 'Enas Abbas',
};

export const HOLD_REASONS: HoldReasonDefinition[] = [
  {
    category: 'Missing Referral',
    label: 'No Referral on Chart',
    note: 'We need to hold this patient because there is no referral on file. The patient cannot be seen until we receive a valid referral document related to the treated body part.',
    routing: 'referral',
  },
  {
    category: 'Missing Referral',
    label: 'Restricted Clearance (Direct Access)',
    note: 'Until the patient brings a referral, the patient can be seen for ONLY 10 sessions during one month by the approved physical therapists for that location.',
    routing: 'referral',
    isDynamic: true,
  },
  {
    category: 'Missing Referral',
    label: 'MD Signature Missing',
    note: 'The referral must be hand-signed by the patient\'s MD before the patient can continue treatment.',
    routing: 'referral',
  },
  {
    category: 'Pending Authorization',
    label: 'Pending Authorization from Medical Doctor',
    note: 'This patient\'s account is currently on Hold pending authorization from their Medical Doctor.',
    routing: 'customercare',
  },
  {
    category: 'Pending Authorization',
    label: 'Pending Authorization from Insurance',
    note: 'This patient\'s account is currently on Hold pending authorization from their insurance provider.',
    routing: 'customercare',
  },
  {
    category: 'New Case Required',
    label: 'New Case — Denied Authorization',
    note: 'The authorization request has been denied. A new case with a medically necessary body part or self-pay is required to continue treatment.',
    routing: 'clinic',
  },
  {
    category: 'New Case Required',
    label: 'New Case — Duplicate (Same Body Part Within 3 Months)',
    note: 'A duplicate case has been identified for the same body part within a 3-month period. A new case is required to proceed.',
    routing: 'clinic',
  },
  {
    category: 'COB Update',
    label: 'COB Update — Primary / Secondary',
    note: 'The patient must call the insurance and update Coordination of Benefits before treatment may continue.',
    routing: 'benefits',
  },
  {
    category: 'COB Update',
    label: 'COB Update — WC / NF Case Still Active',
    note: 'The patient must confirm the WC/NF case is closed and update insurance records.',
    routing: 'benefits',
  },
  {
    category: 'COB Update',
    label: 'COB Update — Medicare Shows Inactive Primary Insurance',
    note: 'Medicare shows another active primary insurance that must be corrected before treatment may continue.',
    routing: 'benefits',
  },
  {
    category: 'Coverage Issue',
    label: 'Coverage Issue — Insurance Inactive',
    note: 'The patient must provide active insurance information before visits can continue.',
    routing: 'benefits',
  },
  {
    category: 'Coverage Issue',
    label: 'Coverage Issue — Met Annual Visit Limit',
    note: 'The patient has exhausted their annual visit limit under the current insurance.',
    routing: 'benefits',
  },
  {
    category: 'Coverage Issue',
    label: 'Coverage Issue — No Medicare ID',
    note: 'No Medicare ID is on file. The patient must provide it so coverage can be verified.',
    routing: 'benefits',
  },
  {
    category: 'Coverage Issue',
    label: 'Coverage Issue — Insurance Not Accepted',
    note: 'The patient\'s insurance is not accepted. Another accepted insurance or self-pay is required.',
    routing: 'benefits',
  },
  {
    category: 'Coverage Issue WC',
    label: 'Coverage Issue WC — Negative IME',
    note: 'Authorization cannot be obtained under WC due to a negative IME. Commercial insurance or self-pay is required.',
    routing: 'benefits',
  },
  {
    category: 'Coverage Issue WC',
    label: 'Coverage Issue WC — Claim Controverted',
    note: 'Workers\' Compensation has been controverted. Commercial insurance or self-pay is required.',
    routing: 'benefits',
  },
  {
    category: 'Coverage Issue WC',
    label: 'Coverage Issue WC — Denied Authorization',
    note: 'Authorization has been denied under WC. A commercial insurance is required to proceed.',
    routing: 'benefits',
  },
  {
    category: 'Insurance Consent',
    label: 'Insurance Consent Required',
    note: 'The insurance requires a signed consent confirming the patient is treating exclusively at our office.',
    routing: 'clinic',
  },
  {
    category: 'Discharge Letter',
    label: 'Discharge Letter from Old Provider Required',
    note: 'The insurance has an open case with another provider. A discharge letter is required before proceeding.',
    routing: 'clinic',
  },
];

export const HOLD_REASON_GROUPS = HOLD_REASONS.reduce<Record<string, HoldReasonDefinition[]>>((acc, item) => {
  if (!acc[item.category]) {
    acc[item.category] = [];
  }

  acc[item.category].push(item);
  return acc;
}, {});

export function getReasonByLabel(label: string): HoldReasonDefinition | undefined {
  return HOLD_REASONS.find((reason) => reason.label === label);
}

export function formatUserDisplay(value: string): string {
  const normalized = value.trim().toLowerCase();
  return PTOC_USER_NAMES[normalized] ?? value;
}
