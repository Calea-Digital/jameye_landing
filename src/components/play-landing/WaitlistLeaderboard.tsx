import React from "react";
import { motion } from "framer-motion";

import L from "../../lang/en/leaderboard.json";

/**
 * Waitlist referral leaderboard — a React port of
 * `src/components/sections/Leaderboard.astro` (same API, same ranking maths,
 * same search / pager / copy-link behaviour) restyled for the play landing.
 */

const CFG = {
  apiBase: "https://waitlist.jameye.com",
  avatars: {
    avatar_1: "/avatar/01-open-market-trader.svg",
    avatar_2: "/avatar/02-edge-score-explorer.svg",
    avatar_3: "/avatar/03-duel-customizable-fighter.svg",
    avatar_4: "/avatar/04-rapid-duel-fighter.svg",
  } as Record<string, string>,
  pointsPerReferral: 5,
  pageSize: 10,
};

type RawEntry = {
  nickname?: string;
  timestamp?: string;
  avatar?: string;
  referral_code?: string;
  referral_link?: string;
  referred_by?: string;
  referred?: string;
};

type Change = { type: "new" } | { type: "up" | "down" | "flat"; n: number };

type Player = {
  nick: string;
  k: string;
  ts: number;
  avatar: string;
  code: string;
  link: string;
  referrals: number;
  pointsNow: number;
  pointsOld: number;
  existedOld: boolean;
  posNow: number;
  change: Change;
};

const parseTs = (s?: string) => {
  const d = new Date(s ?? "");
  return isNaN(d.getTime()) ? 0 : d.getTime();
};

function build(entries: RawEntry[]): Player[] {
  const cutoff = Date.now() - 7 * 24 * 3600 * 1000;
  const refs = new Map<string, { all: number; old: number }>();
  const bump = (k: string, ts: number) => {
    const o = refs.get(k) || { all: 0, old: 0 };
    o.all++;
    if (ts && ts <= cutoff) o.old++;
    refs.set(k, o);
  };
  const byNick = new Map<string, { nick: string; ts: number; avatar: string; code: string; link: string }>();
  for (const row of entries) {
    const nick = (row?.nickname || "").trim();
    const ts = parseTs(row?.timestamp);
    const avatar = (row?.avatar || "").trim();
    const code = (row?.referral_code || "").trim();
    const link = (row?.referral_link || "").trim();
    const ref = (row?.referred_by || row?.referred || "").trim().toLowerCase();
    if (nick) {
      const k = nick.toLowerCase();
      const prev = byNick.get(k);
      if (!prev || (ts && (!prev.ts || ts < prev.ts))) byNick.set(k, { nick, ts, avatar, code, link });
    }
    if (ref) bump(ref, ts);
  }
  const PTS = CFG.pointsPerReferral;
  const list = [...byNick.entries()].map(([k, u]) => {
    const ownerKey = (u.code || k).toLowerCase();
    const rc = refs.get(ownerKey) || { all: 0, old: 0 };
    return {
      nick: u.nick,
      k,
      ts: u.ts,
      avatar: u.avatar,
      code: u.code,
      link: u.link,
      referrals: rc.all,
      pointsNow: rc.all * PTS,
      pointsOld: rc.old * PTS,
      existedOld: !!u.ts && u.ts <= cutoff,
      posNow: 0,
      change: { type: "flat", n: 0 } as Change,
    };
  });
  const cmp = (key: "pointsNow" | "pointsOld") => (a: (typeof list)[number], b: (typeof list)[number]) =>
    b[key] - a[key] || (a.ts || Infinity) - (b.ts || Infinity) || a.k.localeCompare(b.k);
  const now = [...list].sort(cmp("pointsNow"));
  now.forEach((u, i) => (u.posNow = i + 1));
  const oldPos = new Map<string, number>();
  [...list].filter((u) => u.existedOld).sort(cmp("pointsOld")).forEach((u, i) => oldPos.set(u.k, i + 1));
  now.forEach((u) => {
    if (!u.existedOld) {
      u.change = { type: "new" };
      return;
    }
    const op = oldPos.get(u.k);
    const delta = (op ?? u.posNow) - u.posNow;
    u.change = { type: delta > 0 ? "up" : delta < 0 ? "down" : "flat", n: Math.abs(delta) };
  });
  return now;
}

