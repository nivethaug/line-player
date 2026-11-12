import { useCallback, useEffect, useRef, useState } from "react";
import { VideoPlayer, VideoSkin, usePlayer } from "@videojs/react/video";
import { MuxVideo } from "@videojs/react/media/mux-video";
import { MuxData } from "@videojs/react/extensions/mux-data";
import {
  selectTime,
  selectPlayback,
  selectVolume,
  selectFullscreen,
  selectTextTrack,
  selectBuffer,
} from "@videojs/core/dom";
import "./flipbook.css";

/**
 * Flipbook Player — cream paper, red ink, tactile book controls.
 * Real Video.js v10 + Mux playback; same usePlayer store pattern as the
 * untouched Field Recorder player. Uploaded SVGs served from /uploads/.
 * Flat 2D book-spine timeline: slim right-leaning parallelogram paper grains
 * packed tightly in a cream capsule rail, single page-curl at the
 * played/unplayed boundary, bookmark-ribbon playhead hanging at the exact
 * progress percentage.
 */

const A = {
  bookmark: "/uploads/image_2194_bookmark-ribbon_67545a8a.svg",
  playFold: "/uploads/image_2194_play-fold_dd98937f.svg",
  speaker: "/uploads/image_2194_volume-speaker_ce79028b.svg",
  back10: "/uploads/image_2194_skip-back-10_22190660.svg",
  fwd10: "/uploads/image_2194_skip-forward-10_ff176ddb.svg",
  cc: "/uploads/image_2194_captions-cc_72399a80.svg",
  gear: "/uploads/image_2194_settings-gear_ee929322.svg",
  fullscreen: "/uploads/image_2194_fullscreen_2e34dbaa.svg",
};

const PAUSE_ICON = (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
    <rect x="4.5" y="4" width="5.5" height="16" rx="2" fill="#b83227" stroke="#29231f" strokeWidth="1.6" />
    <rect x="14" y="4" width="5.5" height="16" rx="2" fill="#b83227" stroke="#29231f" strokeWidth="1.6" />
  </svg>
);

