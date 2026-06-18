# Battle of Universities — standalone export

A self-contained copy of the **Battle of Universities** hero: two org panels
(crest, flag + name, a squad of cursor-tracking fighters, city · country)
flanking a glass **VS** badge, over a saturated arena gradient painted from the
competing orgs' brand colors, with a prize-pool stat and a live countdown.

This folder has **no `@/` aliases, no router, and no API/data layer** — the app
drives it from live tournament hooks; here it takes a single `data` prop. Copy
the whole folder into your landing repo and import it.

## Files

| File | What it is |
|---|---|
| `BattleOfUniversities.tsx` | The hero. Props-driven, with `DEMO_BATTLE` data so it renders out of the box. **Start here.** |
| `types.ts` | `BattleData` / `BattleOrg` — the data you pass in. |
| `EventHeroCard.tsx` | The gradient hero shell + `HeroPanel` / `HeroStat` / `HeroCountdown`. |
| `ArenaBackdrop.tsx` | Drifting diagonal speed-lines (+ optional color washes). |
| `VsBadge.tsx` | The circular VS sticker (glass + brand variants). |
| `Crest.tsx` | Org logo, or a monogram disc painted from brand colors. |
| `SquadFighter.tsx` | Self-contained recolorable chibi fighter (replaces the app's DB-driven avatar subsystem). |
| `fighterPointer.ts` | Shared cursor-tracking + blink engine for the fighters. |
| `brand.ts` | `battleGradient`, `brandGradientStyle`, `orgMonogram`. |
| `country-flag.ts` | Free-text country → flag emoji. |
| `format.ts` | `formatPrize` + the `useNow` ticking clock. |
| `cn.ts` | Tiny classnames joiner (no external deps). |
| `battle-of-universities.css` | Fonts + `bou-` helper classes + speed-lines keyframe. **Import once.** |
| `index.ts` | Barrel exports. |

## Requirements in the host app

- React 18+
- `lucide-react` (the CTA arrow icon — or swap the `<ArrowRight>` for your own)
- **Tailwind CSS** — components use Tailwind utility classes. Make sure this
  folder is inside Tailwind's `content` glob so the classes aren't purged.
- Designed for placement on any background (the hero is self-contained and dark
  internally).

## Usage

```tsx
import { BattleOfUniversities } from "./battle-of-universities-export";
import "./battle-of-universities-export/battle-of-universities.css";

export default function Landing() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <BattleOfUniversities onCta={() => openSignup()} />
    </section>
  );
}
```

### With your own data

```tsx
import { BattleOfUniversities, type BattleData } from "./battle-of-universities-export";

const battle: BattleData = {
  title: "Campus Clash 2026",
  subtitle: "Your org is your squad",
  prizeCents: 2_500_000,                  // $25K  (or pass prizeLabel: "$25K")
  closesAt: "2026-09-01T00:00:00Z",       // Date | epoch ms | ISO string
  canJoin: true,
  orgs: [
    { name: "MIT", colorPrimary: "#750014", colorSecondary: "#8a8b8c", city: "Cambridge", country: "USA" },
    { name: "Cambridge", colorPrimary: "#a3c1ad", colorSecondary: "#085c5c", city: "Cambridge", country: "UK" },
    // any extra orgs roll into a "+N more orgs in the battle" line
  ],
};

<BattleOfUniversities data={battle} onCta={() => {}} />
```

`BattleData` / `BattleOrg` fields are documented in `types.ts`.

## What changed vs. the app (so you know what's "real")

- **No data hooks.** The app uses `useFeaturedBattle` / `useCashTournament` /
  `useOrganizations` / `useJoinCashTournament`. All replaced by the `data` prop
  and an `onCta` callback. The only hook kept is `useNow` (a pure ticking clock
  for the countdown).
- **Fighters are generic.** The app renders each org's *real* members through a
  database-driven customizable-avatar system. That's replaced by `SquadFighter`,
  a single recolorable SVG tinted to each org's primary color (3 per side,
  varied hair). Set `squadSize` per org (0–3) to change how many show.
- **Theme tokens inlined.** The app's `bg-cta` / `shadow-cta` / `ring-glass-border`
  / `font-display` / `font-mono` / `--accent-*` tokens are replaced with concrete
  values or the `bou-` classes in the CSS file, so no app Tailwind theme is needed.

## Notes

- **Fonts matter for fidelity.** `battle-of-universities.css` loads *Inter Tight*
  (display) and *JetBrains Mono* (the uppercase labels/countdown) from Google
  Fonts. If you skip the CSS, the type will fall back and look noticeably
  different. If your site blocks font CDNs, self-host those two families and
  point the `--bou-display` / `--bou-mono` vars at them.
- **Org logos:** set `logo` on an org to use a real image; otherwise a monogram
  disc is drawn from the brand colors.
- All fighter art is inline SVG — no image assets to copy.
