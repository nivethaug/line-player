import { Link } from "react-router-dom";
import {
  Reveal,
  SpotlightCard,
} from "@/components/motion";
import {
  Play,
  Home as HomeIcon,
  MonitorPlay,
  Layers,
  SlidersHorizontal,
  Accessibility,
  RotateCcw,
  RotateCw,
  Settings,
  Maximize,
  ChevronRight,
} from "lucide-react";

/**
 * Home — Field Recorder / Cinema Edition cinematic landing page.
 * Layout per reference: hero (copy left, glowing player frame right),
 * "Every detail earns its place" 4-card row, "See it in action" 4 demo
 * cards, bottom technology strip. Live playback lives on /player.
 */
const MUX_PLAYBACK_ID = "MeWNxCn01tfsK9eF301NGaZ9Lkpr02TfHQa6r7Vu02OMs01k";
const HERO_POSTER = `https://image.mux.com/${MUX_PLAYBACK_ID}/thumbnail.jpg?width=1280&quality=80`;

const FEATURES = [
  {
    icon: MonitorPlay,
    title: "Video.js v10",
    body: "Modern, flexible, and extension-ready.",
  },
  {
    icon: Layers,
    title: "Mux Streaming",
    body: "HLS, adaptive bitrate, and global delivery.",
  },
  {
    icon: SlidersHorizontal,
    title: "Cinema Controls",
    body: "Timeline, timecode, volume meter, captions.",
  },
  {
    icon: Accessibility,
    title: "Responsive & Accessible",
    body: "Works across desktop, tablet, and mobile (NVDA ready).",
  },
];

const DEMOS = [
  { title: "Demo Reel", tag: "Demo", duration: "00:30", img: "https://picsum.photos/seed/showcase-reel/640/360" },
  { title: "Cinematic Controls", tag: "Skins", duration: "00:24", img: "https://picsum.photos/seed/showcase-skins/640/360" },
  { title: "Mux Streaming (HLS)", tag: "Streaming", duration: "00:42", img: "https://picsum.photos/seed/showcase-stream/640/360" },
  { title: "Nature Showcase", tag: "Reels", duration: "00:05", img: "https://picsum.photos/seed/showcase-nature/640/360" },
];

const TECH = [
  {
    name: "Video.js v10",
    swatch: (
      <span aria-hidden="true" className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-violet-500/20 text-violet-300">
        <Play className="h-3.5 w-3.5 fill-violet-300" />
      </span>
    ),
  },
  {
    name: "Mux",
    label: "Mux",
    swatch: (
      <span aria-hidden="true" className="font-mono text-lg font-bold tracking-tight text-pink-400">MUX</span>
    ),
  },
  {
    name: "React",
    swatch: (
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#61dafb" strokeWidth="1.4">
        <circle cx="12" cy="12" r="1.8" fill="#61dafb" stroke="none" />
        <ellipse cx="12" cy="12" rx="10" ry="4" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
      </svg>
    ),
  },
  {
    name: "TypeScript",
    swatch: (
      <span aria-hidden="true" className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#3178c6] font-mono text-xs font-bold text-white">TS</span>
    ),
  },
];

