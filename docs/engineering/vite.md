# Vite 构建工具

Vite 是新一代前端构建工具，以极速的开发体验著称。

## 特点与优势

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

## Webpack vs Vite

| 特性 | Webpack | Vite |
|------|---------|------|
| 启动速度 | 慢（需要打包） | 快（原生 ESM） |
| HMR 速度 | 随项目增大而变慢 | 始终很快 |
| 生产构建 | 成熟稳定 | 基于 Rollup |
| 生态 | 丰富 | 快速增长 |
| 配置复杂度 | 较复杂 | 简洁 |

### 高频面试题

**Q: Vite 为什么比 Webpack 快？**

**答案**：
1. **开发模式**：Vite 使用原生 ESM，不打包；Webpack 需要打包整个应用
2. **按需编译**：Vite 只编译浏览器请求的模块；Webpack 编译所有模块
3. **预构建**：Vite 使用 esbuild 预构建依赖，比 Webpack 快 10-100 倍

**Q: Vite 和 Webpack 应该如何选择？**

**答案**：
- **Vite**：适合新项目、追求开发体验、中小型项目
- **Webpack**：适合老项目、需要复杂定制、大型企业级应用
