import { Suspense, lazy, useMemo, useState, type CSSProperties } from "react";
import { Check, TrainFront, Circle, Flag, Palette, Monitor, Tablet, Smartphone } from "lucide-react";
import "../line/line.css";
import {
  DEFAULT_THEME_ID,
  LINE_THEMES,
  LINE_THEME_STORAGE_KEY,
  type LineTheme,
} from "../line/themes";

/**
 * Line — Transit Video Player page.
 * Transit-map-inspired Video.js v10 skin: chapters are stations, the progress
 * route is a metro line, the playhead is a train. Player lives in its own
 * module (LinePlayer); chapters are configurable in src/line/chapters.ts.
 * Own Mux playback id (updated Chennai reel) — nothing here touches /player.
 */

const MUX_PLAYBACK_ID = "kv7rPGFouV99auvqEthx4H1OvTfB1n7VtMWRQslZv01Q";
const POSTER = `https://image.mux.com/${MUX_PLAYBACK_ID}/thumbnail.jpg?width=1280`;

const LinePlayer = lazy(() => import("../line/LinePlayer"));

/* route color at each preview stage (matches the token palette) */
const STAGE_ROUTE: Record<string, { done: number; total: number; fill: string }> = {
  desktop: { done: 62, total: 100, fill: "var(--ln-green)" },
  tablet: { done: 45, total: 100, fill: "var(--ln-green)" },
  mobile: { done: 30, total: 100, fill: "var(--ln-green)" },
};

function MiniRoute({ stage, width }: { stage: keyof typeof STAGE_ROUTE; width: string }) {
  const cfg = STAGE_ROUTE[stage];
  const dots = [8, 34, 62, 88];
  return (
    <div className="ln-mini-route" style={{ width }} aria-hidden="true">
      <span
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: `${cfg.done}%`,
          background: cfg.fill,
          borderRadius: 999,
        }}
      />
      {dots.map((d) => (
        <span
          key={d}
          className="ln-mini-dot"
          style={{
            left: `${d}%`,
            width: 10,
            height: 10,
            background: d <= cfg.done ? cfg.fill : "#fff",
            border: `2px solid ${d <= cfg.done ? cfg.fill : "var(--ln-blue)"}`,
          }}
        />
      ))}
      <span
        className="ln-mini-dot"
        style={{
          left: `${cfg.done}%`,
          width: 16,
          height: 16,
          background: "var(--ln-yellow)",
          border: "2px solid var(--ln-navy)",
        }}
      />
    </div>
  );
}

/* theme state: persisted in localStorage, applied as CSS vars on the player card */
function useLineTheme() {
  const [themeId, setThemeId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(LINE_THEME_STORAGE_KEY);
      return saved && LINE_THEMES.some((t) => t.id === saved) ? saved : DEFAULT_THEME_ID;
    } catch {
      return DEFAULT_THEME_ID;
    }
  });
  const theme = useMemo(() => LINE_THEMES.find((t) => t.id === themeId) ?? LINE_THEMES[0], [themeId]);
  const selectTheme = (id: string) => {
    setThemeId(id);
    try {
      localStorage.setItem(LINE_THEME_STORAGE_KEY, id);
    } catch {
      /* storage unavailable — theme still applies for this visit */
    }
  };
  return { theme, selectTheme };
}

