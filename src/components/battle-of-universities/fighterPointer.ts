/**
 * One mousemove listener and one rAF loop drive every fighter avatar on the
 * page: heads tilt and pupils slide toward the cursor. Instances register their
 * SVG groups; the loop eases each toward its target. Honors reduced-motion.
 *
 * Ported verbatim from the app's `components/fighters/fighterPointer.ts` — it
 * has no external dependencies, so it travels as-is.
 */

const EASE = 0.1;
const MAX_DIST = 380;
const HEAD_ROT = 3.5; // deg
const HEAD_TILT_Y = 1.2; // svg units
const EYE_DX = 1.6;
const EYE_DY = 1.2;

type Facing = "left" | "right";

interface Instance {
  wrapper: HTMLElement;
  head: SVGGElement | null;
  eyes: SVGGElement | null;
  signX: number;
  cx: number;
  cy: number;
  headAngle: number;
  headTiltY: number;
  eyeDx: number;
  eyeDy: number;
  tAngle: number;
  tTiltY: number;
  tEyeDx: number;
  tEyeDy: number;
}

const instances = new Set<Instance>();
let pointerX = 0;
let pointerY = 0;
let rafId = 0;
let listening = false;

const FIGHTER_STYLES = `
@media (prefers-reduced-motion: no-preference) {
  @keyframes fighterBlink {
    0%, 92%, 100% { transform: scaleY(1); }
    95%, 97%      { transform: scaleY(0.08); }
  }
  [data-fighter-eye] {
    transform-box: fill-box;
    transform-origin: center;
    animation: fighterBlink 4.8s ease-in-out infinite;
  }
}
`;

let stylesInjected = false;

/** Inject the shared blink stylesheet once. Safe to call from any avatar. */
export function ensureFighterStyles(): void {
  if (stylesInjected || typeof document === "undefined") return;
  const style = document.createElement("style");
  style.setAttribute("data-fighter-styles", "true");
  style.textContent = FIGHTER_STYLES;
  document.head.appendChild(style);
  stylesInjected = true;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

function measure(inst: Instance) {
  const r = inst.wrapper.getBoundingClientRect();
  inst.cx = r.left + r.width / 2;
  inst.cy = r.top + r.height * 0.38;
}

function measureAll() {
  for (const inst of instances) measure(inst);
}

function setTargets(inst: Instance) {
  const normDx = Math.max(-1, Math.min(1, (pointerX - inst.cx) / MAX_DIST));
  const normDy = Math.max(-1, Math.min(1, (pointerY - inst.cy) / MAX_DIST));
  inst.tAngle = normDx * HEAD_ROT * inst.signX;
  inst.tTiltY = normDy * HEAD_TILT_Y;
  inst.tEyeDx = normDx * EYE_DX * inst.signX;
  inst.tEyeDy = normDy * EYE_DY;
}

function onMouseMove(e: MouseEvent) {
  pointerX = e.clientX;
  pointerY = e.clientY;
  for (const inst of instances) {
    measure(inst);
    setTargets(inst);
  }
}

function onLayoutShift() {
  measureAll();
  for (const inst of instances) setTargets(inst);
}

const REMEASURE_EVERY = 15;
let frame = 0;

function tick() {
  if (frame++ % REMEASURE_EVERY === 0) {
    for (const inst of instances) {
      measure(inst);
      setTargets(inst);
    }
  }
  for (const inst of instances) {
    inst.headAngle += (inst.tAngle - inst.headAngle) * EASE;
    inst.headTiltY += (inst.tTiltY - inst.headTiltY) * EASE;
    inst.eyeDx += (inst.tEyeDx - inst.eyeDx) * EASE;
    inst.eyeDy += (inst.tEyeDy - inst.eyeDy) * EASE;

    inst.head?.setAttribute(
      "transform",
      `rotate(${inst.headAngle.toFixed(3)}, 60, 50) translate(0, ${inst.headTiltY.toFixed(3)})`,
    );
    inst.eyes?.setAttribute(
      "transform",
      `translate(${inst.eyeDx.toFixed(3)}, ${inst.eyeDy.toFixed(3)})`,
    );
  }
  rafId = requestAnimationFrame(tick);
}

function start() {
  if (listening) return;
  listening = true;
  window.addEventListener("mousemove", onMouseMove, { passive: true });
  window.addEventListener("scroll", onLayoutShift, { passive: true });
  window.addEventListener("resize", onLayoutShift);
  rafId = requestAnimationFrame(tick);
}

function stop() {
  if (!listening) return;
  listening = false;
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("scroll", onLayoutShift);
  window.removeEventListener("resize", onLayoutShift);
  cancelAnimationFrame(rafId);
}

/**
 * Register a fighter for cursor tracking. Returns an unregister cleanup. A no-op
 * (returns an empty cleanup) when motion is reduced or groups are missing.
 */
export function registerFighter(opts: {
  wrapper: HTMLElement;
  head: SVGGElement | null;
  eyes: SVGGElement | null;
  facing?: Facing;
}): () => void {
  ensureFighterStyles();
  if (prefersReducedMotion() || (!opts.head && !opts.eyes)) return () => {};

  const inst: Instance = {
    wrapper: opts.wrapper,
    head: opts.head,
    eyes: opts.eyes,
    signX: opts.facing === "left" ? -1 : 1,
    cx: 0,
    cy: 0,
    headAngle: 0,
    headTiltY: 0,
    eyeDx: 0,
    eyeDy: 0,
    tAngle: 0,
    tTiltY: 0,
    tEyeDx: 0,
    tEyeDy: 0,
  };
  measure(inst);
  setTargets(inst);
  instances.add(inst);
  start();

  return () => {
    instances.delete(inst);
    if (instances.size === 0) stop();
  };
}
