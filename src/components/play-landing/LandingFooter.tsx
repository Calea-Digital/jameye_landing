import footer from "../../lang/en/footer.json";
import { CONTACT_EMAIL, TELEGRAM_URL } from "../../config";

/** Site footer for the play landing: oversized wordmark + legal links. */
export function LandingFooter() {
  return (
    <footer className="play-footer relative w-full snap-start overflow-hidden bg-[#05060F] px-5 pt-12 pb-[calc(8.5rem+env(safe-area-inset-bottom))] text-center sm:px-8 sm:pt-16 sm:pb-[calc(9.5rem+env(safe-area-inset-bottom))]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[60vw] w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-[110px]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(236,72,153,0.45), rgba(99,102,241,0.3) 55%, transparent 100%)",
        }}
      />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center">
        <a href="/en" aria-label="Jameye home" className="block w-full">
          <span className="jameye-wordmark block w-full whitespace-nowrap text-[clamp(3.4rem,17.5vw,15.5rem)] leading-none">
            JAMEYE<sup className="reg">®</sup>
          </span>
        </a>

        <nav
          aria-label="Legal"
          className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-white/65 sm:mt-8 sm:gap-x-6 sm:text-xs"
        >
          {footer.legal.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-white">
              {link.text}
            </a>
          ))}
          <a href="/en/about" className="transition-colors hover:text-white">
            About
          </a>
          <a href={`mailto:${CONTACT_EMAIL}`} className="transition-colors hover:text-white">
            Contact
          </a>
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Join our Telegram"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 10l-4 4l6 6l4 -16l-18 7l4 2l2 6l3 -4" />
            </svg>
            Telegram
          </a>
        </nav>

        <p className="mt-5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/40 sm:mt-6 sm:text-xs">
          {footer.signature}
        </p>
      </div>
    </footer>
  );
}

export default LandingFooter;
