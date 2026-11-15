import { Code2, MapPin, Server, Sparkles, Trophy } from "lucide-react";
import { content } from "@/lib/content";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

const HIGHLIGHT_ICONS = {
  backend: Server,
  frontend: Code2,
  tools: Sparkles,
  trophy: Trophy,
};

export default function About() {
  const { profile, about, experience, certifications, languages } = content;

  return (
    <section id="about" className="section-anchor relative px-5 py-24 sm:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeading
          session="01"
          eyebrow={about.eyebrow}
          title={about.title}
          description={about.description}
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <Reveal className="space-y-5 text-base leading-relaxed text-muted">
            <p className="text-foreground/90">{profile.summary}</p>
            {about.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
            <div className="grid gap-4 pt-2 sm:grid-cols-3">
              {about.highlights.map((highlight) => {
                const Icon = HIGHLIGHT_ICONS[highlight.icon] ?? Sparkles;
                return (
                  <div key={highlight.title} className="corners panel panel-hover p-4">
                    <Icon className="h-5 w-5 text-racing" />
                    <h3 className="display mt-3 text-base font-semibold uppercase text-foreground">
                      {highlight.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted">
                      {highlight.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="corners panel p-6">
              <h3 className="telemetry flex items-center justify-between text-muted">
                CAR SPEC
                <span className="h-1 w-8 bg-racing" aria-hidden="true" />
              </h3>
              <ul className="mt-5 space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-racing" />
                  <span>
                    <span className="block text-foreground">{profile.location}</span>
                    <span className="text-muted">Home circuit</span>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Server className="mt-0.5 h-4 w-4 shrink-0 text-racing" />
                  <span>
                    <span className="block text-foreground">
                      {experience.length} race seats · {experience[0]?.company.split(" — ")[0]}
                    </span>
                    <span className="text-muted">Latest stint: {experience[0]?.period}</span>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-racing" />
                  <span>
                    <span className="block text-foreground">
                      {certifications.length} licences · {languages.length} languages
                    </span>
                    <span className="text-muted">{certifications.join(" · ")}</span>
                  </span>
                </li>
              </ul>

              {/* comms frequencies */}
              <div className="mt-6 border border-line bg-elevated p-4">
                <p className="telemetry text-muted">RADIO FREQUENCIES</p>
                <ul className="mt-3 space-y-1.5">
                  {languages.map((language) => (
                    <li
                      key={language.name}
                      className="flex items-center justify-between gap-4 text-sm"
                    >
                      <span className="text-foreground/90">{language.name}</span>
                      <span className="telemetry text-muted">{language.level}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 border border-racing/30 bg-racing-soft p-4">
                <p className="telemetry text-muted">BEST REACHED BY EMAIL</p>
                <a
                  href={`mailto:${profile.email}`}
                  className="mt-1 block break-all text-sm font-medium text-foreground hover:text-racing"
                >
                  {profile.email}
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
