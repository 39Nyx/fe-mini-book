# 工程化实践

前端工程化是提升开发效率、代码质量和团队协作的关键。

## 构建工具

### Webpack

#### 核心概念

```js
// webpack.config.js
module.exports = {
  // 入口
  entry: './src/index.js',
  
  // 输出
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash:8].js',
    clean: true
  },
  
  // 模块处理
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        type: 'asset/resource'
      }
    ]
  },
  
  // 插件
  plugins: [
    new HtmlWebpackPlugin({ template: './public/index.html' }),
    new MiniCssExtractPlugin()
  ],
  
  // 优化
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  },
  
  // 开发服务器
  devServer: {
    port: 3000,
    hot: true,
    open: true
  }
};
```

#### Loader 与 Plugin 的区别

| 特性 | Loader | Plugin |
|------|--------|--------|
| 作用 | 转换模块源代码 | 扩展 webpack 功能 |
| 执行时机 | 模块加载时 | 整个编译周期 |
| 配置位置 | module.rules | plugins 数组 |
| 示例 | babel-loader、css-loader | HtmlWebpackPlugin、CleanWebpackPlugin |

#### 代码分割

```js
// 动态导入实现代码分割
const module = await import('./module.js');

// React 懒加载
const LazyComponent = React.lazy(() => import('./Component'));

// webpack 配置
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  }
};
```

### Vite

#### 特点与优势

1. **极速冷启动**：基于原生 ES 模块，无需打包
2. **即时热更新**：HMR 速度快，与模块数量无关
3. **真正的按需编译**：浏览器请求时才编译
4. **开箱即用**：内置 TypeScript、JSX、CSS 等支持

```js
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia']
        }
      }
    }
  }
});
```

#### Webpack vs Vite

| 特性 | Webpack | Vite |
|------|---------|------|
| 启动速度 | 慢（需要打包） | 快（原生 ESM） |
| HMR 速度 | 随项目增大而变慢 | 始终很快 |
| 生产构建 | 成熟稳定 | 基于 Rollup |
| 生态 | 丰富 | 快速增长 |
| 配置复杂度 | 较复杂 | 简洁 |

## Babel

### 核心功能

```js
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        browsers: ['> 1%', 'last 2 versions']
      },
      useBuiltIns: 'usage',
      corejs: 3
    }],
    '@babel/preset-react',
    '@babel/preset-typescript'
  ],
  plugins: [
    '@babel/plugin-proposal-decorators',
    '@babel/plugin-proposal-class-properties',
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      }
    ]
  ]
};
```

### Polyfill 方案

```js
// 方案1: @babel/polyfill (已废弃)
import '@babel/polyfill';

// 方案2: core-js + regenerator-runtime
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// 方案3: useBuiltIns: 'usage' (推荐)
// 按需引入，自动检测代码中使用的特性
```

## 包管理工具

### npm / yarn / pnpm

| 特性 | npm | yarn | pnpm |
|------|-----|------|------|
| 安装速度 | 一般 | 快 | 最快 |
| 磁盘占用 | 大 | 大 | 小（硬链接） |
| node_modules | 扁平/嵌套 | 扁平 | 非扁平 |
| 锁文件 | package-lock.json | yarn.lock | pnpm-lock.yaml |
| 工作区支持 | 支持 | 支持 | 原生支持 |

```bash
# pnpm 常用命令
pnpm install          # 安装依赖
pnpm add <pkg>        # 添加依赖
pnpm add -D <pkg>     # 添加开发依赖
pnpm remove <pkg>     # 移除依赖
pnpm update           # 更新依赖
pnpm run <script>     # 运行脚本
```

## 代码规范

### ESLint

```js
// .eslintrc.js
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier' // 关闭与 Prettier 冲突的规则
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/multi-word-component-names': 'off'
  }
};
```

### Prettier

```js
// .prettierrc.js
module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  arrowParens: 'avoid',
  endOfLine: 'lf'
};
```

### Husky + lint-staged

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  },
  "lint-staged": {
    "*.{js,jsx,vue,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,less,scss}": [
      "stylelint --fix",
      "prettier --write"
    ]
  }
}
```

## CI/CD

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Lint
        run: pnpm run lint
      
      - name: Test
        run: pnpm run test
      
      - name: Build
        run: pnpm run build
      
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Docker 部署

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 生产环境
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 模块化规范

### ES Modules vs CommonJS

```js
// ES Modules (ESM)
// 静态导入，编译时确定依赖关系
import { foo } from './module.js';
import * as utils from './utils.js';
export const bar = 1;
export default main;

// CommonJS (CJS)
// 动态导入，运行时确定依赖关系
const { foo } = require('./module');
module.exports = { bar: 1 };
exports.bar = 1;
```

### 差异对比

| 特性 | ESM | CJS |
|------|-----|-----|
| 加载时机 | 编译时 | 运行时 |
| 动态导入 | import() | require() |
| 同步/异步 | 异步加载 | 同步加载 |
| 顶层 this | undefined | module.exports |
| 循环依赖 | 支持（部分导出） | 支持（完整导出） |

## 高频面试题

### 1. Webpack 的构建流程是什么？

**答案**：
1. **初始化参数**：合并配置文件和 shell 参数
2. **开始编译**：初始化 Compiler，加载插件
3. **确定入口**：从 entry 找出所有入口文件
4. **编译模块**：调用 Loader 转换模块，解析依赖
5. **完成编译**：得到模块依赖关系和转换后的内容
6. **输出资源**：组装 Chunk，转换文件，写入文件系统

### 2. Loader 和 Plugin 的区别？

**答案**：
- **Loader**：模块转换器，处理文件转换（如 babel-loader 转换 ES6+）
- **Plugin**：扩展 webpack 功能，在构建生命周期中执行（如 HtmlWebpackPlugin 生成 HTML）

### 3. Webpack 的热更新原理？

**答案**：
1. 修改代码 → Webpack 重新编译
2. Webpack-dev-server 通过 WebSocket 通知浏览器
3. 浏览器获取更新后的模块（HMR Runtime）
4. 替换旧模块，不刷新页面

### 4. Vite 为什么比 Webpack 快？

**答案**：
1. **开发模式**：Vite 使用原生 ESM，不打包；Webpack 需要打包整个应用
2. **按需编译**：Vite 只编译浏览器请求的模块；Webpack 编译所有模块
3. **预构建**：Vite 使用 esbuild 预构建依赖，比 Webpack 快 10-100 倍

### 5. 如何优化前端性能？

**构建优化**：
- 代码分割（Code Splitting）
- Tree Shaking 移除无用代码
- 压缩代码（Terser、Gzip）
- 使用 CDN
- 图片优化（压缩、WebP、懒加载）

**运行时优化**：
- 路由懒加载
- 组件懒加载
- 虚拟列表
- 防抖节流
- 缓存策略

---

> 📌 **持续更新中**，更多内容敬请期待...
