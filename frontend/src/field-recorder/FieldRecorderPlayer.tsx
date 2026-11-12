import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Video, VideoPlayer, VideoSkin, usePlayer } from "@videojs/react/video";
import { MuxVideo } from "@videojs/react/media/mux-video";
import { MuxData } from "@videojs/react/extensions/mux-data";
import {
  selectTime,
  selectPlayback,
  selectVolume,
  selectFullscreen,
  selectPiP,
  selectTextTrack,
  selectBuffer,
} from "@videojs/core/dom";

type PlaybackStatus = "PLAY" | "PAUSED" | "BUFFERING";
import "./field-recorder.css";
import "./field-recorder-refinements.css";
import {
  SkipBack10Icon,
  SkipForward10Icon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  VolumeIcon,
  VolumeMutedIcon,
  CaptionsIcon,
  SettingsIcon,
  PipIcon,
  FullscreenEnterIcon,
  FullscreenExitIcon,
} from "./svg";

/**
 * Field Recorder — Cinema Edition
 * Custom-skinned Video.js v10 player built on the preset's usePlayer store.
 *
 * All controls bind to REAL player state via selectors:
 *   selectTime      currentTime / duration / seek
 *   selectPlayback  paused / play / pause
 *   selectVolume    volume / muted / setVolume / setMuted
 *   selectFullscreen isFullscreen / requestFullscreen / exitFullscreen
 *   selectPiP       isPictureInPicture / requestPictureInPicture / exit
 *   selectTextTrack textTrackList / subtitlesShowing / toggleSubtitles
 *   selectBuffer    buffered / seekable
 */

const fmt = (t: number) => {
  if (!Number.isFinite(t) || t < 0) t = 0;
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = Math.floor(t % 60);
  return (
    String(h).padStart(2, "0") +
    ":" +
    String(m).padStart(2, "0") +
    ":" +
    String(s).padStart(2, "0")
  );
};

/* ── icons: SVG asset components (loaded from the supplied ZIP) ───────── */

const ico = (name: string, className?: string): ReactNode => (
  <svg className={className} aria-hidden focusable="false">
    <use href={`/assets/fr/${name}.svg#${name}`} />
  </svg>
);

/* ── timecode panel ────────────────────────────────────────────────────── */

function Timecode({ time, duration }: { time: number; duration: number }) {
  return (
    <div className="fr-timecode-wrap">
      <div className="fr-timecode">
        <span className="fr-tc-label">TIMECODE</span>
        <span className="fr-tc-value">{fmt(time)}</span>
      </div>
      <div className="fr-timecode fr-timecode-dim">
        <span className="fr-tc-label">DURATION</span>
        <span className="fr-tc-value">{fmt(duration)}</span>
      </div>
    </div>
  );
}

/* ── volume LED meter ──────────────────────────────────────────────────── */

function VolumeLadder({ volume, muted }: { volume: number; muted: boolean }) {
  const segments = 16;
  const level = muted ? 0 : Math.round(volume * segments);
  return (
    <div className="fr-vol-meter" aria-hidden>
      {Array.from({ length: segments }, (_, i) => {
        const seg = i + 1;
        const cls =
          seg > level ? "fr-led off" : seg <= 9 ? "fr-led green" : seg <= 13 ? "fr-led yellow" : "fr-led orange";
        return <i key={i} className={cls} />;
      })}
    </div>
  );
}

/* ── transport dock ────────────────────────────────────────────────────── */

interface TransportProps {
  paused: boolean;
  bufferedPct: number;
  status: PlaybackStatus;
  onPlayPause: () => void;
  onSeek: (t: number) => void;
  onSkip: (delta: number) => void;
  onStop: () => void;
  volume: number;
  muted: boolean;
  onVolume: (v: number) => void;
  onMute: () => void;
  time: number;
  duration: number;
  captionsOn: boolean;
  hasCaptions: boolean;
  onCaptions: () => void;
  pipActive: boolean;
  onPiP: () => void;
  fsActive: boolean;
  onFullscreen: () => void;
  crosshairOn: boolean;
  onCrosshair: () => void;
}

