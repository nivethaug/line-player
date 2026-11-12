/**
 * Line — multi-theme configuration.
 *
 * Every theme is a flat map of CSS custom properties applied to the player
 * card (`.ln-player-card`), so the single LinePlayer instance re-skins
 * instantly — no duplicated components, no playback/seek/chapter changes.
 *
 * Variable contract:
 *   --ln-blue         route line, station outlines, volume accent
 *   --ln-yellow       train marker, current station
 *   --ln-green        completed stations + route progress fill
 *   --ln-navy         dark surfaces (destination sign, tooltip, play btn, frame border)
 *   --ln-accent       bright accent ON dark surfaces (sign dot, tooltip time)
 *   --ln-train-ink    icon/border ink drawn ON the train color
 *   --ln-on-route     icon ink drawn ON route-colored fills (pressed controls)
 *   --ln-card-bg      player card surface
 *   --ln-ctrl-bg      control button surface
 *   --ln-ctrl-hover   control button hover surface
 *   --ln-station-bg   upcoming station dot fill
 *   --ln-ink          primary text on light surfaces
 *   --ln-ink-muted    secondary text on light surfaces
 *   --ln-sign-ink     primary text on dark surfaces
 *   --ln-sign-muted   secondary text on dark surfaces
 *   --ln-dark-hover   hover/active dark surface
 *   --ln-border       hairline borders
 *   --ln-focus        keyboard focus ring (WCAG-visible on this theme's surfaces)
 *   --ln-check-ink    check icon ink drawn ON completed-station dots
 */

export interface LineTheme {
  id: string;
  name: string;
  note: string;
  vars: Record<string, string>;
}

export const DEFAULT_THEME_ID = "sunset-express";

export const LINE_THEME_STORAGE_KEY = "line-theme";

