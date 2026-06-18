# Edge Score Builder — standalone export

A self-contained copy of the **Edge Score Builder** visual (the expedition-map
scene: winding brand-gradient track, animated comet + runway lights, the player
avatar at START, locked/reward padlocks, and the boss guarding the "Certified
Edge Score Holders Only" vault hall).

This folder has **no `@/` aliases and no app-specific logic** (the router
`useNavigate` was replaced with an `onStart` callback). Copy the whole folder
into your landing repo and import it.

## Files

| File | What it is |
|---|---|
| `EdgeScoreBuilder.tsx` | Drop-in section: header + glow card + scene. Start here. |
| `LoopExpeditionScene.tsx` | The scene itself (path + nodes + hover cards). Use directly if you don't want the header/card. |
| `AvatarFighter.tsx` | The player avatar at the START node (cursor-tracking). |
| `EdgeScoreBossAvatar.tsx` | The final-node boss avatar (cursor-tracking). |
| `curatedLoopsData.ts` | The chapter/node data driving the path. |
| `fighterStyles.ts` | Shared eye-blink stylesheet injector (no external deps). |
| `ui.tsx` | Self-contained `GlowCard` + `PageGlow` (no `cn`/alias deps). |
| `edge-score-builder.css` | Keyframes + glass/glow/title-accent classes. **Import once.** |
| `index.ts` | Barrel exports. |

## Requirements in the host app

- React 18+ and `react-dom` (the hover card uses `createPortal`)
- **Tailwind CSS** — the components use Tailwind utility classes (incl. arbitrary
  values like `h-[clamp(...)]`). Make sure this folder is within Tailwind's
  `content` glob so the classes aren't purged.
- Designed for a **dark background** (the scene is a neon/void aesthetic).

## Usage

```tsx
import { EdgeScoreBuilder } from "./edge-score-builder-export";
import "./edge-score-builder-export/edge-score-builder.css";

export default function Landing() {
  return (
    <div className="bg-[#0a0a0a]">
      {/* ...hero... */}
      <EdgeScoreBuilder onStart={() => {/* scroll to signup, open modal, route, … */}} />
    </div>
  );
}
```

Scene only (no header/card):

```tsx
import { LoopExpeditionScene } from "./edge-score-builder-export";
import "./edge-score-builder-export/edge-score-builder.css";

<div className="rounded-2xl bg-[#0b0b14] p-6">
  <LoopExpeditionScene onStart={() => {}} />
</div>
```

## Notes / customization

- **`onStart`** fires when the player taps the START node or the "Tap to play"
  button. Omit it for a purely decorative scene.
- **Which loop renders**: `LoopExpeditionScene` defaults to `CURATED_LOOPS[0]`
  (6 nodes). Pass `loop={CURATED_LOOPS[1]}` for the shorter 4-node variant, or
  build your own `CuratedLoop`.
- **Fonts**: references `"Inter Tight Variable"` and `"JetBrains Mono Variable"`
  with `system-ui` / `monospace` fallbacks. Load those families for a 1:1 match.
- **CSS class names** are prefixed `esb-` so they won't collide with your
  landing page's own `.glass` / `.title-accent` etc.
- All visuals are inline SVG — there are **no image/font assets** to copy.
