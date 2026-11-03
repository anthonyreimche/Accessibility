// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

// Turns on Safelight's opt-in accessibility overlays and adds their section to
// Preferences ▸ Extensions. It was core's built-in `core.accessibility` until
// Safelight 3.2.0. The engine stays in core, where core components read it;
// disabling this extension removes every overlay. The baseline semantics
// (names, roles, focus trap, landmarks, the focus ring) are core's and stay.

import { AccessibilitySettings } from "./AccessibilitySettings";
import { api, initRuntime } from "./rt";
import type { SafelightAPI } from "./safelight";
import { accessibilityCss } from "./styles";

export const STYLESHEET_ID = "safelight.accessibility.styles";

export const SETTINGS_KEYWORDS = [
  "a11y", "wcag", "contrast", "vision", "colour blind", "colour blind",
  "colorblind", "protanopia", "deuteranopia", "tritanopia", "focus",
  "zoom", "magnify", "scale", "legible", "readable", "text size",
  "font size", "uppercase", "caps", "hit target", "transparency",
  "opacity", "motion", "system", "os", "prefers", "forced colours",
  "high contrast mode", "keyboard",
];

export function activate(host: SafelightAPI): void {
  initRuntime(host);
  host.accessibility.activate();
  host.registerStylesheet({ id: STYLESHEET_ID, css: accessibilityCss(host.ui.tokens) });
  host.registerSettings({
    title: "Accessibility",
    order: 0,
    fields: [],
    component: AccessibilitySettings,
    keywords: SETTINGS_KEYWORDS,
  });
}

export function deactivate(): void {
  api.accessibility.deactivate();
}
