import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { VideoPlayer, VideoSkin, usePlayer } from "@videojs/react/video";
import { MuxVideo } from "@videojs/react/media/mux-video";
import { MuxData } from "@videojs/react/extensions/mux-data";
import {
  selectTime,
  selectPlayback,
  selectVolume,
  selectFullscreen,
  selectTextTrack,
  selectPlaybackRate,
} from "@videojs/core/dom";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Captions,
  Settings,
  Check,
  TrainFront,
  Flag,
  List,
  X,
} from "lucide-react";
import { CHAPTERS, REFERENCE_DURATION, scaleChapterTime } from "./chapters";

/* ── helpers ─────────────────────────────────────────────────────────── */

const fmt = (s: number) => {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
};

/* station times are scaled to the real duration (e.g. 1.987s for a 2s chapter);
   show them rounded, not floored, so a 2s chapter reads 0:02 not 0:01 */
const fmtStation = (s: number) => fmt(Math.round(s));

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

/** Resolve terminus (time: -1) against the real duration. */
const stationTime = (t: number, duration: number) => (t < 0 ? duration : t);

/* ── tiny inline SVGs ────────────────────────────────────────────────── */

/* side-view metro train playhead — the user-provided realistic train illustration,
   inlined so the livery follows the active theme via CSS variables.
   Static geometry, position-only updates. */
const MetroTrain = () => (
  <svg className="ln-train-svg" viewBox="0 0 900 150" aria-hidden="true">
    <defs>
      <linearGradient id="ln-train-band" x2="0" y2="1">
        <stop stopColor="var(--ln-blue)" />
        <stop offset="1" stopColor="color-mix(in srgb, var(--ln-blue) 60%, #0a1526)" />
      </linearGradient>
      <linearGradient id="ln-train-glass" x2="0" y2="1">
        <stop stopColor="#263e53" /><stop offset="1" stopColor="#0c1927" />
      </linearGradient>
    </defs>
    <ellipse cx="450" cy="139" rx="420" ry="6" fill="#000" opacity=".13" />
    <g stroke="#35414b" strokeWidth="1.4" strokeLinejoin="round">
      {/* coaches */}
      <path fill="var(--ln-train-body)" d="M20 35Q24 17 44 17H270Q290 17 294 35V112H20Z" />
      <path fill="var(--ln-train-body)" d="M294 35Q298 17 318 17H540Q560 17 564 35V112H294Z" />
      <path fill="var(--ln-train-body)" d="M564 35Q568 17 588 17H765Q786 17 790 38V112H564Z" />
      <path fill="url(#ln-train-band)" stroke="none" d="M20 91H294V112H20ZM294 91H564V112H294ZM564 91H790V112H564Z" />
      <path fill="var(--ln-yellow)" stroke="none" d="M20 87H294V92H20ZM294 87H564V92H294ZM564 87H790V92H564Z" />
      {/* windows */}
      <g fill="url(#ln-train-glass)" stroke="#78838c">
        <rect x="40" y="38" width="37" height="34" rx="4"/><rect x="84" y="38" width="37" height="34" rx="4"/><rect x="128" y="38" width="37" height="34" rx="4"/><rect x="172" y="38" width="37" height="34" rx="4"/><rect x="216" y="38" width="37" height="34" rx="4"/><rect x="320" y="38" width="37" height="34" rx="4"/><rect x="364" y="38" width="37" height="34" rx="4"/><rect x="408" y="38" width="37" height="34" rx="4"/><rect x="452" y="38" width="37" height="34" rx="4"/><rect x="496" y="38" width="37" height="34" rx="4"/><rect x="590" y="38" width="37" height="34" rx="4"/><rect x="634" y="38" width="37" height="34" rx="4"/><rect x="678" y="38" width="37" height="34" rx="4"/><rect x="722" y="38" width="37" height="34" rx="4"/>
      </g>
      {/* doors */}
      <g fill="color-mix(in srgb, var(--ln-train-body) 85%, #9aa3aa)" stroke="#78838c">
        <rect x="264" y="32" width="22" height="57"/><path d="M275 32v57" fill="none"/><rect x="534" y="32" width="22" height="57"/><path d="M545 32v57" fill="none"/><rect x="754" y="32" width="22" height="57"/><path d="M765 32v57" fill="none"/>
      </g>
      <path d="M290 20v92M560 20v92" stroke="#5a626b" strokeWidth="5" />
      {/* front cab */}
      <path fill="var(--ln-train-body)" d="M765 17H800Q829 18 850 42L875 73Q883 84 883 99V112H790V38Q786 20 765 17Z" />
      <path fill="url(#ln-train-glass)" d="M790 31Q813 25 832 42L859 73Q868 84 870 96H790Z" />
      <path fill="#a9cde2" opacity=".2" stroke="none" d="M798 35L818 39L846 70L817 65Z" />
      <path fill="url(#ln-train-band)" stroke="none" d="M790 91H883V112H790Z" />
      <path fill="var(--ln-yellow)" stroke="none" d="M790 87H883V92H790Z" />
      <ellipse cx="862" cy="98" rx="6" ry="4" fill="#fff3bf" /><ellipse cx="862" cy="108" rx="5" ry="3" fill="#fff3bf" />
      {/* undercarriage and wheels */}
      <path fill="#252c32" stroke="none" d="M30 112H870V128H30Z" />
      <g fill="#202830" stroke="#8a969f" strokeWidth="2">
        {[[66],[105],[235],[274],[336],[375],[505],[544],[606],[645],[775],[814]].map(([cx]) => (
          <g key={cx}>
            <circle cx={cx} cy="128" r="9" /><circle cx={cx} cy="128" r="3.5" fill="#b7c0c6" stroke="none" />
          </g>
        ))}
      </g>
    </g>
    <path d="M12 143H890" stroke="#626b73" strokeWidth="4" /><path d="M12 147H890" stroke="#a8afb4" strokeWidth="1.5" />
    <path d="M30 139v10" stroke="#7b858c" strokeWidth="2" /><path d="M68 139v10" stroke="#7b858c" strokeWidth="2" /><path d="M106 139v10" stroke="#7b858c" strokeWidth="2" /><path d="M144 139v10" stroke="#7b858c" strokeWidth="2" /><path d="M182 139v10" stroke="#7b858c" strokeWidth="2" /><path d="M220 139v10" stroke="#7b858c" strokeWidth="2" /><path d="M258 139v10" stroke="#7b858c" strokeWidth="2" /><path d="M296 139v10" stroke="#7b858c" strokeWidth="2" /><path d="M334 139v10" stroke="#7b858c" strokeWidth="2" /><path d="M372 139v10" stroke="#7b858c" strokeWidth="2" /><path d="M410 139v10" stroke="#7b858c" strokeWidth="2" /><path d="M448 139v10" stroke="#7b858c" strokeWidth="2" /><path d="M486 139v10" stroke="#7b858c" strokeWidth="2" /><path d="M524 139v10" stroke="#7b858c" strokeWidth="2" /><path d="M562 139v10" stroke="#7b858c" strokeWidth="2" /><path d="M600 139v10" stroke="#7b858c" strokeWidth="2" /><path d="M638 139v10" stroke="#7b858c" strokeWidth="2" /><path d="M676 139v10" stroke="#7b858c" strokeWidth="2" /><path d="M714 139v10" stroke="#7b858c" strokeWidth="2" /><path d="M752 139v10" stroke="#7b858c" strokeWidth="2" /><path d="M790 139v10" stroke="#7b858c" strokeWidth="2" /><path d="M828 139v10" stroke="#7b858c" strokeWidth="2" /><path d="M866 139v10" stroke="#7b858c" strokeWidth="2" />
  </svg>
);

