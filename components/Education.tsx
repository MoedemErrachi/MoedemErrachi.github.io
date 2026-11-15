import { Award } from "lucide-react";
import { content } from "@/lib/content";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

export default function Education() {
  const { education, certifications, sections } = content;

  return (
    <section id="education" className="section-anchor px-5 py-24 sm:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeading
          session="06"
          eyebrow={sections.education.eyebrow}
          title={sections.education.title}
          description={sections.education.description}
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          {/* ladder */}
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute bottom-2 left-[13px] top-2 w-px bg-gradient-to-b from-racing/60 via-line to-transparent"
            />
            <div className="space-y-6">
              {education.map((edu, index) => {
                const isCurrent = /final|seeking/i.test(edu.period);
                return (
                  <Reveal key={edu.degree} delay={index * 0.06}>
                    <div className="relative pl-10">
                      {/* tier marker */}
                      <span
                        aria-hidden="true"
                        className={`absolute left-0 top-1 flex h-7 w-7 items-center justify-center border text-[10px] font-bold numeral ${
                          isCurrent
                            ? "border-racing bg-racing text-white"
                            : "border-line bg-panel text-muted"
                        }`}
                      >
                        {index + 1}
                      </span>

                      <div
                        className={`panel p-5 ${isCurrent ? "corners" : ""}`}
                      >
                        <span
                          className={`numeral text-xs ${
                            isCurrent ? "text-racing" : "text-muted"
                          }`}
                        >
                          {edu.period}
                        </span>
                        <h3 className="display mt-2 text-lg font-semibold uppercase leading-snug text-foreground">
                          {edu.degree}
                        </h3>
                        <p className="mt-0.5 text-sm text-foreground/70">{edu.school}</p>
                        <p className="mt-2.5 text-sm leading-relaxed text-muted">
                          {edu.description}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>

          {/* licences */}
          <Reveal delay={0.1}>
            <div className="corners panel p-6">
              <h3 className="telemetry flex items-center justify-between text-muted">
                LICENCES
                <span className="h-1 w-8 bg-racing" aria-hidden="true" />
              </h3>
              <ul className="mt-5 space-y-3">
                {certifications.map((cert) => (
                  <li
                    key={cert}
                    className="flex items-start gap-3 border border-line bg-elevated p-3.5"
                  >
                    <Award className="mt-0.5 h-4 w-4 shrink-0 text-racing" />
                    <span className="text-sm leading-relaxed text-foreground/90">
                      {cert}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs leading-relaxed text-muted">
                Superlicence equivalents — issued by AWS and Microsoft, verified on
                request.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
