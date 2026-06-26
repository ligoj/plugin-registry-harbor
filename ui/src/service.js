/*
 * Service layer for plugin "registry-harbor".
 *
 * Tool-level plugin (lives at `service:registry:harbor`). The parent
 * `plugin-registry` delegates the subscription-row hooks to us:
 *
 *   - renderFeatures   → a link to the Harbor projects view
 *     (`<url>/harbor/projects`).
 *   - renderDetailsKey → the registry chip
 *     (`service:registry:harbor:registry`).
 *
 * `url` is a node-validation parameter; `registry` is collected at
 * subscription time. Kept free of Vue SFC imports so it can be
 * unit-tested without a DOM.
 */
import { renderServiceLink, renderDetailsChip, useI18nStore } from '@ligoj/host'

const PARAM_URL = 'service:registry:harbor:url'
const PARAM_REGISTRY = 'service:registry:harbor:registry'

/** Harbor projects link. Requires the node-level base URL. */
function renderFeatures(subscription) {
  const url = subscription?.parameters?.[PARAM_URL]
  if (!url) return []
  const { t } = useI18nStore()
  const base = url.replace(/\/+$/, '')
  return [renderServiceLink({ icon: 'mdi-anchor', href: `${base}/harbor/projects`, title: t('service:registry:harbor:registry') })]
}

/** Registry chip. Mirrors the resource-key chip of the scm tools. */
function renderDetailsKey(subscription) {
  const registry = subscription?.parameters?.[PARAM_REGISTRY]
  if (!registry) return null
  const { t } = useI18nStore()
  return renderDetailsChip({ icon: 'mdi-anchor', text: registry, title: t('service:registry:harbor:registry') })
}

export default { renderFeatures, renderDetailsKey }