/* single-car metro playhead: one coach + front cab from the full train illustration.
   Livery follows the active theme via CSS variables. */
const MetroCar = () => (
  <svg className="ln-train-svg" viewBox="556 10 336 126" aria-hidden="true">
    <defs>
      <linearGradient id="ln-car-band" x2="0" y2="1">
        <stop stopColor="var(--ln-blue)" />
        <stop offset="1" stopColor="color-mix(in srgb, var(--ln-blue) 60%, #0a1526)" />
      </linearGradient>
      <linearGradient id="ln-car-glass" x2="0" y2="1">
        <stop stopColor="#263e53" /><stop offset="1" stopColor="#0c1927" />
      </linearGradient>
    </defs>
    <g stroke="#35414b" strokeWidth="2" strokeLinejoin="round">
      <path fill="var(--ln-train-body)" d="M564 35Q568 17 588 17H765Q786 17 790 38V112H564Z" />
      <path fill="var(--ln-train-body)" d="M765 17H800Q829 18 850 42L875 73Q883 84 883 99V112H790V38Q786 20 765 17Z" />
      <path fill="url(#ln-car-band)" stroke="none" d="M564 91H883V112H564Z" />
      <path fill="var(--ln-yellow)" stroke="none" d="M564 86H883V92H564Z" />
      <g fill="url(#ln-car-glass)" stroke="#78838c">
        <rect x="582" y="38" width="38" height="34" rx="4" /><rect x="628" y="38" width="38" height="34" rx="4" /><rect x="674" y="38" width="38" height="34" rx="4" />
        <path stroke="none" d="M790 31Q813 25 832 42L859 73Q868 84 870 96H790Z" />
      </g>
      <g fill="color-mix(in srgb, var(--ln-train-body) 85%, #9aa3aa)" stroke="#78838c">
        <rect className="ln-car-interior" x="729" y="33" width="24" height="55" fill="#ffe9a8" stroke="none" />
        <rect className="ln-car-door ln-car-door-l" x="728" y="32" width="13" height="57" />
        <rect className="ln-car-door ln-car-door-r" x="741" y="32" width="13" height="57" />
      </g>
      <ellipse cx="864" cy="98" rx="6" ry="4" fill="#fff3bf" stroke="none" />
      <path fill="#252c32" stroke="none" d="M572 112H872V128H572Z" />
      <g fill="#202830" stroke="#8a969f" strokeWidth="2">
        <circle cx="610" cy="128" r="9" /><circle cx="650" cy="128" r="9" /><circle cx="800" cy="128" r="9" /><circle cx="840" cy="128" r="9" />
      </g>
    </g>
  </svg>
);

/* map backdrop behind the route strip: a quiet street grid, city blocks,
   two arterial roads, parks and a shoreline — drawn in theme colours so
   the route reads like a line laid over a city map. Decorative only. */
