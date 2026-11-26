// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

// The look core gave the Accessibility settings with Tailwind utilities, as
// plain CSS: the app's Tailwind build never scans an extension.

import type { UiTokens } from "./safelight";

const P = "safelight-a11y";

export const CLASSES = {
  stack: `${P}-stack`,
  note: `${P}-note`,
  colorsHeader: `${P}-colors-header`,
  colorsTitle: `${P}-colors-title`,
  colorList: `${P}-color-list`,
  colorRow: `${P}-color-row`,
  colorLabel: `${P}-color-label`,
  contrast: `${P}-contrast`,
  contrastPass: `${P}-contrast-pass`,
  contrastFail: `${P}-contrast-fail`,
  swatch: `${P}-swatch`,
} as const;

const C = CLASSES;

/** `:where()` drops every rule to zero specificity, so any stylesheet that
 *  restyles buttons or inputs wins over them as it wins over core's layered
 *  utilities. The last block repeats core's Accessibility ▸ Larger text and
 *  Lowercase headings rules for these classes, in core's order. The contrast
 *  colours are core's label palette, which `api.ui.tokens` does not carry. */
export function accessibilityCss(t: UiTokens): string {
  return `
:where(.${C.stack}) { display: flex; flex-direction: column; gap: 1rem; }
:where(.${C.note}) { margin-top: 0.25rem; font-size: 10px; line-height: 1.625; color: ${t.textMuted}; }
:where(.${C.colorsHeader}) { display: flex; align-items: center; justify-content: space-between; }
:where(.${C.colorsTitle}) { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: ${t.textMuted}; }
:where(.${C.colorList}) { margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.25rem; }
:where(.${C.colorRow}) { display: flex; align-items: center; gap: 0.5rem; }
:where(.${C.colorLabel}) { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 11px; color: ${t.textSecondary}; }
:where(.${C.contrast}) { font-variant-numeric: tabular-nums; font-size: 10px; }
:where(.${C.contrastPass}) { color: ${t.labelGreen}; }
:where(.${C.contrastFail}) { color: ${t.labelRed}; }
:where(.${C.swatch}) { height: 1.25rem; width: 1.5rem; flex-shrink: 0; cursor: pointer; border-radius: 0.25rem; border: 1px solid ${t.border}; background-color: transparent; padding: 0; }
html.sl-larger-text .${C.note}, html.sl-larger-text .${C.colorsTitle}, html.sl-larger-text .${C.contrast} { font-size: 12px !important; }
html.sl-larger-text .${C.colorLabel} { font-size: 13px !important; line-height: 1.45 !important; }
html.sl-larger-text .${C.colorsTitle} { text-transform: none !important; letter-spacing: normal !important; }
html.sl-title-headings .${C.colorsTitle} { text-transform: capitalize !important; }
`;
}
