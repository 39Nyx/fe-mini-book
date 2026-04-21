# 代码规范工具

代码规范工具保证团队代码风格一致，提高代码质量。

## ESLint

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

## Prettier

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

## Husky + lint-staged

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

## ESLint vs Prettier

| 特性 | ESLint | Prettier |
|------|--------|----------|
| 作用 | 代码质量检查 | 代码格式化 |
| 检查内容 | 潜在错误、最佳实践 | 代码风格、格式 |
| 自动修复 | 部分支持 | 完全支持 |
| 配置复杂度 | 较复杂 | 简单 |

### 高频面试题

**Q: ESLint 和 Prettier 如何配合使用？**

**答案**：
1. **ESLint**：负责代码质量检查（潜在错误、最佳实践）
2. **Prettier**：负责代码格式化（空格、换行、引号）
3. **配合方式**：
   - 使用 `eslint-config-prettier` 关闭冲突规则
   - 使用 `eslint-plugin-prettier` 将 Prettier 作为 ESLint 规则运行
   - 在 lint-staged 中先运行 ESLint，再运行 Prettier

**Q: Husky 和 lint-staged 的作用？**

**答案**：
- **Husky**：Git hooks 工具，在提交前执行脚本
- **lint-staged**：只对暂存区的文件执行 lint，提高效率
- **配合使用**：在 pre-commit 钩子中自动格式化和检查代码
