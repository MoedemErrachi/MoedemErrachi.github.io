"use client";

import Image from "next/image";
import { motion, type Variants } from "motion/react";
import { ArrowDown, Download, Mail, MapPin } from "lucide-react";
import { GithubIcon, LinkedInIcon } from "@/components/icons/Social";
import Counter from "@/components/Counter";
import { content } from "@/lib/content";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function Hero() {
  const { profile, hackathons, experience, projects, certifications } = content;
  const github = profile.links.find((l) => l.icon === "github");
  const linkedin = profile.links.find((l) => l.icon === "linkedin");

  const stats = [
    { value: hackathons.length, label: "Rounds entered" },
    { value: experience.length, label: "Race seats" },
    { value: projects.length, label: "Garage entries" },
    { value: certifications.length, label: "Licences" },
  ];

  return (
    <section
      id="top"
      className="relative isolate overflow-hidden px-5 pb-24 pt-32 sm:px-8 sm:pt-40"
    >
      {/* ── backdrop: broadcast grid + carbon + red light trails ── */}
      <div className="bg-grid absolute inset-0 -z-10" aria-hidden="true" />
      <div className="carbon absolute inset-0 -z-10" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-[26%] -z-10 h-px w-[130%] -translate-x-1/2 streak"
      />
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-[42%] -z-10 h-px w-[130%] -translate-x-1/2 streak opacity-40"
      />
      <div
        aria-hidden="true"
        className="absolute -left-40 top-24 -z-10 h-96 w-96 rounded-full bg-racing/10 blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-carbon to-transparent"
      />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-16 lg:grid-cols-[1.15fr_0.85fr]">
        {/* ── left: driver ID ── */}
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.p variants={item} className="telemetry text-muted">
            <span className="text-racing">TUNIS · TUNISIA</span>
            <span className="mx-3 text-line">|</span>
            {profile.heroLabel}
          </motion.p>

          <motion.h1
            variants={item}
            className="display mt-6 text-6xl font-bold leading-[0.92] text-foreground sm:text-8xl"
          >
            <span className="block">{profile.name}</span>
            <span className="mt-2 block text-racing">{profile.tagline}</span>
          </motion.h1>

          <motion.p variants={item} className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            <span className="font-medium text-foreground/85">{profile.role}</span>
            <span className="hidden h-3 w-px bg-line sm:block" />
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {profile.location}
            </span>
          </motion.p>

          <motion.p
            variants={item}
            className="mt-6 max-w-xl text-base leading-relaxed text-muted"
          >
            {profile.summary}
          </motion.p>

          {/* status line */}
          <motion.p variants={item} className="mt-6 inline-flex items-center gap-2.5 border border-line bg-panel px-3.5 py-2">
            <span className="live-dot relative flex h-2 w-2">
              <span className="relative inline-flex h-2 w-2 rounded-full bg-racing" />
            </span>
            <span className="telemetry text-foreground/90">{profile.status}</span>
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-wrap gap-3">
            <a
              href="#projects"
              className="group inline-flex items-center gap-2 bg-racing px-6 py-3 text-sm font-bold tracking-wide text-white display transition-colors hover:bg-[#c00500]"
            >
              Enter the garage
              <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
            </a>
            <a
              href={profile.resume[0].href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-line bg-panel px-6 py-3 text-sm font-semibold tracking-wide text-foreground transition-colors hover:border-racing display"
            >
              <Download className="h-4 w-4" />
              Race programme · CV
            </a>
            {github ? (
              <a
                href={github.href}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="inline-flex h-11 w-11 items-center justify-center border border-line bg-panel text-muted transition-colors hover:border-racing hover:text-foreground"
              >
                <GithubIcon className="h-4 w-4" />
              </a>
            ) : null}
            {linkedin ? (
              <a
                href={linkedin.href}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="inline-flex h-11 w-11 items-center justify-center border border-line bg-panel text-muted transition-colors hover:border-racing hover:text-foreground"
              >
                <LinkedInIcon className="h-4 w-4" />
              </a>
            ) : null}
            <a
              href={`mailto:${profile.email}`}
              aria-label="Email"
              className="inline-flex h-11 w-11 items-center justify-center border border-line bg-panel text-muted transition-colors hover:border-racing hover:text-foreground"
            >
              <Mail className="h-4 w-4" />
            </a>
          </motion.div>

          {/* telemetry tiles */}
          <motion.dl
            variants={item}
            className="mt-12 grid max-w-lg grid-cols-4 gap-px border border-line bg-line"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="bg-panel px-4 py-4">
                <dt className="numeral text-3xl font-bold text-foreground">
                  <Counter value={stat.value} pad={2} />
                </dt>
                <dd className="telemetry mt-1.5 text-[9px] text-muted">
                  {stat.label}
                </dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        {/* ── right: driver card ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="relative mx-auto w-full max-w-sm lg:max-w-md"
        >
          <div
            aria-hidden="true"
            className="absolute -inset-8 -z-10 rounded-full bg-racing/10 blur-[100px]"
          />

          <div className="corners panel relative p-2.5">
            {/* season tag over the photo */}
            <span className="absolute left-2.5 top-2.5 z-10 bg-carbon/80 px-2.5 py-1 telemetry text-[9px] text-foreground backdrop-blur-sm">
              DRIVER · {profile.name.split(" ")[0]}
            </span>
            <div className="relative overflow-hidden">
              <Image
                src={profile.photo}
                alt={profile.name}
                width={640}
                height={800}
                priority
                className="h-auto w-full object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-carbon/85 via-transparent to-carbon/20"
              />
            </div>

            {/* broadcast lower-third */}
            <div className="relative">
              <div className="absolute -top-px left-0 z-10 h-6 w-1.5 bg-racing" aria-hidden="true" />
              <div className="flex items-center justify-between gap-3 px-3 pb-1 pt-2">
                <div className="min-w-0">
                  <p className="display truncate text-lg font-semibold uppercase text-foreground">
                    {profile.name}
                  </p>
                  <p className="telemetry truncate text-[9px] text-muted">
                    {profile.tagline} · FST TUNIS
                  </p>
                </div>
                <span aria-hidden="true" className="chequered h-6 w-14 shrink-0 opacity-70" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
