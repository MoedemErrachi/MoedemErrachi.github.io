import { ArrowUpRight } from "lucide-react";
import { GithubIcon } from "@/components/icons/Social";
import { content } from "@/lib/content";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

export default function Projects() {
  const { projects, sections, profile } = content;
  const github = profile.links.find((link) => link.icon === "github");
  const garageHref = github
    ? `${github.href}?tab=repositories`
    : "https://github.com/MoedemErrachi";

  return (
    <section id="projects" className="section-anchor px-5 py-24 sm:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeading
          session="05"
          eyebrow={sections.projects.eyebrow}
          title={sections.projects.title}
          description={sections.projects.description}
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => {
            const number = String(index + 1).padStart(2, "0");
            return (
              <Reveal key={project.title} delay={(index % 3) * 0.06}>
                <article
                  className={`panel panel-hover flex h-full flex-col p-6 ${
                    project.featured ? "corners" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* entry number plate */}
                    <span
                      aria-hidden="true"
                      className="numeral text-4xl font-bold leading-none text-white/[0.09]"
                    >
                      {number}
                    </span>
                    <span
                      className={`px-2 py-1 text-[9px] font-bold tracking-[0.16em] display ${
                        project.featured
                          ? "bg-racing text-white"
                          : "border border-line text-muted"
                      }`}
                    >
                      {project.featured ? "WORKS ENTRY" : "CUSTOMER ENTRY"}
                    </span>
                  </div>

                  <h3 className="display mt-3 text-xl font-semibold uppercase leading-tight text-foreground">
                    {project.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted">
                    {project.description}
                  </p>

                  {project.highlights.length > 0 ? (
                    <ul className="mt-4 space-y-1.5">
                      {project.highlights.map((highlight) => (
                        <li
                          key={highlight}
                          className="flex items-start gap-2.5 text-xs leading-relaxed text-muted"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-[6px] h-1 w-1 shrink-0 bg-racing"
                          />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {project.tech.map((tech) => (
                      <span
                        key={tech}
                        className="numeral border border-line bg-elevated px-2 py-0.5 text-[10px] text-foreground/70"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto flex items-center gap-4 border-t border-line pt-4 mt-6">
                    {project.repo ? (
                      <a
                        href={project.repo}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-foreground/80 transition-colors hover:text-racing display"
                      >
                        <GithubIcon className="h-3.5 w-3.5" />
                        GARAGE
                      </a>
                    ) : null}
                    {project.demo ? (
                      <a
                        href={project.demo}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-foreground/80 transition-colors hover:text-racing display"
                      >
                        ONBOARD
                        <ArrowUpRight className="h-3 w-3" />
                      </a>
                    ) : null}
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.1} className="mt-5">
          <a
            href={garageHref}
            target="_blank"
            rel="noreferrer"
            className="group corners panel panel-hover row-shift flex items-center justify-between gap-4 p-5 sm:p-6"
          >
            <span>
              <span className="telemetry block text-muted">FULL GARAGE LIST</span>
              <span className="display mt-1 block text-2xl font-semibold uppercase text-foreground">
                More entries on GitHub
              </span>
            </span>
            <ArrowUpRight className="h-6 w-6 shrink-0 text-racing transition-transform group-hover:translate-x-1" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
