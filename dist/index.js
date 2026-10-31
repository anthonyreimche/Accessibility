//#region src/rt.ts
var e, t;
function n(n) {
	t = n, e = n.react;
}
//#endregion
//#region src/styles.ts
var r = "safelight-a11y", i = {
	stack: `${r}-stack`,
	note: `${r}-note`,
	colorsHeader: `${r}-colors-header`,
	colorsTitle: `${r}-colors-title`,
	resetAll: `${r}-reset-all`,
	colorList: `${r}-color-list`,
	colorRow: `${r}-color-row`,
	colorLabel: `${r}-color-label`,
	contrast: `${r}-contrast`,
	contrastPass: `${r}-contrast-pass`,
	contrastFail: `${r}-contrast-fail`,
	swatch: `${r}-swatch`,
	hex: `${r}-hex`,
	clear: `${r}-clear`
}, a = i;
function o(e) {
	return `
:where(.${a.stack}) { display: flex; flex-direction: column; gap: 1rem; }
:where(.${a.note}) { margin-top: 0.25rem; font-size: 10px; line-height: 1.625; color: ${e.textMuted}; }
:where(.${a.colorsHeader}) { display: flex; align-items: center; justify-content: space-between; }
:where(.${a.colorsTitle}) { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: ${e.textMuted}; }
:where(.${a.resetAll}) { border-radius: 0.25rem; background-color: ${e.surface2}; padding: 0.125rem 0.5rem; font-size: 10px; color: ${e.textSecondary}; }
:where(.${a.colorList}) { margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.25rem; }
:where(.${a.colorRow}) { display: flex; align-items: center; gap: 0.5rem; }
:where(.${a.colorLabel}) { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 11px; color: ${e.textSecondary}; }
:where(.${a.contrast}) { font-variant-numeric: tabular-nums; font-size: 10px; }
:where(.${a.contrastPass}) { color: ${e.labelGreen}; }
:where(.${a.contrastFail}) { color: ${e.labelRed}; }
:where(.${a.swatch}) { height: 1.25rem; width: 1.5rem; flex-shrink: 0; cursor: pointer; border-radius: 0.25rem; border: 1px solid ${e.border}; background-color: transparent; padding: 0; }
:where(.${a.hex}) { width: 68px; flex-shrink: 0; border-radius: 0.25rem; background-color: ${e.surface2}; padding: 0.125rem 0.25rem; text-align: right; font-variant-numeric: tabular-nums; font-size: 11px; color: ${e.textPrimary}; outline-style: none; }
:where(.${a.clear}) { width: 1rem; flex-shrink: 0; color: ${e.textMuted}; }
@media (hover: hover) {
  :where(.${a.resetAll}:hover) { background-color: ${e.surface3}; color: ${e.textPrimary}; }
  :where(.${a.clear}:hover) { color: ${e.textPrimary}; }
}
:where(.${a.hex}:focus) { background-color: ${e.surface3}; }
:where(.${a.clear}:disabled) { opacity: 0.25; }
@media (hover: hover) { :where(.${a.clear}:disabled:hover) { color: ${e.textMuted}; } }
html.sl-larger-text .${a.note}, html.sl-larger-text .${a.colorsTitle}, html.sl-larger-text .${a.resetAll}, html.sl-larger-text .${a.contrast} { font-size: 12px !important; }
html.sl-larger-text .${a.colorLabel}, html.sl-larger-text .${a.hex} { font-size: 13px !important; line-height: 1.45 !important; }
html.sl-larger-text .${a.colorsTitle} { text-transform: none !important; letter-spacing: normal !important; }
html.sl-title-headings .${a.colorsTitle} { text-transform: capitalize !important; }
`;
}
//#endregion
//#region src/ColorOverrides.tsx
var s = [
	{
		var: "--color-surface-0",
		label: "Background — base"
	},
	{
		var: "--color-surface-1",
		label: "Background — panels"
	},
	{
		var: "--color-surface-2",
		label: "Background — raised"
	},
	{
		var: "--color-surface-3",
		label: "Background — raised +"
	},
	{
		var: "--color-surface-4",
		label: "Background — raised ++"
	},
	{
		var: "--color-border",
		label: "Border"
	},
	{
		var: "--color-border-subtle",
		label: "Border — subtle"
	},
	{
		var: "--color-text-primary",
		label: "Text — primary",
		text: !0
	},
	{
		var: "--color-text-secondary",
		label: "Text — secondary",
		text: !0
	},
	{
		var: "--color-text-muted",
		label: "Text — muted",
		text: !0
	},
	{
		var: "--color-accent",
		label: "Accent"
	},
	{
		var: "--color-accent-hover",
		label: "Accent — hover"
	},
	{
		var: "--color-slider-fill",
		label: "Controls / selection"
	}
];
function c(e) {
	let t = e.trim().replace(/^#/, "").toLowerCase();
	return /^[0-9a-f]{3}$/.test(t) ? {
		r: parseInt(t[0] + t[0], 16),
		g: parseInt(t[1] + t[1], 16),
		b: parseInt(t[2] + t[2], 16)
	} : /^[0-9a-f]{6}$/.test(t) ? {
		r: parseInt(t.slice(0, 2), 16),
		g: parseInt(t.slice(2, 4), 16),
		b: parseInt(t.slice(4, 6), 16)
	} : null;
}
function l(e) {
	let t = c(e);
	if (!t) return null;
	let n = (e) => e.toString(16).padStart(2, "0");
	return `#${n(t.r)}${n(t.g)}${n(t.b)}`;
}
function u(e) {
	let t = c(e);
	if (!t) return null;
	let n = (e) => {
		let t = e / 255;
		return t <= .03928 ? t / 12.92 : ((t + .055) / 1.055) ** 2.4;
	};
	return .2126 * n(t.r) + .7152 * n(t.g) + .0722 * n(t.b);
}
function d(e, t) {
	let n = u(e), r = u(t);
	if (n == null || r == null) return null;
	let i = Math.max(n, r), a = Math.min(n, r);
	return (i + .05) / (a + .05);
}
function f() {
	let n = t.registry.use((e) => e.themes), r = t.stores.useThemeStore((e) => e.activeId), a = t.stores.useSettings((e) => e.colorOverrides), o = n[r], c = o?.vars ?? {}, l = a[r] ?? {}, u = Object.keys(l).length > 0, f = (e) => l[e] ?? c[e] ?? "", m = f("--color-surface-1"), h = (e, n) => {
		t.appSettings.update({ colorOverrides: {
			...a,
			[r]: {
				...l,
				[e]: n
			}
		} });
	}, g = (e) => {
		let n = { ...l };
		delete n[e];
		let i = { ...a };
		Object.keys(n).length > 0 ? i[r] = n : delete i[r], t.appSettings.update({ colorOverrides: i });
	};
	return o ? /* @__PURE__ */ e.createElement("div", null, /* @__PURE__ */ e.createElement("div", { className: i.colorsHeader }, /* @__PURE__ */ e.createElement("span", { className: i.colorsTitle }, "Custom colours — ", o.name), u && /* @__PURE__ */ e.createElement("button", {
		onClick: () => {
			let e = { ...a };
			delete e[r], t.appSettings.update({ colorOverrides: e });
		},
		className: i.resetAll
	}, "Reset all")), /* @__PURE__ */ e.createElement("p", { className: i.note }, "Retune any colour for the current theme. Each field starts at the theme's own value; edited colours override the theme (and high contrast) and are saved per theme. Text colours show their contrast against the panel background — aim for 4.5:1 or higher."), /* @__PURE__ */ e.createElement("div", { className: i.colorList }, s.map((t) => /* @__PURE__ */ e.createElement(p, {
		key: t.var,
		label: t.label,
		value: f(t.var),
		overridden: l[t.var] != null,
		contrast: t.text ? d(f(t.var), m) : null,
		onSet: (e) => h(t.var, e),
		onClear: () => g(t.var)
	})))) : null;
}
function p({ label: t, value: n, overridden: r, contrast: a, onSet: o, onClear: s }) {
	let [c, u] = e.useState(n);
	e.useEffect(() => u(n), [n]);
	let d = l(n) ?? "#000000", f = (e) => {
		let t = l(e);
		t ? o(t) : u(n);
	}, p = a != null && a >= 4.5;
	return /* @__PURE__ */ e.createElement("div", { className: i.colorRow }, /* @__PURE__ */ e.createElement("span", {
		className: i.colorLabel,
		title: t
	}, t), a != null && /* @__PURE__ */ e.createElement("span", {
		className: `${i.contrast} ${p ? i.contrastPass : i.contrastFail}`,
		title: "Contrast against the panel background (WCAG AA needs 4.5:1)"
	}, a.toFixed(1), ":1 ", p ? "✓" : "✗"), /* @__PURE__ */ e.createElement("input", {
		type: "color",
		value: d,
		onChange: (e) => o(e.target.value),
		"aria-label": `${t} colour picker`,
		className: i.swatch
	}), /* @__PURE__ */ e.createElement("input", {
		type: "text",
		value: c,
		spellCheck: !1,
		onChange: (e) => u(e.target.value),
		onBlur: (e) => f(e.target.value),
		onKeyDown: (e) => {
			e.key === "Enter" && f(e.currentTarget.value);
		},
		"aria-label": `${t} hex value`,
		className: i.hex
	}), /* @__PURE__ */ e.createElement("button", {
		onClick: s,
		disabled: !r,
		"aria-label": `Reset ${t} to the theme default`,
		title: "Reset to theme default",
		className: i.clear
	}, "↺"));
}
//#endregion
//#region src/AccessibilitySettings.tsx
var m = [
	{
		value: "none",
		label: "Off"
	},
	{
		value: "protanopia",
		label: "Protanopia"
	},
	{
		value: "deuteranopia",
		label: "Deuteranopia"
	},
	{
		value: "tritanopia",
		label: "Tritanopia"
	}
];
function h() {
	let { Field: n, OptionRow: r, ToggleField: a, useFieldVisible: o } = t.preferences.fields, { ScaleStepper: s } = t.components, c = t.stores.useSettings, l = t.appSettings.update, u = c((e) => e.syncOSAccessibility), d = c((e) => e.highContrast), p = c((e) => e.uiScale), h = c((e) => e.largerText), g = c((e) => e.largerControls), _ = c((e) => e.lowercaseHeadings), v = c((e) => e.strongFocus), y = c((e) => e.reduceTransparency), b = c((e) => e.colorVisionFilter), x = c((e) => e.keyboardCanvasEditing), S = c((e) => e.editingHighlights), C = c((e) => e.reduceMotion), w = o("Interface scale");
	return /* @__PURE__ */ e.createElement("div", { className: i.stack }, /* @__PURE__ */ e.createElement(a, {
		label: "Match system accessibility settings",
		hint: "Also apply your operating system's reduced-motion, increased-contrast and reduced-transparency preferences. The options below add to these — they never switch a system preference back off. (Windows High Contrast mode is always respected.)",
		checked: u,
		onChange: (e) => l({ syncOSAccessibility: e })
	}), /* @__PURE__ */ e.createElement(a, {
		label: "High contrast",
		hint: "Override the current theme with a maximal-contrast palette (WCAG AA). The Dark and Neutral themes switch to a high-contrast dark palette; the Light theme to a high-contrast light one. Your default theme is left unchanged while this is off.",
		checked: d,
		onChange: (e) => l({ highContrast: e })
	}), /* @__PURE__ */ e.createElement("div", null, /* @__PURE__ */ e.createElement(n, { label: "Interface scale" }, /* @__PURE__ */ e.createElement(s, {
		value: p,
		onChange: (e) => l({ uiScale: e }),
		label: "Interface scale"
	})), w && /* @__PURE__ */ e.createElement("p", { className: i.note }, "Enlarges the whole interface — text included — up to 200%. The same control lives under Interface ▸ Interface scale.")), /* @__PURE__ */ e.createElement(a, {
		label: "Larger text",
		hint: "Enlarge the smallest labels and drop their all-caps styling so they read as words — without scaling the rest of the interface. Best for cramped labels; it can reflow tight rows.",
		checked: h,
		onChange: (e) => l({ largerText: e })
	}), /* @__PURE__ */ e.createElement(a, {
		label: "Larger controls",
		hint: "Grow buttons and inputs to a comfortable minimum size (≥24px) for easier pointing. Can loosen dense toolbars.",
		checked: g,
		onChange: (e) => l({ largerControls: e })
	}), /* @__PURE__ */ e.createElement(a, {
		label: "Lowercase headings",
		hint: "Show the all-caps section headings in Title Case (capitalise the first letter of each word) instead of UPPERCASE, which is harder to read at a glance.",
		checked: _,
		onChange: (e) => l({ lowercaseHeadings: e })
	}), /* @__PURE__ */ e.createElement(a, {
		label: "Strong focus indicator",
		hint: "Draw a thick outline around whichever control has keyboard focus, so it's easy to see where you are when navigating by keyboard.",
		checked: v,
		onChange: (e) => l({ strongFocus: e })
	}), /* @__PURE__ */ e.createElement(a, {
		label: "Reduce transparency",
		hint: "Make translucent backgrounds opaque so edges and content read clearly.",
		checked: y,
		onChange: (e) => l({ reduceTransparency: e })
	}), /* @__PURE__ */ e.createElement(n, {
		label: "Colour-vision simulation",
		hint: "Filters the whole window so you can check how the interface and your photo read to colour-blind viewers. This recolours the image too — turn it off for colour-critical editing."
	}, /* @__PURE__ */ e.createElement(r, {
		value: b,
		options: m,
		onChange: (e) => l({ colorVisionFilter: e })
	})), /* @__PURE__ */ e.createElement(a, {
		label: "Keyboard canvas editing",
		hint: "Edit direct-manipulation tools with the keyboard: focus a tool (e.g. the tone curve) and use the arrow keys. Also shows the tone curve's numeric point editor (In/Out, prev/next, add/remove).",
		checked: x,
		onChange: (e) => l({ keyboardCanvasEditing: e })
	}), /* @__PURE__ */ e.createElement(a, {
		label: "Editing highlights",
		hint: "Draw the selection/focus ring on the active point in canvas editors (such as the tone curve). Turn off to hide these visible editing highlights.",
		checked: S,
		onChange: (e) => l({ editingHighlights: e })
	}), /* @__PURE__ */ e.createElement(a, {
		label: "Reduce motion",
		hint: "Minimize animated UI affordances.",
		checked: C,
		onChange: (e) => l({ reduceMotion: e })
	}), /* @__PURE__ */ e.createElement(f, null));
}
//#endregion
//#region src/index.tsx
var g = "safelight.accessibility.styles", _ = /* @__PURE__ */ "a11y.wcag.contrast.vision.colour blind.color blind.colorblind.protanopia.deuteranopia.tritanopia.focus.zoom.magnify.scale.legible.readable.text size.font size.uppercase.caps.hit target.transparency.opacity.motion.system.os.prefers.forced colors.high contrast mode.keyboard".split(".");
function v(e) {
	n(e), e.accessibility.activate(), e.registerStylesheet({
		id: g,
		css: o(e.ui.tokens)
	}), e.registerSettings({
		title: "Accessibility",
		order: 0,
		fields: [],
		component: h,
		keywords: _
	});
}
function y() {
	t.accessibility.deactivate();
}
//#endregion
export { _ as SETTINGS_KEYWORDS, g as STYLESHEET_ID, v as activate, y as deactivate };

//# sourceMappingURL=index.js.map