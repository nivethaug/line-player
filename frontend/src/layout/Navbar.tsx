import { NavLink } from "react-router-dom";
import { Play, Home, TrainFront, SlidersHorizontal, Menu, X } from "lucide-react";
import { useState } from "react";

/* Line is the submission: the site opens on it and the header carries only Line.
   The brand itself links to /line, so the nav list is empty. Other pages stay routable (/home, /player, /flipbook, /showcase) but are not linked. */
const LINKS: { to: string; label: string; icon: typeof Play }[] = [];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex min-h-[44px] items-center gap-2 rounded-lg px-3 text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0c0e] ${
      isActive
        ? "bg-orange-500/15 text-orange-300"
        : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
    }`;

  return (
    <header
      data-da-source="src/layout/Navbar.tsx:Navbar"
      className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0c0c0e]/85 backdrop-blur-xl"
    >
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4"
      >
        <NavLink
          to="/line"
          className="flex items-center gap-2 font-semibold tracking-tight text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/70 rounded-lg"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/30">
            <Play className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="flex flex-col leading-tight">
            <span>Line</span>
            <span className="text-[11px] font-normal tracking-normal text-zinc-400">A transit-map skin for Video.js v10</span>
          </span>
        </NavLink>

        <div className="hidden items-center gap-1 sm:flex">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              data-testid={`navbar-link-${l.label.toLowerCase()}`}
              className={linkClass}
            >
              <l.icon className="h-4 w-4" aria-hidden="true" />
              {l.label}
            </NavLink>
          ))}
        </div>

        <button
          className="hidden min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-white/10 text-zinc-300 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/70"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          data-testid="sidebar-toggle-button"
          onClick={() => setOpen(!open)}
        >
          {open ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/5 bg-[#0c0c0e] md:hidden">
          <div className="mx-auto flex max-w-5xl flex-col p-2">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setOpen(false)}
                data-testid={`navbar-link-${l.label.toLowerCase()}`}
                className={({ isActive }) =>
                  `flex min-h-[44px] items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/70 ${
                    isActive
                      ? "bg-orange-500/15 text-orange-300"
                      : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
                  }`
                }
              >
                <l.icon className="h-4 w-4" aria-hidden="true" />
                {l.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
