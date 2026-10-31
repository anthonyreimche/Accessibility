# Accessibility for Safelight

Safelight's opt-in accessibility options, under **Preferences ▸ Extensions ▸
Accessibility**:

- **Match system accessibility settings:** follow the operating system's
  reduced-motion, increased-contrast and reduced-transparency preferences.
- **High contrast:** a maximal-contrast palette over the current theme.
- **Interface scale:** the whole interface from 80% to 200%, the same control
  as Interface ▸ Interface scale.
- **Larger text, Larger controls, Lowercase headings:** bigger small labels
  without all-caps, bigger hit targets, Title Case section headings.
- **Strong focus indicator, Reduce transparency, Reduce motion.**
- **Colour-vision simulation:** protanopia, deuteranopia or tritanopia over
  the whole window, photo included.
- **Keyboard canvas editing, Editing highlights:** arrow-key editing of canvas
  tools such as the tone curve, and the ring on the active point.
- **Custom colours:** retune any theme colour, saved per theme. Text colours
  show their contrast against the panel background.

Disabling the extension removes every one of these. The app stays
screen-reader navigable either way: names, roles, focus handling and the
focus ring are part of Safelight itself.

Until Safelight 3.2.0 this was the built-in `core.accessibility`. The
overlays are still applied by Safelight; the extension switches them on and
off and provides the settings.

## Development

```bash
npm install
npm run typecheck
npm run build    # dist/index.js, the file Safelight loads
npm test         # vitest; the bundle checks read dist/, so build first
npm run check    # all three, in that order
```

Safelight hands the extension its own React through `api.react`, so the
bundle never includes React. `src/safelight.d.ts` mirrors the part of the
app's extension API the extension uses.

## License

GPL-3.0-only with an attribution term (GPL v3 §7b), the same licence as Safelight; see LICENSE. Copyright (C) 2026 Anthony Reimche.