const MapBackdrop = () => (
  <svg className="ln-map" viewBox="0 0 600 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <pattern id="ln-map-minor" width="14" height="14" patternUnits="userSpaceOnUse">
        <path d="M14 0H0V14" fill="none" stroke="var(--ln-map-street)" strokeWidth="0.6" />
      </pattern>
      <pattern id="ln-map-major" width="70" height="70" patternUnits="userSpaceOnUse">
        <path d="M70 0H0V70" fill="none" stroke="var(--ln-map-street)" strokeWidth="1.4" />
      </pattern>
      <clipPath id="ln-map-clip">
        <rect width="600" height="150" rx="14" />
      </clipPath>
    </defs>
    <g clipPath="url(#ln-map-clip)">
      <rect width="600" height="150" fill="var(--ln-map-land)" />
      {/* parks */}
      <ellipse cx="118" cy="38" rx="52" ry="22" fill="var(--ln-map-park)" />
      <ellipse cx="330" cy="128" rx="44" ry="18" fill="var(--ln-map-park)" />
      <ellipse cx="455" cy="30" rx="34" ry="15" fill="var(--ln-map-park)" />
      {/* city blocks */}
      <g fill="var(--ln-map-block)">
        <rect x="190" y="18" width="40" height="22" rx="2" />
        <rect x="236" y="18" width="30" height="22" rx="2" />
        <rect x="190" y="46" width="76" height="18" rx="2" />
        <rect x="372" y="54" width="34" height="26" rx="2" />
        <rect x="412" y="54" width="52" height="26" rx="2" />
        <rect x="372" y="86" width="92" height="20" rx="2" />
        <rect x="30" y="96" width="58" height="22" rx="2" />
        <rect x="94" y="96" width="36" height="22" rx="2" />
        <rect x="520" y="96" width="46" height="24" rx="2" />
      </g>
      <rect width="600" height="150" fill="url(#ln-map-minor)" />
      <rect width="600" height="150" fill="url(#ln-map-major)" />
      {/* water: shoreline along the lower right */}
      <path d="M420 150C455 118 520 104 600 96V150Z" fill="var(--ln-map-water)" />
      <path d="M420 150C455 118 520 104 600 96" fill="none" stroke="var(--ln-map-shore)" strokeWidth="1.2" />
      {/* arterial roads */}
      <g fill="none" strokeLinecap="round">
        <path d="M-10 118C120 100 240 112 350 70S520 10 610 22" stroke="var(--ln-map-road-edge)" strokeWidth="7" />
        <path d="M-10 118C120 100 240 112 350 70S520 10 610 22" stroke="var(--ln-map-road)" strokeWidth="4.5" />
        <path d="M150 -10C170 60 120 110 160 160" stroke="var(--ln-map-road-edge)" strokeWidth="5" />
        <path d="M150 -10C170 60 120 110 160 160" stroke="var(--ln-map-road)" strokeWidth="3" />
      </g>
      {/* park trees */}
      <g fill="var(--ln-map-tree)">
        <circle cx="96" cy="34" r="3.2" /><circle cx="108" cy="44" r="2.6" /><circle cx="126" cy="32" r="3" /><circle cx="140" cy="42" r="2.4" />
        <circle cx="318" cy="126" r="3" /><circle cx="334" cy="132" r="2.5" /><circle cx="348" cy="124" r="2.8" />
        <circle cx="446" cy="28" r="2.8" /><circle cx="462" cy="33" r="2.4" />
      </g>
      {/* lighthouse on the shore + a boat in the bay */}
      <g transform="translate(486 112)" stroke="var(--ln-map-ink)" strokeWidth="0.7">
        <path d="M-3.4 0-2.2-13H2.2L3.4 0Z" fill="var(--ln-card-bg)" />
        <path d="M-2.8-6.5H2.8L3.1-3.5H-3.1Z" fill="var(--ln-blue)" stroke="none" />
        <rect x="-2.6" y="-17" width="5.2" height="4" rx="1" fill="var(--ln-yellow)" />
        <path d="M-3-17 0-20 3-17Z" fill="var(--ln-map-ink)" stroke="none" />
      </g>
      <g transform="translate(574 122)" stroke="var(--ln-map-ink)" strokeWidth="0.7">
        <path d="M-7 0H7L4.5 3.5H-4.5Z" fill="var(--ln-card-bg)" />
        <path d="M0-9V0M0-9 5-2H0Z" fill="var(--ln-yellow)" />
      </g>
      {/* district labels */}
      <g fill="var(--ln-map-ink)" fontFamily="inherit" fontWeight="700" fontSize="5.5" letterSpacing="1.6" textAnchor="middle">
        <text x="118" y="24">CITY PARK</text>
        <text x="228" y="76">OLD TOWN</text>
        <text x="418" y="118">HARBOUR</text>
        <text x="528" y="144" fontStyle="italic" fill="var(--ln-map-shore)">THE BAY</text>
      </g>
      {/* compass + scale bar */}
      <g transform="translate(572 14)" fill="var(--ln-map-ink)">
        <circle r="9" fill="var(--ln-map-land)" stroke="var(--ln-map-ink)" strokeWidth="0.8" />
        <path d="M0-6.5 2.4 1.5 0 0-2.4 1.5Z" />
        <text y="20" fontSize="6.5" fontWeight="700" textAnchor="middle" fontFamily="inherit">N</text>
      </g>
      <g transform="translate(14 134)" stroke="var(--ln-map-ink)" strokeWidth="1" fill="var(--ln-map-ink)">
        <path d="M0-3v6M28-3v6M56-3v6M0 0h56" />
        <text x="62" y="2.5" fontSize="6" stroke="none" fontFamily="inherit">1 km</text>
      </g>
    </g>
  </svg>
);

const TrainMark = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    {/* geometric front-facing train */}
    <rect x="5" y="3" width="14" height="13" rx="3" fill="currentColor" />
    <rect x="8" y="6" width="8" height="4" rx="1" fill="var(--ln-yellow)" />
    <circle cx="9" cy="13.4" r="1.4" fill="var(--ln-yellow)" />
    <circle cx="15" cy="13.4" r="1.4" fill="var(--ln-yellow)" />
    <path d="M8 17.5 6.5 21M16 17.5 17.5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const TerminusFlag = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 3v18" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    <path d="M6 4h11l-2.5 3.5L17 11H6z" fill="currentColor" />
  </svg>
);

