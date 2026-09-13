/**
 * Build-time Polymarket feed for the "How it works · Markets" panel.
 *
 * Pulls live binary (Yes/No) markets from Polymarket's public Gamma API and
 * maps them to the shape the section renders. Runs in Astro frontmatter, so it
 * executes once per build (and per request in dev). Any failure resolves to an
 * empty array — the section then falls back to its curated markets, so a flaky
 * network or API change can never break the build.
 */

const GAMMA = 'https://gamma-api.polymarket.com/markets';

export interface LiveMarket {
  id: string;
  label: string;       // short category derived from the question
  question: string;
  image: string;       // remote Polymarket thumbnail
  yes: number;         // 0–100
  no: number;          // 0–100
  volume: string;      // formatted, e.g. "$4.2M"
  liquidity: string;   // formatted
}

function fmtUSD(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return '—';
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${Math.round(n / 1e3)}K`;
  return `$${Math.round(n)}`;
}

// Best-effort category label so the switcher pills read like real verticals.
function labelFor(q: string): string {
  const s = q.toLowerCase();
  if (/\b(bitcoin|btc|ethereum|eth|solana|\bsol\b|crypto|dogecoin|xrp)\b/.test(s)) return 'Crypto';
  if (/\b(president|election|nominee|nomination|senate|congress|governor|trump|biden|democrat|republican|gop|parliament|prime minister)\b/.test(s)) return 'Politics';
  if (/\b(super bowl|nba|nfl|world cup|champions league|premier league|playoffs|fifa|ufc|olympic|grand slam|win the)\b/.test(s)) return 'Sports';
  if (/\b(fed|rate cut|rates|gdp|inflation|recession|cpi|jobs report|unemployment)\b/.test(s)) return 'Economy';
  if (/\b(grammy|oscar|movie|album|box office|spotify|emmy|celebrity|tour)\b/.test(s)) return 'Culture';
  if (/\b(climate|temperature|degrees|hurricane|\bai\b|gpt|openai|nuclear|space|nasa|rocket)\b/.test(s)) return 'Future';
  return 'Trending';
}

function parseList(v: unknown): string[] {
  if (Array.isArray(v)) return v as string[];
  if (typeof v === 'string') {
    try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; } catch { return []; }
  }
  return [];
}

// The Gamma API caps each response at 100 rows, and the highest-volume markets
// are mostly near-certain (boring). Page through the top few hundred by volume
// to gather a healthy pool of in-band candidates.
async function fetchPage(offset: number): Promise<Record<string, unknown>[]> {
  const url = `${GAMMA}?closed=false&active=true&archived=false&order=volumeNum&ascending=false&limit=100&offset=${offset}`;
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) return [];
  return (await res.json()) as Record<string, unknown>[];
}

async function fetchPolymarket(limit: number): Promise<LiveMarket[]> {
  const raw: Record<string, unknown>[] = [];
  for (const offset of [0, 100, 200, 300, 400]) {
    const page = await fetchPage(offset);
    raw.push(...page);
    if (page.length < 100) break;
  }
  if (!raw.length) return [];

  const candidates: LiveMarket[] = [];
  for (const m of raw) {
    const outcomes = parseList(m.outcomes);
    const prices = parseList(m.outcomePrices);
    if (outcomes.length !== 2 || prices.length !== 2) continue;
    // Only standard Yes/No markets so the card's binary framing holds.
    if (outcomes[0]?.toLowerCase() !== 'yes') continue;

    const yes = Math.round(parseFloat(prices[0]) * 100);
    if (!Number.isFinite(yes)) continue;
    // Skip near-certain markets — a 99/1 split makes for a boring card.
    if (yes < 12 || yes > 88) continue;

    const image = (m.icon || m.image) as string | undefined;
    if (!image || typeof image !== 'string') continue;
    const question = typeof m.question === 'string' ? m.question : '';
    if (!question) continue;

    candidates.push({
      id: String(m.id ?? question),
      label: labelFor(question),
      question,
      image,
      yes,
      no: 100 - yes,
      volume: fmtUSD(Number(m.volumeNum ?? m.volume ?? 0)),
      liquidity: fmtUSD(Number(m.liquidityNum ?? m.liquidity ?? 0)),
    });
  }

  // Prefer one market per category for variety, then top up to `limit`.
  const picked: LiveMarket[] = [];
  const seenLabel = new Set<string>();
  for (const c of candidates) {
    if (seenLabel.has(c.label)) continue;
    seenLabel.add(c.label);
    picked.push(c);
    if (picked.length >= limit) break;
  }
  if (picked.length < limit) {
    const ids = new Set(picked.map((p) => p.id));
    for (const c of candidates) {
      if (ids.has(c.id)) continue;
      picked.push(c);
      if (picked.length >= limit) break;
    }
  }
  return picked;
}

// Memoize per process so multiple renders in one build/dev session share one fetch.
let cache: Promise<LiveMarket[]> | null = null;

export function getLiveMarkets(limit = 6): Promise<LiveMarket[]> {
  if (!cache) {
    cache = fetchPolymarket(limit).catch(() => [] as LiveMarket[]);
  }
  return cache;
}

/* ---------------------------------------------------------------------------
   Sports fixtures — the "Live markets" grid.

   Review note (Sep 2026): the grid ran on stock photography that read as
   AI-generated, and the top of Polymarket by volume is elections and war. Both
   were called out ("real pics from polymarket", "no war markets — just action
   and fun"), so this pulls the *sports* tag and keeps only head-to-head
   fixtures priced on the two competitors: real artwork, real odds, and a side
   that reads like a team rather than a bare YES/NO. Any failure resolves to an
   empty array and the section falls back to its curated cards.
   --------------------------------------------------------------------------- */

const GAMMA_EVENTS = 'https://gamma-api.polymarket.com/events';

/** Belt and braces on top of the sports tag — never surface a conflict market. */
const EXCLUDE = /\b(war|invade|invasion|ceasefire|missile|nuclear|troops|military|hostage|election|president|senate|congress|parliament|assassinat|coup|died|death|dies)\b/i;

/** At most two fixtures from one competition, so the grid isn't all one sport. */
const PER_LEAGUE = 2;

export interface SportsFixture {
  id: string;
  league: string;    // e.g. "NFL", "Tennis", "Esports"
  question: string;  // the fixture, e.g. "Falcons vs. Steelers"
  image: string;     // real Polymarket artwork
  pct: number;       // 0–100, the favourite
  side: string;      // the favourite's name
  volume: string;    // formatted, e.g. "$243K"
}

/**
 * Polymarket titles carry the game as a prefix and the stage as a suffix
 * ("Counter-Strike: G2 vs Legacy (BO5) - FISSURE PLAYGROUND Playoffs"). Both
 * live elsewhere on the card, so the fixture is all that's left.
 */
function fixtureTitle(title: string): string {
  return title
    .replace(/\s*-\s*More Markets$/i, '')
    .replace(/\s*\((?:BO\d|Best of \d)\)/i, '')
    .replace(/^[^:]{2,24}:\s*/, '')
    .replace(/\s+-\s+[^-]{3,40}$/, '')
    .trim();
}

/** Prefer the most specific tag ("NFL") over the umbrella one ("Sports"). */
function leagueOf(tags: unknown): string {
  if (!Array.isArray(tags)) return 'Sports';
  for (const tag of tags) {
    if (!tag || typeof tag !== 'object') continue;
    const label = String((tag as { label?: unknown }).label ?? '').trim();
    if (!label || label.length > 18) continue;
    if (/^(sports|games|all|weekly|recurring)$/i.test(label)) continue;
    // Acronyms come through lowercase from the API ("cfb", "ucl").
    return label.length <= 4 ? label.toUpperCase() : label.replace(/^\w/, (c) => c.toUpperCase());
  }
  return 'Sports';
}

/** The competitor-priced line for a fixture, if it is genuinely contested. */
function favourite(markets: unknown): { pct: number; side: string } | null {
  if (!Array.isArray(markets)) return null;
  for (const m of markets as Record<string, unknown>[]) {
    const outcomes = parseList(m.outcomes);
    const prices = parseList(m.outcomePrices).map(Number);
    if (outcomes.length !== 2 || prices.length !== 2) continue;
    // Yes/No lines on a fixture are props ("ends in a draw?") — the card wants
    // the moneyline, where the outcomes are the two competitors.
    if (/^(yes|no)$/i.test(outcomes[0] ?? '')) continue;
    if (!prices.every((p) => Number.isFinite(p))) continue;

    const top = prices[0] >= prices[1] ? 0 : 1;
    const pct = Math.round(prices[top] * 100);
    // A 50/50 or a 95/5 both make for a dead card.
    if (pct < 52 || pct > 90) continue;

    const side = (outcomes[top] ?? '').trim();
    if (!side) continue;
    return { pct, side };
  }
  return null;
}

async function fetchFixtures(limit: number): Promise<SportsFixture[]> {
  const url =
    `${GAMMA_EVENTS}?closed=false&active=true&archived=false&tag_slug=sports` +
    `&order=volume24hr&ascending=false&limit=60`;

  const res = await fetch(url, {
    headers: { accept: 'application/json' },
    // A marketing page must never hang a build on a third-party API.
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return [];

  const events = (await res.json()) as Record<string, unknown>[];
  const out: SportsFixture[] = [];
  const seen = new Set<string>();
  const perLeague = new Map<string, number>();

  for (const ev of events) {
    const raw = typeof ev.title === 'string' ? ev.title : '';
    const image = typeof ev.image === 'string' ? ev.image : '';
    if (!raw || !image || EXCLUDE.test(raw)) continue;
    if (!/\bvs\.?\b/i.test(raw)) continue;

    const question = fixtureTitle(raw);
    if (!question || seen.has(question)) continue;

    const league = leagueOf(ev.tags);
    if ((perLeague.get(league) ?? 0) >= PER_LEAGUE) continue;

    const best = favourite(ev.markets);
    if (!best) continue;

    seen.add(question);
    perLeague.set(league, (perLeague.get(league) ?? 0) + 1);
    out.push({
      id: String(ev.id ?? question),
      league,
      question,
      image,
      pct: best.pct,
      side: best.side,
      volume: fmtUSD(Number(ev.volume ?? 0)),
    });
    if (out.length >= limit) break;
  }

  return out;
}

let fixtureCache: Promise<SportsFixture[]> | null = null;

/** Memoized per process, so every render in one build shares a single fetch. */
export function getSportsFixtures(limit = 6): Promise<SportsFixture[]> {
  if (!fixtureCache) fixtureCache = fetchFixtures(limit).catch(() => [] as SportsFixture[]);
  return fixtureCache;
}
