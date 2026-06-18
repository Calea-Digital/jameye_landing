import { useRef, useEffect } from "react";
import { ensureFighterStyles } from "./fighterStyles";

export function AvatarFighter() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headGroupRef = useRef<SVGGElement>(null);
  const pupilsGroupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    ensureFighterStyles();
  }, []);

  useEffect(() => {
    const state = {
      headAngle: 0, headTiltY: 0,
      targetAngle: 0, targetTiltY: 0,
      eyeDx: 0, eyeDy: 0,
      targetEyeDx: 0, targetEyeDy: 0,
    };

    let rafId: number;

    const animate = () => {
      const EASE = 0.1;
      state.headAngle += (state.targetAngle - state.headAngle) * EASE;
      state.headTiltY += (state.targetTiltY - state.headTiltY) * EASE;
      state.eyeDx += (state.targetEyeDx - state.eyeDx) * EASE;
      state.eyeDy += (state.targetEyeDy - state.eyeDy) * EASE;

      if (headGroupRef.current) {
        headGroupRef.current.setAttribute(
          "transform",
          `rotate(${state.headAngle.toFixed(3)}, 60, 50) translate(0, ${state.headTiltY.toFixed(3)})`,
        );
      }
      if (pupilsGroupRef.current) {
        pupilsGroupRef.current.setAttribute(
          "transform",
          `translate(${state.eyeDx.toFixed(3)}, ${state.eyeDy.toFixed(3)})`,
        );
      }
      rafId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height * 0.38;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const maxDist = 380;

      const normDx = Math.max(-1, Math.min(1, dx / maxDist));
      const normDy = Math.max(-1, Math.min(1, dy / maxDist));

      state.targetAngle = normDx * 3.5;
      state.targetTiltY = normDy * 1.2;
      state.targetEyeDx = normDx * 1.6;
      state.targetEyeDy = normDy * 1.2;
    };

    window.addEventListener("mousemove", handleMouseMove);
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center"
      style={{ animation: "avatar-float 3s ease-in-out infinite" }}
    >
      <svg
        viewBox="0 0 120 140"
        className="w-full h-full"
        aria-hidden="true"
        role="img"
      >
        <defs>
          <linearGradient id="av_hair" x1="30" x2="90" y1="6" y2="60" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7e3bff" />
            <stop offset="0.5" stopColor="#450a0a" />
            <stop offset="1" stopColor="#0b0606" />
          </linearGradient>
          <linearGradient id="av_hairFront" x1="32" x2="88" y1="8" y2="38" gradientUnits="userSpaceOnUse">
            <stop stopColor="#a78bff" />
            <stop offset="0.45" stopColor="#d83bff" />
            <stop offset="1" stopColor="#9f1239" />
          </linearGradient>
          <linearGradient id="av_face" x1="38" x2="82" y1="22" y2="74" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fde7c2" />
            <stop offset="0.55" stopColor="#f9b27d" />
            <stop offset="1" stopColor="#c2410c" />
          </linearGradient>
          <linearGradient id="av_eye" x1="46" x2="74" y1="42" y2="60" gradientUnits="userSpaceOnUse">
            <stop stopColor="#020617" />
            <stop offset="0.45" stopColor="#9f1239" />
            <stop offset="1" stopColor="#d83bff" />
          </linearGradient>
          <linearGradient id="av_shirt" x1="32" x2="88" y1="74" y2="120" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1f2937" />
            <stop offset="1" stopColor="#0b0f1a" />
          </linearGradient>
        </defs>

        {/* ground shadow */}
        <ellipse cx="60" cy="134" rx="34" ry="4" fill="#0f172a" opacity="0.25" />

        {/* left arm decorations */}
        <path d="M10 60 L24 60" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
        <path d="M6 76 L22 76" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" opacity="0.4" />
        <path d="M10 92 L22 92" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" opacity="0.3" />

        {/* star sparkle */}
        <path d="M104 60 l1.4 -4 1.4 4 4 1.4 -4 1.4 -1.4 4 -1.4 -4 -4 -1.4 z" fill="#f43f5e" />

        {/* legs */}
        <path d="M40 102 L34 130 L48 130 L52 106 Z" fill="#0f172a" stroke="#0f172a" strokeWidth="2.4" strokeLinejoin="round" />
        <ellipse cx="41" cy="131" rx="10" ry="3.2" fill="#0f172a" stroke="#0f172a" strokeWidth="2" />
        <path d="M64 106 Q72 118 78 130 L92 130 L88 132.5 L74 132.5 Q68 124 60 110 Z" fill="#0f172a" stroke="#0f172a" strokeWidth="2.4" strokeLinejoin="round" />
        <ellipse cx="84" cy="131" rx="11" ry="3.2" fill="#0f172a" stroke="#0f172a" strokeWidth="2" />

        {/* belt */}
        <rect x="40" y="98" width="42" height="7" fill="#9f1239" stroke="#0f172a" strokeWidth="2.2" />

        {/* shirt */}
        <g>
          <path d="M42 74 Q34 96 40 104 L82 104 Q88 96 80 74 Q60 68 42 74 Z" fill="url(#av_shirt)" stroke="#0f172a" strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M48 74 L52 68" stroke="#0f172a" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M74 74 L70 68" stroke="#0f172a" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M44 84 L78 82" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />
          <path d="M52 90 Q60 94 70 90" stroke="#0f172a" strokeWidth="1.6" fill="none" opacity="0.55" />
        </g>

        {/* left arm */}
        <path d="M44 76 Q30 76 32 92 Q34 100 42 96 L46 86 Q48 80 46 76 Z" fill="url(#av_face)" stroke="#0f172a" strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M34 94 L42 92" stroke="#9f1239" strokeWidth="2" strokeLinecap="round" />

        {/* left hand */}
        <g transform="translate(38,66)">
          <circle cx="0" cy="0" r="9" fill="url(#av_face)" stroke="#0f172a" strokeWidth="2.4" />
          <path d="M-6 -2 L6 -2 M-5 2 L5 2" stroke="#0f172a" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M-9 5 L9 5" stroke="#9f1239" strokeWidth="2.4" strokeLinecap="round" />
        </g>

        {/* right arm */}
        <path d="M76 76 Q92 72 96 86 Q98 96 90 100 L80 94 Q76 86 76 78 Z" fill="url(#av_face)" stroke="#0f172a" strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M88 96 L92 88" stroke="#9f1239" strokeWidth="2" strokeLinecap="round" />

        {/* right hand */}
        <g transform="translate(100,92)">
          <circle cx="0" cy="0" r="11" fill="url(#av_face)" stroke="#0f172a" strokeWidth="2.6" />
          <path d="M-7 -3 L7 -3 M-7 1 L7 1" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M-11 6 L11 6" stroke="#9f1239" strokeWidth="2.6" strokeLinecap="round" />
        </g>

        {/* belt buckle */}
        <rect x="55" y="70" width="10" height="6" fill="#c2410c" stroke="#0f172a" strokeWidth="2" />

        {/* HEAD GROUP — rotated for head-tracking */}
        <g ref={headGroupRef}>
          {/* back hair */}
          <path
            d="M30 48C30 22 42 8 60 8C78 8 90 22 90 48V70C90 78 84 82 76 79C72 82 48 82 44 79C36 82 30 78 30 70V48Z"
            fill="url(#av_hair)"
            stroke="#0f172a"
            strokeWidth="2.4"
          />
          {/* ears */}
          <path d="M28 54C20 50 22 36 30 36M92 54C100 50 98 36 90 36" fill="#450a0a" stroke="#0f172a" strokeWidth="2" />
          {/* face */}
          <ellipse cx="60" cy="48" rx="22" ry="24" fill="url(#av_face)" stroke="#0f172a" strokeWidth="2.4" />
          {/* front hair */}
          <g>
            <path
              d="M30 32 L36 14 L42 28 L48 8 L54 26 L60 6 L66 26 L72 8 L78 28 L84 14 L90 32 Q60 22 30 32 Z"
              fill="url(#av_hairFront)"
              stroke="#0f172a"
              strokeWidth="2.3"
              strokeLinejoin="round"
            />
            <path d="M28 38 Q60 28 92 38 L92 46 Q60 36 28 46 Z" fill="#f43f5e" stroke="#0f172a" strokeWidth="2.4" strokeLinejoin="round" />
            <path d="M88 40 L106 34 L100 46 L110 50 L94 50 Z" fill="#f43f5e" stroke="#0f172a" strokeWidth="2" strokeLinejoin="round" />
            <circle cx="60" cy="42" r="1.6" fill="rgba(255,255,255,0.04)" stroke="#0f172a" strokeWidth="1.2" />
            <path d="M40 44 L46 46 M74 46 L80 44" stroke="#9f1239" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
          </g>
          {/* eyebrows */}
          <path d="M42 50 L56 52" stroke="#0f172a" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M64 52 L78 50" stroke="#0f172a" strokeWidth="2.6" strokeLinecap="round" />
          {/* eye whites / irises */}
          <ellipse data-fighter-eye cx="50" cy="56" rx="6.4" ry="5.5" fill="url(#av_eye)" stroke="#0f172a" strokeWidth="1.5" />
          <ellipse data-fighter-eye cx="70" cy="56" rx="6.4" ry="5.5" fill="url(#av_eye)" stroke="#0f172a" strokeWidth="1.5" />
          {/* PUPILS — translated for eye-tracking */}
          <g ref={pupilsGroupRef}>
            <circle cx="50" cy="56" r="2.4" fill="#0a1330" />
            <circle cx="70" cy="56" r="2.4" fill="#0a1330" />
            <circle cx="48.4" cy="54" r="1.6" fill="#fff" />
            <circle cx="68.4" cy="54" r="1.6" fill="#fff" />
            <circle cx="52" cy="58" r="1" fill="#d83bff" />
            <circle cx="72" cy="58" r="1" fill="#d83bff" />
          </g>
          {/* mouth */}
          <g>
            <path d="M52 66 L68 66" stroke="#0f172a" strokeWidth="2.6" strokeLinecap="round" />
            <rect x="55" y="67.2" width="10" height="1.8" fill="rgba(255,255,255,0.04)" stroke="#0f172a" strokeWidth="0.8" />
            <path d="M40 60 L44 62" stroke="#9f1239" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
            <path d="M76 62 L80 60" stroke="#9f1239" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
          </g>
        </g>
      </svg>
    </div>
  );
}
