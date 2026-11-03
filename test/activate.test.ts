// What activate() and deactivate() do: switch core's accessibility engine on
// and off, register the Accessibility section as core's core.accessibility
// did (title, order, no declarative fields, the custom component, the search
// keywords), and register the stylesheet that gives it core's look.

import { describe, expect, it } from "vitest";
import { AccessibilitySettings } from "../src/AccessibilitySettings";
import { SETTINGS_KEYWORDS, STYLESHEET_ID, activate, deactivate } from "../src/index";
import { CLASSES } from "../src/styles";
import { fakeApi } from "./support/fake-api";

describe("activate", () => {
  it("turns the accessibility engine on", () => {
    const rig = fakeApi();
    activate(rig.api);
    expect(rig.engine).toEqual(["activate"]);
  });

  it("registers exactly the Accessibility settings section, as core.accessibility did", () => {
    const rig = fakeApi();
    activate(rig.api);
    expect(rig.settingsSections).toEqual([
      {
        title: "Accessibility",
        order: 0,
        fields: [],
        component: AccessibilitySettings,
        keywords: SETTINGS_KEYWORDS,
      },
    ]);
  });

  it("keeps core's settings-search keywords", () => {
    expect(SETTINGS_KEYWORDS).toEqual([
      "a11y", "wcag", "contrast", "vision", "colour blind", "colour blind",
      "colorblind", "protanopia", "deuteranopia", "tritanopia", "focus",
      "zoom", "magnify", "scale", "legible", "readable", "text size",
      "font size", "uppercase", "caps", "hit target", "transparency",
      "opacity", "motion", "system", "os", "prefers", "forced colours",
      "high contrast mode", "keyboard",
    ]);
  });

  it("registers one stylesheet, coloured from the theme tokens", () => {
    const rig = fakeApi();
    activate(rig.api);
    expect(rig.stylesheets.map((s) => s.id)).toEqual([STYLESHEET_ID]);
    const css = rig.stylesheets[0].css;
    expect(css).toContain(`:where(.${CLASSES.note}) { margin-top: 0.25rem; font-size: 10px; line-height: 1.625; color: var(--color-text-muted); }`);
    expect(css).toContain(`:where(.${CLASSES.resetAll}:hover) { background-color: var(--color-surface-3); color: var(--color-text-primary); }`);
    expect(css).toContain(`:where(.${CLASSES.hex}:focus) { background-color: var(--color-surface-3); }`);
    expect(css).toContain(`:where(.${CLASSES.clear}:disabled) { opacity: 0.25; }`);
    expect(css).toContain("border: 1px solid var(--color-border)");
  });

  it("follows core's Larger text and Lowercase headings rules, title-case last", () => {
    const rig = fakeApi();
    activate(rig.api);
    const css = rig.stylesheets[0].css;
    const larger = css.indexOf(`html.sl-larger-text .${CLASSES.colorsTitle} { text-transform: none !important;`);
    const title = css.indexOf(`html.sl-title-headings .${CLASSES.colorsTitle} { text-transform: capitalize !important; }`);
    expect(larger).toBeGreaterThan(-1);
    expect(title).toBeGreaterThan(larger);
  });

  it("keeps every other rule at zero specificity", () => {
    const rig = fakeApi();
    activate(rig.api);
    const rules = rig.stylesheets[0].css
      .split("\n")
      .filter((line) => line.includes("safelight-a11y-") && !line.startsWith("html.sl-"));
    expect(rules.length).toBeGreaterThan(0);
    expect(rules.every((line) => line.trim().startsWith(":where(") || line.startsWith("@media"))).toBe(true);
  });
});

describe("deactivate", () => {
  it("turns the accessibility engine off", () => {
    const rig = fakeApi();
    activate(rig.api);
    deactivate();
    expect(rig.engine).toEqual(["activate", "deactivate"]);
  });
});