const fmt = (t: number) => {
  if (!Number.isFinite(t) || t < 0) t = 0;
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

const PAGE_COUNT = 30;

function FlipbookUI({ playbackId, title }: { playbackId: string; title: string }) {
  const tSel = usePlayer(selectTime);
  const pbSel = usePlayer(selectPlayback);
  const vSel = usePlayer(selectVolume);
  const fsSel = usePlayer(selectFullscreen);
  const trSel = usePlayer(selectTextTrack);
  const bSel = usePlayer(selectBuffer);
  const time = { currentTime: 0, duration: 0, seek: async (t: number) => t, ...(tSel ?? {}) };
  const playback = { paused: true, waiting: false, play: async () => {}, pause: () => {}, ...(pbSel ?? {}) };
  const volume = { volume: 1, muted: false, setVolume: () => 1, setMuted: () => false, ...(vSel ?? {}) };
  const fullscreen = { isFullscreen: false, requestFullscreen: async () => {}, exitFullscreen: async () => {}, ...(fsSel ?? {}) };
  const tracks = { textTrackList: [] as unknown[], subtitlesShowing: false, toggleSubtitles: () => false, ...(trSel ?? {}) };
  const buffer = { buffered: [] as [number, number][], ...(bSel ?? {}) };

  const status = playback.waiting ? "BUFFERING" : playback.paused ? "PAUSED" : "PLAYING";

  const onPlayPause = useCallback(() => {
    if (playback.paused) void playback.play();
    else playback.pause();
  }, [playback]);

  const onSkip = useCallback(
    (delta: number) => {
      void time.seek(Math.min(Math.max(time.currentTime + delta, 0), time.duration));
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

  const onFullscreen = useCallback(() => {
    if (fullscreen.isFullscreen) void fullscreen.exitFullscreen();
    else void fullscreen.requestFullscreen();
  }, [fullscreen]);

  // "Open Player" button on the info panel dispatches this
  useEffect(() => {
    const onExternalPlay = () => { void playback.play(); };
    window.addEventListener("flipbook:play", onExternalPlay);
    return () => window.removeEventListener("flipbook:play", onExternalPlay);
  }, [playback]);

  // Global keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
      switch (e.key) {
        case " ": e.preventDefault(); onPlayPause(); break;
        case "ArrowLeft": e.preventDefault(); onSkip(-5); break;
        case "ArrowRight": e.preventDefault(); onSkip(5); break;
        case "ArrowUp": e.preventDefault(); onVolume(Math.min(1, volume.volume + 0.1)); break;
        case "ArrowDown": e.preventDefault(); onVolume(Math.max(0, volume.volume - 0.1)); break;
        case "f": case "F": onFullscreen(); break;
        case "c": case "C": if (tracks.textTrackList.length > 0) tracks.toggleSubtitles(); break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onPlayPause, onSkip, onVolume, onFullscreen, volume.volume, tracks]);

  // Page-stack seek bar: pointer drag + keyboard
  const barRef = useRef<HTMLDivElement | null>(null);
  const [dragPct, setDragPct] = useState<number | null>(null);
  const pct = dragPct ?? (time.duration > 0 ? (time.currentTime / time.duration) * 100 : 0);
  // H. real Video.js progress; a page is played once its midpoint passes
  const progress = pct / 100;

  const seekFromEvent = useCallback(
    (clientX: number, commit: boolean) => {
      const el = barRef.current;
      if (!el || time.duration <= 0) return;
      const r = el.getBoundingClientRect();
      const p = Math.min(Math.max((clientX - r.left) / r.width, 0), 1);
      setDragPct(p * 100);
      if (commit) {
        void time.seek(p * time.duration);
        setDragPct(null);
      }
    },
    [time],
  );

  return (
    <>
      {/* ── the open book spread ── */}
      <div className="fb-video-wrap">
        <VideoSkin className="fb-vjs-skin">
          <MuxVideo source={{ playbackId }} preload="auto" playsInline crossOrigin="anonymous" />
          <MuxData metadata={{ video_title: title }} />
        </VideoSkin>

        <span className="fb-tab" data-testid="flipbook-title-overlay">{title}</span>
        <span
          className="fb-status"
          data-testid="flipbook-status-badge"
          aria-live="polite"
        >
          {status}
        </span>

        {/* tactile paper-fold play button over the video (paused only) */}
        <button
          type="button"
          className={`fb-fold-play ${playback.paused ? "" : "fb-hidden"}`}
          aria-label="Play video"
          data-testid="flipbook-fold-play"
          onClick={onPlayPause}
        >
          <img className="fb-fold-img" src={A.playFold} alt="" aria-hidden="true" />
        </button>
      </div>

      {/* ── control dock ── */}
      <div className="fb-controls">
        <div
          ref={barRef}
          className="fb-seek"
          role="slider"
          aria-label="Seek — page stack timeline"
          aria-valuemin={0}
          aria-valuemax={Math.round(time.duration)}
          aria-valuenow={Math.round(time.currentTime)}
          aria-valuetext={`${fmt(time.currentTime)} of ${fmt(time.duration)}`}
          tabIndex={0}
          data-testid="flipbook-seekbar"
          onPointerDown={(e) => {
            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
            seekFromEvent(e.clientX, false);
          }}
          onPointerMove={(e) => {
            if (e.buttons & 1) seekFromEvent(e.clientX, false);
          }}
          onPointerUp={(e) => seekFromEvent(e.clientX, true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") { void time.seek(Math.min(time.currentTime + 5, time.duration)); e.preventDefault(); }
            if (e.key === "ArrowLeft") { void time.seek(Math.max(time.currentTime - 5, 0)); e.preventDefault(); }
            if (e.key === "Home") { void time.seek(0); e.preventDefault(); }
            if (e.key === "End") { void time.seek(time.duration); e.preventDefault(); }
          }}
        >
          {/* cream paper rail — the 30 page tiles are its flex children */}
          <div className="fb-rail" aria-hidden="true">
            {(() => {
              const playedCount = Array.from(
                { length: PAGE_COUNT },
                (_, j) => (j + 0.5) / PAGE_COUNT <= progress,
              ).filter(Boolean).length;
              return Array.from({ length: PAGE_COUNT }).map((_, i) => {
                const played = (i + 0.5) / PAGE_COUNT <= progress;
                // spines closest to the boundary fade salmon → red, like leaning
                // books catching light next to the fold (tier 0 = lightest)
                const tier = played ? Math.min(2, Math.max(0, playedCount - 1 - i)) : -1;
                return (
                  <span
                    key={i}
                    className={`fb-page-seg ${played ? `is-played tier-${tier}` : ""}`}
                  />
                );
              });
            })()}
          </div>
          {/* boundary overlay aligned exactly with the grain row:
              curl + bookmark ribbon both track the real progress pct */}
          <div className="fb-track" aria-hidden="true">
            {/* small grounded curl centered on the red/cream boundary —
                bookmark ribbon sits exactly at the progress marker */}
            <img
              className="fb-curl"
              src="/uploads/image_2194_reference-book-page-curl_2086fe1b.svg"
              alt=""
              style={{ left: `clamp(42px, ${pct}%, calc(100% - 42px))` }}
            />
            <div className="fb-playhead" style={{ left: `clamp(42px, ${pct}%, calc(100% - 42px))` }}>
              <img src={A.bookmark} alt="" />
            </div>
          </div>
        </div>

        <div className="fb-transport" data-testid="flipbook-transport">
          {/* left group: fold play + skips */}
          <div className="fb-group">
            <button
              type="button"
              className="fb-btn fb-btn-fold"
              aria-label={playback.paused ? "Play" : "Pause"}
              data-testid="flipbook-play-button"
              onClick={onPlayPause}
            >
              {playback.paused ? (
                <img src={A.playFold} alt="" aria-hidden="true" />
              ) : (
                PAUSE_ICON
              )}
            </button>
            <button type="button" className="fb-btn" aria-label="Skip backward 10 seconds" onClick={() => onSkip(-10)}>
              <img src={A.back10} alt="" aria-hidden="true" />
            </button>
            <button type="button" className="fb-btn" aria-label="Skip forward 10 seconds" onClick={() => onSkip(10)}>
              <img src={A.fwd10} alt="" aria-hidden="true" />
            </button>
          </div>

          <span className="fb-divider" aria-hidden="true" />

          {/* red ink time readout */}
          <div className="fb-time" aria-live="off" data-testid="flipbook-timecode">
            {fmt(time.currentTime)} <span className="fb-time-dim">/ {fmt(time.duration)}</span>
          </div>

          <span className="fb-divider" aria-hidden="true" />

          {/* right group: volume + utilities */}
          <div className="fb-group fb-utilities">
            <div className="fb-vol">
              <button
                type="button"
                className="fb-btn fb-btn-plain"
                aria-label={volume.muted ? "Unmute" : "Mute"}
                onClick={() => volume.setMuted(!volume.muted)}
              >
                <img src={A.speaker} alt="" aria-hidden="true" />
              </button>
              <div className="fb-vol-track">
                <input
                  type="range"
                  aria-label="Volume"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume.muted ? 0 : volume.volume}
                  onChange={(e) => onVolume(parseFloat(e.target.value))}
                />
                <img className="fb-vol-thumb" src={A.bookmark} alt="" aria-hidden="true" />
              </div>
            </div>
            <span className="fb-divider" aria-hidden="true" />
            <button
              type="button"
              className={`fb-btn fb-btn-plain ${tracks.subtitlesShowing ? "fb-btn-active" : ""}`}
              aria-label={tracks.textTrackList.length > 0 ? "Captions" : "Captions — none available"}
              onClick={() => tracks.textTrackList.length > 0 && tracks.toggleSubtitles()}
            >
              <img src={A.cc} alt="" aria-hidden="true" />
            </button>
            <button type="button" className="fb-btn fb-btn-plain" aria-label="Settings" title="Settings">
              <img src={A.gear} alt="" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="fb-btn fb-btn-plain"
              aria-label={fullscreen.isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              onClick={onFullscreen}
            >
              <img src={A.fullscreen} alt="" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function FlipbookPlayer({
  playbackId,
  poster,
  title,
}: {
  playbackId: string;
  poster?: string;
  title: string;
}) {
  return (
    <div className="fb-book" data-testid="flipbook-player">
      <div className="fb-spread">
        <VideoPlayer title={title} poster={poster}>
          <FlipbookUI playbackId={playbackId} title={title} />
        </VideoPlayer>
      </div>
    </div>
  );
}
