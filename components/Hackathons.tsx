import { ArrowUpRight } from "lucide-react";
import { content } from "@/lib/content";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

function chipTone(award: string, position?: number): string {
  if (position === 1) return "border-gold/60 bg-gold/10 text-gold";
  if (position === 2) return "border-zinc-300/50 bg-zinc-300/10 text-zinc-200";
  if (position === 3) return "border-amber-600/50 bg-amber-600/10 text-amber-500";
  if (position && position > 0) return "border-racing/50 bg-racing-soft text-foreground";
  return "border-racing/50 bg-racing-soft text-foreground";
}

export default function Hackathons() {
  const { hackathons, sections } = content;

  return (
    <section id="hackathons" className="section-anchor px-5 py-24 sm:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeading
          session="04"
          eyebrow={sections.hackathons.eyebrow}
          title={sections.hackathons.title}
          description={sections.hackathons.description}
        />

        <Reveal delay={0.05} className="mt-12">
          <div className="corners panel">
            {/* timing-tower header */}
            <div
              className="hidden grid-cols-[90px_64px_1fr_120px_110px] gap-4 border-b border-line px-6 py-3 sm:grid"
              aria-hidden="true"
            >
              <span className="telemetry text-muted">POS</span>
              <span className="telemetry text-muted">RD</span>
              <span className="telemetry text-muted">ROUND · ENTRY</span>
              <span className="telemetry text-muted">SEASON</span>
              <span className="telemetry text-right text-muted">GARAGE</span>
            </div>

            {hackathons.map((hack, index) => (
              <article
                key={hack.title}
                className="row-shift group border-b border-line px-6 py-5 last:border-b-0"
              >
                <div className="grid items-center gap-3 sm:grid-cols-[90px_64px_1fr_120px_110px] sm:gap-4">
                  {/* position */}
                  <span
                    className={`inline-flex w-fit items-center border px-2.5 py-1 text-xs font-bold tracking-wider display ${chipTone(hack.award, hack.position)}`}
                  >
                    {hack.award}
                  </span>

                  {/* round number */}
                  <span className="numeral text-xs text-muted">
                    R{index + 1}
                  </span>

                  {/* event + entry */}
                  <div className="min-w-0">
                    <h3 className="display text-xl font-semibold uppercase text-foreground">
                      {hack.title}
                      {hack.project ? (
                        <span className="ml-2 text-sm font-medium normal-case text-muted">
                          — {hack.project}
                        </span>
                      ) : null}
                    </h3>
                  </div>

                  {/* season */}
                  <span className="numeral text-xs text-muted">{hack.date}</span>

                  {/* garage link */}
                  {hack.link ? (
                    <a
                      href={hack.link}
                      target="_blank"
                      rel="noreferrer"
                      className="justify-self-start text-xs font-semibold tracking-wide text-foreground/80 transition-colors hover:text-racing display sm:justify-self-end"
                    >
                      <span className="inline-flex items-center gap-1">
                        GARAGE
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </span>
                    </a>
                  ) : (
                    <span className="telemetry text-muted/50 sm:text-right">—</span>
                  )}
                </div>

                {/* debrief */}
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
                  {hack.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {hack.tags.map((tag) => (
                    <span
                      key={tag}
                      className="numeral border border-line bg-elevated px-2 py-0.5 text-[10px] text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
