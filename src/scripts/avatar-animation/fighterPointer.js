/**
 * Shared cursor-tracking engine for fighter avatars.
 *
 * One `mousemove` listener and one `requestAnimationFrame` loop drive EVERY
 * avatar on the page: heads tilt and pupils slide toward the cursor, and all
 * registered eyes blink on a shared rhythm. Instances register their SVG
 * groups; the loop eases each toward its target. Honors `prefers-reduced-motion`.
 *
 * Zero dependencies. Works in any modern browser (bundled or as a native ESM
 * module). The avatars this was designed for use `viewBox="0 0 120 140"`, so the
 * head rotates around the pivot `(60, 50)` by default — pass `headPivot` to
 * `registerFighter` to match a different viewBox.
 */

const EASE = 0.1; // per-frame easing toward the target (0..1)
const MAX_DIST = 380; // px from avatar center where tracking saturates
const HEAD_ROT = 3.5; // max head rotation, degrees
const HEAD_TILT_Y = 1.2; // max head vertical shift, svg units
const EYE_DX = 1.6; // max pupil horizontal slide, svg units
const EYE_DY = 1.2; // max pupil vertical slide, svg units

const DEFAULT_PIVOT = { x: 60, y: 50 };

/** @typedef {"left" | "right"} Facing */

/**
 * @typedef {Object} Instance
 * @property {HTMLElement} wrapper
 * @property {SVGGElement | null} head
 * @property {SVGGElement | null} eyes
 * @property {number} signX
 * @property {{x:number,y:number}} pivot
 * @property {number} cx
 * @property {number} cy
 * @property {number} headAngle
 * @property {number} headTiltY
 * @property {number} eyeDx
 * @property {number} eyeDy
 * @property {number} tAngle
 * @property {number} tTiltY
 * @property {number} tEyeDx
 * @property {number} tEyeDy
 */

/** @type {Set<Instance>} */
const instances = new Set();
let pointerX = 0;
let pointerY = 0;
let rafId = 0;
let listening = false;

/**
 * The shared eye-blink: any element marked `data-fighter-eye` (eye whites,
 * irises, visor slits) squashes vertically on the same rhythm across every
 * avatar. `transform-box: fill-box` pivots each shape around its own centre, so
 * no per-eye transform-origin is needed. Wrapped in a no-preference query so it
 * self-disables under reduced motion. Injected once per document.
 */
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
export function ensureFighterStyles() {
  if (stylesInjected || typeof document === "undefined") return;
  const style = document.createElement("style");
  style.setAttribute("data-fighter-styles", "true");
  style.textContent = FIGHTER_STYLES;
  document.head.appendChild(style);
  stylesInjected = true;
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** @param {Instance} inst */
function measure(inst) {
  const r = inst.wrapper.getBoundingClientRect();
  inst.cx = r.left + r.width / 2;
  inst.cy = r.top + r.height * 0.38; // eye-line sits a bit above the middle
}

function measureAll() {
  for (const inst of instances) measure(inst);
}

/** @param {Instance} inst */
function setTargets(inst) {
  const normDx = Math.max(-1, Math.min(1, (pointerX - inst.cx) / MAX_DIST));
  const normDy = Math.max(-1, Math.min(1, (pointerY - inst.cy) / MAX_DIST));
  inst.tAngle = normDx * HEAD_ROT * inst.signX;
  inst.tTiltY = normDy * HEAD_TILT_Y;
  inst.tEyeDx = normDx * EYE_DX * inst.signX;
  inst.tEyeDy = normDy * EYE_DY;
}

/** @param {MouseEvent} e */
function onMouseMove(e) {
  pointerX = e.clientX;
  pointerY = e.clientY;
  // Re-measure every move: a wrapper can shift after mount (async content,
  // reflow, tab/route switch) without firing scroll/resize, which would
  // otherwise leave a stale center and the avatar staring at the wrong spot.
  for (const inst of instances) {
    measure(inst);
    setTargets(inst);
  }
}

function onLayoutShift() {
  measureAll();
  for (const inst of instances) setTargets(inst);
}

// Re-measure cadence in frames (~4x/s at 60fps). A live feed reflows and shifts
// avatars without firing mousemove/scroll/resize; without a periodic re-measure
// an avatar under a stationary cursor keeps aiming at its old screen center and
// looks like it stopped tracking.
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

    if (inst.head) {
      inst.head.setAttribute(
        "transform",
        `rotate(${inst.headAngle.toFixed(3)}, ${inst.pivot.x}, ${inst.pivot.y}) translate(0, ${inst.headTiltY.toFixed(3)})`,
      );
    }
    if (inst.eyes) {
      inst.eyes.setAttribute(
        "transform",
        `translate(${inst.eyeDx.toFixed(3)}, ${inst.eyeDy.toFixed(3)})`,
      );
    }
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
 * (returns an empty cleanup) when motion is reduced or both groups are missing.
 *
 * @param {Object} opts
 * @param {HTMLElement} opts.wrapper - element whose center the cursor is measured against
 * @param {SVGGElement | null} opts.head - group that tilts (or null)
 * @param {SVGGElement | null} opts.eyes - pupil group that slides (or null)
 * @param {Facing} [opts.facing] - "right" (default) or "left"; flips horizontal direction
 * @param {{x:number,y:number}} [opts.headPivot] - rotation pivot in svg units (default {60,50})
 * @returns {() => void} cleanup
 */
export function registerFighter(opts) {
  ensureFighterStyles();
  if (prefersReducedMotion() || (!opts.head && !opts.eyes)) return () => {};

  /** @type {Instance} */
  const inst = {
    wrapper: opts.wrapper,
    head: opts.head,
    eyes: opts.eyes,
    signX: opts.facing === "left" ? -1 : 1,
    pivot: opts.headPivot ?? DEFAULT_PIVOT,
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
