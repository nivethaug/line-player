import FieldRecorderPlayer from "../field-recorder/FieldRecorderPlayer";
import { CheckCircle2, Play } from "lucide-react";

/**
 * Showcase — Field Recorder / Cinema Edition showcase.
 * Top: player + info card (same two-column layout as the Player page).
 * Bottom: row of 4 video thumbnail cards.
 * Cinematic graphite/orange theme.
 */
// Mux public playback (unsigned) — same demo reel as the Player page
const MUX_PLAYBACK_ID = "MeWNxCn01tfsK9eF301NGaZ9Lkpr02TfHQa6r7Vu02OMs01k";
const POSTER = `https://image.mux.com/${MUX_PLAYBACK_ID}/thumbnail.jpg?width=1280`;
const TITLE = "MUX DEMO REEL — FIELD RECORDER";

const FEATURES = [
  {
    title: "Mux Streaming",
    desc: "HLS, adaptive bitrate playback",
  },
  {
    title: "Video.js v10 Controls",
    desc: "Timeline, timecode, volume meter",
  },
  {
    title: "Cinema Skin",
    desc: "Field Recorder graphite/orange theme",
  },
  {
    title: "Responsive & Accessible",
    desc: "Works across desktop, tablet, and mobile (NVDA ready)",
  },
];

const VIDEOS = [
  {
    title: "Demo Reel",
    tag: "Demo",
    duration: "00:30",
    img: "https://picsum.photos/seed/showcase-reel/640/360",
  },
  {
    title: "Cinematic Controls",
    tag: "Skins",
    duration: "00:24",
    img: "https://picsum.photos/seed/showcase-skins/640/360",
  },
  {
    title: "Mux Streaming (HLS)",
    tag: "Streaming",
    duration: "00:42",
    img: "https://picsum.photos/seed/showcase-stream/640/360",
  },
  {
    title: "Nature Showcase",
    tag: "Reels",
    duration: "00:05",
    img: "https://picsum.photos/seed/showcase-nature/640/360",
  },
];

export default function Showcase() {
  return (
    <div
      data-testid="showcase-page"
      data-da-source="src/pages/Showcase.tsx:Showcase"
      className="relative min-h-full overflow-hidden bg-[#0d0c0f]"
    >
      {/* Cinematic studio background — orange key light upper-right */}
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

      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 md:px-8">
        <h1 className="sr-only">Showcase</h1>

        {/* Top: player + info card (same layout as Player page) */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div
            data-testid="showcase-player-frame"
            className="md:col-span-2 rounded-2xl border border-white/10 bg-[#131316] p-2 shadow-[0_0_60px_rgba(249,115,22,0.08),0_24px_60px_rgba(0,0,0,0.6)] ring-1 ring-inset ring-white/5 sm:p-3"
          >
            <FieldRecorderPlayer
              playbackId={MUX_PLAYBACK_ID}
              poster={POSTER}
              title={TITLE}
            />
          </div>

          <div
            data-testid="showcase-info-card"
            className="rounded-xl border border-white/10 bg-[#141417]/85 px-5 py-5 backdrop-blur"
          >
            <h2 className="text-xl font-bold text-zinc-100">Field Recorder</h2>
            <p className="text-sm font-semibold text-orange-400">Cinema Edition</p>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              A premium, cinema-inspired skin for Video.js v10 with professional
              controls, timecode, and Mux streaming playback.
            </p>
            <ul className="mt-4 space-y-3">
              {FEATURES.map((f) => (
                <li key={f.title} className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-orange-500/30 bg-orange-500/10 text-orange-400"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 7l6 5-6 5V7z" />
                      <rect x="13" y="6" width="8" height="12" rx="1.5" />
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-100">{f.title}</p>
                    <p className="text-xs text-zinc-400">{f.desc}</p>
                  </div>
                  <CheckCircle2
                    aria-hidden="true"
                    className="ml-auto mt-1 h-4 w-4 shrink-0 text-orange-400"
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom: video thumbnails row */}
        <div
          data-testid="showcase-videos-section"
          className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {VIDEOS.map((v) => (
            <button
              key={v.title}
              type="button"
              data-testid={`showcase-video-card-${v.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
              aria-label={`Play video: ${v.title}`}
              className="group overflow-hidden rounded-xl border border-white/10 bg-[#131316] text-left shadow-[0_12px_32px_rgba(0,0,0,0.5)] transition hover:border-orange-500/40 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={v.img}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 flex items-center justify-center"
                >
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
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
