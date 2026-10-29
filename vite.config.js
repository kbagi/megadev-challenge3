// Build setup for rendering the kb export locally. Not part of the desk's export.
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { mdsvex } from 'mdsvex';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [
    sveltekit({
      extensions: ['.svelte', '.svx'],
      preprocess: [mdsvex({ extensions: ['.svx'], layout: { runbook: fileURLToPath(new URL('src/lib/layouts/runbook.svelte', import.meta.url)) } })],
      adapter: adapter({ pages: 'render', assets: 'render', strict: false }),
      alias: { '#lib': 'src/lib' },
      prerender: {
        entries: ['/kb', '/kb/incidents/4471', '/kb/incidents/4471-split', '/kb/triage/dedupe', '/kb/decisions/0001-dedupe-by-subject'],
      },
    }),
  ],
});