/* ── main export ─────────────────────────────────────────────────────── */

export default function LinePlayer({
  playbackId,
  poster,
  title,
}: {
  playbackId: string;
  poster?: string;
  title: string;
}) {
  return (
    <VideoPlayer title={title} poster={poster}>
      <LineUI playbackId={playbackId} title={title} />
    </VideoPlayer>
  );
}

/* ── UI (inside the player store) ────────────────────────────────────── */

function LineUI({ playbackId, title }: { playbackId: string; title: string }) {
  const tSel = usePlayer(selectTime);
  const pbSel = usePlayer(selectPlayback);
  const vSel = usePlayer(selectVolume);
  const fsSel = usePlayer(selectFullscreen);
  const trSel = usePlayer(selectTextTrack);
  const rateSel = usePlayer(selectPlaybackRate);

  const time = { currentTime: 0, duration: 0, seek: async (t: number) => t, ...(tSel ?? {}) };
  const playback = { paused: true, play: async () => {}, pause: () => {}, ...(pbSel ?? {}) };
  const volume = { volume: 1, muted: false, setVolume: () => 1, setMuted: () => false, ...(vSel ?? {}) };
  const fullscreen = { isFullscreen: false, requestFullscreen: async () => {}, exitFullscreen: async () => {}, ...(fsSel ?? {}) };
  const tracks = { textTrackList: [] as unknown[], subtitlesShowing: false, toggleSubtitles: () => false, ...(trSel ?? {}) };
  const hasCaptions = (tracks.textTrackList?.length ?? 0) > 0;
  const rate = { playbackRate: 1, playbackRates: [0.5, 1, 1.5, 2] as number[], setPlaybackRate: (_r: number) => {}, ...(rateSel ?? {}) };

  const duration = time.duration;
  const current = time.currentTime;
  const hasDuration = duration > 0;

  /* poster thumbnail shown on load until the first play */
  const [started, setStarted] = useState(false);
  useEffect(() => {
    if (!playback.paused) setStarted(true);
  }, [playback.paused]);

  /* station geometry: percent position along the route */
  const stations = useMemo(
    () =>
      CHAPTERS.map((c) => ({
        ...c,
        at: hasDuration
          ? scaleChapterTime(c.time, duration)
          : c.time < 0 ? 0 : c.time,
        pct: hasDuration
          ? (scaleChapterTime(c.time, duration) / duration) * 100
          : (c.time < 0 ? 1 : c.time / REFERENCE_DURATION) * 100,
      })),
    [duration, hasDuration],
  );

  /* current station index: last station whose time <= playhead */
  const currentIdx = useMemo(() => {
    if (!hasDuration) return 0;
    let idx = 0;
    for (let i = 0; i < stations.length; i++) {
      if (current >= stations[i].at - 0.25) idx = i;
    }
    return idx;
  }, [current, stations, hasDuration]);

  /* destination sign: next chapter after the playhead */
  const atEnd = hasDuration && duration - current <= 0.3;

  /* route completion % */
  const progressPct = hasDuration ? clamp((current / duration) * 100, 0, 100) : 0;

  /* ── interactions ── */
  const [liveMsg, setLiveMsg] = useState("");
  /* "Now arriving" sign: shown briefly whenever the playhead enters a new station */
  const [arrivedIdx, setArrivedIdx] = useState<number | null>(null);
  const arrivalPrevRef = useRef<number | null>(null);
  const [tooltip, setTooltip] = useState<{ pct: number; t: number; label: string } | null>(null);
  const [rateOpen, setRateOpen] = useState(false);
  const [chaptersOpen, setChaptersOpen] = useState(false);
  const rateBtnRef = useRef<HTMLButtonElement>(null);
  const rateMenuRef = useRef<HTMLDivElement>(null);
  const chaptersBtnRef = useRef<HTMLButtonElement>(null);
  const chaptersRef = useRef<HTMLDivElement>(null);
  const lastJumpRef = useRef(0);
  const prevIdxRef = useRef<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  /* Smooth, immediate playhead: the store's time only updates ~4x/second, which
     made the train start late and move in steps. Read the video clock every
     frame and paint the train + route fill directly; tick stations on arrival. */
  const frameRef = useRef<HTMLDivElement>(null);
  const trainRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const stationsRef = useRef(stations);
  stationsRef.current = stations;
  const [reached, setReached] = useState(0);
  useEffect(() => {
    let raf = 0;
    let lastReached = -1;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const v = frameRef.current?.querySelector("video");
      if (!v || !Number.isFinite(v.duration) || v.duration <= 0 || draggingRef.current) return;
      const t = v.currentTime;
      const pct = Math.min(100, Math.max(0, (t / v.duration) * 100));
      trainRef.current?.style.setProperty("--ln-pct", `${pct}%`);
      if (doneRef.current) doneRef.current.style.width = `${pct}%`;
      let n = 0;
      stationsRef.current.forEach((s, i) => {
        if (!s.terminus && t >= s.at + (i === 0 ? 0.5 : 0)) n = i + 1;
      });
      if (n !== lastReached) {
        lastReached = n;
        setReached(n);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  /* seek-preview thumbnails: cached per whole second so we never re-request
     the same Mux frame, and the state only updates on second/position change */
  const thumbCache = useRef(new Map<number, string>());
  const lastTipRef = useRef<{ pct: number; sec: number; fromDrag: boolean } | null>(null);

  /* Mux official thumbnail endpoint — same playback id the video plays */
  const thumbUrl = useMemo(() => {
    if (!tooltip || !hasDuration) return null;
    const sec = clamp(Math.floor(tooltip.t), 0, Math.max(0, Math.floor(duration) - 1));
    const cache = thumbCache.current;
    let url = cache.get(sec);
    if (!url) {
      url = `https://image.mux.com/${playbackId}/thumbnail.jpg?time=${sec}&width=320&height=180&fit_mode=smartcrop`;
      if (cache.size > 80) cache.clear();
      cache.set(sec, url);
    }
    return url;
  }, [tooltip, hasDuration, duration, playbackId]);

  const seekPct = useCallback(
    (pct: number) => {
      if (!hasDuration) return;
      void time.seek(clamp((pct / 100) * duration, 0, duration));
    },
    [time, duration, hasDuration],
  );

  const goToChapter = useCallback(
    (idx: number) => {
      const s = stations[idx];
      if (!s) return;
      void time.seek(s.at);
      lastJumpRef.current = Date.now();
      setLiveMsg(`Jumped to ${s.title}, ${fmtStation(s.at)}`);
    },
    [stations, time],
  );

  const pctFromEvent = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return 0;
      const r = el.getBoundingClientRect();
      return clamp(((clientX - r.left) / r.width) * 100, 0, 100);
    },
    [],
  );

  /* shared tooltip updater — throttled: re-renders only when the hovered
     position moves meaningfully or crosses into a new whole second */
  const updateTooltip = useCallback(
    (clientX: number, fromDrag: boolean) => {
      if (!hasDuration) return;
      const pct = pctFromEvent(clientX);
      const t = (pct / 100) * duration;
      const sec = Math.floor(t);
      const last = lastTipRef.current;
      if (last && last.fromDrag === fromDrag && last.sec === sec && Math.abs(last.pct - pct) < 0.6) return;
      lastTipRef.current = { pct, sec, fromDrag };
      const nearest = stations.length
        ? stations.reduce((a, b) => (Math.abs(b.at - t) < Math.abs(a.at - t) ? b : a), stations[0])
        : null;
      setTooltip({ pct, t, label: nearest ? nearest.title : title });
    },
    [hasDuration, pctFromEvent, duration, stations, title],
  );

  /* continuous drag seeking on the route track */
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!hasDuration) return;
      /* a press on a station is a click, not a scrub: don't capture the pointer
         (capture can swallow the station's click) */
      if ((e.target as HTMLElement).closest?.(".ln-station")) return;
      draggingRef.current = true;
      setIsDragging(true);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      seekPct(pctFromEvent(e.clientX));
      lastTipRef.current = null;
      updateTooltip(e.clientX, true);
    },
    [hasDuration, seekPct, pctFromEvent, updateTooltip],
  );
  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (draggingRef.current) {
        seekPct(pctFromEvent(e.clientX));
        updateTooltip(e.clientX, true);
      } else if (e.pointerType === "mouse" || e.pointerType === "pen") {
        /* hover preview (mouse/pen only — touch has no hover) */
        updateTooltip(e.clientX, false);
      }
    },
    [pctFromEvent, seekPct, updateTooltip],
  );
  const onPointerLeave = useCallback(
    (e: React.PointerEvent) => {
      if (draggingRef.current || e.pointerType === "touch") return;
      lastTipRef.current = null;
      setTooltip(null);
    },
    [],
  );
  const endDrag = useCallback(() => {
    draggingRef.current = false;
    setIsDragging(false);
    lastTipRef.current = null;
    setTooltip(null);
  }, []);

  /* keyboard on the route slider: arrows ±5s · Home/End · PageUp/PageDown = next/previous chapter */
  const onRouteKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (!hasDuration || e.ctrlKey || e.altKey || e.metaKey) return;
      const step = 5;
      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        e.preventDefault();
        void time.seek(clamp(current + step, 0, duration));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        e.preventDefault();
        void time.seek(clamp(current - step, 0, duration));
      } else if (e.key === "PageUp") {
        e.preventDefault();
        goToChapter(Math.min(stations.length - 1, currentIdx + 1));
      } else if (e.key === "PageDown") {
        e.preventDefault();
        goToChapter(Math.max(0, currentIdx - 1));
      } else if (e.key === "Home") {
        e.preventDefault();
        void time.seek(0);
      } else if (e.key === "End") {
        e.preventDefault();
        void time.seek(duration);
      }
    },
    [current, duration, hasDuration, time, goToChapter, stations.length, currentIdx],
  );

  /* global shortcuts: space play · f fullscreen · c captions · m mute.
     Polite by design: never touches browser chords (Ctrl/Alt/Meta), never
     fires outside the Line player (or the bare page), and never steals
     Space from a focused button, link or menu item. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey || e.defaultPrevented) return;
      const el = e.target as HTMLElement | null;
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
      const hasClosest = !!el && typeof el.closest === "function";
      const onBody = el === document.body || el === document.documentElement;
      const inPlayer = hasClosest && !!el!.closest(".ln-inner");
      if (!inPlayer && !onBody) return;
      const onActivatable = hasClosest && !!el!.closest('button, a[href], [role="menuitemradio"]');
      if (e.key === " ") {
        if (onActivatable) return;
        e.preventDefault();
        if (playback.paused) void playback.play();
        else playback.pause();
      } else if (e.key === "f" || e.key === "F") {
        if (fullscreen.isFullscreen) void fullscreen.exitFullscreen();
        else void fullscreen.requestFullscreen();
      } else if (e.key === "c" || e.key === "C") {
        if (hasCaptions) tracks.toggleSubtitles();
      } else if (e.key === "m" || e.key === "M") {
        volume.setMuted(!volume.muted);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [playback, fullscreen, tracks, volume, hasCaptions]);

  /* screen readers: announce natural chapter arrivals once (not on drags,
     pauses, or user jumps — those already speak via the slider / jump message) */
  useEffect(() => {
    if (!hasDuration) return;
    if (prevIdxRef.current === null) {
      prevIdxRef.current = currentIdx;
      return;
    }
    if (prevIdxRef.current === currentIdx) return;
    prevIdxRef.current = currentIdx;
    if (draggingRef.current || playback.paused) return;
    if (Date.now() - lastJumpRef.current < 1500) return;
    const st = stations[currentIdx];
    if (!st) return;
    const nxt = stations[currentIdx + 1];
    setLiveMsg(st.terminus ? "Reached the terminus." : `Now at ${st.title}.${nxt ? ` Next stop: ${nxt.title}.` : ""}`);
  }, [currentIdx, hasDuration, playback.paused, stations]);

  /* visual arrival sign: any change of station (playback or seek) flashes the sign for ~3s */
  useEffect(() => {
    if (!hasDuration) return;
    if (arrivalPrevRef.current === null) {
      arrivalPrevRef.current = currentIdx;
      return;
    }
    if (arrivalPrevRef.current === currentIdx) return;
    arrivalPrevRef.current = currentIdx;
    setArrivedIdx(currentIdx);
    const t = window.setTimeout(() => setArrivedIdx(null), 3000);
    return () => window.clearTimeout(t);
  }, [currentIdx, hasDuration]);

  /* speed menu: focus the active item on open; close on outside press */
  useEffect(() => {
    if (!rateOpen) return;
    const menu = rateMenuRef.current;
    const items = menu ? Array.from(menu.querySelectorAll<HTMLElement>('[role="menuitemradio"]')) : [];
    (items.find((n) => n.getAttribute("aria-checked") === "true") ?? items[0])?.focus();
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (menu?.contains(t) || rateBtnRef.current?.contains(t)) return;
      setRateOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [rateOpen]);

  const onRateMenuKey = (e: React.KeyboardEvent) => {
    const menu = rateMenuRef.current;
    if (!menu) return;
    const items = Array.from(menu.querySelectorAll<HTMLElement>('[role="menuitemradio"]'));
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      setRateOpen(false);
      rateBtnRef.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      items[(i + 1) % items.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      items[(i - 1 + items.length) % items.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[items.length - 1]?.focus();
    } else if (e.key === "Tab") {
      setRateOpen(false);
    }
  };

  /* chapters sheet: move focus in on open; Escape closes and returns focus */
  useEffect(() => {
    if (!chaptersOpen) return;
    const box = chaptersRef.current;
    (box?.querySelector<HTMLElement>('[data-chapter-item][aria-current="true"]') ?? box?.querySelector<HTMLElement>("[data-chapter-item]"))?.focus();
  }, [chaptersOpen]);

  const closeChapters = () => {
    setChaptersOpen(false);
    chaptersBtnRef.current?.focus();
  };


  const ariaValueText = hasDuration
    ? `${fmt(current)} of ${fmt(duration)}, chapter ${currentIdx + 1} of ${stations.length}, ${stations[currentIdx].title}`
    : "Loading";

  return (
    <div className="ln-inner">
      {/* ── video frame ── */}
      <div ref={frameRef} className="ln-video-frame" data-testid="line-video-frame">
        <VideoSkin className="ln-skin">
          <MuxVideo source={{ playbackId }} preload="auto" playsInline crossOrigin="anonymous" />
          <MuxData metadata={{ video_title: title }} />
        </VideoSkin>

        {!started ? (
          <button
            type="button"
            className="ln-poster"
            data-testid="line-poster"
            aria-label={`Play ${title}`}
            onClick={() => {
              setStarted(true);
              void playback.play();
            }}
          >
            <img
              className="ln-poster-img"
              src={`https://image.mux.com/${playbackId}/thumbnail.jpg?time=2&width=1280`}
              alt=""
              draggable={false}
            />
            <span className="ln-poster-play" aria-hidden="true">
              <Play size={30} fill="currentColor" />
            </span>
          </button>
        ) : null}

      </div>

      {/* ── transit route ── */}
      <div className="ln-route-wrap" data-testid="line-transit-route">
        <MapBackdrop />
        <div
          ref={trackRef}
          className="ln-route-track"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={onPointerLeave}
        >
          {/* The slider is its own childless element: ARIA sliders cannot contain
              interactive children, so the station buttons are siblings, not descendants. */}
          <div
            className="ln-route-slider"
            role="slider"
            tabIndex={0}
            aria-label="Transit route — playback position"
            aria-orientation="horizontal"
            aria-valuemin={0}
            aria-valuemax={hasDuration ? Math.max(1, Math.round(duration)) : 100}
            aria-valuenow={Math.round(current)}
            aria-valuetext={ariaValueText}
            onKeyDown={onRouteKey}
          />
          <div ref={doneRef} className="ln-route-done" style={{ width: `${progressPct}%` }} />

          {/* decorative interchange lines: other "metro lines" crossing at each mid-route station */}
          {stations.map((s, i) =>
            i > 0 && !s.terminus ? (
              <span
                key={`x-${s.id}`}
                className={`ln-xline ${i % 2 ? "ln-xline-a" : "ln-xline-b"}`}
                style={{ left: `${s.pct}%` }}
                aria-hidden="true"
              />
            ) : null,
          )}

          {/* stations */}
          {stations.map((s, i) => {
            /* tick the moment the train reaches the station (origin ticks once it has pulled away) */
            const done = hasDuration && !s.terminus && (atEnd || i < reached);
            const isCurrent = hasDuration && !atEnd && !s.terminus && !done && i === currentIdx;
            const isTerminus = s.terminus;
            return (
              <button
                key={s.id}
                type="button"
                className={`ln-station${done ? " ln-station-done" : ""}${isCurrent ? " ln-station-current" : ""}${isTerminus ? " ln-station-terminus" : ""}${i % 2 === 1 ? " ln-station-alt" : ""}`}
                style={{ left: `${s.pct}%` }}
                data-testid={`line-station-${s.id}`}
                aria-label={`${s.title}, ${fmtStation(s.at)}${isTerminus ? ", terminus" : done ? ", completed" : isCurrent ? ", current station" : ", upcoming"}`}
                aria-current={isCurrent ? "true" : undefined}
                onClick={(e) => {
                  e.stopPropagation();
                  goToChapter(i);
                }}
                onFocus={() => {
                  lastTipRef.current = null;
                  setTooltip({ pct: s.pct, t: Math.round(s.at), label: s.title });
                }}
                onBlur={() => setTooltip(null)}
                onMouseEnter={() => {
                  lastTipRef.current = null;
                  setTooltip({ pct: s.pct, t: Math.round(s.at), label: s.title });
                }}
                onMouseLeave={() => !draggingRef.current && setTooltip(null)}
              >
                <span className="ln-station-dot">
                  {done ? <Check className="ln-station-check" size={12} strokeWidth={3.2} aria-hidden="true" /> : null}
                  {isTerminus ? <TerminusFlag /> : null}
                </span>
                <span
                  className={`ln-station-label${s.pct < 6 ? " ln-label-start" : ""}${s.pct > 94 ? " ln-label-end" : ""}`}
                >
                  {s.title}
                  <small>{fmtStation(s.at)}</small>
                </span>
              </button>
            );
          })}

          {/* train playhead — the single moving marker, centered on the line */}
          <div
            ref={trainRef}
            className={`ln-train${isDragging ? " ln-train-drag" : ""}${arrivedIdx !== null && stations[arrivedIdx] && !stations[arrivedIdx].terminus ? " ln-train-docked" : ""}`}
            style={{ "--ln-pct": `${progressPct}%` } as React.CSSProperties}
            data-testid="line-train"
            aria-hidden="true"
          >
            <MetroCar />
          </div>

          {/* seek-preview tooltip: live video frame + chapter + timestamp.
              Centered over the hovered position, clamped so it never leaves
              the player (measured against the real track width). */}
          {tooltip ? (
            (() => {
              const w = trackRef.current?.clientWidth ?? 0;
              const half = 92;
              const left = w > 0 ? clamp((tooltip.pct / 100) * w, half, Math.max(half, w - half)) : tooltip.pct;
              return (
                <div className="ln-route-tooltip" style={{ left: `${left}px` }} aria-hidden="true">
                  {thumbUrl ? (
                    <img
                      className="ln-tooltip-thumb"
                      src={thumbUrl}
                      alt=""
                      width={160}
                      height={90}
                      decoding="async"
                      aria-hidden="true"
                    />
                  ) : null}
                  <span className="ln-tooltip-meta">
                    <span className="ln-tooltip-name">{tooltip.label}</span>
                    <span className="ln-tooltip-time">{fmt(tooltip.t)}</span>
                  </span>
                </div>
              );
            })()
          ) : null}
        </div>

        {/* mobile: current chapter label (station labels are hidden ≤479px) */}
        <div className="ln-route-mobile-label" data-testid="line-mobile-current-chapter">
          {stations[Math.min(currentIdx, stations.length - 1)]?.title}
          <small>{fmt(stations[Math.min(currentIdx, stations.length - 1)]?.at ?? 0)}</small>
        </div>
      </div>

      {/* ── controls ── */}
      <div className="ln-controls" data-testid="line-controls">
        <button
          type="button"
          className="ln-ctrl ln-ctrl-play"
          data-testid="line-play-button"
          aria-label={playback.paused ? "Play" : "Pause"}
          onClick={() => (playback.paused ? void playback.play() : playback.pause())}
        >
          {playback.paused ? <Play size={20} fill="currentColor" aria-hidden="true" /> : <Pause size={20} fill="currentColor" aria-hidden="true" />}
        </button>

        <button
          type="button"
          className="ln-ctrl"
          data-testid="line-prev-chapter-button"
          aria-label="Previous chapter"
          onClick={() => goToChapter(Math.max(0, currentIdx - 1))}
        >
          <SkipBack size={17} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="ln-ctrl"
          data-testid="line-next-chapter-button"
          aria-label="Next chapter"
          onClick={() => goToChapter(Math.min(stations.length - 1, currentIdx + 1))}
        >
          <SkipForward size={17} aria-hidden="true" />
        </button>

        <span className="ln-time" data-testid="line-time-display" aria-live="off">
          {fmt(current)} <span>/ {hasDuration ? fmt(duration) : "–:––"}</span>
        </span>

        <div className="ln-spacer" />

        {/* mobile chapters list */}
        <button
          ref={chaptersBtnRef}
          type="button"
          className="ln-chapters-btn"
          data-testid="line-chapters-button"
          aria-label="Open chapters list"
          aria-expanded={chaptersOpen}
          onClick={() => setChaptersOpen((v) => !v)}
        >
          <List size={16} aria-hidden="true" /> Chapters
        </button>

        <input
          type="range"
          className="ln-vol"
          data-testid="line-volume-slider"
          min={0}
          max={1}
          step={0.05}
          value={volume.muted ? 0 : volume.volume}
          aria-label="Volume"
          onChange={(e) => {
            const v = Number(e.target.value);
            volume.setVolume(v);
            if (v > 0 && volume.muted) volume.setMuted(false);
          }}
        />
        <button
          type="button"
          className="ln-ctrl"
          data-testid="line-mute-button"
          aria-label={volume.muted ? "Unmute" : "Mute"}
          aria-pressed={volume.muted}
          onClick={() => volume.setMuted(!volume.muted)}
        >
          {volume.muted || volume.volume === 0 ? <VolumeX size={17} aria-hidden="true" /> : <Volume2 size={17} aria-hidden="true" />}
        </button>

        {/* playback speed */}
        <div style={{ position: "relative" }}>
          <button
            ref={rateBtnRef}
            type="button"
            className="ln-ctrl"
            data-testid="line-settings-button"
            aria-label="Playback speed settings"
            aria-expanded={rateOpen}
            aria-haspopup="menu"
            onClick={() => setRateOpen((v) => !v)}
          >
            <Settings size={17} aria-hidden="true" />
          </button>
          {rateOpen ? (
            <div
              ref={rateMenuRef}
              onKeyDown={onRateMenuKey}
              role="menu"
              aria-label="Playback speed"
              style={{
                position: "absolute",
                bottom: "calc(100% + 8px)",
                right: 0,
                background: "var(--ln-ctrl-bg)",
                color: "var(--ln-ink)",
                border: "1px solid var(--ln-border)",
                borderRadius: 12,
                boxShadow: "0 10px 28px -14px rgba(17,24,39,.35)",
                padding: 6,
                display: "flex",
                flexDirection: "column",
                zIndex: 20,
                minWidth: 96,
              }}
            >
              {rate.playbackRates.map((r: number) => (
                <button
                  key={r}
                  type="button"
                  role="menuitemradio"
                  tabIndex={-1}
                  aria-checked={rate.playbackRate === r}
                  className="ln-ctrl"
                  style={{ width: "100%", height: 34, justifyContent: "flex-start", display: "flex", gap: 8, fontSize: 13, fontWeight: 600 }}
                  onClick={() => {
                    rate.setPlaybackRate(r);
                    setRateOpen(false);
                    rateBtnRef.current?.focus();
                  }}
                >
                  {rate.playbackRate === r ? <Check size={14} aria-hidden="true" /> : <span style={{ width: 14 }} />}
                  {r}×
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* speed quick cycle (visible on all sizes) */}
        <button
          type="button"
          className="ln-speed"
          data-testid="line-speed-button"
          aria-label={`Playback speed ${rate.playbackRate}×, activate to cycle`}
          onClick={() => {
            const list = rate.playbackRates.length ? rate.playbackRates : [0.5, 1, 1.5, 2];
            const i = list.indexOf(rate.playbackRate);
            rate.setPlaybackRate(list[(i + 1) % list.length]);
          }}
        >
          {rate.playbackRate}×
        </button>

        <button
          type="button"
          className="ln-ctrl"
          data-testid="line-captions-button"
          aria-label={hasCaptions ? "Captions" : "Captions — none available for this video"}
          aria-disabled={!hasCaptions || undefined}
          aria-pressed={hasCaptions ? tracks.subtitlesShowing : undefined}
          title={hasCaptions ? "Captions" : "No captions available"}
          onClick={hasCaptions ? () => tracks.toggleSubtitles() : undefined}
        >
          <Captions size={17} aria-hidden="true" />
        </button>

        <button
          type="button"
          className="ln-ctrl"
          data-testid="line-fullscreen-button"
          aria-label={fullscreen.isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          onClick={() => (fullscreen.isFullscreen ? void fullscreen.exitFullscreen() : void fullscreen.requestFullscreen())}
        >
          {fullscreen.isFullscreen ? <Minimize size={17} aria-hidden="true" /> : <Maximize size={17} aria-hidden="true" />}
        </button>
      </div>

      {/* mobile chapters sheet */}
      {chaptersOpen ? (
        <div
          ref={chaptersRef}
          role="dialog"
          aria-label="Chapters"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              e.stopPropagation();
              closeChapters();
            }
          }}
          data-testid="line-chapters-dialog"
          style={{
            background: "var(--ln-ctrl-bg)",
            color: "var(--ln-ink)",
            border: "1px solid var(--ln-border)",
            borderRadius: 16,
            padding: 14,
            boxShadow: "0 16px 40px -20px rgba(17,24,39,.4)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <strong style={{ fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase" }}>Stations</strong>
            <button
              type="button"
              className="ln-ctrl"
              style={{ width: 44, height: 44 }}
              aria-label="Close chapters list"
              onClick={closeChapters}
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {stations.map((s, i) => (
              <button
                key={s.id}
                type="button"
                data-chapter-item
                className="ln-ctrl"
                style={{ width: "100%", height: 44, justifyContent: "flex-start", display: "flex", gap: 10, fontSize: 13.5, fontWeight: 600, border: "none" }}
                aria-current={i === currentIdx ? "true" : undefined}
                onClick={() => {
                  goToChapter(i);
                  closeChapters();
                }}
              >
                {i < currentIdx ? (
                  <Check size={15} style={{ color: "var(--ln-green)" }} aria-hidden="true" />
                ) : i === currentIdx ? (
                  <TrainFront size={15} style={{ color: "var(--ln-navy)" }} aria-hidden="true" />
                ) : (
                  <span style={{ width: 15, height: 15, borderRadius: 999, border: "2.5px solid var(--ln-blue)", display: "inline-block" }} aria-hidden="true" />
                )}
                {s.title}
                <span style={{ marginLeft: "auto", color: "var(--ln-ink-muted)", fontVariantNumeric: "tabular-nums" }}>{fmtStation(s.at)}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* polite live region — only for user-initiated chapter jumps */}
      <div className="ln-live" aria-live="polite" role="status">
        {liveMsg}
      </div>
    </div>
  );
}
