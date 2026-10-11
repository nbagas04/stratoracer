# DESIGN.md

## Identity & Purpose
**StratoRacer** is a high-precision endurance racing pit wall strategy calculator and stint simulation engine designed for endurance racing teams and sim racers (iRacing, ACC, Le Mans Ultimate). It provides tactical race clock computations, stint combination pruning, fuel management projections, and pit schedule timelines.

## Personality & Mood
- **Personality:** Tactical pit wall engineering, telemetry precision, functional clarity, high data density without cognitive clutter.
- **Mood:** Command center / pit wall timing stand under 24-hour endurance race conditions.
- **Theme Rationale (R-34/R-21):** Fixed high-contrast dark theme is an intentional domain requirement replicating real-world motorsport telemetry displays (WEC, IMSA, Blancpain) and sim racing cockpit rigs to eliminate glare and eye fatigue during multi-hour endurance sessions.

## Design Dials
- **ENERGY:** 2 (Focused, tactical engineering tool; purposeful accents without gratuitous flashing decoration).
- **RHYTHM:** 2 (Structured grid sections with varied card types and data matrices).
- **MOTION:** 1 (Functional transitions for modals and toggles; no distracting decorative animations).

## Typography
- **Primary Interface:** Plus Jakarta Sans (`font-sans`) for structural labels, navigation, and section headings.
- **Telemetry & Numbers:** JetBrains Mono (`font-mono`) with `tabular-nums` for all race clock times, lap counts, fuel liters, deltas, and matrix outputs to prevent number jitter.

## Palette & Contrast Standards (WCAG 2.1 AA)
- **Backgrounds:** `#080b0f` (viewport base), `#0f141c` (surface), `#151b26` (cards/panels).
- **Interactive Boundaries:** Border tokens calibrated to >= 3.0:1 contrast against dark background (WCAG 1.4.11 non-text contrast).
- **Text:**
  - High-contrast primary: `#f8fafc` / `#f1f5f9` (>= 15:1 against dark backgrounds).
  - Secondary/metadata: `#94a3b8` (Tailwind `slate-400`, >= 7.3:1 against dark surfaces).
  - Accent indicators: Cyan (`#22d3ee`), Emerald (`#10b981` / `#34d399`), Amber (`#f59e0b` / `#fbbf24`), Rose (`#f43f5e`).
- **Forbidden:** Low-contrast muted text (< 4.5:1), unannounced opacity dimming on interactive text, and decorative em dashes.
