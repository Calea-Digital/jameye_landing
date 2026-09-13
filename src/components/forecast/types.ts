/** Shape of src/lang/<locale>/forecast.json — the landing's whole content tree. */
export interface NavLink { label: string; href: string }

export interface FanCard {
  /** Market artwork — real photography, no portraits. */
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
  /** Jameye character from public/avatar — never a portrait of a person. */
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
  /** Clip length in seconds — the scrubber's clock runs against it. */
  duration: number;
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
    /** Autoplaying brand film behind the headline. */
    video: string;
    /** Poster for the film, and the fallback when motion is turned down. */
    image: string;
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
    /** Accessible name for the scrubber's play/pause button. */
    playLabel: string;
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
    cards: CreatorCard[];
  };
  markets: {
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    lead: string;
    /** Fallback legend — the section derives it from the live feed when it has one. */
    legend: { label: string; tone: string }[];
    cta: string;
    /** Fallback cards, used when the Polymarket feed is unavailable. */
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
