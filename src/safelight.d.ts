// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

// The slice of Safelight's extension API this extension touches, mirrored from
// the app's src/extensions/types.ts, src/extensions/ui-kit.tsx,
// src/extensions/registry.ts, src/extensions/themes.ts,
// src/state/settings-store.ts, src/ui/components/ScaleStepper.tsx and
// src/ui/components/PreferencesDialog.tsx. Extensions are standalone bundles,
// so the host's source is not on the type path; React types come from
// @types/react (dev only).

import type { ComponentType, ReactNode } from "react";

export interface StoreApi<T> {
  (): T;
  <U>(selector: (state: T) => U): U;
  getState(): T;
  setState(partial: Partial<T> | ((s: T) => Partial<T>)): void;
  subscribe(listener: (state: T, prev: T) => void): () => void;
}

/** Colour-vision simulation filter over the whole window; "none" is off. */
export type ColorVisionFilter = "none" | "protanopia" | "deuteranopia" | "tritanopia";

/** Theme id → CSS variable → "#rrggbb". */
export type ColorOverrides = Record<string, Record<string, string>>;

/** The accessibility fields of the app's Preferences. Core's settings carry
 *  many more, which this extension never reads. */
export interface AppSettings {
  uiScale: number;
  reduceMotion: boolean;
  highContrast: boolean;
  strongFocus: boolean;
  colorVisionFilter: ColorVisionFilter;
  largerText: boolean;
  largerControls: boolean;
  lowercaseHeadings: boolean;
  reduceTransparency: boolean;
  syncOSAccessibility: boolean;
  keyboardCanvasEditing: boolean;
  colorOverrides: ColorOverrides;
  editingHighlights: boolean;
}

export interface ThemeContribution {
  id: string;
  name: string;
  colorScheme?: "light" | "dark";
  /** CSS custom properties applied to :root, e.g. { "--color-surface-0": "#fff" }. */
  vars: Record<string, string>;
}

export interface RegisteredTheme extends ThemeContribution {
  extensionId: string;
}

/** The contribution registry, as far as this extension reads it. */
export interface RegistryState {
  themes: Record<string, RegisteredTheme>;
}

export interface ThemeState {
  activeId: string;
}

/** A section under Preferences ▸ Extensions. */
export interface SettingsContribution {
  title?: string;
  /** Declarative fields; this extension has none, its component is the whole
   *  section. */
  fields: [];
  /** Sort position within the Extensions group (lower = higher up). */
  order?: number;
  /** Rendered instead of the declarative fields. */
  component?: ComponentType;
  /** Extra words that find this section in the Preferences search. */
  keywords?: string[];
}

/** A stylesheet applied to every app window after the core styles. Extension
 *  rules are unlayered, so they win over Tailwind utility classes at equal or
 *  lower specificity; disabling the extension removes the sheet. */
export interface StylesheetContribution {
  id: string;
  css: string;
}

/** The theme's CSS variables as `var(--color-…)` strings. */
export interface UiTokens {
  readonly surface2: string;
  readonly surface3: string;
  readonly border: string;
  readonly textPrimary: string;
  readonly textSecondary: string;
  readonly textMuted: string;
  readonly labelRed: string;
  readonly labelGreen: string;
}

export interface ScaleStepperProps {
  value: number;
  onChange: (value: number) => void;
  /** Accessible name of the control, e.g. "Interface scale". */
  label: string;
}

export interface FieldProps {
  label: string;
  hint?: string;
  children: ReactNode;
}

export interface ToggleFieldProps {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

export interface OptionRowProps<T extends string | number> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}

/** The field primitives Preferences sections are built from. Each hides itself
 *  while the Preferences search matches neither its label nor its hint. */
export interface PreferenceFields {
  Field(props: FieldProps): ReactNode;
  ToggleField(props: ToggleFieldProps): ReactNode;
  OptionRow<T extends string | number>(props: OptionRowProps<T>): ReactNode;
  /** Whether a control with this label and hint matches the Preferences search. */
  useFieldVisible(label: string, hint?: string): boolean;
}

export interface SafelightAPI {
  version: 1;
  extensionId: string;
  react: typeof import("react");
  registerSettings(c: SettingsContribution): void;
  registerStylesheet(c: StylesheetContribution): void;
  components: {
    /** The interface-scale control: − and + around the value, in 10% steps
     *  between 80% and 200%. */
    ScaleStepper: ComponentType<ScaleStepperProps>;
  };
  ui: { tokens: UiTokens };
  stores: {
    useSettings: StoreApi<AppSettings>;
    useThemeStore: StoreApi<ThemeState>;
  };
  /** The contribution registry, read-only. React hook. */
  registry: {
    use<T>(selector: (s: RegistryState) => T): T;
  };
  /** Write the app's Preferences; saved, with their side effects. */
  appSettings: {
    update(patch: Partial<AppSettings>): void;
  };
  preferences: {
    fields: PreferenceFields;
  };
  /** Apply the accessibility overlays and follow the settings, theme and OS
   *  (`activate`), or remove every trace of them (`deactivate`). Idempotent. */
  accessibility: {
    activate(): void;
    deactivate(): void;
  };
}

export interface ExtensionModule {
  activate(api: SafelightAPI): void;
  deactivate?(): void;
}
