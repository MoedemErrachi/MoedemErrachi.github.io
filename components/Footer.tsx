import { content } from "@/lib/content";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-4">
      {/* chequered flag */}
      <div aria-hidden="true" className="chequered h-2.5 w-full opacity-80" />

      <div className="px-5 py-8 sm:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="telemetry text-muted">
            PARC FERMÉ · © {year} {content.profile.name}
          </p>
          <p className="telemetry text-muted">
            SESSION COMPLETE ·{" "}
            <a href="#top" className="text-foreground/80 transition-colors hover:text-racing">
              BACK TO GRID ↑
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
