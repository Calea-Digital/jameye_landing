/** Curated prediction “loops” — first wave themed like map / Geo expeditions (no third-party assets). */

export type LoopNodeKind = 'current' | 'locked' | 'reward' | 'boss';
export type LoopNodeCategory =
  | 'Politics & Geopolitics'
  | 'Sport'
  | 'Finance & Macro'
  | 'Companies & Business'
  | 'Crypto'
  | 'Culture & Entertainment'
  | 'Technology';

export interface CuratedLoopNode {
  id: string;
  kind: LoopNodeKind;
  label?: string;
  category: LoopNodeCategory;
  title: string;
  predictionType: string;
  movement: string;
  unlockText?: string;
}

export interface CuratedLoop {
  id: string;
  title: string;
  subtitle: string;
  chapterLabel: string;
  /** e.g. stars collected in chapter */
  progressCurrent: number;
  progressTotal: number;
  nodes: CuratedLoopNode[];
  introSlides: { title: string; body: string }[];
  accentFrom: string;
  accentTo: string;
  /** CSS-ish background hint for cards */
  bgHint: string;
}

export const CURATED_LOOPS: CuratedLoop[] = [
  {
    id: 'expedition-atlas',
    title: 'Expedition: Atlas',
    subtitle: 'Curated world · loop 1',
    chapterLabel: 'Chapter 1',
    progressCurrent: 0,
    progressTotal: 9,
    nodes: [
      { id: 'n1', kind: 'current', label: 'Start', category: 'Politics & Geopolitics', title: '', predictionType: '5 market calls', movement: 'Begin certification' },
      { id: 'n2', kind: 'locked', category: 'Sport', title: 'Sports Arena', predictionType: '5 market calls', movement: 'Keep scoring', unlockText: 'Unlock after your first 5 certified market calls' },
      { id: 'n3', kind: 'locked', category: 'Finance & Macro', title: 'Macro Bridge', predictionType: '5 market calls', movement: 'Sharpen edge', unlockText: 'Unlock by adding 10 markets to your score run' },
      { id: 'n4', kind: 'reward', category: 'Companies & Business', title: 'Company Chest', predictionType: '5 market calls', movement: 'Score checkpoint', unlockText: 'Mid-run checkpoint toward your official Edge Score' },
      { id: 'n5', kind: 'locked', category: 'Culture & Entertainment', title: 'Culture Beat', predictionType: '5 market calls', movement: 'Finish the run', unlockText: 'Unlock by pushing the score run toward 25 markets' },
      { id: 'n6', kind: 'boss', category: 'Technology', title: 'Final: Certification Gate', predictionType: 'Official Edge Score', movement: 'Unlock cash duels', unlockText: 'Finish all 30 markets to certify your Edge Score' },
    ],
    introSlides: [
      {
        title: 'Welcome to Edge Score Builder',
        body: 'Six chapters, five markets each. Answer all 30 to earn an official Edge Score. Once it is certified, cash-prize duels open up.',
      },
      {
        title: 'How it actually works',
        body: 'The path is the story: market calls first, certified Edge Score second, Duel Hall access third.',
      },
    ],
    accentFrom: '#38bdf8',
    accentTo: '#22c55e',
    bgHint: 'linear-gradient(135deg, #06051a 0%, #3a2f6b 45%, #04020c 100%)',
  },
  {
    id: 'norden-grid',
    title: 'Nordic Grid',
    subtitle: 'Precision · loop 2',
    chapterLabel: 'Chapter 1',
    progressCurrent: 0,
    progressTotal: 6,
    nodes: [
      { id: 'a1', kind: 'current', category: 'Politics & Geopolitics', title: 'Nordic Politics', predictionType: 'Government & polling', movement: 'Walk' },
      { id: 'a2', kind: 'locked', category: 'Sport', title: 'Derby Round', predictionType: 'Sports odds', movement: 'Sprint', unlockText: 'Unlock by clearing Nordic Politics' },
      { id: 'a3', kind: 'locked', category: 'Finance & Macro', title: 'Riksbank Lock', predictionType: 'Macro precision', movement: 'Analyze', unlockText: 'Unlock by clearing the Derby Round' },
      { id: 'a4', kind: 'boss', category: 'Companies & Business', title: 'Company Final', predictionType: 'Earnings & guidance', movement: 'Duel', unlockText: 'Clear the full grid round' },
    ],
    introSlides: [
      {
        title: 'Same idea, smaller loop',
        body: 'Four stops instead of five. Real markets, faster runs — in and out before your coffee goes cold. The last one’s still a duel. They all end in a duel.',
      },
    ],
    accentFrom: '#a78bff',
    accentTo: '#f472b6',
    bgHint: 'linear-gradient(145deg, #1e1b4b 0%, #4c0519 100%)',
  },
];
