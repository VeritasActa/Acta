import { defineConfig } from 'vitest/config';

// wrangler.toml declares `[[rules]] type = "Text"` for *.html, so the worker
// imports public/verify.html as a string. Give vitest the same view of it.
const htmlAsText = {
  name: 'html-as-text',
  transform(code, id) {
    if (id.endsWith('.html')) return { code: `export default ${JSON.stringify(code)};`, map: null };
  },
};

export default defineConfig({
  plugins: [htmlAsText],
    test: {
        globals: true,
    },
});
