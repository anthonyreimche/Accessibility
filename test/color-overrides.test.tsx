// Custom colours in a DOM, over real zustand stores: one row per themable
// token starting at the active theme's value, contrast ratios on the text
// rows, edits saved per theme through the app settings (hex field on Enter or
// blur, the native picker), invalid hex reverted, and single and whole-theme
// resets.

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ColorOverrides, OVERRIDE_FIELDS, contrastRatio, normalizeHex } from "../src/ColorOverrides";
import { React, initRuntime } from "../src/rt";
import { CLASSES } from "../src/styles";
import { LIGHT, NEUTRAL, fakeApi, type Rig } from "./support/fake-api";

afterEach(cleanup);

function mount(options: Parameters<typeof fakeApi>[0] = {}): Rig {
  const rig = fakeApi(options);
  initRuntime(rig.api);
  render(<ColorOverrides />);
  return rig;
}

const hex = (label: string) => screen.getByLabelText<HTMLInputElement>(`${label} hex value`);
const picker = (label: string) => screen.getByLabelText<HTMLInputElement>(`${label} colour picker`);
const clear = (label: string) => screen.getByLabelText<HTMLButtonElement>(`Reset ${label} to the theme default`);

describe("hex helpers", () => {
  it("normalizes #rgb and rrggbb spellings and rejects the rest", () => {
    expect(normalizeHex("#ABC")).toBe("#aabbcc");
    expect(normalizeHex(" 1a2B3c ")).toBe("#1a2b3c");
    expect(normalizeHex("#12345")).toBeNull();
    expect(normalizeHex("red")).toBeNull();
  });

  it("gives WCAG contrast ratios", () => {
    expect(contrastRatio("#000", "#fff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#777", "#777")).toBeCloseTo(1, 5);
    expect(contrastRatio("nope", "#fff")).toBeNull();
  });
});

