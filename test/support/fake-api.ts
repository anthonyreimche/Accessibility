// A stand-in Safelight API over real React and zustand. The settings, theme
// and registry stores are real stores; `appSettings.update` merges into the
// settings store as core's updateSettings does and records each patch. The
// Preferences field primitives and the ScaleStepper copy core's markup and
// behaviour (labels, roles, hint text, the search filter, 10% steps between
// 80% and 200%). Every registration and engine call is recorded.

import * as React from "react";
import { create } from "zustand";
import type {
  AppSettings,
  FieldProps,
  OptionRowProps,
  PreferenceFields,
  RegisteredTheme,
  RegistryState,
  SafelightAPI,
  ScaleStepperProps,
  SettingsContribution,
  StoreApi,
  StylesheetContribution,
  ThemeState,
  ToggleFieldProps,
  UiTokens,
} from "../../src/safelight";

const h = React.createElement;

export const TOKENS: UiTokens = {
  surface2: "var(--color-surface-2)",
  surface3: "var(--color-surface-3)",
  border: "var(--color-border)",
  textPrimary: "var(--color-text-primary)",
  textSecondary: "var(--color-text-secondary)",
  textMuted: "var(--color-text-muted)",
  labelRed: "var(--color-label-red)",
  labelGreen: "var(--color-label-green)",
};

export const DEFAULT_SETTINGS: AppSettings = {
  uiScale: 1,
  reduceMotion: false,
  highContrast: false,
  strongFocus: false,
  colorVisionFilter: "none",
  largerText: false,
  largerControls: false,
  lowercaseHeadings: false,
  reduceTransparency: false,
  syncOSAccessibility: true,
  keyboardCanvasEditing: false,
  colorOverrides: {},
  editingHighlights: true,
};

export const NEUTRAL: RegisteredTheme = {
  id: "core.neutral",
  name: "Safelight Neutral",
  extensionId: "core.themes",
  vars: {
    "--color-surface-0": "#1a1a1a",
    "--color-surface-1": "#222222",
    "--color-surface-2": "#2a2a2a",
    "--color-surface-3": "#333333",
    "--color-surface-4": "#3c3c3c",
    "--color-border": "#3a3a3a",
    "--color-border-subtle": "#2e2e2e",
    "--color-text-primary": "#e8e8e8",
    "--color-text-secondary": "#a0a0a0",
    "--color-text-muted": "#6a6a6a",
    "--color-accent": "#333333",
    "--color-accent-hover": "#3c3c3c",
    "--color-slider-fill": "#2e2e2e",
  },
};

export const LIGHT: RegisteredTheme = {
  id: "core.light",
  name: "Light",
  extensionId: "core.themes",
  colorScheme: "light",
  vars: { ...NEUTRAL.vars, "--color-surface-1": "#f4f4f4", "--color-text-primary": "#111111" },
};

export type EngineCall = "activate" | "deactivate";

export interface Rig {
  api: SafelightAPI;
  settings: StoreApi<AppSettings>;
  theme: StoreApi<ThemeState>;
  registry: StoreApi<RegistryState>;
  /** Every `appSettings.update` patch, in order. */
  updates: Partial<AppSettings>[];
  /** Every accessibility engine call, in order. */
  engine: EngineCall[];
  settingsSections: SettingsContribution[];
  stylesheets: StylesheetContribution[];
}

