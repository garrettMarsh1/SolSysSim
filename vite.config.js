import { defineConfig } from 'vite';
import vitePluginString from 'vite-plugin-string';

export default defineConfig({
  assetsInclude: ['**/*.glsl'],
  plugins: [
    vitePluginString()
  ],
  transformers: {
    glsl: {
      test: /\.glsl$/,
      transform(code) {
        return {
          code: `export default \`${code}\``
        }
      }
    }
  }
});
