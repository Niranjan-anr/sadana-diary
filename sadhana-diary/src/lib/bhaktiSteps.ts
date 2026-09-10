export type BhaktiStepId =
  | 'shraddhavan'
  | 'krishna_sevaka'
  | 'krishna_sadhaka'
  | 'krishna_upasaka'
  | 'srila_prabhupada_ashraya'
  | 'aspiration_assessment'
  | 'first_initiation_recommendation';

export interface BhaktiStepDef {
  id: BhaktiStepId;
  name: string;
  minRounds: number;
  readingList: string[];
}

export const BHAKTI_STEPS: BhaktiStepDef[] = [
  {
    id: 'shraddhavan',
    name: 'Shraddhavan',
    minRounds: 1,
    readingList: [
      'Pancha-tattva mantra',
      'Prabhupada pranam mantra',
      'Sikshastakam',
      'Ten offenses to be avoided',
      'Prayers for offering Bhoga',
      'Prasadam honoring mantra',
    ],
  },
  {
    id: 'krishna_sevaka',
    name: 'Krishna Sevaka',
    minRounds: 4,
    readingList: [
      'Beyond Birth & Death',
      'Science of Self Realization — Ch.1',
      'Bhagavad-gita As It Is — Introduction & Ch.1',
    ],
  },
  {
    id: 'krishna_sadhaka',
    name: 'Krishna Sadhaka',
    minRounds: 8,
    readingList: [
      'Beyond Birth & Death',
      'Science of Self Realization — Ch.1–3',
      'Bhagavad-gita As It Is — Introduction & Ch.1–6',
      'Raja Vidya',
      'Matchless Gift',
      'Krishna Book (recommended)',
    ],
  },
  {
    id: 'krishna_upasaka',
    name: 'Krishna Upasaka',
    minRounds: 12,
    readingList: [
      'Beyond Birth & Death',
      'Science of Self Realization — Ch.1–5',
      'Bhagavad-gita As It Is — Introduction & Ch.1–12',
      'Raja Vidya',
      'Matchless Gift',
      'Krishna Book (recommended)',
    ],
  },
  {
    id: 'srila_prabhupada_ashraya',
    name: 'Srila Prabhupada Ashraya',
    minRounds: 16,
    readingList: [
      'Science of Self Realization — Ch.1–8',
      'Bhagavad-gita As It Is — Introduction & Ch.1–18',
      'Raja Vidya',
      'Matchless Gift',
      'Krishna Book (recommended)',
      'Your Ever Well-Wisher',
      'Teachings of Lord Caitanya — Ch.17',
    ],
  },
  {
    id: 'aspiration_assessment',
    name: 'Aspiration Assessment / Shelter',
    minRounds: 16,
    readingList: [
      'Bhagavad-gita As It Is (twice)',
      'Nectar of Instruction',
      'Nectar of Devotion (up to Ch.19)',
      'Teachings of Lord Caitanya — Ch.17',
    ],
  },
  {
    id: 'first_initiation_recommendation',
    name: 'Recommendation for 1st Initiation',
    minRounds: 16,
    readingList: [
      'Srimad Bhagavatam — Canto 1',
      'Bhagavad-gita As It Is (twice)',
      'Life and Teachings of Lord Chaitanya',
      'Nectar of Instruction',
      'Nectar of Devotion (up to Ch.19)',
    ],
  },
];

export function getBhaktiStep(id: string | null | undefined): BhaktiStepDef | null {
  if (!id) return null;
  return BHAKTI_STEPS.find((s) => s.id === id) ?? null;
}