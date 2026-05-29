#!/usr/bin/env node
/**
 * Seed the Jameye waitlist with synthetic users that have a realistic spread
 * of referral points (points = referrals × 5, computed by the leaderboard).
 *
 * The backend (waitlist.jameye.com) exposes NO reset/delete endpoint, so this
 * script only ADDS rows. Wipe the DB on the backend first if you want a clean
 * start — this script cannot do that for you.
 *
 * Usage:
 *   node scripts/seed-waitlist.mjs                 # DRY RUN — prints stats + samples, no writes
 *   node scripts/seed-waitlist.mjs --commit        # actually POSTs to the API
 *   node scripts/seed-waitlist.mjs --commit --count 1200 --base https://waitlist.jameye.com --concurrency 6
 *
 * Flags:
 *   --commit            actually send POST /api/waitlist/signup requests (default: dry run)
 *   --count N           number of synthetic users (default 1200)
 *   --base URL          API base (default https://waitlist.jameye.com)
 *   --concurrency N     parallel requests when committing (default 6)
 *   --seed N            RNG seed for reproducibility (default 42)
 */

const args = process.argv.slice(2);
const flag = (name, def) => {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return def;
  const v = args[i + 1];
  return v && !v.startsWith('--') ? v : true;
};
const COMMIT = args.includes('--commit');
const COUNT = Number(flag('count', 1200));
const BASE = String(flag('base', 'https://waitlist.jameye.com')).replace(/\/+$/, '');
const CONCURRENCY = Number(flag('concurrency', 6));
let SEED = Number(flag('seed', 42));

// Deterministic RNG so dry-run and commit produce the same data.
const rng = () => {
  SEED = (SEED * 1664525 + 1013904223) >>> 0;
  return SEED / 4294967296;
};
const pick = (arr) => arr[Math.floor(rng() * arr.length)];
const randint = (a, b) => a + Math.floor(rng() * (b - a + 1));

// ---- Handle generation (mirrors the site's auto-generated style) ----
const ADJ = ['Patient', 'Bold', 'Lucky', 'Sly', 'Calm', 'Sharp', 'Wise', 'Swift', 'Keen', 'Cosmic', 'Quiet', 'Fearless', 'Steady', 'Curious', 'Mystic', 'Golden', 'Silent', 'Restless', 'Humble', 'Reckless', 'Lunar', 'Solar', 'Iron', 'Velvet', 'Crimson'];
const ARCH = ['Oracle', 'Prophet', 'Seer', 'Analyst', 'Sage', 'Augur', 'Pundit', 'Diviner', 'Soothsayer', 'Visionary', 'Strategist', 'Quant', 'Scout', 'Sentinel', 'Navigator', 'Pathfinder', 'Forecaster'];
const CRIT = ['Slug', 'Owl', 'Fox', 'Falcon', 'Lynx', 'Raven', 'Otter', 'Badger', 'Heron', 'Mantis', 'Ferret', 'Crane', 'Marmot', 'Magpie', 'Wolf', 'Hawk', 'Viper', 'Stag'];
const DOMAIN = ['Time', 'Markets', 'Odds', 'Chaos', 'Tomorrow', 'Trends', 'Fortune', 'Signals', 'Probability', 'the Crowd', 'Tides', 'Futures'];
const HUMAN = ['alex', 'sam', 'jordan', 'mira', 'kenji', 'noa', 'leo', 'ivy', 'omar', 'zoe', 'dev', 'rin', 'tariq', 'luca', 'ada', 'kai', 'yuki', 'priya', 'enzo', 'maya'];

const buildHandle = () => {
  const n = rng();
  if (n < 0.35) return `${pick(ARCH)} of ${pick(DOMAIN)} ${randint(10, 999)}`;
  if (n < 0.62) return `${pick(ADJ)} ${pick(CRIT)} ${randint(10, 999)}`;
  if (n < 0.82) return `${pick(ADJ)} ${pick(ARCH)} ${randint(10, 999)}`;
  return `${pick(HUMAN)}_${pick(CRIT).toLowerCase()}${randint(1, 9999)}`;
};

