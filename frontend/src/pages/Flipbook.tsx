import FlipbookPlayer from "../flipbook/FlipbookPlayer";

/**
 * Flipbook Player page — cream paper, red ink, tactile book controls.
 * Layout per reference: left editorial column (skin tab, serif title,
 * red underline, copy, three mini-features) + dominant book player;
 * horizontal keyboard shortcuts strip; four illustration feature cards.
 * Same Mux playback id as the untouched Field Recorder player (/player).
 */
const MUX_PLAYBACK_ID = "MeWNxCn01tfsK9eF301NGaZ9Lkpr02TfHQa6r7Vu02OMs01k";
const POSTER = `https://image.mux.com/${MUX_PLAYBACK_ID}/thumbnail.jpg?width=1280`;
const TITLE = "MUX DEMO REEL — FLIPBOOK";

const MINI_FEATURES = [
  {
    title: "Page-Stack Timeline",
    copy: "Flip through pages to move in time.",
    icon: (
      <svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true">
        <g stroke="#b83227" strokeWidth="3.2" strokeLinejoin="round" strokeLinecap="round" fill="none">
          <path d="M8 18 24 10l16 8-16 8Z" fill="#fdecd9" />
          <path d="M8 25l16 8 16-8" />
          <path d="M8 31l16 8 16-8" />
        </g>
      </svg>
    ),
  },
  {
    title: "Book-Inspired Controls",
    copy: "Tactile, clear, and easy to use.",
    icon: (
      <svg viewBox="0 0 24 40" width="26" height="40" aria-hidden="true">
        <path d="M3 2h18v36l-9-7-9 7Z" fill="none" stroke="#b83227" strokeWidth="3" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Accessible by Design",
    copy: "Keyboard friendly and screen reader ready.",
    icon: (
      <svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true">
        <circle cx="24" cy="24" r="20" fill="none" stroke="#b83227" strokeWidth="3" />
        <circle cx="24" cy="15" r="3.4" fill="#b83227" />
        <path d="M14 21c6.5 2 13.5 2 20 0M24 24v8M24 32l-6 7M24 32l6 7" fill="none" stroke="#b83227" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
  },
];

const SHORTCUTS = [
  { keys: ["Space"], action: "Play / Pause" },
  { keys: ["← →"], action: "Seek ±5s" },
  { keys: ["↑ ↓"], action: "Volume" },
  { keys: ["C"], action: "Captions" },
  { keys: ["F"], action: "Fullscreen" },
];

/* four illustration feature cards (picture area + caption), per reference */
function CardStack() {
  return (
    <svg viewBox="0 0 220 90" width="100%" height="100%" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <g stroke="#29231f" strokeWidth="1.6" strokeLinejoin="round">
        {Array.from({ length: 9 }).map((_, i) => (
          <path key={i} d={`M${14 + i * 11} 62 L${22 + i * 11} 30 L${34 + i * 11} 30 L${26 + i * 11} 62 Z`} fill={i < 5 ? "#b83227" : "#fdecd9"} />
        ))}
        <path d="M108 30c8-12 22-12 26-2l-10 20-20 4Z" fill="#f6e2c8" />
      </g>
    </svg>
  );
}
function CardBookmark() {
  return (
    <svg viewBox="0 0 220 90" width="100%" height="100%" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <g stroke="#29231f" strokeWidth="1.6">
        {Array.from({ length: 7 }).map((_, i) => (
          <rect key={i} x="16" y={18 + i * 8} width="188" height="6" rx="3" fill="#fdecd9" />
        ))}
        <path d="M100 8h20v56l-10-8-10 8Z" fill="#b83227" />
      </g>
    </svg>
  );
}
function CardPlay() {
  return (
    <svg viewBox="0 0 220 90" width="100%" height="100%" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <rect x="80" y="18" width="60" height="54" rx="12" fill="#b83227" stroke="#29231f" strokeWidth="2.4" />
      <path d="M104 32l22 13-22 13Z" fill="#fdecd9" stroke="#29231f" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
function CardBook() {
  return (
    <svg viewBox="0 0 220 90" width="100%" height="100%" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <g stroke="#29231f" strokeWidth="1.6">
        {Array.from({ length: 6 }).map((_, i) => (
          <rect key={i} x={24 - i * 4} y={14 + i * 4} width={150 - i * 6} height={54 - i * 2} rx="8" fill="#fdecd9" />
        ))}
        <rect x="2" y="16" width="14" height="60" rx="4" fill="#b83227" />
      </g>
    </svg>
  );
}

const CARDS = [
  { label: "Page Flip Timeline", art: <CardStack /> },
  { label: "Bookmark Playhead", art: <CardBookmark /> },
  { label: "Tactile Controls", art: <CardPlay /> },
  { label: "Book-like Design", art: <CardBook /> },
];

export default function Flipbook() {
  return (
    <div className="fb-page" data-testid="flipbook-page" data-da-source="src/pages/Flipbook.tsx:Flipbook">
      <h1 className="sr-only">Flipbook Player</h1>

      <div className="fb-shell">
        <div className="fb-columns">
          {/* ── left editorial panel ── */}
          <div className="fb-info" data-testid="flipbook-info">
            <span className="fb-skin-tab">Video.js v10 Skin</span>
            <div className="fb-info-title">
              Flipbook
              <br />
              Player
            </div>
            <div className="fb-brush" aria-hidden="true" />
            <p className="fb-info-copy">
              A tactile video player that turns time into pages. Scrub, seek,
              and explore your video like a flipbook.
            </p>
            <ul className="fb-minis" aria-label="Highlights">
              {MINI_FEATURES.map((f) => (
                <li key={f.title} className="fb-mini" data-testid={`flipbook-mini-${f.title.toLowerCase().replace(/[^a-z]+/g, "-")}`}>
                  <span className="fb-mini-icon" aria-hidden="true">{f.icon}</span>
                  <span>
                    <strong>{f.title}</strong>
                    <em>{f.copy}</em>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── the book player ── */}
          <div className="fb-player-col">
            <FlipbookPlayer playbackId={MUX_PLAYBACK_ID} poster={POSTER} title={TITLE} />
          </div>
        </div>

        {/* ── keyboard shortcuts — single horizontal strip ── */}
        <section
          className="fb-shortcuts"
          id="flipbook-shortcuts"
          data-testid="flipbook-shortcuts"
          aria-label="Keyboard shortcuts"
        >
          <h2>Keyboard Shortcuts</h2>
          <div className="fb-keys">
            {SHORTCUTS.map((s) => (
              <div key={s.action} className="fb-key-row">
                <kbd>{s.keys.join(" ")}</kbd>
                <span>{s.action}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── four illustration feature cards ── */}
        <section className="fb-features" aria-label="Highlights" data-testid="flipbook-features">
          {CARDS.map((c) => (
            <article key={c.label} className="fb-feature">
              <div className="fb-feature-art" aria-hidden="true">{c.art}</div>
              <h2>{c.label}</h2>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
