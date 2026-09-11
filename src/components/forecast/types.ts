/** Shape of src/lang/<locale>/forecast.json — the landing's whole content tree. */
export interface NavLink { label: string; href: string }

export interface FanCard {
  /** AI-generated portrait from public/images/creators — not a real person. */
  image: string;
  meta: string;
  tone: string;
  name: string;
  call: string;
  odds: string;
  lead?: boolean;
  down?: boolean;
}

export interface TickerItem { label: string; value: string; up: boolean }

export interface CreatorCard {
  /** AI-generated portrait from public/images/creators — not a real person. */
  image: string;
  rank: string;
  tone: string;
  name: string;
  stats: string;
  call: string;
  odds: string;
  founding?: boolean;
  down?: boolean;
}

export interface MarketCard {
  image: string;
  tone: string;
  vertical: string;
  in: string;
  question: string;
  pct: number;
  side: string;
}

export interface Gesture {
  image: string;
  icon: 'up' | 'right' | 'check';
  tone: string;
  title: string;
  body: string;
}

export interface BoardRow {
  pos: number;
  face: string;
  name: string;
  tag: string;
  score: string;
  you?: boolean;
}

export interface PlayMarket {
  image: string;
  watching: string;
  callerFace: string;
  callerName: string;
  callerSide: string;
  vertical: string;
  tone: string;
  question: string;
  elapsed: string;
  chartLabel: string;
  yes: number;
  no: number;
  forecasters: string;
  balance: number;
}

export interface ControlCopy {
  yourCall: string;
  balanceLabel: string;
  coins: string;
  step1: string;
  step2: string;
  hint: string;
  payoffLabel: string;
  quick: string[];
  lockIdle: string;
  lockReady: string;
  lockedTitle: string;
  lockedSub: string;
  keep: string;
  again: string;
}

export interface ForecastContent {
  nav: { links: NavLink[]; cta: string };
  hero: {
    image: string;
    badge: string;
    titleLines: string[];
    titleAccent: string;
    lead: string;
    ctaPrimary: string;
    ctaSecondary: string;
    fan: FanCard[];
  };
  ticker: TickerItem[];
  play: {
    eyebrow: string;
    title: string;
    lead: string;
    ridersFaces: string[];
    ridersCount: string;
    ridersRest: string;
    market: PlayMarket;
    control: ControlCopy;
  };
  creators: {
    titleAccent: string;
    titleRest: string;
    lead: string;
    cta: string;
    /** Standing disclaimer: the roster is illustrative until creators sign. */
    note: string;
    cards: CreatorCard[];
  };
  markets: {
    eyebrow: string;
    titleLead: string;
    titleEvery: string;
    titleVertical: string;
    legend: { label: string; tone: string }[];
    cta: string;
    cards: MarketCard[];
  };
  how: { eyebrow: string; title: string; gestures: Gesture[] };
  fiq: {
    eyebrow: string;
    title: string;
    lead: string;
    stats: { value: string; label: string; gradient?: boolean }[];
    boardTitle: string;
    boardPeriod: string;
    rows: BoardRow[];
  };
  skill: {
    eyebrow: string;
    title: string;
    lead: string;
    steps: { n: string; title: string; body: string }[];
  };
  waitlist: {
    eyebrow: string;
    title: string;
    lead: string;
    cardLabel: string;
    nickname: string;
    referred: string;
    referredHint: string;
    squad: string;
    /** The same four characters the waitlist modal offers. */
    characters: string[];
    cta: string;
    fineprint: string;
  };
  footer: { signature: string; links: NavLink[] };
}
