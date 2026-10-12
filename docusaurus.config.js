// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'AI for Hydraulics',
  tagline: 'Applying artificial intelligence to hydraulics',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  url: 'https://rafikoulebsir-usthb.github.io',
  baseUrl: '/ai-hydraulic-course/',

  // GitHub Pages deployment (via GitHub Actions, see .github/workflows/deploy.yml)
  organizationName: 'rafikoulebsir-usthb',
  projectName: 'ai-hydraulic-course',
  trailingSlash: false,

  onBrokenLinks: 'throw',

  // French will be added once the English version is finished.
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.16.47/dist/katex.min.css',
      type: 'text/css',
      integrity: 'sha384-nH0MfJ44wi1dd7w6jinlyBgljjS8EJAh2JBoRad8a3VDw2K69vfaaqm4WnR+gXtA',
      crossorigin: 'anonymous',
    },
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/rafikoulebsir-usthb/ai-hydraulic-course/tree/main/',
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/logo.png',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'AI for Hydraulics',
        logo: {
          alt: 'AI for Hydraulics Logo',
          src: 'img/logo.png',
          srcDark: 'img/logo-dark.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'courseSidebar',
            position: 'left',
            label: 'Course',
          },
          {
            href: 'https://github.com/rafikoulebsir-usthb/ai-hydraulic-course',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Course',
            items: [
              {label: 'Overview', to: '/docs/intro'},
              {label: 'Part 1 — Data Manipulation', to: '/docs/part-1-data-manipulation'},
              {label: 'Part 2 — Preprocessing & Supervised Learning', to: '/docs/part-2-machine-learning'},
              {label: 'Part 3 — LLMs for Engineering Work', to: '/docs/part-3-llms'},
            ],
          },
          {
            title: 'More',
            items: [
              {label: 'GitHub', href: 'https://github.com/rafikoulebsir-usthb/ai-hydraulic-course'},
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} USTHB — AI for Hydraulics. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
