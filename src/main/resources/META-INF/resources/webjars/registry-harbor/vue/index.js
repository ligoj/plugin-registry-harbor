import { VChip as e, VIcon as t, VTooltip as n, pluginRegistry as r, renderDetailsChip as i, renderServiceLink as a, useI18nStore as o } from "@ligoj/host";
import { h as s } from "vue";
//#region src/i18n/en.js
var c = {
	"service:registry:harbor": "Harbor",
	"service:registry:harbor:url": "Base URL",
	"service:registry:harbor:url-description": "Harbor portal base URL, e.g. https://harbor.example.com",
	"service:registry:harbor:user": "User",
	"service:registry:harbor:password": "Password",
	"service:registry:harbor:type": "Artifact type",
	"service:registry:harbor:type-description": "Fixed to Docker for Harbor",
	"service:registry:harbor:registry": "Registry",
	"service:registry:harbor:registry-description": "Harbor project hosting the artifacts",
	"service:registry:harbor:repositories": "Repositories"
}, l = {
	"service:registry:harbor": "Harbor",
	"service:registry:harbor:url": "URL de base",
	"service:registry:harbor:url-description": "URL du portail Harbor, p. ex. https://harbor.example.com",
	"service:registry:harbor:user": "Utilisateur",
	"service:registry:harbor:password": "Mot de passe",
	"service:registry:harbor:type": "Type d'artefact",
	"service:registry:harbor:type-description": "Fixé à Docker pour Harbor",
	"service:registry:harbor:registry": "Registre",
	"service:registry:harbor:registry-description": "Projet Harbor hébergeant les artefacts",
	"service:registry:harbor:repositories": "Dépôts"
}, u = "service:registry:harbor:url", d = "service:registry:harbor:type", f = "service:registry:harbor:registry", p = ["docker"];
function m(e) {
	return String(p[Number(e)] ?? e ?? "").toLowerCase();
}
function h(e, n = {}) {
	let i = r.get("registry");
	if (i) try {
		return i.feature("renderTypeIcon", {
			type: e,
			...n
		});
	} catch {}
	return s(t, n, () => "mdi-package-variant");
}
function g(e) {
	let t = e?.parameters?.[u];
	if (!t) return [];
	let { t: n } = o();
	return [a({
		icon: "mdi-home",
		href: t.replace(/\/+$/, ""),
		title: n("service:registry:harbor")
	})];
}
function _(t) {
	let r = t?.parameters, i = r?.[f];
	if (!i) return null;
	let a = m(r[d]);
	return s(n, { location: "bottom" }, {
		activator: ({ props: t }) => s(e, {
			...t,
			size: "small",
			variant: "tonal",
			class: "mr-1"
		}, () => [
			h(a, {
				start: !0,
				size: "small"
			}),
			" ",
			i
		]),
		default: () => a ? [s("div", { class: "d-flex align-center ga-1" }, [h(a, { size: "x-small" }), a]), s("div", i)] : [s("div", i)]
	});
}
function v(e) {
	let t = e?.data?.repositories;
	if (t == null) return null;
	let { t: n } = o();
	return [i({
		icon: "mdi-source-repository",
		text: String(t),
		title: n("service:registry:harbor:repositories")
	})];
}
var y = {
	renderFeatures: g,
	renderDetailsKey: _,
	renderDetailsFeatures: v
}, b = {
	renderFeatures: y.renderFeatures,
	renderDetailsKey: y.renderDetailsKey,
	renderDetailsFeatures: y.renderDetailsFeatures
}, x = {
	id: "registry-harbor",
	label: "Harbor",
	requires: ["registry"],
	install() {
		let e = o();
		e.merge(c, "en"), e.merge(l, "fr");
	},
	feature(e, ...t) {
		let n = b[e];
		if (!n) throw Error(`Plugin "registry-harbor" has no feature "${e}"`);
		return n(...t);
	},
	service: y,
	meta: {
		icon: "mdi-anchor",
		color: "light-blue-darken-3"
	}
};
//#endregion
export { x as default, y as service };
