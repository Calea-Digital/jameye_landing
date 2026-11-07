/** Shape of src/lang/<locale>/home.json — the homepage content tree. */

export interface Step {
  n: string;
  label: string;
}

export interface HeroContent {
  eyebrow: string;
  /** Ink lines of the display title; `titleAccent` follows in the gradient. */
  titleLines: string[];
  titleAccent: string;
  lead: string;
  cta: string;
  secondary: string;
  note: string;
  card: {
    image: string;
    tag: string;
    title: string;
    kicker: string;
    question: string;
    cta: string;
  };
  quote: { kicker: string; text: string; accent: string };
  caption: string;
  steps: Step[];
}

export interface Profile {
  name: string;
  /** Profile photo path (e.g. /images/community/barjanne.webp). Empty → monogram. */
  image: string;
}

export interface CommunityContent {
  eyebrow: string;
  profiles: Profile[];
}

export interface ForecastFilter {
  id: string;
  label: string;
}

export interface ForecastCard {
  /** Matches a ForecastFilter id. */
  category: string;
  tag: string;
  title: string;
  body: string;
  image: string;
}

export interface ExploreContent {
  eyebrow: string;
  titleLines: string[];
  lead: string;
  filtersLabel: string;
  filters: ForecastFilter[];
  cardCta: string;
  cards: ForecastCard[];
  caption: string;
}

export interface HowContent {
  eyebrow: string;
  titleLines: string[];
  lead: string;
  steps: { n: string; title: string; body: string }[];
}

export interface ClosingContent {
  eyebrow: string;
  titleLines: string[];
  lead: string[];
  cta: string;
}

export interface HomeContent {
  hero: HeroContent;
  community: CommunityContent;
  explore: ExploreContent;
  how: HowContent;
  closing: ClosingContent;
}
