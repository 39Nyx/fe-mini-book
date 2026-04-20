import { defineConfig } from 'dumi';

export default defineConfig({
  outputPath: 'docs-dist',
  themeConfig: {
    name: 'fe-mini-book',
  },
  codeSplitting: {
    jsStrategy: 'depPerChunk'
  },
  skk: {
    enableVue: true,
    compiler: {
      babelStandaloneCDN: 'https://unpkg.com/@babel/standalone/babel.min.js'
    },
    fileTree: true
  }
});