export default function Home() {
  return (
    <div
      data-testid="home-page"
      data-da-source="src/pages/Home.tsx:Home"
      className="relative min-h-full overflow-hidden bg-[#0d0c0f] text-zinc-100"
    >
      {/* Cinematic studio background — orange ambient light */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('/uploads/image_2194_cinematic-film-set-with-clapperboard_622d7f95.webp')",
          }}
        />
        <div className="absolute inset-0 bg-[#0d0c0f]/80" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0c0f]/60 via-transparent to-[#0d0c0f]/90" />
        <div className="absolute -top-40 right-[-10%] h-[480px] w-[480px] rounded-full bg-orange-500/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] h-[380px] w-[380px] rounded-full bg-orange-600/5 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
      </div>

      <main className="relative mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 md:px-8">
        {/* ── HERO ── */}
        <section
          data-da-source="src/pages/Home.tsx:Hero"
          aria-labelledby="home-hero-heading"
          className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2"
        >
          {/* Left — copy */}
          <div>
            <Reveal variant="fade">
              <span
                data-testid="home-hero-badge"
                className="inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-orange-500/10 px-4 py-1.5 text-sm font-semibold text-orange-300"
              >
                <Play className="h-3.5 w-3.5 fill-orange-300" aria-hidden="true" />
                Video.js v10 + Mux Streaming
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <h1
                id="home-hero-heading"
                className="mt-5 font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]"
              >
                Field Recorder —
                <br />
                <span className="text-orange-400">Cinema Edition</span>
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-zinc-400 sm:text-base">
                A video player skin designed for a modern cinema workflow —
                with a beautiful UI, professional controls, Mux streaming, and
                built on Video.js v10.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                <Link
                  to="/player"
                  data-testid="home-cta-watch-player"
                  className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 font-semibold sm:min-h-[48px] sm:w-auto text-black shadow-lg shadow-orange-500/30 transition-colors hover:bg-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0c0f]"
                >
                  <Play className="h-4 w-4 fill-black" aria-hidden="true" />
                  Watch the Player
                </Link>
                <Link
                  to="/showcase"
                  data-testid="home-cta-explore-showcase"
                  className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg border sm:min-h-[48px] sm:w-auto border-white/15 px-6 font-semibold text-zinc-200 transition-colors hover:border-orange-400/50 hover:text-orange-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0c0f]"
                >
                  <MonitorPlay className="h-4 w-4" aria-hidden="true" />
                  Explore Showcase
                  <span aria-hidden="true" className="ml-1">→</span>
                </Link>
              </div>
            </Reveal>
            <Reveal delay={0.4}>
              <div className="mt-7 flex flex-wrap justify-center gap-2 sm:mt-8 sm:justify-start sm:gap-2.5">
                {[
                  {
                    t: "Video.js v10",
                    swatch: (
                      <span aria-hidden="true" className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-orange-500/20">
                        <Play className="h-3 w-3 fill-orange-400 text-orange-400" />
                      </span>
                    ),
                  },
                  {
                    t: "Mux Streaming",
                    swatch: (
                      <span aria-hidden="true" className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-pink-500/20 text-sm font-bold leading-none text-pink-400">✕</span>
                    ),
                  },
                  {
                    t: "React Ready",
                    swatch: (
                      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#61dafb" strokeWidth="1.4">
                        <circle cx="12" cy="12" r="1.8" fill="#61dafb" stroke="none" />
                        <ellipse cx="12" cy="12" rx="10" ry="4" />
                        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
                        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
                      </svg>
                    ),
                  },
                ].map(({ t, swatch }) => (
                  <span
                    key={t}
                    data-testid="home-hero-tech-badge"
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#15151a]/90 px-3 py-1.5 text-xs font-semibold text-zinc-200"
                  >
                    {swatch}
                    {t}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Right — glowing player preview frame */}
          <Reveal variant="scale" delay={0.2} className="w-full">
            <Link
              to="/player"
              data-testid="home-hero-preview"
              aria-label="Open the live Field Recorder player"
              className="group block rounded-2xl border border-orange-500/30 bg-[#131316] p-2 shadow-[0_0_60px_rgba(249,115,22,0.18),0_24px_60px_rgba(0,0,0,0.6)] ring-1 ring-inset ring-white/5 transition-colors hover:border-orange-400/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 sm:p-3"
            >
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src={HERO_POSTER}
                  alt="Preview frame of the Field Recorder demo reel"
                  className="aspect-video w-full object-cover"
                  loading="eager"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"
                />
                <span className="absolute left-3 top-3 rounded-md bg-black/75 px-3 py-1 font-mono text-[11px] font-semibold tracking-wide text-zinc-100 backdrop-blur">
                  MUX DEMO REEL — FIELD RECORDER
                </span>
                <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-md bg-black/75 px-3 py-1 font-mono text-[11px] font-semibold text-zinc-100 backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-400 motion-reduce:animate-none" />
                  PAUSED
                </span>
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-black/55 ring-1 ring-white/25 backdrop-blur transition group-hover:bg-orange-500/80">
                    <Play className="ml-0.5 h-6 w-6 fill-white text-white" aria-hidden="true" />
                  </span>
                </span>
              </div>
              {/* Fake transport control bar — Field Recorder skin */}
              <div
                data-testid="hero-controlbar"
                className="mt-2 flex flex-nowrap items-center gap-1.5 rounded-lg bg-[#0c0c0e] px-2 py-2 sm:gap-2 sm:px-2.5"
              >
                <span aria-hidden="true" className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#1b1b1f] text-zinc-300">
                  <RotateCcw className="h-3.5 w-3.5" />
                </span>
                <span aria-hidden="true" className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-orange-500 text-black">
                  <Play className="ml-0.5 h-3.5 w-3.5 fill-black" />
                </span>
                <span aria-hidden="true" className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-orange-500 text-black">
                  <RotateCw className="h-3.5 w-3.5" />
                </span>
                <span aria-hidden="true" className="hidden text-zinc-500 sm:inline">+</span>
                <div aria-hidden="true" className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-semibold uppercase tracking-widest text-zinc-500">Timecode</span>
                  <span className="font-mono text-xs font-semibold text-zinc-100">00:00:00</span>
                </div>
                <div aria-hidden="true" className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-semibold uppercase tracking-widest text-zinc-500">Duration</span>
                  <span className="font-mono text-xs font-semibold text-zinc-100">00:00:09</span>
                </div>
                <div aria-hidden="true" className="ml-auto flex items-end gap-[2px]">
                  {[
                    { h: 4, c: "bg-green-400" },
                    { h: 6, c: "bg-green-400" },
                    { h: 8, c: "bg-lime-400" },
                    { h: 10, c: "bg-yellow-400" },
                    { h: 11, c: "bg-orange-400" },
                    { h: 9, c: "bg-orange-500" },
                    { h: 7, c: "bg-red-500" },
                  ].map(({ h, c }, i) => (
                    <span key={i} className={`w-[3px] rounded-sm ${c}`} style={{ height: `${h}px` }} />
                  ))}
                  <span className="ml-1 font-mono text-[10px] font-semibold text-zinc-400">+2</span>
                </div>
                <span aria-hidden="true" className="hidden h-7 items-center justify-center rounded-md bg-[#1b1b1f] px-1.5 font-mono text-[10px] font-bold text-zinc-300 sm:inline-flex">CC</span>
                <span aria-hidden="true" className="hidden h-7 w-7 items-center justify-center rounded-md bg-[#1b1b1f] text-zinc-300 sm:inline-flex">
                  <Settings className="h-3.5 w-3.5" />
                </span>
                <span aria-hidden="true" className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#1b1b1f] text-zinc-300">
                  <Maximize className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          </Reveal>
        </section>

        {/* ── FEATURES ── */}
        <section
          id="features"
          data-da-source="src/pages/Home.tsx:Features"
          aria-labelledby="features-heading"
          className="mt-16 scroll-mt-20 text-center"
        >
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-400">
              Key Features
            </p>
            <h2
              id="features-heading"
              className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Every detail earns its place
            </h2>
            <div aria-hidden="true" className="mx-auto mt-4 h-1 w-16 rounded-full bg-orange-500" />
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.08}>
                <div data-testid={`home-feature-${i}`} className="h-full">
                <SpotlightCard
                  className="h-full rounded-2xl border border-white/10 !bg-[#141417]/85 p-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur sm:p-6"
                >
                  <div className="flex items-center gap-4 sm:block">
                    <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)]">
                      <f.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="min-w-0 flex-1 font-display text-lg font-bold text-zinc-100 sm:mt-4">
                      {f.title}
                    </h3>
                    <ChevronRight
                      aria-hidden="true"
                      className="h-5 w-5 shrink-0 text-orange-400/80 sm:hidden"
                    />
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-400 sm:mt-2">
                    {f.body}
                  </p>
                </SpotlightCard>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── SEE IT IN ACTION ── */}
        <section
          id="in-action"
          data-da-source="src/pages/Home.tsx:InAction"
          aria-labelledby="in-action-heading"
          className="mt-16 text-center"
        >
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-400">
              In Action
            </p>
            <h2
              id="in-action-heading"
              className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl"
            >
              See it in action
            </h2>
            <div aria-hidden="true" className="mx-auto mt-4 h-1 w-16 rounded-full bg-orange-500" />
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DEMOS.map((v) => (
              <Link
                key={v.title}
                to="/showcase"
                data-testid={`home-demo-card-${v.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                aria-label={`Watch demo: ${v.title}`}
                className="group overflow-hidden rounded-xl border border-white/10 bg-[#131316] text-left shadow-[0_12px_32px_rgba(0,0,0,0.5)] transition hover:border-orange-500/40 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={v.img}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105 motion-reduce:transition-none"
                  />
                  <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                  <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/55 ring-1 ring-white/25 backdrop-blur transition group-hover:bg-orange-500/80">
                      <Play className="h-5 w-5 fill-white text-white" />
                    </span>
                  </span>
                  <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-white">
                    {v.duration}
                  </span>
                </div>
                <div className="px-4 py-3">
                  <p className="text-sm font-bold text-zinc-100">{v.title}</p>
                  <span className="mt-2 inline-block rounded-full border border-orange-500/40 bg-orange-500/10 px-2.5 py-0.5 text-xs font-semibold text-orange-400">
                    {v.tag}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── TECHNOLOGY STRIP ── */}
        <section
          data-da-source="src/pages/Home.tsx:TechStrip"
          aria-labelledby="tech-heading"
          className="mt-16 rounded-2xl border border-white/10 bg-[#101013]/80 px-6 py-10 backdrop-blur"
        >
          <h2
            id="tech-heading"
            className="text-center text-sm font-semibold text-zinc-300"
          >
            Built with modern, industry-proven tools
          </h2>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {TECH.map((t) => (
              <li
                key={t.name}
                className="flex items-center gap-2.5 text-sm font-semibold text-zinc-200"
              >
                {t.swatch}
                <span>{t.label ?? t.name}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer
        data-da-source="src/pages/Home.tsx:Footer"
        className="relative border-t border-white/5 bg-[#0c0c0e]"
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-10 text-sm text-zinc-500 sm:flex-row">
          <p className="flex items-center gap-2">
            <HomeIcon className="h-4 w-4 text-orange-400" aria-hidden="true" />
            Field Recorder — Cinema Edition · a{" "}
            <span className="text-zinc-300">Video.js v10 skin challenge</span>{" "}
            submission
          </p>
          <p>
            Video by{" "}
            <a
              href="https://www.mux.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-400 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
            >
              Mux
            </a>{" "}
            · Built with Video.js v10 ·{" "}
            <a
              href="https://dreamagent.ai"
              target="_blank"
              rel="noopener"
              className="text-orange-400 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
              data-testid="footer-dreamagent-link"
            >
              DreamAgent
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
