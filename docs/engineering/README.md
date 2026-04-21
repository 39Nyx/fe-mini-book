# 工程化实践

前端工程化是提升开发效率、代码质量和团队协作的关键。

## 目录

| 模块 | 说明 | 链接 |
|------|------|------|
| **Webpack** | 核心概念、Loader/Plugin、代码分割 | [查看](/engineering/webpack) |
| **Vite** | 特点优势、与 Webpack 对比 | [查看](/engineering/vite) |
| **Babel** | 代码转换、Polyfill 方案 | [查看](/engineering/babel) |
| **包管理工具** | npm/yarn/pnpm 对比 | [查看](/engineering/package-manager) |
| **代码规范** | ESLint、Prettier、Husky | [查看](/engineering/code-style) |
| **CI/CD** | GitHub Actions、Docker 部署 | [查看](/engineering/cicd) |
| **模块化规范** | ESM、CJS、Tree Shaking | [查看](/engineering/modules) |

## 知识地图

```
工程化实践
├── 构建工具
│   ├── Webpack
│   │   ├── 核心概念
│   │   ├── Loader vs Plugin
│   │   └── 代码分割
│   └── Vite
│       ├── 特点优势
│       └── 与 Webpack 对比
├── 代码转换
│   └── Babel
│       ├── 核心功能
│       └── Polyfill 方案
├── 包管理工具
│   ├── npm
│   ├── yarn
│   └── pnpm
├── 代码规范
│   ├── ESLint
│   ├── Prettier
│   └── Husky + lint-staged
├── CI/CD
│   ├── GitHub Actions
│   └── Docker 部署
└── 模块化规范
    ├── ES Modules
    ├── CommonJS
    └── Tree Shaking
```

## 学习建议

1. **掌握构建工具**：理解 Webpack/Vite 的核心概念和配置
2. **熟悉代码规范**：配置 ESLint、Prettier 保证代码质量
3. **了解 CI/CD**：学会使用 GitHub Actions 自动化部署
4. **掌握模块化**：理解 ESM 和 Tree Shaking 原理
5. **选择合适的包管理工具**：推荐使用 pnpm

## 高频面试题精选

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
