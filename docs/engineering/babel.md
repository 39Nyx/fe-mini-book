# Babel 与代码转换

Babel 是 JavaScript 编译器，用于将现代 JavaScript 代码转换为向后兼容的版本。

## 核心功能

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

## Polyfill 方案

```js
// 方案1: @babel/polyfill (已废弃)
import '@babel/polyfill';

// 方案2: core-js + regenerator-runtime
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// 方案3: useBuiltIns: 'usage' (推荐)
// 按需引入，自动检测代码中使用的特性
```

## Babel 工作原理

1. **解析（Parse）**：将源代码解析为 AST（抽象语法树）
2. **转换（Transform）**：遍历 AST，应用插件进行转换
3. **生成（Generate）**：将转换后的 AST 生成新的代码

### 高频面试题

**Q: Babel 的工作原理是什么？**

**答案**：
1. **解析**：将代码转换为 AST
2. **转换**：遍历并修改 AST（Plugins 在此阶段工作）
3. **生成**：将 AST 转换回代码

**Q: preset-env 的 useBuiltIns 选项？**

**答案**：
- `false`：不自动引入 polyfill
- `entry`：根据 targets 全量引入
- `usage`（推荐）：按需引入，自动检测使用的特性
