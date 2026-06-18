/**
 * Tag a raw avatar SVG so the shared engine can animate it.
 *
 * Avatars can ship with explicit markers or with none at all. This finds (or
 * synthesizes) the three things the engine needs:
 *
 *   - the EYE shapes that blink   -> `data-fighter-eye`   (eye whites / slits)
 *   - the PUPIL group that slides -> `data-fighter-eyes`  (one <g>)
 *   - the HEAD group that tilts   -> `data-fighter-head`  (one <g>)
 *
 * Recognized conventions (in priority order):
 *   1. Explicit `data-fighter-head` / `data-fighter-eyes` groups already in the
 *      markup are reused as-is.
 *   2. Eye whites are `<ellipse>` elements painted with an `*eye` gradient, i.e.
 *      `fill="url(#...eye...)"`. They get tagged for the blink, and (if no
 *      pupil group exists) the pupil/highlight shapes sitting inside them are
 *      wrapped into a synthesized `data-fighter-eyes` group.
 *   3. The head group is the largest `<g>` that wraps an eye white; failing
 *      that (eyeless / visor skins) the richest group overall, so the avatar
 *      still tilts toward the cursor even if its eyes can't move.
 *
 * Returns the head + eyes groups to hand to `registerFighter`. `eyes` may be
 * null when a skin has no recognizable eyes (head-only tilt).
 */

const SVG_NS = "http://www.w3.org/2000/svg";
const EYE_FILL = /url\(#[^)]*eye[^)]*\)/i;

/** An eye white: an `<ellipse>` painted with an `*eye` gradient. */
function isEyeWhite(el) {
  return el.localName === "ellipse" && EYE_FILL.test(el.getAttribute("fill") ?? "");
}

function shapeCenter(el) {
  const x = Number.parseFloat(el.getAttribute("cx") ?? "");
  const y = Number.parseFloat(el.getAttribute("cy") ?? "");
  return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
}

function childElementCount(el) {
  let n = 0;
  for (const c of Array.from(el.childNodes)) if (c.nodeType === 1) n += 1;
  return n;
}

/**
 * @param {Element} root - element containing the avatar's <svg> (or the <svg>)
 * @returns {{ head: SVGGElement | null, eyes: SVGGElement | null }}
 */
export function setupTracking(root) {
  const whites = Array.from(root.querySelectorAll("ellipse")).filter(isEyeWhite);
  for (const w of whites) w.setAttribute("data-fighter-eye", "");

  let head = root.querySelector("[data-fighter-head]");
  let eyes = root.querySelector("[data-fighter-eyes]");

  if (whites.length === 0) {
    // Visor skins (no eye whites) blink their eye-group's own children.
    if (eyes) {
      for (const child of Array.from(eyes.children)) {
        child.setAttribute("data-fighter-eye", "");
      }
    }
  } else if (!eyes) {
    const centers = whites
      .map((w) => ({
        c: shapeCenter(w),
        r: Math.max(
          Number.parseFloat(w.getAttribute("rx") ?? "0"),
          Number.parseFloat(w.getAttribute("ry") ?? "0"),
        ),
      }))
      .filter((e) => e.c != null);

    const pupils = [];
    for (const el of Array.from(root.querySelectorAll("circle, ellipse"))) {
      if (isEyeWhite(el)) continue;
      const c = shapeCenter(el);
      if (!c) continue;
      if (centers.some(({ c: wc, r }) => Math.hypot(c.x - wc.x, c.y - wc.y) <= r)) {
        pupils.push(el);
      }
    }
    if (pupils.length > 0) {
      const doc = root.ownerDocument ?? document;
      const group = doc.createElementNS(SVG_NS, "g");
      group.setAttribute("data-fighter-eyes", "");
      pupils[0].parentNode.insertBefore(group, pupils[0]);
      for (const p of pupils) group.appendChild(p);
      eyes = group;
    }
  }

  if (!head) {
    // Prefer the group that wraps an eye white (the head/torso). Eyeless skins
    // have none, so fall back to the richest group overall.
    const groups = Array.from(root.querySelectorAll("g"));
    const withEye = groups.filter((g) =>
      Array.from(g.querySelectorAll("ellipse")).some(isEyeWhite),
    );
    const pool = withEye.length > 0 ? withEye : groups;
    if (pool.length > 0) {
      head = pool.reduce((a, b) =>
        childElementCount(b) > childElementCount(a) ? b : a,
      );
      head.setAttribute("data-fighter-head", "");
    }
  }

  return { head, eyes };
}
