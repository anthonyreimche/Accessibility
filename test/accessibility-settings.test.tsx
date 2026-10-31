// The Accessibility section in a DOM, over real zustand stores: the interface
// scale as the same − / + control as Preferences ▸ Interface and the welcome
// setup (ported from core's AccessibilitySettings.test.tsx), each toggle and
// the colour-vision choice writing its app setting, and the Preferences search
// hiding what doesn't match.

import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AccessibilitySettings } from "../src/AccessibilitySettings";
import { React, initRuntime } from "../src/rt";
import type { AppSettings } from "../src/safelight";
import { CLASSES } from "../src/styles";
import { fakeApi, type Rig } from "./support/fake-api";

afterEach(cleanup);

function mount(options: Parameters<typeof fakeApi>[0] = {}): Rig {
  const rig = fakeApi(options);
  initRuntime(rig.api);
  render(<AccessibilitySettings />);
  return rig;
}

const TOGGLES: [string, keyof AppSettings][] = [
  ["Match system accessibility settings", "syncOSAccessibility"],
  ["High contrast", "highContrast"],
  ["Larger text", "largerText"],
  ["Larger controls", "largerControls"],
  ["Lowercase headings", "lowercaseHeadings"],
  ["Strong focus indicator", "strongFocus"],
  ["Reduce transparency", "reduceTransparency"],
  ["Keyboard canvas editing", "keyboardCanvasEditing"],
  ["Editing highlights", "editingHighlights"],
  ["Reduce motion", "reduceMotion"],
];

describe("AccessibilitySettings", () => {
  it("sets the interface scale with − and + instead of a slider", () => {
    const rig = mount({ settings: { uiScale: 1 } });
    expect(screen.queryByRole("slider", { name: /Interface scale/ })).toBeNull();
    const group = screen.getByRole("group", { name: "Interface scale" });
    fireEvent.click(within(group).getByRole("button", { name: "Decrease interface scale" }));
    expect(rig.settings.getState().uiScale).toBe(0.9);
    expect(rig.updates).toEqual([{ uiScale: 0.9 }]);
    expect(within(group).getByText("90%")).toBeTruthy();
  });

  it("still says where else the control lives", () => {
    mount();
    const note = screen.getByText(/The same control lives under Interface/);
    expect(note.className).toBe(CLASSES.note);
  });

  it("shows the toggles in core's order", () => {
    mount();
    expect(screen.getAllByRole("switch").map((s) => s.textContent)).toEqual(TOGGLES.map(([label]) => label));
  });

  it.each(TOGGLES)("%s flips %s through the app settings", (label, key) => {
    const rig = mount();
    const before = rig.settings.getState()[key];
    const toggle = screen.getByRole("switch", { name: label });
    expect(toggle.getAttribute("aria-checked")).toBe(String(before));
    fireEvent.click(toggle);
    expect(rig.updates).toEqual([{ [key]: !before }]);
    expect(rig.settings.getState()[key]).toBe(!before);
    expect(screen.getByRole("switch", { name: label }).getAttribute("aria-checked")).toBe(String(!before));
  });

  it("picks a colour-vision simulation", () => {
    const rig = mount();
    const off = screen.getByRole("button", { name: "Off" });
    expect(off.getAttribute("aria-pressed")).toBe("true");
    expect(
      ["Off", "Protanopia", "Deuteranopia", "Tritanopia"].map((name) => screen.getByRole("button", { name })),
    ).toHaveLength(4);
    fireEvent.click(screen.getByRole("button", { name: "Deuteranopia" }));
    expect(rig.updates).toEqual([{ colorVisionFilter: "deuteranopia" }]);
    expect(screen.getByRole("button", { name: "Deuteranopia" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("follows settings changed elsewhere", () => {
    const rig = mount();
    act(() => rig.settings.setState({ highContrast: true, uiScale: 1.5 }));
    expect(screen.getByRole("switch", { name: "High contrast" }).getAttribute("aria-checked")).toBe("true");
    expect(screen.getByText("150%")).toBeTruthy();
  });

  it("hides what the Preferences search doesn't match, the scale note with its control", () => {
    mount({ search: "contrast" });
    expect(screen.getByRole("switch", { name: "High contrast" })).toBeTruthy();
    expect(screen.queryByRole("switch", { name: "Reduce motion" })).toBeNull();
    expect(screen.queryByRole("group", { name: "Interface scale" })).toBeNull();
    expect(screen.queryByText(/The same control lives under Interface/)).toBeNull();
  });

  it("keeps the scale note when the search finds the interface scale", () => {
    mount({ search: "interface scale" });
    expect(screen.getByRole("group", { name: "Interface scale" })).toBeTruthy();
    expect(screen.getByText(/The same control lives under Interface/)).toBeTruthy();
  });

  it("lays the section out as core's column, custom colours last", () => {
    mount();
    const stack = document.querySelector(`.${CLASSES.stack}`);
    expect(stack).not.toBeNull();
    expect(stack?.lastElementChild?.querySelector(`.${CLASSES.colorsTitle}`)?.textContent).toBe(
      "Custom colours — Safelight Neutral",
    );
  });
});
