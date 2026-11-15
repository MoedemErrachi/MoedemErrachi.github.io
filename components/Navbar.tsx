"use client";

import { useEffect, useState } from "react";
import { Menu, X, Download } from "lucide-react";
import { content } from "@/lib/content";

/** Timing tower: position number + short session label. */
const links = [
  { href: "#about", position: "P1", label: "BRIEFING" },
  { href: "#experience", position: "P2", label: "SEATS" },
  { href: "#skills", position: "P3", label: "SETUP" },
  { href: "#hackathons", position: "P4", label: "ROUNDS" },
  { href: "#projects", position: "P5", label: "GARAGE" },
  { href: "#education", position: "P6", label: "ACADEMY" },
  { href: "#contact", position: "P7", label: "RADIO" },
];

const SECTION_IDS = ["top", ...links.map((l) => l.href.slice(1))];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState("top");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);

      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);

      let current = SECTION_IDS[0];
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) current = id;
      }
      setActive(current);

      // keep the URL hash in sync with the section on screen (no history spam)
      const desiredHash = current === SECTION_IDS[0] ? "" : `#${current}`;
      if (window.location.hash !== desiredHash) {
        history.replaceState(
          null,
          "",
          `${window.location.pathname}${window.location.search}${desiredHash}`,
        );
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const activeIndex = Math.max(
    0,
    SECTION_IDS.indexOf(active.length ? active : SECTION_IDS[0]),
  );
  const lap = String(activeIndex + 1).padStart(2, "0");
  const total = String(SECTION_IDS.length).padStart(2, "0");

  const cv = content.profile.resume[0];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-200 ${
        scrolled
          ? "border-b border-line bg-carbon/90 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <a
          href="#top"
          className="group flex items-center gap-2.5"
          aria-label="Back to top"
        >
          <span className="corners flex h-8 w-8 items-center justify-center bg-racing text-xs font-bold text-white display">
            ME
          </span>
          <span className="hidden leading-none sm:block">
            <span className="block text-sm font-semibold tracking-wide text-foreground">
              {content.profile.name}
            </span>
            <span className="telemetry block text-[10px] text-muted">
              GRAND PRIX · TUNIS
            </span>
          </span>
        </a>

        <div className="hidden items-center gap-0.5 lg:flex">
          {links.map((link) => {
            const isActive = active === link.href.slice(1);
            return (
              <a
                key={link.href}
                href={link.href}
                className={`group flex items-center gap-1.5 px-3 py-2 text-xs transition-colors ${
                  isActive
                    ? "text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <span
                  className={`numeral text-[10px] ${
                    isActive ? "text-racing" : "text-muted/60"
                  }`}
                >
                  {link.position}
                </span>
                <span className="telemetry">{link.label}</span>
              </a>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <span
            className="telemetry hidden text-muted xl:block"
            aria-label={`Lap ${lap} of ${total}`}
          >
            LAP {lap}/{total}
          </span>
          <a
            href={cv.href}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 border border-line bg-panel px-4 py-2 text-xs font-semibold tracking-wide text-foreground transition-colors hover:border-racing hover:text-white sm:flex"
          >
            <Download className="h-3.5 w-3.5" />
            RACE PROGRAMME
          </a>
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center border border-line bg-panel text-foreground lg:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {/* race-distance progress bar */}
      <div className="h-0.5 w-full bg-white/5" aria-hidden="true">
        <div
          className="h-full bg-racing"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>

      {open ? (
        <div className="border-b border-line bg-carbon/95 px-5 py-4 backdrop-blur-md lg:hidden">
          <div className="flex flex-col gap-0.5">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="row-shift flex items-center gap-3 px-2 py-2.5 text-sm text-muted transition-colors hover:text-foreground"
              >
                <span className="numeral text-[10px] text-racing">
                  {link.position}
                </span>
                <span className="telemetry">{link.label}</span>
              </a>
            ))}
            <a
              href={cv.href}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 bg-racing px-3 py-2.5 text-xs font-bold tracking-wide text-white display"
            >
              <Download className="h-4 w-4" />
              RACE PROGRAMME
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