const referralLink = (u: Player) => {
  if (u.link) return u.link;
  const refKey = u.code || u.nick || "";
  return `${location.origin}/en?ref=${encodeURIComponent(refKey)}`;
};

const medal = (pos: number) => (pos === 1 ? "🥇" : pos === 2 ? "🥈" : pos === 3 ? "🥉" : "");

function Delta({ ch }: { ch: Change }) {
  if (ch.type === "new")
    return (
      <span className="rounded-full border border-[#22D3EE]/60 px-1.5 py-0.5 text-[0.55rem] font-black uppercase tracking-[0.14em] text-[#22D3EE]">
        {L.newBadge}
      </span>
    );
  if (ch.type === "up") return <span className="text-xs font-black text-[#34D399]">▲ {ch.n}</span>;
  if (ch.type === "down") return <span className="text-xs font-black text-[#F87171]">▼ {ch.n}</span>;
  return <span className="text-xs font-black text-white/40">–</span>;
}

type Status = "loading" | "ready" | "empty" | "error";

export function WaitlistLeaderboard() {
  const [list, setList] = React.useState<Player[]>([]);
  const [status, setStatus] = React.useState<Status>("loading");
  const [page, setPage] = React.useState(0);
  const [query, setQuery] = React.useState("");
  const [found, setFound] = React.useState<Player | null | "none">(null);
  const [copied, setCopied] = React.useState(false);
  const bodyRef = React.useRef<HTMLDivElement>(null);

  const PAGE = CFG.pageSize;
  const pageCount = Math.max(1, Math.ceil(list.length / PAGE));

  const load = React.useCallback(async () => {
    try {
      const res = await fetch(`${CFG.apiBase}/api/waitlist/entries`, { cache: "no-store" });
      if (!res.ok) throw new Error(`http_${res.status}`);
      const entries = (await res.json()) as RawEntry[];
      if (!Array.isArray(entries) || entries.length === 0) {
        setList([]);
        setStatus("empty");
        return;
      }
      setList(build(entries));
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  React.useEffect(() => {
    void load();
    const onJoined = () => window.setTimeout(load, 1500);
    window.addEventListener("waitlist:joined", onJoined);
    return () => window.removeEventListener("waitlist:joined", onJoined);
  }, [load]);

  React.useEffect(() => {
    if (page >= pageCount) setPage(0);
  }, [page, pageCount]);

  const runSearch = (scroll = true) => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setFound(null);
      return;
    }
    const u = list.find((x) => x.k === q) || list.find((x) => x.k.includes(q));
    if (!u) {
      setFound("none");
      return;
    }
    setFound(u);
    setPage(Math.floor((u.posNow - 1) / PAGE));
    if (scroll) jumpTo(u.k);
  };

  const jumpTo = (key: string) => {
    window.requestAnimationFrame(() => {
      const el = bodyRef.current?.querySelector<HTMLElement>(`[data-key="${CSS.escape(key)}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  const copyLink = async (u: Player) => {
    try {
      await navigator.clipboard.writeText(referralLink(u));
    } catch {
      /* clipboard unavailable */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const highlightKey = found && found !== "none" ? found.k : null;
  const slice = list.slice(page * PAGE, page * PAGE + PAGE);

  // Windowed pager: 1 … (cur-1 cur cur+1) … total
  const pages: (number | "…")[] = [];
  if (pageCount > 1) {
    let last = 0;
    for (let p = 1; p <= pageCount; p++) {
      if (p === 1 || p === pageCount || Math.abs(p - (page + 1)) <= 1) {
        if (p - last > 1) pages.push("…");
        pages.push(p);
        last = p;
      }
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl text-left">
      {/* perks */}
      <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
        {L.perks.map((p) => (
          <span
            key={p.label}
            className="rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[0.6rem] font-black uppercase tracking-[0.12em] text-white backdrop-blur-sm sm:text-[0.68rem]"
          >
            {p.label}
          </span>
        ))}
      </div>

      {/* board */}
      <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-white/25 bg-white/10 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.6)] backdrop-blur-md sm:mt-6 sm:rounded-[2rem]">
        {/* search */}
        <form
          className="flex gap-2 border-b border-white/15 p-2.5 sm:p-4"
          onSubmit={(e) => {
            e.preventDefault();
            runSearch();
          }}
        >
          <div className="relative flex min-w-0 flex-1 items-center">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="pointer-events-none absolute left-3 h-4 w-4 text-white/60"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!e.target.value.trim()) setFound(null);
              }}
              placeholder={L.search.placeholder}
              aria-label={L.search.label}
              className="w-full rounded-full border border-white/25 bg-white/10 py-2.5 pl-9 pr-9 text-sm font-semibold text-white placeholder:text-white/50 focus:border-white/60 focus:outline-none"
            />
            {query ? (
              <button
                type="button"
                aria-label={L.search.clear}
                onClick={() => {
                  setQuery("");
                  setFound(null);
                }}
                className="absolute right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
              >
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            ) : null}
          </div>
          <button type="submit" className="tactical-cta shrink-0 px-4 py-2 text-xs sm:px-5 sm:text-sm">
            <span className="tactical-cta-inner font-extrabold">{L.search.button}</span>
          </button>
        </form>

        {/* search result */}
        {found === "none" ? (
          <p className="border-b border-white/15 bg-[#F87171]/15 px-4 py-2.5 text-xs font-semibold text-white sm:text-sm">
            {L.search.notFound}
          </p>
        ) : found ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-white/15 bg-[#34D399]/15 px-3 py-2.5 text-xs text-white sm:px-4 sm:text-sm">
            <span className="font-black text-[#34D399]" style={{ fontVariantNumeric: "tabular-nums" }}>
              {L.search.rankPrefix}
              {found.posNow}
            </span>
            <span className="font-bold">{found.nick}</span>
            <span className="text-white/75">
              {found.pointsNow.toLocaleString()} {L.pointsSuffix} · {found.referrals}{" "}
              {found.referrals === 1 ? L.referralsOne : L.referralsMany}
            </span>
            <span className="ml-auto flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => copyLink(found)}
                className={`rounded-full border px-2.5 py-1 text-[0.6rem] font-black uppercase tracking-[0.12em] transition-colors ${
                  copied
                    ? "border-transparent bg-[#34D399] text-[#06281f]"
                    : "border-[#34D399]/60 text-[#34D399] hover:bg-[#34D399]/15"
                }`}
              >
                {copied ? L.search.copied : L.search.refLink}
              </button>
              <button
                type="button"
                onClick={() => jumpTo(found.k)}
                className="rounded-full border border-white/40 px-2.5 py-1 text-[0.6rem] font-black uppercase tracking-[0.12em] text-white hover:bg-white/15"
              >
                {L.search.jump}
              </button>
            </span>
          </div>
        ) : null}

        {/* header */}
        <div className="grid grid-cols-[1.75rem_minmax(0,1fr)_auto_2.75rem] items-center gap-2 bg-white/5 px-3 py-2 text-[0.6rem] font-black uppercase tracking-[0.18em] text-white/60 sm:grid-cols-[2.5rem_minmax(0,1fr)_auto_4rem] sm:gap-3 sm:px-5">
          <span>{L.cols.rank}</span>
          <span>{L.cols.player}</span>
          <span className="text-right">{L.cols.points}</span>
          <span className="text-right">{L.cols.change}</span>
        </div>

        {/* rows */}
        <div ref={bodyRef}>
          {status === "loading" ? (
            <p className="px-4 py-8 text-center text-sm font-semibold text-white/70">{L.states.loading}</p>
          ) : status === "error" ? (
            <p className="px-4 py-8 text-center text-sm font-semibold text-white/70">{L.states.error}</p>
          ) : status === "empty" ? (
            <p className="px-4 py-8 text-center text-sm font-semibold text-white/70">{L.states.empty}</p>
          ) : (
            slice.map((u, i) => {
              const isYou = highlightKey === u.k;
              const m = medal(u.posNow);
              const top3 = u.posNow <= 3;
              const elite = u.posNow <= 10;
              return (
                <motion.div
                  key={u.k}
                  data-key={u.k}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.35 }}
                  className={`relative grid grid-cols-[1.75rem_minmax(0,1fr)_auto_2.75rem] items-center gap-2 border-t border-white/10 px-3 py-2 sm:grid-cols-[2.5rem_minmax(0,1fr)_auto_4rem] sm:gap-3 sm:px-5 sm:py-2.5 ${
                    isYou
                      ? "bg-[#34D399]/20 ring-1 ring-inset ring-[#34D399]/60"
                      : top3
                        ? "bg-[#FACC15]/10"
                        : elite
                          ? "bg-white/5"
                          : ""
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute inset-y-0 left-0 w-[3px] ${
                      isYou
                        ? "bg-[#34D399]"
                        : u.posNow === 1
                          ? "bg-[#FACC15] shadow-[0_0_14px_rgba(250,204,21,0.9)]"
                          : u.posNow === 2
                            ? "bg-[#CBD5E1]"
                            : u.posNow === 3
                              ? "bg-[#FB923C]"
                              : elite
                                ? "bg-gradient-to-b from-[#EC4899] to-[#6366F1]"
                                : "bg-transparent"
                    }`}
                  />
                  <span
                    className={`text-sm font-black ${
                      u.posNow === 1
                        ? "text-[#FDE68A]"
                        : u.posNow === 2
                          ? "text-[#E2E8F0]"
                          : u.posNow === 3
                            ? "text-[#FDBA74]"
                            : "text-white/80"
                    }`}
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {m ? <span className="text-base leading-none">{m}</span> : u.posNow}
                  </span>
                  <span className="flex min-w-0 items-center gap-2 sm:gap-3">
                    <img
                      src={CFG.avatars[u.avatar] || CFG.avatars.avatar_1}
                      alt=""
                      loading="lazy"
                      className="h-7 w-7 shrink-0 rounded-full border border-white/20 bg-white/10 object-contain p-0.5 sm:h-9 sm:w-9"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.8rem] font-bold text-white sm:text-sm">{u.nick}</span>
                      <span className="block truncate text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-white/55">
                        {u.referrals} {u.referrals === 1 ? L.referralsOne : L.referralsMany}
                      </span>
                    </span>
                  </span>
                  <span
                    className="text-right text-sm font-black text-white sm:text-base"
                    style={{ fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}
                  >
                    {u.pointsNow.toLocaleString()}
                    <span className="ml-0.5 text-[0.6rem] font-bold text-white/55">{L.pointsSuffix}</span>
                  </span>
                  <span className="flex justify-end">
                    <Delta ch={u.change} />
                  </span>
                </motion.div>
              );
            })
          )}
        </div>

        {/* pager */}
        {status === "ready" && pageCount > 1 ? (
          <div className="flex flex-wrap items-center justify-center gap-1.5 border-t border-white/15 bg-white/5 px-3 py-3">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="h-8 rounded-lg border border-white/20 bg-white/10 px-2.5 text-xs font-black text-white disabled:opacity-35"
            >
              {L.pager.prev}
            </button>
            {pages.map((p, i) =>
              p === "…" ? (
                <span key={`e${i}`} className="px-1 text-xs text-white/50">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p - 1)}
                  className={`h-8 min-w-8 rounded-lg border px-2 text-xs font-black ${
                    p - 1 === page
                      ? "border-transparent bg-gradient-to-r from-[#EC4899] to-[#6366F1] text-white shadow-[0_6px_18px_-6px_rgba(236,72,153,0.8)]"
                      : "border-white/20 bg-white/10 text-white/80 hover:bg-white/20"
                  }`}
                >
                  {p}
                </button>
              ),
            )}
            <button
              type="button"
              disabled={page >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              className="h-8 rounded-lg border border-white/20 bg-white/10 px-2.5 text-xs font-black text-white disabled:opacity-35"
            >
              {L.pager.next}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default WaitlistLeaderboard;
