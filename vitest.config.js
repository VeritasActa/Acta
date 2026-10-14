import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';

// wrangler.toml declares `[[rules]] type = "Text"` for *.html, so the worker
// imports public/verify.html as a string. Give vitest the same view of it.
const htmlAsText = {
  name: 'html-as-text',
  enforce: 'pre',
  load(id) {
    if (id.endsWith('.html') || id.endsWith('.txt')) return { code: `export default ${JSON.stringify(readFileSync(id, 'utf8'))};`, map: null };
  },
};

export default defineConfig({
  plugins: [htmlAsText],
    test: {
        globals: true,
    },
});