function TransportDock(p: TransportProps) {
  const [dragPct, setDragPct] = useState<number | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const hoverPct = useRef<number | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; t: number } | null>(null);

  const pct = dragPct ?? (p.duration > 0 ? (p.time / p.duration) * 100 : 0);

  const posToTime = useCallback(
    (clientX: number) => {
      const el = barRef.current;
      if (!el || p.duration <= 0) return 0;
      const r = el.getBoundingClientRect();
      return Math.min(Math.max((clientX - r.left) / r.width, 0), 1) * p.duration;
    },
    [p.duration],
  );

  const onPointer = useCallback(
    (e: React.PointerEvent, commit: boolean) => {
      const t = posToTime(e.clientX);
      setDragPct(p.duration > 0 ? (t / p.duration) * 100 : 0);
      if (commit) {
        p.onSeek(t);
        setDragPct(null);
      }
    },
    [posToTime, p],
  );

  return (
    <div className="fr-dock">
      <img src="/assets/fr/hardware/seek-ruler.svg" alt="" className="fr-ruler-bg" />
      {/* timeline */}
      <div className="fr-timeline-wrap">
        <div
          ref={barRef}
          className="fr-timeline"
          role="slider"
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={Math.max(1, Math.round(p.duration))}
          aria-valuenow={Math.round(p.time)}
          aria-valuetext={`${fmt(p.time)} of ${fmt(p.duration)}`}
          aria-orientation="horizontal"
          tabIndex={0}
          onPointerDown={(e) => {
            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
            onPointer(e, false);
          }}
          onPointerMove={(e) => {
            if (e.buttons & 1) onPointer(e, false);
            setTooltip({ x: e.clientX, t: posToTime(e.clientX) });
          }}
          onPointerUp={(e) => onPointer(e, true)}
          onPointerLeave={() => setTooltip(null)}
          onKeyDown={(e) => {
            // The slider owns its own keys; stop them reaching the global
            // shortcut handler so a single press never seeks twice.
            if (e.ctrlKey || e.altKey || e.metaKey) return;
            const handled = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"];
            if (handled.includes(e.key)) e.stopPropagation();
            if (e.key === "ArrowRight" || e.key === "ArrowUp") { p.onSeek(Math.min(p.time + 5, p.duration)); e.preventDefault(); }
            if (e.key === "ArrowLeft" || e.key === "ArrowDown") { p.onSeek(Math.max(p.time - 5, 0)); e.preventDefault(); }
            if (e.key === "PageUp") { p.onSeek(Math.min(p.time + 30, p.duration)); e.preventDefault(); }
            if (e.key === "PageDown") { p.onSeek(Math.max(p.time - 30, 0)); e.preventDefault(); }
            if (e.key === "Home") { p.onSeek(0); e.preventDefault(); }
            if (e.key === "End") { p.onSeek(p.duration); e.preventDefault(); }
          }}
        >
          {/* tick ruler: minor ticks every 1% via gradient, major every 10% */}
          <div className="fr-ticks" aria-hidden="true">
            {Array.from({ length: 9 }, (_, i) => (
              <i key={i} className="fr-tick-major" style={{ left: `${(i + 1) * 10}%` }} />
            ))}
          </div>
          <div className="fr-timeline-buffer" style={{ width: `${p.bufferedPct}%` }} />
          <div className="fr-timeline-played" style={{ width: `${pct}%` }} />
          <img src="/assets/fr/hardware/seek-playhead.svg" alt="" className="fr-playhead" style={{ "--pct": pct } as React.CSSProperties} />
        </div>
        {tooltip && p.duration > 0 && (
          <div
            className="fr-tooltip"
            style={{ left: `${Math.min(Math.max(((tooltip.x - (barRef.current?.getBoundingClientRect().left ?? 0)) / (barRef.current?.getBoundingClientRect().width ?? 1)) * 100, 0), 100)}%` }}
          >
            {fmt(tooltip.t)}
          </div>
        )}
      </div>

      {/* transport row — four balanced groups spread across the full dock width */}
      <div className="fr-transport">
        {/* Group A — Transport */}
        <div className="fr-group fr-group-transport">
          <button
            type="button"
            className="fr-btn"
            aria-label="Skip backward 10 seconds"
            onClick={() => p.onSkip(-10)}
          >
            <SkipBack10Icon className="fr-ico" />
          </button>

          <button
            type="button"
            className={`fr-btn fr-btn-play ${p.paused ? "" : "fr-btn-playing"}`}
            aria-label={p.paused ? "Play" : "Pause"}
            onClick={p.onPlayPause}
          >
            {p.paused ? (
              <PlayIcon className="fr-ico" />
            ) : (
              <PauseIcon className="fr-ico" />
            )}
          </button>

          <button
            type="button"
            className="fr-btn"
            aria-label="Skip forward 10 seconds"
            onClick={() => p.onSkip(10)}
          >
            <SkipForward10Icon className="fr-ico" />
          </button>

          <button type="button" className="fr-btn" aria-label="Stop" onClick={p.onStop}>
            <StopIcon className="fr-ico" />
          </button>
        </div>

        {/* Group B — Time Display */}
        <Timecode time={p.time} duration={p.duration} />

        {/* Group C — Audio */}
        <div className="fr-volume-group">
          <div className="fr-volume-wrap">
            <span className="fr-vol-label">VOLUME</span>
            <VolumeLadder volume={p.volume} muted={p.muted} />
            <input
              type="range"
              className="fr-vol-range"
              aria-label="Volume"
              min={0}
              max={1}
              step={0.05}
              value={p.muted ? 0 : p.volume}
              onChange={(e) => p.onVolume(parseFloat(e.target.value))}
            />
          </div>
          <button
            type="button"
            className="fr-btn fr-btn-essential"
            aria-label={p.muted ? "Unmute" : "Mute"}
            onClick={p.onMute}
          >
            {p.muted ? <VolumeMutedIcon className="fr-ico" /> : <VolumeIcon className="fr-ico" />}
          </button>
        </div>

        {/* Group D — Utilities */}
        <div className="fr-group fr-group-utilities">
          <button
            type="button"
            className={`fr-btn fr-btn-captions ${p.captionsOn ? "fr-btn-active" : ""}`}
            aria-label={p.hasCaptions ? "Captions" : "Captions — no captions available for this media"}
            aria-disabled={!p.hasCaptions || undefined}
            aria-pressed={p.hasCaptions ? p.captionsOn : undefined}
            onClick={p.hasCaptions ? p.onCaptions : undefined}
            title={p.hasCaptions ? "Captions" : "No captions available"}
          >
            <CaptionsIcon className="fr-ico" />
          </button>

          <button
            type="button"
            className={`fr-btn ${p.crosshairOn ? "fr-btn-active" : ""}`}
            aria-label="Center crosshair"
            aria-pressed={p.crosshairOn}
            onClick={p.onCrosshair}
            title="Center crosshair"
          >
            <SettingsIcon className="fr-ico" />
          </button>

          <button
            type="button"
            className={`fr-btn ${p.pipActive ? "fr-btn-active" : ""}`}
            aria-label="Picture in picture"
            onClick={p.onPiP}
          >
            <PipIcon className="fr-ico" />
          </button>

          <button
            type="button"
            className="fr-btn fr-btn-essential"
            aria-label={p.fsActive ? "Exit fullscreen" : "Enter fullscreen"}
            onClick={p.onFullscreen}
          >
            {p.fsActive ? <FullscreenExitIcon className="fr-ico" /> : <FullscreenEnterIcon className="fr-ico" />}
          </button>
        </div>
      </div>

      {/* panel screws */}
      <img src="/assets/fr/hardware/panel-screw.svg" alt="" className="fr-screw fr-screw-tl" />
      <img src="/assets/fr/hardware/panel-screw.svg" alt="" className="fr-screw fr-screw-tr" />
      <img src="/assets/fr/hardware/panel-screw.svg" alt="" className="fr-screw fr-screw-bl" />
      <img src="/assets/fr/hardware/panel-screw.svg" alt="" className="fr-screw fr-screw-br" />
    </div>
  );
}