/* preview-card picker: header + six route/train preview cards in one row */
function ThemeSelector({ active, onSelect }: { active: LineTheme; onSelect: (id: string) => void }) {
  return (
    <div className="ln-themes" role="group" aria-label="Player color theme" data-testid="line-theme-selector">
      <div className="ln-themes-head">
        <Palette size={16} aria-hidden="true" />
        <h2 className="ln-themes-title">Theme</h2>
        <p className="ln-themes-sub">Choose a transit style for the player</p>
      </div>
      <div className="ln-themes-row" role="listbox" aria-label="Theme options">
        {LINE_THEMES.map((t) => {
          const isActive = t.id === active.id;
          const bg = t.vars["--ln-card-bg"] ?? "#FFFFFF";
          const lum = (hex: string) => {
            const m = hex.replace("#", "");
            const v = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
            const [r, g, b] = [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16) / 255);
            const f = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
            return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
          };
          const bgLum = lum(bg);
          const nameColor = (() => {
            const white = (1.05) / (bgLum + 0.05);
            const dark = (bgLum + 0.05) / 0.0586; // vs #0B172F ≈ lum 0.0086
            return white >= dark ? "#FFFFFF" : (t.vars["--ln-navy"] ?? "#0B172F");
          })();
          return (
            <button
              key={t.id}
              type="button"
              role="option"
              aria-selected={isActive}
              className={`ln-theme-card${isActive ? " ln-theme-active" : ""}`}
              data-testid={`line-theme-${t.id}`}
              title={t.note}
              style={{
                background: t.vars["--ln-card-bg"],
                color: t.vars["--ln-ink"],
                borderColor: isActive ? t.vars["--ln-focus"] : t.vars["--ln-border"],
                boxShadow: isActive ? `0 0 0 1px ${t.vars["--ln-focus"]}, 0 0 12px ${t.vars["--ln-focus"]}47` : undefined,
                ["--tc-route" as string]: t.vars["--ln-blue"],
                ["--tc-train" as string]: t.vars["--ln-yellow"],
                ["--tc-train-ink" as string]: t.vars["--ln-train-ink"],
                ["--tc-station" as string]: t.vars["--ln-station-bg"],
                ["--tc-accent" as string]: t.vars["--ln-focus"],
                ["--tc-name" as string]: isActive ? nameColor : t.vars["--ln-ink"],
              }}
              onClick={() => onSelect(t.id)}
            >
              <span className="ln-theme-check" aria-hidden="true">
                <Check size={11} strokeWidth={3.5} />
              </span>
              <span className="ln-theme-scene" aria-hidden="true">
                <span className="ln-tp-route" />
                <span className="ln-tp-node" />
                <span className="ln-tp-train" />
              </span>
              <span className="ln-theme-name">{t.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

type View = "desktop" | "tablet" | "phone";
const VIEWS: { id: View; label: string; Icon: typeof Monitor; w: number }[] = [
  { id: "desktop", label: "Desktop", Icon: Monitor, w: 0 },
  { id: "tablet", label: "Tablet", Icon: Tablet, w: 768 },
  { id: "phone", label: "Phone", Icon: Smartphone, w: 375 },
];

/* floating device switcher: Tablet and Phone load this same page in a real
   iframe of that width, so the genuine responsive CSS (not a scaled copy) is shown */
function ViewSwitcher({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  return (
    <div className="ln-viewbar" role="group" aria-label="Preview size" data-testid="line-view-switcher">
      {VIEWS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          className={`ln-viewbtn${view === id ? " ln-viewbtn-on" : ""}`}
          aria-pressed={view === id}
          data-testid={`line-view-${id}`}
          onClick={() => onChange(id)}
        >
          <Icon size={16} aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

export default function Line() {
  const { theme, selectTheme } = useLineTheme();
  const embed = useMemo(() => new URLSearchParams(window.location.search).get("embed") === "1", []);
  const [view, setView] = useState<View>("desktop");
  const framed = !embed && view !== "desktop";
  const dev = VIEWS.find((v) => v.id === view)!;
  return (
    <div className="ln-page" data-testid="line-page" data-embed={embed ? "true" : undefined}>
      <div className="ln-shell">
        <h1 className="sr-only">Line — A Transit Map Video Player</h1>

        {framed ? (
          <div className={`ln-device ln-device-${view}`} data-testid={`line-device-${view}`}>
            <iframe
              className="ln-device-frame"
              title={`Line player at ${dev.label.toLowerCase()} width (${dev.w}px)`}
              src="/line?embed=1"
            />
          </div>
        ) : (
        /* one app-style column: player sheet, then a compact line-colour picker and key help */
        <section
          className="ln-player-card"
          style={theme.vars as unknown as CSSProperties}
          data-testid="line-player-section"
          aria-label="Line player"
        >
          <Suspense
            fallback={
              <div
                className="ln-video-frame"
                style={{ display: "grid", placeItems: "center", color: "#fff", fontSize: 13 }}
              >
                Loading player…
              </div>
            }
          >
            <LinePlayer
              playbackId={MUX_PLAYBACK_ID}
              poster={POSTER}
              title="Chennai in Motion — a city documentary"
            />
          </Suspense>

          <ThemeSelector active={theme} onSelect={selectTheme} />

          <details className="ln-kbd" data-testid="line-interactions-card">
            <summary>Keyboard &amp; touch</summary>
            <ul className="ln-interactions">
              <li><kbd>Space</kbd> Play / pause</li>
              <li><kbd>← →</kbd> Seek ±5s on the route</li>
              <li><kbd>PgUp</kbd> <kbd>PgDn</kbd> Next / previous station</li>
              <li><kbd>Home</kbd> <kbd>End</kbd> Start / end of the line</li>
              <li><kbd>F</kbd> Fullscreen · <kbd>M</kbd> Mute · <kbd>C</kbd> Captions</li>
              <li>Tap a station to jump to that chapter</li>
              <li>Drag the route (or the train) to scrub</li>
            </ul>
          </details>
        </section>
        )}
      </div>
      {embed ? null : <ViewSwitcher view={view} onChange={setView} />}
    </div>
  );
}
