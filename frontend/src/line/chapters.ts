/**
 * Line — chapter data (kept separate from presentation).
 * Times in seconds; terminus anchors to the end of the video (duration).
 */
export interface Chapter {
  id: string;
  title: string;
  time: number; // seconds; terminus uses time: -1 → binds to duration
  terminus?: boolean;
}

export const CHAPTERS: Chapter[] = [
  { id: "chennai-coast", title: "Chennai Coast", time: 0 },
  { id: "chennai-central", title: "Chennai Central", time: 2 },
  { id: "city-today", title: "The City Today", time: 6 },
  { id: "terminus", title: "Terminus", time: -1, terminus: true },
];

/**
 * Stations are authored on the actual Chennai reel (12.25s) — timestamps
 * come from the footage's real scene cuts, not even spacing. Terminus (-1)
 * stays bound to the actual end.
 */
export const REFERENCE_DURATION = 12.25;

export function scaleChapterTime(time: number, duration: number): number {
  if (time < 0) return duration; // terminus → end of video
  if (duration > 0) return time * (duration / REFERENCE_DURATION);
  return time;
}
