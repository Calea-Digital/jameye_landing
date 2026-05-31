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
