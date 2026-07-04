import { describe, expect, it } from 'vitest'

import { globRouteRulesFromPages, removePagesRules } from '../src/pages/route-rules.ts'

describe('routeRules from page meta', () => {
  const getPages = () => [
    {
      path: '/',
      rules: { prerender: true },
    },
    // parent without routeRules
    {
      path: '/users',
      children: [{ path: ':id', rules: { prerender: true } }],
    },
    // nested paths
    {
      path: '/some',
      children: [
        {
          path: 'nested',
          children: [{ path: 'page', rules: { prerender: true } }],
        },
      ],
    },
    // page with empty routeRules
    {
      path: '/contact',
      rules: {},
    },
  ]

  it('extracts route rules from pages', () => {
    const pages = getPages()
    const result = globRouteRulesFromPages(pages)
    expect(result).toEqual({
      '/': { prerender: true },
      '/some/nested/page': { prerender: true },
      '/users/**': { prerender: true },
    })
  })

  it('warns when constrained dynamic params map to broader route rules', () => {
    const warnings: string[] = []
    const pages = [
      {
        path: '/:locale(de|fr)/account/verify',
        rules: { prerender: true },
      },
    ]

    expect(globRouteRulesFromPages(pages, { warn: message => warnings.push(message) })).toEqual({
      '/**': { prerender: true },
    })
    expect(warnings).toEqual([
      'Inline route rules for `/:locale(de|fr)/account/verify` were mapped to `/**`, which is broader than the page route because custom RegExp constraints cannot be represented by Nitro route rules.',
    ])
  })

  it('warns when inline route rules override the same route rule glob', () => {
    const warnings: string[] = []
    const pages = [
      {
        path: '/foo/:id',
        rules: { swr: 60 },
      },
      {
        path: '/foo/:slug',
        rules: { prerender: true },
      },
    ]

    expect(globRouteRulesFromPages(pages, { warn: message => warnings.push(message) })).toEqual({
      '/foo/**': { prerender: true },
    })
    expect(warnings).toEqual([
      'Inline route rules for `/foo/:slug` generated `/foo/**`, which is already used by another page. The later inline route rules will override the earlier ones.',
    ])
  })

  it('removes route rules from pages', () => {
    const pages = getPages()
    removePagesRules(pages)
    expect(pages).toEqual([
      { path: '/' },
      { path: '/users', children: [{ path: ':id' }] },
      {
        path: '/some',
        children: [{ path: 'nested', children: [{ path: 'page' }] }],
      },
      { path: '/contact' },
    ])
  })
})
