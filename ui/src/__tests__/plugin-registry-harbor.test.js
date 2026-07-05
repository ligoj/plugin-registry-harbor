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

beforeEach(() => { setActivePinia(createPinia()) })

/** Extract the mdi icon name from a renderServiceLink (VBtn) or renderDetailsChip (VChip) vnode. */
function iconOf(vnode) {
  const kids = vnode.children.default()
  const iconVNode = Array.isArray(kids) ? kids[0] : kids
  return iconVNode.children.default()
}

// renderDetailsKey now returns a VTooltip wrapping a chip activator.
const chipOf = (tooltip) => tooltip.children.activator({ props: {} })
const linesOf = (tooltip) => tooltip.children.default()
const chipIcon = (chip) => chip.children.default()[0].children.default()
const chipText = (chip) => { const k = chip.children.default(); return k[k.length - 1] }
const vIcon = (iconVNode) => iconVNode.children.default()

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
    expect(chipIcon(chip)).toBe('mdi-docker')
    expect(chipText(chip)).toBe('library')
    const lines = linesOf(byIndex)
    expect(lines).toHaveLength(2)
    expect(lines[0].children[1]).toBe('docker')
    expect(vIcon(lines[0].children[0])).toBe('mdi-docker')
    expect(lines[1].children).toBe('library')
    // Value given directly resolves the same way.
    expect(chipIcon(chipOf(def.feature('renderDetailsKey', { parameters: { 'service:registry:harbor:registry': 'x', 'service:registry:harbor:type': 'docker' } })))).toBe('mdi-docker')
  })

  it('renderDetailsKey falls back to a generic icon + single-line tooltip when the type is absent', () => {
    def.install()
    const noType = def.feature('renderDetailsKey', { parameters: { 'service:registry:harbor:registry': 'library' } })
    expect(chipIcon(chipOf(noType))).toBe('mdi-package-variant')
    const lines = linesOf(noType)
    expect(lines).toHaveLength(1)
    expect(lines[0].children).toBe('library')
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
