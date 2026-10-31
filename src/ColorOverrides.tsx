// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

// Custom UI colour overrides for the active theme: retune any of the themable
// colour tokens with a hex field + native colour picker when the theme's own
// choices don't suit (low vision, bright ambient light, personal preference).
// Overrides are stored per theme in the app settings and applied over the
// theme — and over high contrast — by core's accessibility engine. Text
// colours show a live WCAG contrast ratio against the panel background so
// users can self-correct.

import { React, api } from "./rt";
import { CLASSES } from "./styles";

export const OVERRIDE_FIELDS: { var: string; label: string; text?: boolean }[] = [
  { var: "--color-surface-0", label: "Background — base" },
  { var: "--color-surface-1", label: "Background — panels" },
  { var: "--color-surface-2", label: "Background — raised" },
  { var: "--color-surface-3", label: "Background — raised +" },
  { var: "--color-surface-4", label: "Background — raised ++" },
  { var: "--color-border", label: "Border" },
  { var: "--color-border-subtle", label: "Border — subtle" },
  { var: "--color-text-primary", label: "Text — primary", text: true },
  { var: "--color-text-secondary", label: "Text — secondary", text: true },
  { var: "--color-text-muted", label: "Text — muted", text: true },
  { var: "--color-accent", label: "Accent" },
  { var: "--color-accent-hover", label: "Accent — hover" },
  { var: "--color-slider-fill", label: "Controls / selection" },
];

/** Parse #rgb / #rrggbb (with or without #) → {r,g,b} 0..255, or null. */
function parseHex(raw: string): { r: number; g: number; b: number } | null {
  const m = raw.trim().replace(/^#/, "").toLowerCase();
  if (/^[0-9a-f]{3}$/.test(m)) {
    return {
      r: parseInt(m[0] + m[0], 16),
      g: parseInt(m[1] + m[1], 16),
      b: parseInt(m[2] + m[2], 16),
    };
  }
  if (/^[0-9a-f]{6}$/.test(m)) {
    return {
      r: parseInt(m.slice(0, 2), 16),
      g: parseInt(m.slice(2, 4), 16),
      b: parseInt(m.slice(4, 6), 16),
    };
  }
  return null;
}

/** Normalise any accepted hex spelling to #rrggbb, or null if invalid. */
export function normalizeHex(raw: string): string | null {
  const c = parseHex(raw);
  if (!c) return null;
  const h = (n: number) => n.toString(16).padStart(2, "0");
  return `#${h(c.r)}${h(c.g)}${h(c.b)}`;
}

function relLuminance(hex: string): number | null {
  const c = parseHex(hex);
  if (!c) return null;
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
}

/** WCAG contrast ratio between two hex colours, or null if either is invalid. */
export function contrastRatio(a: string, b: string): number | null {
  const la = relLuminance(a);
  const lb = relLuminance(b);
  if (la == null || lb == null) return null;
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

export function ColorOverrides() {
  const themes = api.registry.use((s) => s.themes);
  const activeId = api.stores.useThemeStore((s) => s.activeId);
  const overridesAll = api.stores.useSettings((s) => s.colorOverrides);

  const theme = themes[activeId];
  const themeVars = theme?.vars ?? {};
  const ov = overridesAll[activeId] ?? {};
  const anyOverridden = Object.keys(ov).length > 0;

  const effective = (k: string): string => ov[k] ?? themeVars[k] ?? "";
  const surface1 = effective("--color-surface-1");

  const setOverride = (k: string, hex: string) => {
    api.appSettings.update({
      colorOverrides: { ...overridesAll, [activeId]: { ...ov, [k]: hex } },
    });
  };
  const clearOverride = (k: string) => {
    const themeOv = { ...ov };
    delete themeOv[k];
    const next = { ...overridesAll };
    if (Object.keys(themeOv).length > 0) next[activeId] = themeOv;
    else delete next[activeId];
    api.appSettings.update({ colorOverrides: next });
  };
  const resetAll = () => {
    const next = { ...overridesAll };
    delete next[activeId];
    api.appSettings.update({ colorOverrides: next });
  };

  if (!theme) return null;

  return (
    <div>
      <div className={CLASSES.colorsHeader}>
        <span className={CLASSES.colorsTitle}>Custom colours — {theme.name}</span>
        {anyOverridden && (
          <button onClick={resetAll} className={CLASSES.resetAll}>
            Reset all
          </button>
        )}
      </div>
      <p className={CLASSES.note}>
        Retune any colour for the current theme. Each field starts at the theme's
        own value; edited colours override the theme (and high contrast) and are
        saved per theme. Text colours show their contrast against the panel
        background — aim for 4.5:1 or higher.
      </p>
      <div className={CLASSES.colorList}>
        {OVERRIDE_FIELDS.map((f) => (
          <ColorRow
            key={f.var}
            label={f.label}
            value={effective(f.var)}
            overridden={ov[f.var] != null}
            contrast={f.text ? contrastRatio(effective(f.var), surface1) : null}
            onSet={(hex) => setOverride(f.var, hex)}
            onClear={() => clearOverride(f.var)}
          />
        ))}
      </div>
    </div>
  );
}

function ColorRow({
  label,
  value,
  overridden,
  contrast,
  onSet,
  onClear,
}: {
  label: string;
  value: string;
  overridden: boolean;
  contrast: number | null;
  onSet: (hex: string) => void;
  onClear: () => void;
}) {
  // Local text so intermediate/invalid typing doesn't fight the controlled value;
  // commit only valid hex, revert to the effective value on blur if invalid.
  const [text, setText] = React.useState(value);
  React.useEffect(() => setText(value), [value]);

  const pickerValue = normalizeHex(value) ?? "#000000";
  const commit = (raw: string) => {
    const hex = normalizeHex(raw);
    if (hex) onSet(hex);
    else setText(value);
  };
  const aaPass = contrast != null && contrast >= 4.5;

  return (
    <div className={CLASSES.colorRow}>
      <span className={CLASSES.colorLabel} title={label}>
        {label}
      </span>
      {contrast != null && (
        <span
          className={`${CLASSES.contrast} ${aaPass ? CLASSES.contrastPass : CLASSES.contrastFail}`}
          title={`Contrast against the panel background (WCAG AA needs 4.5:1)`}
        >
          {contrast.toFixed(1)}:1 {aaPass ? "✓" : "✗"}
        </span>
      )}
      <input
        type="color"
        value={pickerValue}
        onChange={(e) => onSet(e.target.value)}
        aria-label={`${label} colour picker`}
        className={CLASSES.swatch}
      />
      <input
        type="text"
        value={text}
        spellCheck={false}
        onChange={(e) => setText(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit(e.currentTarget.value);
        }}
        aria-label={`${label} hex value`}
        className={CLASSES.hex}
      />
      <button
        onClick={onClear}
        disabled={!overridden}
        aria-label={`Reset ${label} to the theme default`}
        title="Reset to theme default"
        className={CLASSES.clear}
      >
        ↺
      </button>
    </div>
  );
}
