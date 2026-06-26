import { renderDetailsChip as e, renderServiceLink as t, useI18nStore as n } from "@ligoj/host";
//#region src/i18n/en.js
var r = {
	"service:registry:harbor": "Harbor",
	"service:registry:harbor:url": "Base URL",
	"service:registry:harbor:url-description": "Harbor portal base URL, e.g. https://harbor.example.com",
	"service:registry:harbor:user": "User",
	"service:registry:harbor:password": "Password",
	"service:registry:harbor:type": "Artifact type",
	"service:registry:harbor:type-description": "Fixed to Docker for Harbor",
	"service:registry:harbor:registry": "Registry",
	"service:registry:harbor:registry-description": "Harbor project hosting the artifacts"
}, i = {
	"service:registry:harbor": "Harbor",
	"service:registry:harbor:url": "URL de base",
	"service:registry:harbor:url-description": "URL du portail Harbor, p. ex. https://harbor.example.com",
	"service:registry:harbor:user": "Utilisateur",
	"service:registry:harbor:password": "Mot de passe",
	"service:registry:harbor:type": "Type d'artefact",
	"service:registry:harbor:type-description": "Fixé à Docker pour Harbor",
	"service:registry:harbor:registry": "Registre",
	"service:registry:harbor:registry-description": "Projet Harbor hébergeant les artefacts"
}, a = "service:registry:harbor:url", o = "service:registry:harbor:registry";
function s(e) {
	let r = e?.parameters?.[a];
	if (!r) return [];
	let { t: i } = n();
	return [t({
		icon: "mdi-anchor",
		href: `${r.replace(/\/+$/, "")}/harbor/projects`,
		title: i("service:registry:harbor:registry")
	})];
}
function c(t) {
	let r = t?.parameters?.[o];
	if (!r) return null;
	let { t: i } = n();
	return e({
		icon: "mdi-anchor",
		text: r,
		title: i("service:registry:harbor:registry")
	});
}
var l = {
	renderFeatures: s,
	renderDetailsKey: c
}, u = {
	renderFeatures: l.renderFeatures,
	renderDetailsKey: l.renderDetailsKey
}, d = {
	id: "registry-harbor",
	label: "Harbor",
	requires: ["registry"],
	install() {
		let e = n();
		e.merge(r, "en"), e.merge(i, "fr");
	},
	feature(e, ...t) {
		let n = u[e];
		if (!n) throw Error(`Plugin "registry-harbor" has no feature "${e}"`);
		return n(...t);
	},
	service: l,
	meta: {
		icon: "mdi-anchor",
		color: "light-blue-darken-3"
	}
};
//#endregion
export { d as default, l as service };
