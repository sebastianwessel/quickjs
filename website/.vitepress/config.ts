import { type HeadConfig, defineConfig } from 'vitepress'
import { generateSidebar } from 'vitepress-sidebar'

const hostname = 'https://sebastianwessel.github.io'
export default defineConfig({
	outDir: '../docs',
	base: '/quickjs/',
	lang: 'en-US',
	title: 'QuickJS',
	head: [
		['link', { rel: 'stylesheet', type: 'text/css', media: 'all', href: '/quickjs/cookieconsent.css' }],
		['script', { src: '/quickjs/cookieconsent2.js' }],
		['script', { src: '/quickjs/cookieconsent-init2.js' }],

		['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/quickjs/apple-touch-icon.png' }],
		['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/quickjs/favicon-32x32.png' }],
		['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/quickjs/favicon-16x16.png' }],
		['link', { rel: 'manifest', href: '/quickjs/site.webmanifest' }],
		['link', { rel: 'mask-icon', href: '/quickjs/safari-pinned-tab.svg', color: '#5bbad5' }],
		['meta', { name: 'msapplication-TileColor', content: '#da532c' }],
		['meta', { name: 'theme-color', content: '#ffffff' }],

		['meta', { property: 'og:type', content: 'website' }],
		['meta', { property: 'twitter:card', content: 'summary_large_image' }],
		['meta', { property: 'twitter:site', content: '@swessel78' }],
		['meta', { property: 'twitter:creator', content: '@swessel78' }],
	],
	description: 'A typescript package to execute JavaScript and TypeScript code in a WebAssembly QuickJS sandbox.',
	sitemap: {
		hostname,
	},
	transformHead: ({ pageData, page }) => {
		const head: HeadConfig[] = []

		head.push(['meta', { property: 'og:title', content: pageData.frontmatter.title ?? 'QuickJS' }])
		head.push([
			'meta',
			{ property: 'og:url', content: new URL(`/quickjs/${page.replace('.md', '.html')}`, hostname).toString() },
		])
		head.push([
			'meta',
			{
				property: 'og:description',
				content: pageData.frontmatter.description ?? 'QuickJS sandbox in JavaScript/Typescript',
			},
		])

		if (pageData.frontmatter.image) {
			head.push([
				'meta',
				{ property: 'og:image', content: new URL(`/quickjs${pageData.frontmatter.image}`, hostname).toString() },
			])
		} else {
			head.push([
				'meta',
				{
					property: 'og:image',
					content: 'https://github.com/sebastianwessel/quickjs/og.jpg',
				},
			])
		}

		return head
	},
	ignoreDeadLinks: [/^https?:\/\/localhost/, /^https?:\/\/127.0.0.1/],
	themeConfig: {
		search: {
			provider: 'local',
		},
		// https://vitepress.dev/reference/default-theme-config
		nav: [
			{ text: 'Home', link: '/' },
			{ text: 'Documentation', link: '/docs' },
			{ text: 'Use Cases', link: '/use-cases' },
			{ text: 'Blog', link: '/blog' },
		],
		outline: 'deep',
		lastUpdated: {
			text: 'Updated at',
			formatOptions: {
				dateStyle: 'full',
				timeStyle: 'medium',
			},
		},
		sidebar: {
			...generateSidebar([
				{
					documentRootPath: 'website',
					scanStartPath: 'docs',
					resolvePath: 'docs/',
					useTitleFromFileHeading: true,
					hyphenToSpace: true,
					capitalizeFirst: true,
					underscoreToSpace: true,
					useTitleFromFrontmatter: true,
					useFolderTitleFromIndexFile: true,
					useFolderLinkFromIndexFile: true,
					sortMenusByFrontmatterOrder: true,
					includeRootIndexFile: true,
					includeEmptyFolder: true,
					capitalizeEachWords: true,
					collapseDepth: 1,
				},
				{
					documentRootPath: 'website',
					scanStartPath: 'use-cases',
					resolvePath: 'use-cases/',
					useTitleFromFileHeading: true,
					hyphenToSpace: true,
					capitalizeFirst: true,
					underscoreToSpace: true,
					useTitleFromFrontmatter: true,
					useFolderTitleFromIndexFile: true,
					useFolderLinkFromIndexFile: true,
					sortMenusByFrontmatterOrder: true,
					includeRootIndexFile: false,
					includeEmptyFolder: true,
					capitalizeEachWords: true,
					collapseDepth: 1,
				},
				{
					documentRootPath: 'website',
					scanStartPath: 'blog',
					resolvePath: 'blog/',
					useTitleFromFileHeading: true,
					hyphenToSpace: true,
					capitalizeFirst: true,
					underscoreToSpace: true,
					useTitleFromFrontmatter: true,
					useFolderTitleFromIndexFile: true,
					useFolderLinkFromIndexFile: true,
					includeRootIndexFile: false,
					includeEmptyFolder: true,
					capitalizeEachWords: true,
					collapseDepth: 1,
					sortMenusByFrontmatterDate: true,
					sortMenusOrderByDescending: true,
				},
			]),
		},

		socialLinks: [
			{ icon: 'github', link: 'https://github.com/sebastianwessel/quickjs' },
			{ icon: 'twitter', link: 'https://x.com/swessel78' },
		],
		footer: {
			message: 'Made from developers for developers with ❤️',
			copyright:
				'<a href="/quickjs/docs/credits.html">Credits</a> | <a href="javascript:cc.showSettings()">Cookie preferences</a> | <a href="/quickjs/imprint.html">Imprint</a>',
		},
	},
})
