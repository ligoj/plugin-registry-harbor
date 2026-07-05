import { VChip as e, VIcon as t, VTooltip as n, renderDetailsChip as r, renderServiceLink as i, useI18nStore as a } from "@ligoj/host";
import { h as o } from "vue";
//#region src/i18n/en.js
var s = {
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
}, c = {
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
}, l = "service:registry:harbor:url", u = "service:registry:harbor:type", d = "service:registry:harbor:registry", f = ["docker"], p = {
	docker: "mdi-docker",
	maven: "mdi-language-java",
	nuget: "mdi-nuget",
	npm: "mdi-npm",
	python: "mdi-language-python"
};
function m(e) {
	return String(f[Number(e)] ?? e ?? "").toLowerCase();
}
function h(e) {
	return p[e] || "mdi-package-variant";
}
function g(e) {
	let t = e?.parameters?.[l];
	if (!t) return [];
	let { t: n } = a();
	return [i({
		icon: "mdi-home",
		href: t.replace(/\/+$/, ""),
		title: n("service:registry:harbor")
	})];
}
function _(r) {
	let i = r?.parameters, a = i?.[d];
	if (!a) return null;
	let s = m(i[u]), c = h(s);
	return o(n, { location: "bottom" }, {
		activator: ({ props: n }) => o(e, {
			...n,
			size: "small",
			variant: "tonal",
			class: "mr-1"
		}, () => [
			o(t, {
				start: !0,
				size: "small"
			}, () => c),
			" ",
			a
		]),
		default: () => s ? [o("div", { class: "d-flex align-center ga-1" }, [o(t, { size: "x-small" }, () => c), s]), o("div", a)] : [o("div", a)]
	});
}
function v(e) {
	let t = e?.data?.repositories;
	if (t == null) return null;
	let { t: n } = a();
	return [r({
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
		let e = a();
		e.merge(s, "en"), e.merge(c, "fr");
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
