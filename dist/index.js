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
	colorList: `${r}-color-list`,
	colorRow: `${r}-color-row`,
	colorLabel: `${r}-color-label`,
	contrast: `${r}-contrast`,
	contrastPass: `${r}-contrast-pass`,
	contrastFail: `${r}-contrast-fail`,
	swatch: `${r}-swatch`
}, a = i;
function o(e) {
	return `
:where(.${a.stack}) { display: flex; flex-direction: column; gap: 1rem; }
:where(.${a.note}) { margin-top: 0.25rem; font-size: 10px; line-height: 1.625; color: ${e.textMuted}; }
:where(.${a.colorsHeader}) { display: flex; align-items: center; justify-content: space-between; }
:where(.${a.colorsTitle}) { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: ${e.textMuted}; }
:where(.${a.colorList}) { margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.25rem; }
:where(.${a.colorRow}) { display: flex; align-items: center; gap: 0.5rem; }
:where(.${a.colorLabel}) { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 11px; color: ${e.textSecondary}; }
:where(.${a.contrast}) { font-variant-numeric: tabular-nums; font-size: 10px; }
:where(.${a.contrastPass}) { color: ${e.labelGreen}; }
:where(.${a.contrastFail}) { color: ${e.labelRed}; }
:where(.${a.swatch}) { height: 1.25rem; width: 1.5rem; flex-shrink: 0; cursor: pointer; border-radius: 0.25rem; border: 1px solid ${e.border}; background-color: transparent; padding: 0; }
html.sl-larger-text .${a.note}, html.sl-larger-text .${a.colorsTitle}, html.sl-larger-text .${a.contrast} { font-size: 12px !important; }
html.sl-larger-text .${a.colorLabel} { font-size: 13px !important; line-height: 1.45 !important; }
html.sl-larger-text .${a.colorsTitle} { text-transform: none !important; letter-spacing: normal !important; }
html.sl-title-headings .${a.colorsTitle} { text-transform: capitalize !important; }
`;
}
//#endregion
//#region src/ColorOverrides.tsx
var s = "Retune any colour for the current theme. Each field starts at the theme's own value; edited colours override the theme (and high contrast) and are saved per theme. Text colours show their contrast against the panel background: aim for 4.5:1 or higher.", c = [
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
	},
	{
		var: "--color-on-accent",
		label: "Text — on accent",
		text: !0,
		against: ["--color-slider-fill", "--color-accent"]
	}
], l = { "--color-on-accent": "#ffffff" };
function u(e) {
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
function d(e) {
	let t = u(e);
	if (!t) return null;
	let n = (e) => e.toString(16).padStart(2, "0");
	return `#${n(t.r)}${n(t.g)}${n(t.b)}`;
}
function f(e) {
	let t = u(e);
	if (!t) return null;
	let n = (e) => {
		let t = e / 255;
		return t <= .03928 ? t / 12.92 : ((t + .055) / 1.055) ** 2.4;
	};
	return .2126 * n(t.r) + .7152 * n(t.g) + .0722 * n(t.b);
}
function p(e, t) {
	let n = f(e), r = f(t);
	if (n == null || r == null) return null;
	let i = Math.max(n, r), a = Math.min(n, r);
	return (i + .05) / (a + .05);
}
function m(e) {
	return d(getComputedStyle(document.documentElement).getPropertyValue(e)) ?? l[e] ?? "";
}
function h(e, t, n) {
	let r = (t.length > 0 ? t : [n]).map((t) => p(e, t));
	return r.some((e) => e == null) ? null : Math.min(...r);
}
function g() {
	let { Button: n } = t.ui, r = t.registry.use((e) => e.themes), a = t.stores.useThemeStore((e) => e.activeId), o = t.stores.useSettings((e) => e.colorOverrides), l = r[a], u = l?.vars ?? {}, d = o[a] ?? {}, f = Object.keys(d).length > 0, p = (e) => d[e] ?? u[e] ?? m(e), g = p("--color-surface-1"), v = (e, n) => {
		t.appSettings.update({ colorOverrides: {
			...o,
			[a]: {
				...d,
				[e]: n
			}
		} });
	}, y = (e) => {
		let n = { ...d };
		delete n[e];
		let r = { ...o };
		Object.keys(n).length > 0 ? r[a] = n : delete r[a], t.appSettings.update({ colorOverrides: r });
	};
	return l ? /* @__PURE__ */ e.createElement("div", null, /* @__PURE__ */ e.createElement("div", { className: i.colorsHeader }, /* @__PURE__ */ e.createElement("span", {
		className: i.colorsTitle,
		title: s
	}, "Custom colours — ", l.name), f && /* @__PURE__ */ e.createElement(n, {
		size: "sm",
		onClick: () => {
			let e = { ...o };
			delete e[a], t.appSettings.update({ colorOverrides: e });
		}
	}, "Reset all")), /* @__PURE__ */ e.createElement("div", { className: i.colorList }, c.map((t) => /* @__PURE__ */ e.createElement(_, {
		key: t.var,
		label: t.label,
		value: p(t.var),
		overridden: d[t.var] != null,
		contrast: t.text ? h(p(t.var), (t.against ?? []).map(p), g) : null,
		against: t.against ? "both fills it sits on" : "the panel background",
		onSet: (e) => v(t.var, e),
		onClear: () => y(t.var)
	})))) : null;
}
function _({ label: n, value: r, overridden: a, contrast: o, against: s, onSet: c, onClear: l }) {
	let { Button: u, TextInput: f } = t.ui, [p, m] = e.useState(r);
	e.useEffect(() => m(r), [r]);
	let h = d(r) ?? "#000000", g = (e) => {
		let t = d(e);
		t ? c(t) : m(r);
	}, _ = o != null && o >= 4.5;
	return /* @__PURE__ */ e.createElement("div", { className: i.colorRow }, /* @__PURE__ */ e.createElement("span", {
		className: i.colorLabel,
		title: n
	}, n), o != null && /* @__PURE__ */ e.createElement("span", {
		className: `${i.contrast} ${_ ? i.contrastPass : i.contrastFail}`,
		title: `Contrast against ${s} (WCAG AA needs 4.5:1)`
	}, o.toFixed(1), ":1 ", _ ? "✓" : "✗"), /* @__PURE__ */ e.createElement("input", {
		type: "color",
		value: h,
		onChange: (e) => c(e.target.value),
		"aria-label": `${n} colour picker`,
		className: i.swatch
	}), /* @__PURE__ */ e.createElement(f, {
		value: p,
		spellCheck: !1,
		onChange: m,
		onBlur: (e) => g(e.target.value),
		onKeyDown: (e) => {
			e.key === "Enter" && g(e.currentTarget.value);
		},
		"aria-label": `${n} hex value`,
		style: {
			width: 68,
			textAlign: "right"
		}
	}), /* @__PURE__ */ e.createElement(u, {
		variant: "ghost",
		size: "sm",
		onClick: l,
		disabled: !a,
		"aria-label": `Reset ${n} to the theme default`,
		title: "Reset to theme default"
	}, "↺"));
}
//#endregion
//#region src/AccessibilitySettings.tsx
var v = [
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
function y() {
	let { Field: n, OptionRow: r, ToggleField: a, useFieldVisible: o } = t.preferences.fields, { ScaleStepper: s } = t.components, c = t.stores.useSettings, l = t.appSettings.update, u = c((e) => e.syncOSAccessibility), d = c((e) => e.highContrast), f = c((e) => e.uiScale), p = c((e) => e.largerText), m = c((e) => e.largerControls), h = c((e) => e.lowercaseHeadings), _ = c((e) => e.strongFocus), y = c((e) => e.reduceTransparency), b = c((e) => e.colorVisionFilter), x = c((e) => e.keyboardCanvasEditing), S = c((e) => e.editingHighlights), C = c((e) => e.reduceMotion), w = o("Interface scale");
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
		value: f,
		onChange: (e) => l({ uiScale: e }),
		label: "Interface scale"
	})), w && /* @__PURE__ */ e.createElement("p", { className: i.note }, "Enlarges the whole interface — text included — up to 200%. The same control lives under Interface ▸ Interface scale.")), /* @__PURE__ */ e.createElement(a, {
		label: "Larger text",
		hint: "Enlarge the smallest labels and drop their all-caps styling so they read as words — without scaling the rest of the interface. Best for cramped labels; it can reflow tight rows.",
		checked: p,
		onChange: (e) => l({ largerText: e })
	}), /* @__PURE__ */ e.createElement(a, {
		label: "Larger controls",
		hint: "Grow buttons and inputs to a comfortable minimum size (≥24px) for easier pointing. Can loosen dense toolbars.",
		checked: m,
		onChange: (e) => l({ largerControls: e })
	}), /* @__PURE__ */ e.createElement(a, {
		label: "Lowercase headings",
		hint: "Show the all-caps section headings in Title Case (capitalise the first letter of each word) instead of UPPERCASE, which is harder to read at a glance.",
		checked: h,
		onChange: (e) => l({ lowercaseHeadings: e })
	}), /* @__PURE__ */ e.createElement(a, {
		label: "Strong focus indicator",
		hint: "Draw a thick outline around whichever control has keyboard focus, so it's easy to see where you are when navigating by keyboard.",
		checked: _,
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
		options: v,
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
	}), /* @__PURE__ */ e.createElement(g, null));
}
//#endregion
//#region src/index.tsx
var b = "safelight.accessibility.styles", x = /* @__PURE__ */ "a11y.wcag.contrast.vision.colour blind.colour blind.colorblind.protanopia.deuteranopia.tritanopia.focus.zoom.magnify.scale.legible.readable.text size.font size.uppercase.caps.hit target.transparency.opacity.motion.system.os.prefers.forced colours.high contrast mode.keyboard".split(".");
function S(e) {
	n(e), e.accessibility.activate(), e.registerStylesheet({
		id: b,
		css: o(e.ui.tokens)
	}), e.registerSettings({
		title: "Accessibility",
		order: 0,
		fields: [],
		component: y,
		keywords: x
	});
}
function C() {
	t.accessibility.deactivate();
}
//#endregion
export { x as SETTINGS_KEYWORDS, b as STYLESHEET_ID, S as activate, C as deactivate };

//# sourceMappingURL=index.js.map