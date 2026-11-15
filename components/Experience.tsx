import { ArrowUpRight, ExternalLink } from "lucide-react";
import { content } from "@/lib/content";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

export default function Experience() {
  const { experience, sections } = content;

  return (
    <section id="experience" className="section-anchor px-5 py-24 sm:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeading
          session="02"
          eyebrow={sections.experience.eyebrow}
          title={sections.experience.title}
          description={sections.experience.description}
        />

        <div className="mt-12 space-y-6">
          {experience.map((stint, index) => (
            <Reveal key={stint.company} delay={index * 0.08} variant="wipe">
              <article className="corners panel panel-hover relative p-6 sm:p-8">
                {/* season tag */}
                <span
                  aria-hidden="true"
                  className="numeral pointer-events-none absolute right-4 top-4 hidden text-6xl font-bold text-white/[0.04] sm:block"
                >
                  {String(experience.length - index).padStart(2, "0")}
                </span>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="bg-racing px-2.5 py-1 text-[10px] font-bold tracking-[0.16em] text-white display">
                    {stint.season}
                  </span>
                  <span className="telemetry text-muted">{stint.period}</span>
                  <span aria-hidden="true" className="h-px flex-1 bg-line" />
                </div>

                <h3 className="display mt-5 text-2xl font-semibold uppercase leading-tight text-foreground sm:text-3xl">
                  {stint.role}
                </h3>
                <p className="mt-1 text-sm font-medium text-foreground/75">
                  {stint.company}
                </p>

                <p className="numeral mt-4 text-xs text-muted">{stint.stack}</p>

                <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">
                  {stint.description}
                </p>

                <ul className="mt-5 max-w-3xl space-y-2.5">
                  {stint.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3 text-sm leading-relaxed text-muted">
                      <span
                        aria-hidden="true"
                        className="mt-[7px] h-1.5 w-1.5 shrink-0 bg-racing"
                      />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                {stint.link || stint.demo ? (
                  <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-line pt-4">
                    {stint.link ? (
                      <a
                        href={stint.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-foreground/80 transition-colors hover:text-racing display"
                      >
                        GARAGE
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    ) : null}
                    {stint.demo ? (
                      <a
                        href={stint.demo}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-foreground/80 transition-colors hover:text-racing display"
                      >
                        ONBOARD
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