function makeFields(search: string): PreferenceFields {
  const q = search.trim().toLowerCase();
  const useFieldVisible = (label: string, hint?: string): boolean =>
    !q || label.toLowerCase().includes(q) || (hint?.toLowerCase().includes(q) ?? false);
  const hintNode = (hint?: string) => (hint ? h("p", null, hint) : null);
  function Field({ label, hint, children }: FieldProps) {
    if (!useFieldVisible(label, hint)) return null;
    return h("div", null, h("div", null, label), h("div", null, children), hintNode(hint));
  }
  function ToggleField({ label, hint, checked, onChange }: ToggleFieldProps) {
    if (!useFieldVisible(label, hint)) return null;
    return h(
      "div",
      null,
      h(
        "button",
        { type: "button", role: "switch", "aria-checked": checked, onClick: () => onChange(!checked) },
        h("span", null, label),
      ),
      hintNode(hint),
    );
  }
  function OptionRow<T extends string | number>({ value, options, onChange }: OptionRowProps<T>) {
    return h(
      "div",
      null,
      options.map((o) =>
        h("button", { key: String(o.value), onClick: () => onChange(o.value), "aria-pressed": o.value === value }, o.label),
      ),
    );
  }
  return { Field, ToggleField, OptionRow, useFieldVisible };
}

const UI_SCALE_MIN = 0.8;
const UI_SCALE_MAX = 2;
const stepUiScale = (value: number, direction: -1 | 1): number => {
  const tenths = value * 10;
  const next = direction > 0 ? Math.floor(tenths + 1e-6) + 1 : Math.ceil(tenths - 1e-6) - 1;
  return Math.min(UI_SCALE_MAX, Math.max(UI_SCALE_MIN, next / 10));
};
const canStepUiScale = (value: number, direction: -1 | 1): boolean =>
  direction > 0 ? value < UI_SCALE_MAX - 1e-6 : value > UI_SCALE_MIN + 1e-6;

function ScaleStepper({ value, onChange, label }: ScaleStepperProps) {
  const name = label.toLowerCase();
  const step = (direction: -1 | 1) => {
    if (canStepUiScale(value, direction)) onChange(stepUiScale(value, direction));
  };
  return h(
    "div",
    { role: "group", "aria-label": label },
    h(
      "button",
      { type: "button", "aria-label": `Decrease ${name}`, "aria-disabled": !canStepUiScale(value, -1) || undefined, onClick: () => step(-1) },
      "−",
    ),
    h("output", { "aria-live": "polite" }, `${Math.round(value * 100)}%`),
    h(
      "button",
      { type: "button", "aria-label": `Increase ${name}`, "aria-disabled": !canStepUiScale(value, 1) || undefined, onClick: () => step(1) },
      "+",
    ),
  );
}

export function fakeApi({
  settings: initial = {},
  themes = [NEUTRAL, LIGHT],
  activeTheme = NEUTRAL.id,
  search = "",
}: {
  settings?: Partial<AppSettings>;
  themes?: RegisteredTheme[];
  activeTheme?: string;
  search?: string;
} = {}): Rig {
  const updates: Partial<AppSettings>[] = [];
  const engine: EngineCall[] = [];
  const settingsSections: SettingsContribution[] = [];
  const stylesheets: StylesheetContribution[] = [];
  const settings: StoreApi<AppSettings> = create<AppSettings>()(() => ({ ...DEFAULT_SETTINGS, ...initial }));
  const theme: StoreApi<ThemeState> = create<ThemeState>()(() => ({ activeId: activeTheme }));
  const registry: StoreApi<RegistryState> = create<RegistryState>()(() => ({
    themes: Object.fromEntries(themes.map((t) => [t.id, t])),
  }));
  const api: SafelightAPI = {
    version: 1,
    extensionId: "safelight.accessibility",
    react: React,
    registerSettings: (c) => void settingsSections.push(c),
    registerStylesheet: (c) => void stylesheets.push(c),
    components: { ScaleStepper },
    ui: { tokens: TOKENS },
    stores: { useSettings: settings, useThemeStore: theme },
    registry: { use: (selector) => registry(selector) },
    appSettings: {
      update: (patch) => {
        updates.push(patch);
        settings.setState(patch);
      },
    },
    preferences: { fields: makeFields(search) },
    accessibility: {
      activate: () => void engine.push("activate"),
      deactivate: () => void engine.push("deactivate"),
    },
  };
  return { api, settings, theme, registry, updates, engine, settingsSections, stylesheets };
}
