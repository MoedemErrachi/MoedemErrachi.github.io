import { Brain, Database, Monitor, Server, Workflow, Wrench } from "lucide-react";
import { content } from "@/lib/content";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

const assemblies = {
  backend: { icon: Server, code: "BE" },
  frontend: { icon: Monitor, code: "FE" },
  tools: { icon: Wrench, code: "CD" },
  data: { icon: Database, code: "DB" },
  ci: { icon: Workflow, code: "CI" },
  ai: { icon: Brain, code: "AI" },
} as const;

export default function Skills() {
  const { skills, sections } = content;

  return (
    <section id="skills" className="section-anchor px-5 py-24 sm:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeading
          session="03"
          eyebrow={sections.skills.eyebrow}
          title={sections.skills.title}
          description={sections.skills.description}
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {skills.map((group, index) => {
            const assembly = assemblies[group.icon] ?? assemblies.tools;
            const Icon = assembly.icon;
            return (
              <Reveal key={group.category} delay={index * 0.06}>
                <div className="corners panel panel-hover h-full p-6">
                  <div className="flex items-center justify-between">
                    <span className="telemetry flex items-center gap-2 text-muted">
                      <Icon className="h-4 w-4 text-racing" />
                      ASSEMBLY {assembly.code}
                    </span>
                    <span
                      aria-hidden="true"
                      className="numeral text-xs text-muted/60"
                    >
                      {group.items.length.toString().padStart(2, "0")} PARTS
                    </span>
                  </div>

                  <h3 className="display mt-4 text-2xl font-semibold uppercase text-foreground">
                    {group.category}
                  </h3>

                  <ul className="mt-4 divide-y divide-line border-y border-line">
                    {group.items.map((skill, itemIndex) => (
                      <li
                        key={skill}
                        className="row-shift flex items-center justify-between gap-4 py-2.5"
                      >
                        <span className="text-sm text-foreground/85">{skill}</span>
                        <span
                          aria-hidden="true"
                          className="numeral text-[10px] text-muted/60"
                        >
                          {assembly.code}-{String(itemIndex + 1).padStart(2, "0")}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
