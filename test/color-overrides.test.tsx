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
  it("normalises #rgb and rrggbb spellings and rejects the rest", () => {
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

  it("shows contrast against the panel background on the text rows only", () => {
    mount();
    const ratios = [...document.querySelectorAll(`.${CLASSES.contrast}`)];
    expect(ratios).toHaveLength(3);
    const primary = contrastRatio("#e8e8e8", "#222222") ?? 0;
    const muted = contrastRatio("#6a6a6a", "#222222") ?? 0;
    expect(ratios[0].textContent).toBe(`${primary.toFixed(1)}:1 ✓`);
    expect(ratios[0].classList.contains(CLASSES.contrastPass)).toBe(true);
    expect(ratios[2].textContent).toBe(`${muted.toFixed(1)}:1 ✗`);
    expect(ratios[2].classList.contains(CLASSES.contrastFail)).toBe(true);
  });

  it("saves a typed hex on Enter, normalised, for the active theme only", () => {
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
