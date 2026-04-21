# 模块化规范

JavaScript 模块化是前端工程化的基础。

## ES Modules vs CommonJS

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

## 差异对比

| 特性 | ESM | CJS |
|------|-----|-----|
| 加载时机 | 编译时 | 运行时 |
| 动态导入 | import() | require() |
| 同步/异步 | 异步加载 | 同步加载 |
| 顶层 this | undefined | module.exports |
| 循环依赖 | 支持（部分导出） | 支持（完整导出） |

## 模块化演进

### 1. CommonJS（Node.js）
- 服务端标准
- 同步加载
- 运行时确定依赖

### 2. AMD（RequireJS）
- 浏览器端标准
- 异步加载
- 配置复杂

### 3. UMD（兼容方案）
- 同时支持 CommonJS 和 AMD
- 兼容性好
- 代码冗余

### 4. ES Modules（现代标准）
- 语言层面支持
- 静态分析
- Tree Shaking 友好

## Tree Shaking

```js
// utils.js
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

// main.js
import { add } from './utils.js';
console.log(add(1, 2)); // subtract 会被移除

// 需要满足的条件：
// 1. 使用 ESM
// 2. 函数无副作用
// 3. 生产模式构建
```

### 高频面试题

**Q: ESM 和 CommonJS 的主要区别？**

**答案**：
1. **加载时机**：ESM 编译时加载，CJS 运行时加载
2. **语法**：ESM 使用 import/export，CJS 使用 require/module.exports
3. **this 指向**：ESM 顶层 this 是 undefined，CJS 指向 module.exports
4. **值引用**：ESM 是值的引用（动态绑定），CJS 是值的拷贝

**Q: 什么是 Tree Shaking？如何实现？**

**答案**：
- **Tree Shaking**：移除未使用的代码，减小打包体积
- **实现条件**：
  1. 使用 ES Modules（静态分析）
  2. 代码无副作用
  3. 开启生产模式优化