// ---- Build the user list with a power-law referral graph ----
// Preferential attachment → a few "viral" referrers rack up big point totals,
// long tail sits near zero. Mirrors a real referral leaderboard.
function buildUsers(count) {
  const users = [];
  const seen = new Set();
  const referralCount = []; // index-aligned with users

  for (let i = 0; i < count; i++) {
    let nick;
    do { nick = buildHandle(); } while (seen.has(nick.toLowerCase()));
    seen.add(nick.toLowerCase());

    let referred = null;
    // First ~25 are "founders" with no referrer; after that, 68% are referred.
    if (i >= 25 && rng() < 0.68) {
      // Weighted pick over existing users: weight = referrals*3 + 1 (preferential attachment).
      let total = 0;
      for (let j = 0; j < i; j++) total += referralCount[j] * 3 + 1;
      let r = rng() * total;
      let chosen = 0;
      for (let j = 0; j < i; j++) {
        r -= referralCount[j] * 3 + 1;
        if (r <= 0) { chosen = j; break; }
      }
      referred = users[chosen].nickname;
      referralCount[chosen]++;
    }

    referralCount[i] = referralCount[i] || 0;
    users.push({
      name: nick,
      nickname: nick,
      email: `seed_${String(i).padStart(4, '0')}_${Math.floor(rng() * 1e6)}@seed.jameye.dev`,
      referred,
      avatar: `avatar_${randint(1, 4)}`,
    });
  }
  return { users, referralCount };
}

function pointsHistogram(referralCount) {
  const pts = referralCount.map((c) => c * 5).sort((a, b) => b - a);
  const buckets = { '0': 0, '5-20': 0, '25-50': 0, '55-100': 0, '105-250': 0, '250+': 0 };
  for (const p of pts) {
    if (p === 0) buckets['0']++;
    else if (p <= 20) buckets['5-20']++;
    else if (p <= 50) buckets['25-50']++;
    else if (p <= 100) buckets['55-100']++;
    else if (p <= 250) buckets['105-250']++;
    else buckets['250+']++;
  }
  return { top: pts.slice(0, 10), buckets };
}

async function postUser(u) {
  const res = await fetch(`${BASE}/api/waitlist/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: u.name, email: u.email, nickname: u.nickname, referred: u.referred ?? undefined, avatar: u.avatar }),
  });
  if (!res.ok) {
    let detail = `http_${res.status}`;
    try { const b = await res.json(); if (b?.detail) detail = b.detail; } catch {}
    throw new Error(detail);
  }
  return res.json().catch(() => ({}));
}

async function run() {
  const { users, referralCount } = buildUsers(COUNT);
  const { top, buckets } = pointsHistogram(referralCount);

  console.log(`\nJameye waitlist seed`);
  console.log(`  base:        ${BASE}`);
  console.log(`  count:       ${COUNT}`);
  console.log(`  mode:        ${COMMIT ? 'COMMIT (will POST)' : 'DRY RUN (no writes)'}`);
  console.log(`\nPoint distribution (points = referrals × 5):`);
  for (const [k, v] of Object.entries(buckets)) console.log(`  ${k.padEnd(8)} ${v} users`);
  console.log(`  top 10 point totals: ${top.join(', ')}`);
  console.log(`\nSample users:`);
  for (const u of users.slice(0, 5)) console.log(`  ${u.nickname}  ·  referred=${u.referred ?? '—'}  ·  ${u.avatar}`);

  if (!COMMIT) {
    console.log(`\nDry run only. Re-run with --commit to POST these to ${BASE}.\n`);
    return;
  }

  console.log(`\nPosting ${users.length} users (concurrency ${CONCURRENCY})…`);
  let ok = 0, fail = 0;
  const errs = {};
  let idx = 0;
  const worker = async () => {
    while (idx < users.length) {
      const u = users[idx++];
      try { await postUser(u); ok++; }
      catch (e) { fail++; errs[e.message] = (errs[e.message] || 0) + 1; }
      if ((ok + fail) % 100 === 0) console.log(`  ${ok + fail}/${users.length} (${ok} ok, ${fail} fail)`);
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  console.log(`\nDone. ${ok} ok, ${fail} failed.`);
  if (fail) console.log(`  errors:`, errs);
}

run().catch((e) => { console.error(e); process.exit(1); });
