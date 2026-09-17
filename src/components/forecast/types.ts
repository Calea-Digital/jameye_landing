/** Shape of src/lang/<locale>/forecast.json — the landing's whole content tree. */
export interface NavLink { label: string; href: string }

export interface FanOutcome {
  label: string;
  pct: number;
  /** The outcome the demo player backed — rendered as the highlighted row. */
  picked?: boolean;
}

export interface FanCard {
  /** Market artwork — real photography of the subject (stadium, court, ring), no portraits. */
  image: string;
  meta: string;
  tone: string;
  name: string;
  lead?: boolean;
  outcomes: FanOutcome[];
  /** Payout multiplier shown on the picked row, e.g. "1.61×". */
  win: string;
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
  /** Optional CSS object-position for the photo, when the subject is off-centre (e.g. "20% 75%"). */
  focus?: string;
  tone: string;
  vertical: string;
  in: string;
  question: string;
  pct: number;
  side: string;
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
  callerFace: string;
  callerName: string;
  callerSide: string;
  vertical: string;
  tone: string;
  question: string;
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
    titleLines: string[];
    titleAccent: string;
    lead: string;
    ctaPrimary: string;
    /** Labels on the hero cards' highlighted row: "You picked" · "Win 1.61×". */
    picked: string;
    win: string;
    fan: FanCard[];
  };
  ticker: TickerItem[];
  /** The showreel between the ticker and the play section (Showreel.astro). */
  video: {
    eyebrow: string;
    titleAccent: string;
    titleRest: string;
    lead: string;
    /** Portrait mp4 under public/video, with a poster frame beside it. */
    src: string;
    poster: string;
    soundOn: string;
    soundOff: string;
    play: string;
    pause: string;
    restart: string;
    seek: string;
  };
  play: {
    eyebrow: string;
    title: string;
    ridersFaces: string[];
    ridersCount: string;
    ridersRest: string;
    market: PlayMarket;
    control: ControlCopy;
  };
  creators: {
    titleAccent: string;
    titleRest: string;
    /** One entry per paragraph under the heading. */
    lead: string[];
    cta: string;
    cards: CreatorCard[];
  };
  markets: {
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    lead: string;
    /** Unused by LiveMarkets, which derives its legend from the cards; kept for older sections. */
    legend: { label: string; tone: string }[];
    cta: string;
    /** Fallback cards, used when the Polymarket feed is unavailable. */
    cards: MarketCard[];
  };
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
    cta: string;
    fineprint: string;
  };
  footer: { signature: string; links: NavLink[] };
}
