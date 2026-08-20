# Dashboard Design

> Tokens used by the staff UI. Keep the dashboard light and readable on phones.

## Palette

| Token | Value | Use |
|-------|--------|-----|
| `--background` | `#f3efe6` | Page |
| `--foreground` | `#1c1917` | Text |
| `--card` | `#fffcf7` | Panels |
| `--line` | `#e7e0d4` | Borders |
| `--muted` | `#78716c` | Secondary text |
| `--accent` | `#0f5f5b` | Buttons, links |
| `--accent-hover` | `#0b4c49` | Button hover |
| `--danger` | `#b42318` | Errors |

Header bar is `#102422` (not a CSS token). Nav includes Queue, Contact, Inbox, Orders, Customers, Logs.

## Type

Geist Sans / Geist Mono via `app/layout.tsx`. Body uses the sans variable.

## Status colors

Parcel and outcome badges use Tailwind color chips in `components/badges.tsx` (amber pending, red delayed, emerald delivered/confirmed, etc.). Keep labels in `lib/constants.ts` in sync with DB check constraints.