/* ── main player ───────────────────────────────────────────────────────── */

export default function FieldRecorderPlayer({
  playbackId,
  poster,
  title,
}: {
  playbackId: string;
  poster?: string;
  title: string;
}) {
  return (
    <div className="fr-player">
      <div className="fr-stage">
        {/* Everything that touches the player store must live INSIDE
            VideoPlayer (usePlayer reads the Player context). */}
        <VideoPlayer title={title} poster={poster}>
          <FieldRecorderUI playbackId={playbackId} title={title} />
        </VideoPlayer>
      </div>
    </div>
  );
}

function FieldRecorderUI({ playbackId, title }: { playbackId: string; title: string }) {
  // Selectors yield undefined before the store attaches — normalize to
  // safe defaults so the dock renders a valid idle state.
  const tSel = usePlayer(selectTime);
  const pbSel = usePlayer(selectPlayback);
  const vSel = usePlayer(selectVolume);
  const fsSel = usePlayer(selectFullscreen);
  const pipSel = usePlayer(selectPiP);
  const trSel = usePlayer(selectTextTrack);
  const bSel = usePlayer(selectBuffer);
  const time = { currentTime: 0, duration: 0, seek: async (t: number) => t, ...(tSel ?? {}) };
  const playback = { paused: true, waiting: false, play: async () => {}, pause: () => {}, ...(pbSel ?? {}) };
  const volume = { volume: 1, muted: false, setVolume: () => 1, setMuted: () => false, ...(vSel ?? {}) };
  const fullscreen = { isFullscreen: false, requestFullscreen: async () => {}, exitFullscreen: async () => {}, ...(fsSel ?? {}) };
  const pip = { isPictureInPicture: false, requestPictureInPicture: async () => {}, exitPictureInPicture: async () => {}, ...(pipSel ?? {}) };
  const tracks = { textTrackList: [] as unknown[], subtitlesShowing: false, toggleSubtitles: () => false, ...(trSel ?? {}) };
  const buffer = { buffered: [] as [number, number][], seekable: [] as [number, number][], ...(bSel ?? {}) };

  // Real playback state from the player store (selectPlayback.waiting).
  const status: PlaybackStatus = playback.waiting ? "BUFFERING" : playback.paused ? "PAUSED" : "PLAY";

  // Buffered percentage: end of the buffered range covering playhead.
  const bufferedPct = (() => {
    if (time.duration <= 0) return 0;
    const at = time.currentTime;
    const range =
      buffer.buffered.find(([s, e]) => at >= s - 0.5 && at <= e) ?? buffer.buffered[buffer.buffered.length - 1];
    return range ? Math.min((range[1] / time.duration) * 100, 100) : 0;
  })();

  const [crosshair, setCrosshair] = useState(false);

  // Mux playback: MuxVideo resolves stream.mux.com HLS from the playback ID
  // and attaches its bundled hls.js engine (native HLS on Safari).

  const onSkip = useCallback(
    (delta: number) => {
      const t = time.currentTime + delta;
      void time.seek(Math.min(Math.max(t, 0), time.duration));
    },
    [time],
  );

  const onVolume = useCallback(
    (v: number) => {
      volume.setVolume(v);
      if (v > 0 && volume.muted) volume.setMuted(false);
    },
    [volume],
  );

  const onPlayPause = useCallback(() => {
    if (playback.paused) void playback.play();
    else playback.pause();
  }, [playback]);

  const onFullscreen = useCallback(() => {
    if (fullscreen.isFullscreen) void fullscreen.exitFullscreen();
    else void fullscreen.requestFullscreen();
  }, [fullscreen]);

  // Global keyboard shortcuts (mirrored in the Player page shortcut bar):
  // Space play/pause · ←/→ seek ±5s · ↑/↓ volume · F fullscreen · C captions
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Never fight the browser or assistive tech: leave any chord that
      // uses Ctrl / Alt / Meta alone (Ctrl+F find, Ctrl+C copy, Alt+Left back).
      if (e.ctrlKey || e.altKey || e.metaKey || e.defaultPrevented) return;
      const el = e.target as HTMLElement | null;
      // Only act while focus is inside this player or on the page body, so
      // shortcuts never hijack the rest of the site.
      const inPlayer = !!el && typeof el.closest === "function" && !!el.closest(".fr-player");
      const onBody = el === document.body || el === document.documentElement;
      if (!inPlayer && !onBody) return;
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
      // Native buttons and sliders already own Space / Enter / arrows; let
      // them activate normally instead of also toggling playback.
      const isControl = !!el && !!el.closest('button, [role="slider"], [role="button"], a[href]');
      if (isControl && (e.key === " " || e.key === "Enter" || e.key.startsWith("Arrow"))) return;
      switch (e.key) {
        case " ":
          e.preventDefault();
          onPlayPause();
          break;
        case "ArrowLeft":
          e.preventDefault();
          onSkip(-5);
          break;
        case "ArrowRight":
          e.preventDefault();
          onSkip(5);
          break;
        case "ArrowUp":
          e.preventDefault();
          onVolume(Math.min(1, volume.volume + 0.1));
          break;
        case "ArrowDown":
          e.preventDefault();
          onVolume(Math.max(0, volume.volume - 0.1));
          break;
        case "f":
        case "F":
          onFullscreen();
          break;
        case "c":
        case "C":
          tracks.toggleSubtitles();
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onPlayPause, onSkip, onVolume, onFullscreen, volume.volume, tracks]);

  return (
    <>
      <div className="fr-video-frame">
        <VideoSkin className="fr-vjs-skin">
          <MuxVideo source={{ playbackId: playbackId }} preload="auto" playsInline crossOrigin="anonymous" />
          <MuxData metadata={{ video_title: title }} />
        </VideoSkin>

        <div className="fr-overlay">
          {/* small title overlay, top-left inside the frame */}
          <span className="fr-title" data-testid="player-title-overlay">{title}</span>
          {/* live playback state badge (replaces the old REC pill) */}
          <span
            className={`fr-status fr-status-${status.toLowerCase()}`}
            data-testid="player-status-badge"
            aria-live="polite"
          >
            <i className="fr-status-dot" aria-hidden="true" />
            {status}
          </span>
          <span className="fr-corner fr-corner-tl" aria-hidden="true" />
          <span className="fr-corner fr-corner-tr" aria-hidden="true" />
          <span className="fr-corner fr-corner-bl" aria-hidden="true" />
          <span className="fr-corner fr-corner-br" aria-hidden="true" />
          <button
            type="button"
            className={`fr-crosshair ${crosshair ? "fr-crosshair-on" : ""}`}
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setCrosshair((v) => !v)}
          >
            <img src="/assets/fr/hardware/crosshair.svg" alt="" />
          </button>
        </div>
      </div>

      <TransportDock
        paused={playback.paused}
        bufferedPct={bufferedPct}
        status={status}
        onPlayPause={() => (playback.paused ? void playback.play() : playback.pause())}
        onSeek={(t) => void time.seek(t)}
        onSkip={onSkip}
        onStop={() => {
          playback.pause();
          void time.seek(0);
        }}
        volume={volume.volume}
        muted={volume.muted}
        onVolume={onVolume}
        onMute={() => volume.setMuted(!volume.muted)}
        time={time.currentTime}
        duration={time.duration}
        captionsOn={tracks.subtitlesShowing}
        hasCaptions={tracks.textTrackList.length > 0}
        onCaptions={() => tracks.toggleSubtitles()}
        pipActive={pip.isPictureInPicture}
        onPiP={() => (pip.isPictureInPicture ? void pip.exitPictureInPicture() : void pip.requestPictureInPicture())}
        fsActive={fullscreen.isFullscreen}
        onFullscreen={() => (fullscreen.isFullscreen ? void fullscreen.exitFullscreen() : void fullscreen.requestFullscreen())}
        crosshairOn={crosshair}
        onCrosshair={() => setCrosshair((v) => !v)}
      />
    </>
  );
}
