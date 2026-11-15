export interface Link {
  label: string;
  href: string;
  icon?: "github" | "linkedin" | "mail" | "phone" | "globe" | "file";
}

export interface CvFile {
  label: string;
  href: string;
}

export interface Language {
  name: string;
  level: string;
}

export interface Profile {
  name: string;
  role: string;
  tagline: string;
  /** Small mono line under the hero eyebrow, e.g. "FINAL SEASON — SEEKING A PFE SEAT". */
  heroLabel: string;
  /** Status chip text, e.g. "ON TRACK — OPEN TO A PFE INTERNSHIP". */
  status: string;
  summary: string;
  location: string;
  email: string;
  phone?: string;
  photo: string;
  resume: CvFile[];
  links: Link[];
}

export interface SkillGroup {
  category: string;
  icon: "backend" | "frontend" | "tools" | "data" | "ci" | "ai";
  items: string[];
}

export interface Experience {
  role: string;
  company: string;
  /** Short mono label rendered as the stint badge, e.g. "SEASON 2026". */
  season: string;
  period: string;
  stack: string;
  description: string;
  bullets: string[];
  link?: string;
  demo?: string;
}

export interface Hackathon {
  title: string;
  /** Name of the entry built for the round, e.g. "Ainek Mizenek". */
  project?: string;
  /** Display string, e.g. "TOP 5", "P2". */
  award: string;
  /** Exact finishing position when known (drives gold/silver/bronze styling). */
  position?: number;
  date: string;
  description: string;
  tags: string[];
  link?: string;
}

export interface Project {
  title: string;
  description: string;
  highlights: string[];
  tech: string[];
  repo?: string;
  demo?: string;
  featured?: boolean;
}

export interface Education {
  degree: string;
  school: string;
  period: string;
  description: string;
}

export interface AboutHighlight {
  title: string;
  text: string;
  icon: "backend" | "frontend" | "tools" | "trophy";
}

export interface About {
  eyebrow: string;
  title: string;
  description: string;
  paragraphs: string[];
  highlights: AboutHighlight[];
}

export interface SectionCopy {
  eyebrow: string;
  title: string;
  description: string;
}

export interface PortfolioContent {
  profile: Profile;
  about: About;
  sections: {
    experience: SectionCopy;
    skills: SectionCopy;
    hackathons: SectionCopy;
    projects: SectionCopy;
    education: SectionCopy;
    contact: SectionCopy;
  };
  experience: Experience[];
  skills: SkillGroup[];
  hackathons: Hackathon[];
  projects: Project[];
  education: Education[];
  certifications: string[];
  languages: Language[];
  seo: {
    title: string;
    description: string;
  };
}
