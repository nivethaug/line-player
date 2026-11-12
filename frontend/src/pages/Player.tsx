import FieldRecorderPlayer from "../field-recorder/FieldRecorderPlayer";
import { CheckCircle2 } from "lucide-react";

/**
 * Player — Field Recorder / Cinema Edition.
 * Two-column layout: player on the left, shortcuts + info cards stacked on the right.
 * Playback logic untouched.
 */
// Mux public playback (unsigned)
const MUX_PLAYBACK_ID = "MeWNxCn01tfsK9eF301NGaZ9Lkpr02TfHQa6r7Vu02OMs01k";
const POSTER = `https://image.mux.com/${MUX_PLAYBACK_ID}/thumbnail.jpg?width=1280`;
const TITLE = "MUX DEMO REEL — FIELD RECORDER";

const SHORTCUTS = [
  { keys: ["Space"], action: "Play / Pause" },
  { keys: ["← →"], action: "Seek ±5s" },
  { keys: ["↑ ↓"], action: "Volume" },
  { keys: ["F"], action: "Fullscreen" },
  { keys: ["C"], action: "Captions" },
];

const FEATURES = [
  {
    title: "Mux Streaming",
    desc: "Powered by Mux (HLS, adaptive bitrate)",
  },
  {
    title: "Video.js v10 Controls",
    desc: "Timeline, timecode, volume meter",
  },
  {
    title: "Accessible",
    desc: "Full keyboard control, visible focus, reduced motion",
  },
  {
    title: "Responsive",
    desc: "Works across desktop, tablet, and mobile",
  },
];

export default function Player() {
  return (
    <div
      data-testid="player-page"
      data-da-source="src/pages/Player.tsx:Player"
      className="relative min-h-full overflow-hidden bg-[#0d0c0f]"
    >
      {/* Cinematic studio background — orange key light upper-right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/uploads/image_2194_cinematic-film-set-with-clapperboard_622d7f95.webp')",
          }}
        />
        {/* Darken + orange grade so player/controls stay readable */}
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
        {/* Screen-reader-only page heading */}
        <h1 className="sr-only">The Player</h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Left column — the player (~2/3 width) */}
          <div
            data-testid="player-frame"
            className="md:col-span-2 rounded-2xl border border-white/10 bg-[#131316] p-2 shadow-[0_0_60px_rgba(249,115,22,0.08),0_24px_60px_rgba(0,0,0,0.6)] ring-1 ring-inset ring-white/5 sm:p-3"
          >
            <FieldRecorderPlayer playbackId={MUX_PLAYBACK_ID} poster={POSTER} title={TITLE} />
          </div>

          {/* Right column — shortcuts + info cards */}
          <div className="flex flex-col gap-6">
            {/* Keyboard shortcuts card */}
            <div
              data-testid="player-shortcuts-card"
              aria-label="Keyboard shortcuts"
              className="rounded-xl border border-white/10 bg-[#141417]/85 px-5 py-4 backdrop-blur"
            >
              <div className="mb-4 flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-orange-500/15 text-orange-400"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="2" y="6" width="20" height="12" rx="2" />
                    <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8" />
                  </svg>
                </span>
                <h2 className="text-base font-bold text-zinc-100">Keyboard Shortcuts</h2>
              </div>
              <div className="grid grid-cols-2 gap-x-5 gap-y-3">
                {SHORTCUTS.map((s) => (
                  <div key={s.action} className="flex items-center gap-2 text-sm">
                    <kbd className="inline-flex min-w-[2rem] items-center justify-center rounded-md border border-white/15 border-b-white/25 bg-[#1c1c20] px-2 py-1 font-mono text-xs font-semibold text-zinc-200 shadow-[0_2px_0_rgba(0,0,0,0.5)]">
                      {s.keys.join(" ")}
                    </kbd>
                    <span className="text-zinc-400">{s.action}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Field Recorder / Cinema Edition info card */}
            <div
              data-testid="player-info-card"
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
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        </div>
      </div>
    </div>
  );
}