/** Every palette that ships with Line. Only FEATURED_THEME_IDS appear in the picker. */
export const ALL_LINE_THEMES: LineTheme[] = [
  {
    id: "metro-blue",
    name: "Metro Blue",
    note: "Default · clean metro",
    vars: {
      "--ln-blue": "#1E40AF",
      "--ln-yellow": "#FFC107",
      "--ln-green": "#10B981",
      "--ln-navy": "#111827",
      "--ln-accent": "#FFC107",
      "--ln-train-ink": "#111827",
      "--ln-on-route": "#FFFFFF",
      "--ln-card-bg": "#FFFFFF",
      "--ln-ctrl-bg": "#FFFFFF",
      "--ln-ctrl-hover": "#F8F5EB",
      "--ln-station-bg": "#FFFFFF",
      "--ln-ink": "#111827",
      "--ln-ink-muted": "#475569",
      "--ln-sign-ink": "#FFFFFF",
      "--ln-sign-muted": "#D7DBE4",
      "--ln-dark-hover": "#000000",
      "--ln-border": "#D6D3C8",
      "--ln-focus": "#1D4ED8",
      "--ln-check-ink": "#FFFFFF",
    },
  },
  {
    id: "tokyo-neon",
    name: "Tokyo Neon",
    note: "Midnight · cyan line",
    vars: {
      "--ln-blue": "#22D3EE",
      "--ln-yellow": "#FF4D9E",
      "--ln-green": "#10B981",
      "--ln-navy": "#050D1F",
      "--ln-accent": "#4DE3FF",
      "--ln-train-ink": "#160311",
      "--ln-on-route": "#06121F",
      "--ln-card-bg": "#0B1730",
      "--ln-ctrl-bg": "#12203B",
      "--ln-ctrl-hover": "#1A2C4E",
      "--ln-station-bg": "#12203B",
      "--ln-ink": "#EAF2FF",
      "--ln-ink-muted": "#9DB0D0",
      "--ln-sign-ink": "#EAF6FF",
      "--ln-sign-muted": "#8FA3C4",
      "--ln-dark-hover": "#13223F",
      "--ln-border": "#24365C",
      "--ln-focus": "#4DE3FF",
      "--ln-check-ink": "#050D1F",
    },
  },
  {
    id: "london-underground",
    name: "London Underground",
    note: "Classic roundel red",
    vars: {
      "--ln-blue": "#DC241F",
      "--ln-yellow": "#1A3C7D",
      "--ln-green": "#0B7A3E",
      "--ln-navy": "#232323",
      "--ln-accent": "#E8B04B",
      "--ln-train-ink": "#FFFFFF",
      "--ln-on-route": "#FFFFFF",
      "--ln-card-bg": "#F7F5F0",
      "--ln-ctrl-bg": "#FFFFFF",
      "--ln-ctrl-hover": "#EFECE3",
      "--ln-station-bg": "#FFFFFF",
      "--ln-ink": "#1A1A1A",
      "--ln-ink-muted": "#5A5A5A",
      "--ln-sign-ink": "#FFFFFF",
      "--ln-sign-muted": "#D6D6D6",
      "--ln-dark-hover": "#0F0F0F",
      "--ln-border": "#D8D4CB",
      "--ln-focus": "#B3261E",
      "--ln-check-ink": "#FFFFFF",
    },
  },
  {
    id: "forest-green",
    name: "Forest Green",
    note: "Calm nature line",
    vars: {
      "--ln-blue": "#2F6B3F",
      "--ln-yellow": "#E8A13C",
      "--ln-green": "#0E7A4E",
      "--ln-navy": "#1E4025",
      "--ln-accent": "#A9D078",
      "--ln-train-ink": "#2A1A05",
      "--ln-on-route": "#F4FAF0",
      "--ln-card-bg": "#EDF2E4",
      "--ln-ctrl-bg": "#F7F9F1",
      "--ln-ctrl-hover": "#DFE9CF",
      "--ln-station-bg": "#F7F9F1",
      "--ln-ink": "#1F3325",
      "--ln-ink-muted": "#55654F",
      "--ln-sign-ink": "#F2F7EC",
      "--ln-sign-muted": "#B9C9AE",
      "--ln-dark-hover": "#16331C",
      "--ln-border": "#CBD8BD",
      "--ln-focus": "#2F6B3F",
      "--ln-check-ink": "#FFFFFF",
    },
  },
  {
    id: "sunset-express",
    name: "Sunset Express",
    note: "Warm dusk railway",
    vars: {
      "--ln-blue": "#C2542A",
      "--ln-yellow": "#F2B233",
      "--ln-green": "#2E6E5E",
      "--ln-navy": "#3E2A20",
      "--ln-accent": "#F2B233",
      "--ln-train-ink": "#3E2A20",
      "--ln-on-route": "#FFF8EC",
      "--ln-card-bg": "#FBF3E4",
      "--ln-ctrl-bg": "#FFFBF2",
      "--ln-ctrl-hover": "#F3E6CB",
      "--ln-station-bg": "#FFFBF2",
      "--ln-ink": "#3A2A1E",
      "--ln-ink-muted": "#6E5A44",
      "--ln-sign-ink": "#FFF6E8",
      "--ln-sign-muted": "#D9C2A8",
      "--ln-dark-hover": "#2E1F16",
      "--ln-border": "#E4D5B8",
      "--ln-focus": "#C2542A",
      "--ln-check-ink": "#FFFFFF",
    },
  },
  {
    id: "monochrome",
    name: "Monochrome",
    note: "High-contrast minimal",
    vars: {
      "--ln-blue": "#1A1A1A",
      "--ln-yellow": "#FFFFFF",
      "--ln-green": "#6B6B6B",
      "--ln-navy": "#111111",
      "--ln-accent": "#D9D9D9",
      "--ln-train-ink": "#111111",
      "--ln-on-route": "#FFFFFF",
      "--ln-card-bg": "#FAFAFA",
      "--ln-ctrl-bg": "#FFFFFF",
      "--ln-ctrl-hover": "#ECECEC",
      "--ln-station-bg": "#FFFFFF",
      "--ln-ink": "#111111",
      "--ln-ink-muted": "#595959",
      "--ln-sign-ink": "#FFFFFF",
      "--ln-sign-muted": "#C9C9C9",
      "--ln-dark-hover": "#000000",
      "--ln-border": "#D9D9D9",
      "--ln-focus": "#111111",
      "--ln-check-ink": "#FFFFFF",
    },
  },
];

/** Palettes shown in the picker, in display order. Others stay available in code. */
export const FEATURED_THEME_IDS = ["sunset-express", "metro-blue", "forest-green"] as const;

export const LINE_THEMES: LineTheme[] = FEATURED_THEME_IDS.map(
  (id) => ALL_LINE_THEMES.find((t) => t.id === id) as LineTheme,
);

export function getLineTheme(id: string | null | undefined): LineTheme {
  return LINE_THEMES.find((t) => t.id === id) ?? LINE_THEMES[0];
}
