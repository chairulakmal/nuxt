import { defu } from 'defu'
import type { NuxtConfig } from 'nuxt/schema'

export const builder = (process.env.TEST_BUILDER as 'webpack' | 'rspack' | 'vite' | 'nitro-vite') ?? 'vite'

export const isWebpack = builder === 'webpack' || builder === 'rspack'
export const nitroViteEnvironment = builder === 'nitro-vite'

export const isDev = process.env.TEST_ENV === 'dev'
export const isBuilt = !isDev

export const isTestingAppManifest = process.env.TEST_MANIFEST !== 'manifest-off'

export const asyncContext = process.env.TEST_CONTEXT === 'async'
export const typescriptBundlerResolution = process.env.MODULE_RESOLUTION !== 'node'

/**
 * Suffix identifying the current matrix combination.
 */
export const projectSuffix = [
  process.env.TEST_BUILDER,
  process.env.TEST_ENV,
  process.env.TEST_CONTEXT,
  process.env.TEST_MANIFEST,
].filter(Boolean).join('-') || 'default'

export const isNuxtPrepare = process.argv.slice(2).includes('prepare')

export function withMatrix (config: NuxtConfig) {
  return defu(config, {
    builder: builder === 'nitro-vite' ? 'vite' : builder,
    devtools: { enabled: false },
    future: {
      typescriptBundlerResolution,
    },
    experimental: {
      asyncContext,
      appManifest: isTestingAppManifest,
      nitroViteEnvironment,
    },
    compatibilityDate: 'latest',
  })
}
