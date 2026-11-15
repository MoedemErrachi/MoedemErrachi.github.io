import { Download, Mail, MapPin, Phone } from "lucide-react";
import { GithubIcon, LinkedInIcon } from "@/components/icons/Social";
import { content } from "@/lib/content";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

const channelIcons = {
  github: GithubIcon,
  mail: Mail,
  linkedin: LinkedInIcon,
  globe: Phone,
  phone: Phone,
  file: Download,
} as const;

export default function Contact() {
  const { profile, sections } = content;

  return (
    <section id="contact" className="section-anchor px-5 py-24 sm:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <Reveal variant="wipe">
          <div className="corners panel relative overflow-hidden px-6 py-14 sm:px-12">
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-10 h-px w-[110%] -translate-x-1/2 streak opacity-60"
            />
            <div className="relative mx-auto flex max-w-2xl flex-col items-center text-center">
              <SectionHeading
                session="07"
                eyebrow={sections.contact.eyebrow}
                title={sections.contact.title}
                description={sections.contact.description}
                align="center"
              />

              {/* big channel button */}
              <a
                href={`mailto:${profile.email}`}
                className="group mt-9 inline-flex items-center gap-2.5 bg-racing px-8 py-4 text-base font-bold tracking-wide text-white display transition-colors hover:bg-[#c00500]"
              >
                <Mail className="h-4 w-4" />
                Open a channel
              </a>

              {/* mono contact lines */}
              <div className="mt-6 space-y-1.5 text-sm text-muted">
                <p className="numeral break-all">{profile.email}</p>
                {profile.phone ? (
                  <p className="numeral flex items-center justify-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-racing" />
                    {profile.phone}
                  </p>
                ) : null}
                <p className="flex items-center justify-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-racing" />
                  {profile.location}
                </p>
              </div>

              {/* other channels */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                {profile.links.map((link) => {
                  const Icon = channelIcons[link.icon ?? "globe"];
                  if (link.icon === "mail") return null;
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 border border-line bg-panel px-5 py-2.5 text-sm text-foreground transition-colors hover:border-racing"
                    >
                      <Icon className="h-4 w-4 text-muted" />
                      {link.label}
                    </a>
                  );
                })}
              </div>

              {/* race programme */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
                {profile.resume.map((cv) => (
                  <a
                    key={cv.href}
                    href={cv.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-racing"
                  >
                    <Download className="h-3.5 w-3.5" />
                    {cv.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