describe("ColorOverrides", () => {
  it("lists every token for the active theme, starting at the theme's values", () => {
    mount();
    expect(screen.getByText("Custom colours — Safelight Neutral").className).toBe(CLASSES.colorsTitle);
    expect([...document.querySelectorAll(`.${CLASSES.colorLabel}`)].map((e) => e.textContent)).toEqual(
      OVERRIDE_FIELDS.map((f) => f.label),
    );
    expect(hex("Border").value).toBe("#3a3a3a");
    expect(picker("Border").value).toBe("#3a3a3a");
    expect(clear("Border").disabled).toBe(true);
    expect(screen.queryByRole("button", { name: "Reset all" })).toBeNull();
  });

  it("shows contrast on the text rows only: panel text against the panel, on-accent text against both fills", () => {
    mount();
    const ratios = [...document.querySelectorAll(`.${CLASSES.contrast}`)];
    expect(ratios).toHaveLength(4);
    const primary = contrastRatio("#e8e8e8", "#222222") ?? 0;
    const muted = contrastRatio("#6a6a6a", "#222222") ?? 0;
    expect(ratios[0].textContent).toBe(`${primary.toFixed(1)}:1 ✓`);
    expect(ratios[0].classList.contains(CLASSES.contrastPass)).toBe(true);
    expect(ratios[2].textContent).toBe(`${muted.toFixed(1)}:1 ✗`);
    expect(ratios[2].classList.contains(CLASSES.contrastFail)).toBe(true);
    const onAccent = Math.min(contrastRatio("#ffffff", "#2e2e2e") ?? 0, contrastRatio("#ffffff", "#333333") ?? 0);
    expect(ratios[3].textContent).toBe(`${onAccent.toFixed(1)}:1 ✓`);
  });

  it("shows the core's value for a token the theme doesn't set, not a blank or black", () => {
    mount();
    expect(hex("Text — on accent").value).toBe("#ffffff");
    expect(picker("Text — on accent").value).toBe("#ffffff");
    expect(clear("Text — on accent").disabled).toBe(true);
  });

  it("prefers the value the page actually computes for a token the theme doesn't set", () => {
    document.documentElement.style.setProperty("--color-on-accent", "#102030");
    try {
      mount();
      expect(hex("Text — on accent").value).toBe("#102030");
    } finally {
      document.documentElement.style.removeProperty("--color-on-accent");
    }
  });

  it("lets a user fix white button text on a light accent, re-measuring against both fills", () => {
    const rig = mount();
    const badge = () => [...document.querySelectorAll(`.${CLASSES.contrast}`)][3];
    fireEvent.change(hex("Accent"), { target: { value: "#f0c060" } });
    fireEvent.blur(hex("Accent"));
    expect(badge().textContent).toMatch(/✗$/);
    fireEvent.change(hex("Text — on accent"), { target: { value: "#000000" } });
    fireEvent.keyDown(hex("Text — on accent"), { key: "Enter" });
    expect(rig.settings.getState().colorOverrides[NEUTRAL.id]).toEqual({
      "--color-accent": "#f0c060",
      "--color-on-accent": "#000000",
    });
    const worst = Math.min(contrastRatio("#000000", "#f0c060") ?? 0, contrastRatio("#000000", "#2e2e2e") ?? 0);
    expect(badge().textContent).toBe(`${worst.toFixed(1)}:1 ${worst >= 4.5 ? "✓" : "✗"}`);
  });

  it("saves a typed hex on Enter, normalized, for the active theme only", () => {
    const rig = mount({ settings: { colorOverrides: { [LIGHT.id]: { "--color-border": "#000000" } } } });
    fireEvent.change(hex("Border"), { target: { value: "F0A" } });
    expect(rig.updates).toEqual([]);
    fireEvent.keyDown(hex("Border"), { key: "Enter" });
    expect(rig.settings.getState().colorOverrides).toEqual({
      [LIGHT.id]: { "--color-border": "#000000" },
      [NEUTRAL.id]: { "--color-border": "#ff00aa" },
    });
    expect(hex("Border").value).toBe("#ff00aa");
    expect(clear("Border").disabled).toBe(false);
    expect(screen.getByRole("button", { name: "Reset all" }).className).toBe(CLASSES.resetAll);
  });

  it("saves a typed hex on blur and reverts an invalid one", () => {
    const rig = mount();
    fireEvent.change(hex("Accent"), { target: { value: "#123456" } });
    fireEvent.blur(hex("Accent"));
    expect(rig.settings.getState().colorOverrides[NEUTRAL.id]).toEqual({ "--color-accent": "#123456" });
    fireEvent.change(hex("Accent"), { target: { value: "#12" } });
    fireEvent.blur(hex("Accent"));
    expect(hex("Accent").value).toBe("#123456");
    expect(rig.updates).toHaveLength(1);
  });

  it("saves a colour from the native picker and recomputes contrast", () => {
    const rig = mount();
    fireEvent.input(picker("Background — panels"), { target: { value: "#ffffff" } });
    expect(rig.settings.getState().colorOverrides[NEUTRAL.id]).toEqual({ "--color-surface-1": "#ffffff" });
    const primary = contrastRatio("#e8e8e8", "#ffffff") ?? 0;
    expect(document.querySelector(`.${CLASSES.contrast}`)?.textContent).toBe(`${primary.toFixed(1)}:1 ✗`);
  });

  it("resets one token, dropping the theme's entry when it was the last", () => {
    const rig = mount({
      settings: {
        colorOverrides: {
          [NEUTRAL.id]: { "--color-border": "#111111", "--color-accent": "#222222" },
          [LIGHT.id]: { "--color-border": "#000000" },
        },
      },
    });
    expect(hex("Border").value).toBe("#111111");
    fireEvent.click(clear("Border"));
    expect(rig.settings.getState().colorOverrides).toEqual({
      [NEUTRAL.id]: { "--color-accent": "#222222" },
      [LIGHT.id]: { "--color-border": "#000000" },
    });
    expect(hex("Border").value).toBe("#3a3a3a");
    fireEvent.click(clear("Accent"));
    expect(rig.settings.getState().colorOverrides).toEqual({ [LIGHT.id]: { "--color-border": "#000000" } });
    expect(screen.queryByRole("button", { name: "Reset all" })).toBeNull();
  });

  it("resets the whole theme and leaves other themes alone", () => {
    const rig = mount({
      settings: {
        colorOverrides: {
          [NEUTRAL.id]: { "--color-border": "#111111", "--color-accent": "#222222" },
          [LIGHT.id]: { "--color-border": "#000000" },
        },
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Reset all" }));
    expect(rig.updates).toEqual([{ colorOverrides: { [LIGHT.id]: { "--color-border": "#000000" } } }]);
    expect(hex("Accent").value).toBe("#333333");
  });

  it("follows a theme switch", () => {
    const rig = mount({ settings: { colorOverrides: { [LIGHT.id]: { "--color-border": "#000000" } } } });
    act(() => rig.theme.setState({ activeId: LIGHT.id }));
    expect(screen.getByText("Custom colours — Light")).toBeTruthy();
    expect(hex("Background — panels").value).toBe("#f4f4f4");
    expect(hex("Border").value).toBe("#000000");
  });

  it("renders nothing while the active theme isn't registered", () => {
    mount({ activeTheme: "missing.theme" });
    expect(document.body.textContent).toBe("");
  });
});
