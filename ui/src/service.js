/*
 * Service layer for plugin "registry-harbor".
 *
 * Tool-level plugin (lives at `service:registry:harbor`). The parent
 * `plugin-registry` delegates the subscription-row hooks to us:
 *
 *   - renderFeatures        → a "home" link to the Harbor portal (the node
 *     base URL, i.e. the main tool resource).
 *   - renderDetailsKey      → the registry chip, prefixed with the icon of the
 *     configured artifact type, with a two-line tooltip (type + name).
 *     Harbor is a container registry, so the type is docker.
 *   - renderDetailsFeatures → the live repository count, refreshed from the
 *     subscription status data.
 *
 * Kept free of Vue SFC imports so it can be unit-tested without a DOM.
 */
import { h } from 'vue'
import { pluginRegistry, renderServiceLink, renderDetailsChip, useI18nStore, VChip, VIcon, VTooltip } from '@ligoj/host'

const PARAM_URL = 'service:registry:harbor:url'
const PARAM_TYPE = 'service:registry:harbor:type'
const PARAM_REGISTRY = 'service:registry:harbor:registry'

/**
 * Artifact types in the SELECT parameter's declared order — MUST match
 * csv/parameter.csv: `["docker"]` (Harbor is a container registry). A
 * subscription persists a SELECT as its option INDEX, so this resolves that
 * index back to the value.
 */
const TYPE_VALUES = ['docker']

/**
 * Resolve the stored artifact type. A SELECT is persisted as its option INDEX
 * (e.g. "0"), so map that back to the value; a value passed straight through
 * (e.g. "docker") is kept as-is. Returns "" when there is nothing to resolve.
 */
function resolveType(raw) {
  return String(TYPE_VALUES[Number(raw)] ?? raw ?? '').toLowerCase()
}

/**
 * Artifact-type icon as a VNode, drawn by the shared RegistryTypeIcon that the
 * parent plugin-registry hosts (a plugin can't import another plugin's SFC, so
 * we ask the parent via its `renderTypeIcon` feature). Falls back to a generic
 * package icon if the parent isn't loaded / is too old. `attrs` forwards
 * size / start / class through to the icon.
 */
function typeIconVNode(type, attrs = {}) {
  const registry = pluginRegistry.get('registry')
  if (registry) {
    try { return registry.feature('renderTypeIcon', { type, ...attrs }) } catch { /* older parent without the feature */ }
  }
  return h(VIcon, attrs, () => 'mdi-package-variant')
}

/** "Home" link to the Harbor portal (the main tool resource). */
function renderFeatures(subscription) {
  const url = subscription?.parameters?.[PARAM_URL]
  if (!url) return []
  const { t } = useI18nStore()
  return [renderServiceLink({ icon: 'mdi-home', href: url.replace(/\/+$/, ''), title: t('service:registry:harbor') })]
}

/**
 * Registry chip prefixed with the artifact-type icon. The tooltip has two
 * lines: the type (with its icon) and the repository name.
 */
function renderDetailsKey(subscription) {
  const params = subscription?.parameters
  const registry = params?.[PARAM_REGISTRY]
  if (!registry) return null
  const type = resolveType(params[PARAM_TYPE])
  return h(VTooltip, { location: 'bottom' }, {
    activator: ({ props }) => h(VChip, { ...props, size: 'small', variant: 'tonal', class: 'mr-1' },
      () => [typeIconVNode(type, { start: true, size: 'small' }), ' ', registry]),
    default: () => (type
      ? [h('div', { class: 'd-flex align-center ga-1' }, [typeIconVNode(type, { size: 'x-small' }), type]), h('div', registry)]
      : [h('div', registry)]),
  })
}

/** Live repository count, refreshed from the subscription status data. */
function renderDetailsFeatures(subscription) {
  const repositories = subscription?.data?.repositories
  if (repositories == null) return null
  const { t } = useI18nStore()
  return [renderDetailsChip({ icon: 'mdi-source-repository', text: String(repositories), title: t('service:registry:harbor:repositories') })]
}

export default { renderFeatures, renderDetailsKey, renderDetailsFeatures }
