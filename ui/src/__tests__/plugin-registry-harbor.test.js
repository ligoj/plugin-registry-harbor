/*
 * Contract tests for plugin-registry-harbor, incl. the parent → child
 * delegation: when registry-harbor is registered, plugin-registry's
 * renderFeatures/renderDetailsKey/renderDetailsFeatures resolve to this tool
 * for a matching node.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { pluginRegistry, useI18nStore } from '@ligoj/host'
import def from '../index.js'
import parentDef from '../../../../plugin-registry/ui/src/index.js'

// The type icon in the chip is the shared RegistryTypeIcon, drawn by the parent
// plugin-registry via its `renderTypeIcon` feature — register the parent so the
// tool can resolve it (as at runtime, where the parent is always loaded).
beforeEach(() => { setActivePinia(createPinia()); pluginRegistry.register('registry', parentDef) })
afterEach(() => { pluginRegistry.remove('registry') })

/** Extract the mdi icon name from a renderServiceLink (VBtn) or renderDetailsChip (VChip) vnode. */
function iconOf(vnode) {
  const kids = vnode.children.default()
  const iconVNode = Array.isArray(kids) ? kids[0] : kids
  return iconVNode.children.default()
}

// renderDetailsKey now returns a VTooltip wrapping a chip activator.
const chipOf = (tooltip) => tooltip.children.activator({ props: {} })
const linesOf = (tooltip) => tooltip.children.default()
const chipText = (chip) => { const k = chip.children.default(); return k[k.length - 1] }
// The type icon is the shared RegistryTypeIcon; assert the artifact `type` handed
// to it (the type→mdi mapping is verified in plugin-registry's own tests).
const chipType = (chip) => chip.children.default()[0].props.type
const lineType = (iconVNode) => iconVNode.props.type

describe('plugin-registry-harbor manifest', () => {
  it('exposes a valid tool-level manifest', () => {
    expect(def.id).toBe('registry-harbor')
    expect(def.label).toBe('Harbor')
    expect(def.requires).toEqual(['registry'])
    expect(def.routes).toBeUndefined()
    expect(def.component).toBeUndefined()
    expect(typeof def.install).toBe('function')
    expect(typeof def.feature).toBe('function')
    expect(def.service).toBeTypeOf('object')
    expect(def.meta).toMatchObject({ icon: expect.any(String), color: expect.any(String) })
  })

  it('merges en + fr i18n on install', () => {
    const i18n = useI18nStore()
    def.install()
    expect(i18n.t('service:registry:harbor:registry')).toBeTypeOf('string')
    expect(i18n.t('service:registry:harbor:type')).toBe('Artifact type')
    expect(i18n.t('service:registry:harbor:repositories')).toBe('Repositories')
    i18n.setLocale('fr')
    expect(i18n.t('service:registry:harbor:type')).toBe("Type d'artefact")
    expect(i18n.t('service:registry:harbor:repositories')).toBe('Dépôts')
  })

  it('throws for an unknown feature', () => {
    expect(() => def.feature('nope')).toThrow(/Plugin "registry-harbor" has no feature "nope"/)
  })

  it('renderFeatures is a home link to the Harbor portal, trailing slash trimmed', () => {
    def.install()
    const vnodes = def.feature('renderFeatures', { parameters: { 'service:registry:harbor:url': 'https://harbor.acme.io/' } })
    expect(vnodes).toHaveLength(1)
    expect(vnodes[0].__v_isVNode).toBe(true)
    expect(vnodes[0].props.target).toBe('_blank')
    expect(vnodes[0].props.href).toBe('https://harbor.acme.io')
    expect(iconOf(vnodes[0])).toBe('mdi-home')
  })

  it('renderFeatures returns [] without the node URL', () => {
    def.install()
    expect(def.feature('renderFeatures', { parameters: {} })).toEqual([])
    expect(def.feature('renderFeatures', {})).toEqual([])
  })

  it('renderDetailsKey builds a docker-icon chip + 2-line icon tooltip, resolving the SELECT index', () => {
    def.install()
    // Harbor is a container registry — index 0 = docker.
    const byIndex = def.feature('renderDetailsKey', { parameters: { 'service:registry:harbor:registry': 'library', 'service:registry:harbor:type': '0' } })
    expect(byIndex.__v_isVNode).toBe(true)
    const chip = chipOf(byIndex)
    expect(chipType(chip)).toBe('docker')
    expect(chipText(chip)).toBe('library')
    const lines = linesOf(byIndex)
    expect(lines).toHaveLength(2)
    expect(lines[0].children[1]).toBe('docker')
    expect(lineType(lines[0].children[0])).toBe('docker')
    expect(lines[1].children).toBe('library')
    // Value given directly resolves the same way.
    expect(chipType(chipOf(def.feature('renderDetailsKey', { parameters: { 'service:registry:harbor:registry': 'x', 'service:registry:harbor:type': 'docker' } })))).toBe('docker')
  })

  it('renderDetailsKey passes an empty type through with a single-line tooltip when absent', () => {
    def.install()
    const noType = def.feature('renderDetailsKey', { parameters: { 'service:registry:harbor:registry': 'library' } })
    expect(chipType(chipOf(noType))).toBe('')  // no type → empty string handed to the shared icon
    const lines = linesOf(noType)
    expect(lines).toHaveLength(1)
    expect(lines[0].children).toBe('library')
  })

  it('renderDetailsKey renders a generic package icon when the parent cannot provide one', () => {
    def.install()
    const params = { 'service:registry:harbor:registry': 'library', 'service:registry:harbor:type': 'docker' }
    const iconName = (tooltip) => chipOf(tooltip).children.default()[0].children.default()
    pluginRegistry.remove('registry')  // parent not loaded
    expect(iconName(def.feature('renderDetailsKey', { parameters: params }))).toBe('mdi-package-variant')
    // older parent bundle without the renderTypeIcon feature (feature() throws)
    pluginRegistry.register('registry', { id: 'registry', feature: () => { throw new Error('no feature "renderTypeIcon"') } })
    expect(iconName(def.feature('renderDetailsKey', { parameters: params }))).toBe('mdi-package-variant')
  })

  it('renderDetailsKey returns null without a registry', () => {
    def.install()
    expect(def.feature('renderDetailsKey', { parameters: {} })).toBeNull()
    expect(def.feature('renderDetailsKey', {})).toBeNull()
  })

  it('renderDetailsFeatures shows the live repository count', () => {
    def.install()
    const out = def.feature('renderDetailsFeatures', { data: { repositories: 8 } })
    expect(out).toHaveLength(1)
    expect(out[0].__v_isVNode).toBe(true)
    const kids = out[0].children.default()
    expect(kids[kids.length - 1]).toBe('8')
    expect(iconOf(out[0])).toBe('mdi-source-repository')
  })

  it('renderDetailsFeatures returns null without status data', () => {
    def.install()
    expect(def.feature('renderDetailsFeatures', { data: {} })).toBeNull()
    expect(def.feature('renderDetailsFeatures', {})).toBeNull()
  })
})

