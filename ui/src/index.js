/*
 * Plugin "registry-harbor" — Harbor implementation of plugin-registry.
 *
 * Tool-level plugin (`service:registry:harbor`). Augments the parent
 * `plugin-registry` via i18n parameter labels + row features (project
 * link + registry chip) merged in through plugin-registry's
 * `subPluginIdFor` delegation hook.
 *
 * The artifact `type` is fixed to `docker` for Harbor (a container
 * registry); the parameter is still declared so the subscription form
 * stays uniform across registry tools — see csv/parameter.csv.
 *
 * Authored as source — compiled to `/main/registry-harbor/vue/index.js`.
 */
import { useI18nStore } from '@ligoj/host'
import enMessages from './i18n/en.js'
import frMessages from './i18n/fr.js'
import service from './service.js'

const features = {
  renderFeatures: service.renderFeatures,
  renderDetailsKey: service.renderDetailsKey,
}

export default {
  id: 'registry-harbor',
  label: 'Harbor',
  requires: ['registry'],
  install() {
    const i18n = useI18nStore()
    i18n.merge(enMessages, 'en')
    i18n.merge(frMessages, 'fr')
  },
  feature(action, ...args) {
    const fn = features[action]
    if (!fn) throw new Error(`Plugin "registry-harbor" has no feature "${action}"`)
    return fn(...args)
  },
  service,
  meta: { icon: 'mdi-anchor', color: 'light-blue-darken-3' },
}

export { service }
