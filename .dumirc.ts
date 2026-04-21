import { defineConfig } from 'dumi';

const nav = [
  {
    title: 'Vue',
    link: '/vue'
  },
  {
    title: '场景题',
    link: '/scenario'
  },
  {
    title: '手写系列',
    link: '/hand-writing'
  }
]


export default defineConfig({
  outputPath: 'docs-dist',
  themeConfig: {
    name: 'fe-mini-book',
    nav,
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