describe('plugin-registry → plugin-registry-harbor delegation', () => {
  beforeEach(() => {
    parentDef.install({ router: { addRoute() {} } })
    def.install()
    pluginRegistry.register('registry-harbor', def)
  })
  afterEach(() => { pluginRegistry.remove('registry-harbor') })

  it('parent renderFeatures resolves to this tool for a matching node', () => {
    const out = parentDef.feature('renderFeatures', {
      node: { id: 'service:registry:harbor:1' },
      parameters: { 'service:registry:harbor:url': 'https://harbor.acme.io' },
    })
    expect(Array.isArray(out)).toBe(true)
    expect(out.length).toBe(1)
    expect(out[0].__v_isVNode).toBe(true)
  })

  it('parent renderDetailsKey resolves to this tool for a matching node', () => {
    const out = parentDef.feature('renderDetailsKey', {
      node: { id: 'service:registry:harbor:1' },
      parameters: { 'service:registry:harbor:registry': 'library', 'service:registry:harbor:type': 'docker' },
    })
    expect(Array.isArray(out)).toBe(true)
    expect(out.length).toBe(1)
    expect(out[0].__v_isVNode).toBe(true)
  })

  it('parent renderDetailsFeatures resolves to this tool for a matching node', () => {
    const out = parentDef.feature('renderDetailsFeatures', {
      node: { id: 'service:registry:harbor:1' },
      data: { repositories: 3 },
    })
    expect(Array.isArray(out)).toBe(true)
    expect(out.length).toBe(1)
    expect(out[0].__v_isVNode).toBe(true)
  })

  it('does not delegate for a different tool', () => {
    const out = parentDef.feature('renderDetailsKey', {
      node: { id: 'service:registry:other:1' },
      parameters: {},
    })
    expect(out).toBeNull()
  })
})
