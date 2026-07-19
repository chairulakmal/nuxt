import { isNuxtPrepare, projectSuffix, withMatrix } from '../../matrix'

export default withMatrix({
  ...(isNuxtPrepare ? {} : { buildDir: `.nuxt-${projectSuffix}` }),
  experimental: {
    runtimeBaseURL: true,
  },
  nitro: {
    prerender: {
      routes: [
        '/prefetch/server-components',
      ],
    },
  },
})
