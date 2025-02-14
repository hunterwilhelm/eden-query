import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import ci from 'ci-info'
import { bundledLanguages, createHighlighter } from 'shiki'
import { ModuleResolutionKind } from 'typescript'
import { defineConfig } from 'vitepress'
import { repository } from '../../../package.json'
import { npmToYarn } from './npm-to-yarn'
import { magicMove } from './magic-move'
import { addIncludes, parseIncludeMeta, replaceIncludesInCode } from './twoslash-include'

const repositoryName = repository.url.split('/').pop() ?? ''

const description =
  'Ergonomic Framework for Humans. TypeScript server framework supercharged by Bun with End-to-End Type Safety, unified type system and outstanding developer experience.'

const base = ci.GITHUB_ACTIONS ? `/${repositoryName.replace('.git', '')}/` : ''

console.log({ ci, base })

const includes = new Map<string, string>()

const config = defineConfig({
  lang: 'en-US',
  title: 'ElysiaJS',
  base,
  ignoreDeadLinks: true,
  lastUpdated: true,
  markdown: {
    config: async (md) => {
      md.use(npmToYarn({ sync: true }))

      const highlighter = await createHighlighter({
        themes: ['github-light', 'github-dark'],
        langs: Object.keys(bundledLanguages),
      })

      md.use(magicMove, highlighter)
    },
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
    codeTransformers: [
      {
        name: 'twoslash-replace-include',
        preprocess: (code, options) => {
          const include = parseIncludeMeta(options.meta?.__raw)

          if (include) addIncludes(includes, include, code)

          const codeWithIncludes = replaceIncludesInCode(includes, code)

          return codeWithIncludes
        },
      },
      transformerTwoslash({
        twoslashOptions: {
          compilerOptions: {
            moduleResolution: ModuleResolutionKind.Bundler,
          },
        },
      }),
    ],
  },
  head: [
    [
      'meta',
      {
        name: 'viewport',
        content: 'width=device-width,initial-scale=1,user-scalable=no',
      },
    ],
    [
      'link',
      {
        rel: 'icon',
        href: `${base}/assets/elysia.png`,
      },
    ],
    [
      'meta',
      {
        property: 'og:image',
        content: 'https://elysiajs.com/assets/cover.jpg',
      },
    ],
    [
      'meta',
      {
        property: 'og:image:width',
        content: '1920',
      },
    ],
    [
      'meta',
      {
        property: 'og:image:height',
        content: '1080',
      },
    ],
    [
      'meta',
      {
        property: 'twitter:card',
        content: 'summary_large_image',
      },
    ],
    [
      'meta',
      {
        property: 'twitter:image',
        content: 'https://elysiajs.com/assets/cover.jpg',
      },
    ],
    [
      'meta',
      {
        property: 'og:title',
        content: 'ElysiaJS',
      },
    ],
    [
      'meta',
      {
        property: 'og:description',
        content: description,
      },
    ],
  ],
  themeConfig: {
    search: {
      provider: 'local',
    },
    logo: '/assets/elysia.svg',
    nav: [
      {
        text: 'Eden-Query',
        link: '/eden-query',
      },
    ],
    sidebar: [
      {
        text: 'Getting Started',
        items: [
          {
            text: 'Overview',
            link: '/overview',
          },
          {
            text: 'Quick Start',
            link: '/quick-start',
          },
          {
            text: 'Table of Contents',
            link: '/table-of-contents',
          },
        ],
      },
      {
        text: 'Eden-Query',
        collapsed: false,
        items: [
          {
            text: 'Overview',
            link: '/eden-query/index.md',
          },
          {
            text: 'Batching',
            link: '/eden-query/batching.md',
          },
          {
            text: 'Transformers',
            link: '/eden-query/transformers.md',
          },
          {
            text: 'Create Custom Header',
            link: '/eden-query/headers.md',
          },
          {
            text: 'CORS & Cookies',
            link: '/eden-query/cors.md',
          },
          {
            text: 'Links',
            link: '/eden-query/links/index.md',
            collapsed: true,
            items: [
              {
                text: 'HTTP Link',
                link: '/eden-query/links/http-link.md',
              },
              {
                text: 'HTTP Batch Link',
                link: '/eden-query/links/http-batch-link.md',
              },
              {
                text: 'Split Link',
                link: '/eden-query/links/split-link.md',
              },
              {
                text: 'Logger Link',
                link: '/eden-query/links/logger-link.md',
              },
            ],
          },
          {
            text: 'Eden-React-Query',
            collapsed: true,
            link: '/eden-query/react/index.md',
            items: [
              {
                text: 'Setup',
                link: '/eden-query/react/setup',
                docFooterText: 'Setup',
              },
              {
                text: 'Inferring Types',
                link: '/eden-query/react/inferring-types',
                docFooterText: 'Inferring Types',
              },
              {
                text: 'useQuery()',
                link: '/eden-query/react/useQuery',
                docFooterText: 'useQuery',
              },
              {
                text: 'useMutation()',
                link: '/eden-query/react/useMutation',
                docFooterText: 'useMutation',
              },
              {
                text: 'useInfiniteQuery()',
                link: '/eden-query/react/useInfiniteQuery',
                docFooterText: 'useInfiniteQuery',
              },
              {
                text: 'useUtils()',
                link: '/eden-query/react/useUtils',
                docFooterText: 'useUtils',
              },
              {
                text: 'createUtils()',
                link: '/eden-query/react/createUtils',
                docFooterText: 'createUtils',
              },
              {
                text: 'useQueries()',
                link: '/eden-query/react/useQueries',
                docFooterText: 'useQueries',
              },
              {
                text: 'Suspense',
                link: '/eden-query/react/suspense',
                docFooterText: 'Suspense',
              },
              {
                text: 'getQueryKey()',
                link: '/eden-query/react/getQueryKey',
                docFooterText: 'getQueryKey',
              },
              {
                text: 'Aborting Requests',
                link: '/eden-query/react/aborting',
                docFooterText: 'Aborting Requests',
              },
              {
                text: 'Disabling Queries',
                link: '/eden-query/react/disabling',
                docFooterText: 'Disabling Queries',
              },
            ],
          },
          {
            text: 'Eden-Svelte-Query',
            collapsed: true,
            link: '/eden-query/svelte/index.md',
            items: [
              {
                text: 'Setup',
                link: '/eden-query/svelte/setup',
                docFooterText: 'Setup',
              },
              {
                text: 'Inferring Types',
                link: '/eden-query/svelte/inferring-types',
                docFooterText: 'Inferring Types',
              },
              {
                text: 'createQuery()',
                link: '/eden-query/svelte/createQuery',
                docFooterText: 'createQuery',
              },
              {
                text: 'createMutation()',
                link: '/eden-query/svelte/createMutation',
                docFooterText: 'createMutation',
              },
              {
                text: 'createInfiniteQuery()',
                link: '/eden-query/svelte/createInfiniteQuery',
                docFooterText: 'createInfiniteQuery',
              },
              {
                text: 'useUtils()',
                link: '/eden-query/svelte/useUtils',
                docFooterText: 'useUtils',
              },
              {
                text: 'createUtils()',
                link: '/eden-query/svelte/createUtils',
                docFooterText: 'createUtils',
              },
              {
                text: 'createQueries()',
                link: '/eden-query/svelte/createQueries',
                docFooterText: 'createQueries',
              },
              {
                text: 'Reactive Queries',
                link: '/eden-query/svelte/reactive',
                docFooterText: 'Reactive Queries',
              },
              {
                text: 'getQueryKey()',
                link: '/eden-query/svelte/getQueryKey',
                docFooterText: 'getQueryKey',
              },
              {
                text: 'Aborting Requests',
                link: '/eden-query/svelte/aborting',
                docFooterText: 'Aborting Requests',
              },
              {
                text: 'Disabling Queries',
                link: '/eden-query/svelte/disabling',
                docFooterText: 'Disabling Queries',
              },
            ],
          },
          {
            text: 'Eden-Vue-Query',
            collapsed: true,
            link: '/eden-query/vue/index.md',
            items: [
              {
                text: 'Setup',
                link: '/eden-query/vue/setup',
                docFooterText: 'Setup',
              },
              {
                text: 'Inferring Types',
                link: '/eden-query/vue/inferring-types',
                docFooterText: 'Inferring Types',
              },
              {
                text: 'useQuery()',
                link: '/eden-query/vue/useQuery',
                docFooterText: 'useQuery',
              },
              {
                text: 'useMutation()',
                link: '/eden-query/vue/useMutation',
                docFooterText: 'useMutation',
              },
              {
                text: 'useInfiniteQuery()',
                link: '/eden-query/vue/useInfiniteQuery',
                docFooterText: 'useInfiniteQuery',
              },
              {
                text: 'useUtils()',
                link: '/eden-query/vue/useUtils',
                docFooterText: 'useUtils',
              },
              {
                text: 'createUtils()',
                link: '/eden-query/vue/createUtils',
                docFooterText: 'createUtils',
              },
              {
                text: 'useQueries()',
                link: '/eden-query/vue/useQueries',
                docFooterText: 'useQueries',
              },
              {
                text: 'Suspense',
                link: '/eden-query/vue/suspense',
                docFooterText: 'Suspense',
              },
              {
                text: 'getQueryKey()',
                link: '/eden-query/vue/getQueryKey',
                docFooterText: 'getQueryKey',
              },
              {
                text: 'Aborting Requests',
                link: '/eden-query/vue/aborting',
                docFooterText: 'Aborting Requests',
              },
              {
                text: 'Disabling Queries',
                link: '/eden-query/vue/disabling',
                docFooterText: 'Disabling Queries',
              },
            ],
          },
        ],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/elysiajs/elysia' },
      { icon: 'twitter', link: 'https://twitter.com/elysiajs' },
      { icon: 'discord', link: 'https://discord.gg/eaFJ2KDJck' },
    ],
    editLink: {
      text: 'Edit this page on GitHub',
      pattern: 'https://github.com/ap0nia/eden-query/edit/main/documentation/docs/:path',
    },
  },
})

config.markdown?.shikiSetup
export default config
