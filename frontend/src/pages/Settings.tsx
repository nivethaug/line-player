import { useEffect, useState } from "react";
import { Settings as SettingsIcon, Check } from "lucide-react";
import { getApiUrl } from "@/lib/api-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Tab = "player" | "skin" | "preferences";

const TABS: { id: Tab; label: string }[] = [
  { id: "player", label: "Player" },
  { id: "skin", label: "Skin" },
  { id: "preferences", label: "Preferences" },
];

export default function Settings() {
  const [tab, setTab] = useState<Tab>("skin");
  const [accent, setAccent] = useState("#7c3aed");
  const [radius, setRadius] = useState("14");
  const [preload, setPreload] = useState("auto");
  const [autoplay, setAutoplay] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(getApiUrl("/api/settings"))
      .then((r) => r.json())
      .then((j) => {
        if (j?.success && j.data) {
          setAccent(j.data.accent ?? accent);
          setRadius(String(j.data.radius ?? radius));
          setPreload(j.data.preload ?? preload);
          setAutoplay(Boolean(j.data.autoplay));
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const valid =
    /^#[0-9a-fA-F]{6}$/.test(accent) &&
    /^\d+$/.test(radius) &&
    +radius >= 0 &&
    +radius <= 48;

  const save = async () => {
    if (!valid) {
      setError("Accent must be a hex color and radius 0–48px.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const res = await fetch(getApiUrl("/api/settings"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accent, radius: Number(radius), preload, autoplay }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("Could not save preferences to the server.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section
        data-da-source="src/pages/Settings.tsx:Header"
        className="mx-auto w-full max-w-3xl px-4 pt-10 pb-6 text-center"
      >
        <h1 className="inline-flex items-center gap-2 text-3xl font-bold tracking-tight md:text-4xl">
          <SettingsIcon className="h-7 w-7 text-violet-500" aria-hidden="true" />
          Settings
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Tune the player's skin and behavior. Saved to the backend.
        </p>
      </section>

      <section
        data-da-source="src/pages/Settings.tsx:SettingsForm"
        className="mx-auto w-full max-w-3xl px-4 pb-16"
      >
        <div
          role="tablist"
          aria-label="Settings sections"
          className="mb-5 flex gap-1 rounded-xl border bg-card p-1"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`min-h-[44px] flex-1 rounded-lg px-4 text-sm font-medium transition-all duration-300 ${
                tab === t.id
                  ? "bg-gradient-to-r from-violet-500 to-blue-500 text-white shadow"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          {tab === "skin" && (
            <div className="grid gap-5 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="accent">Accent color (hex)</Label>
                <Input
                  id="accent"
                  aria-label="Accent color hex value"
                  value={accent}
                  onChange={(e) => setAccent(e.target.value)}
                  placeholder="#7c3aed"
                />
                {!/^#[0-9a-fA-F]{6}$/.test(accent) && (
                  <p className="text-xs text-red-500">Use a #rrggbb hex color.</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="radius">Corner radius (px)</Label>
                <Input
                  id="radius"
                  aria-label="Corner radius in pixels"
                  inputMode="numeric"
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                />
              </div>
            </div>
          )}
          {tab === "player" && (
            <div className="grid gap-5 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="preload">Preload strategy</Label>
                <select
                  id="preload"
                  aria-label="Preload strategy"
                  value={preload}
                  onChange={(e) => setPreload(e.target.value)}
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                >
                  <option value="auto">auto</option>
                  <option value="metadata">metadata</option>
                  <option value="none">none</option>
                </select>
              </div>
              <label className="flex min-h-[44px] items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  aria-label="Enable autoplay"
                  checked={autoplay}
                  onChange={(e) => setAutoplay(e.target.checked)}
                  className="h-4 w-4 accent-violet-600"
                />
                Attempt autoplay when the player mounts
              </label>
            </div>
          )}
          {tab === "preferences" && (
            <p className="text-sm text-muted-foreground">
              Account-level preferences (theme, locale, notifications) arrive
              once the backend is connected in a later session.
            </p>
          )}

          {error && (
            <p className="mt-4 text-sm text-red-500" aria-live="assertive">
              {error}
            </p>
          )}
          {saved && (
            <p
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-emerald-600"
              aria-live="polite"
            >
              <Check className="h-4 w-4" aria-hidden="true" /> Saved
            </p>
          )}

          <div className="mt-6 flex gap-3">
            <Button
              data-testid="settings-save-button"
              disabled={saving}
              onClick={save}
              className="min-h-[44px] bg-gradient-to-r from-violet-500 to-blue-500 text-white hover:opacity-90"
            >
              Save changes
            </Button>
            <Button
              variant="outline"
              className="min-h-[44px]"
              onClick={() => {
                setAccent("#7c3aed");
                setRadius("14");
                setPreload("auto");
                setAutoplay(false);
                setError("");
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
