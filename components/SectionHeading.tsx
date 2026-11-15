import Reveal from "./Reveal";

interface SectionHeadingProps {
  /** Zero-padded session number, e.g. "02". */
  session: string;
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

export default function SectionHeading({
  session,
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  const alignment =
    align === "center" ? "text-center mx-auto items-center" : "text-left items-start";

  return (
    <Reveal variant="wipe" className={`flex flex-col gap-4 max-w-2xl ${alignment}`}>
      <span className="inline-flex items-center gap-3">
        <span className="inline-flex items-center bg-racing px-2.5 py-1 text-[11px] font-bold tracking-[0.18em] text-white display">
          SESSION {session}
        </span>
        <span className="telemetry text-muted">{eyebrow}</span>
        {/* sector ticks */}
        <span aria-hidden="true" className="hidden items-center gap-1 sm:flex">
          <span className="h-1 w-4 bg-racing" />
          <span className="h-1 w-2 bg-line" />
          <span className="h-1 w-2 bg-line" />
        </span>
      </span>

      <h2 className="display text-4xl font-semibold leading-[0.95] text-foreground sm:text-5xl">
        {title}
      </h2>

      {description ? (
        <p className="max-w-xl text-base leading-relaxed text-muted">{description}</p>
      ) : null}

      <span aria-hidden="true" className="mt-1 block h-px w-24 bg-gradient-to-r from-racing to-transparent" />
    </Reveal>
  );
}
