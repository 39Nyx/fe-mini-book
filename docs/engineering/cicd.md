# CI/CD 与部署

持续集成和持续部署是自动化交付的关键环节。

## GitHub Actions

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

## Docker 部署

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

## CI/CD 流程

```
代码提交 → 触发 CI → 安装依赖 → 代码检查 → 运行测试 → 构建 → 部署
```

### 1. 持续集成（CI）
- **代码检查**：ESLint、StyleLint
- **单元测试**：Jest、Vitest
- **构建验证**：确保构建成功

### 2. 持续部署（CD）
- **自动化部署**：推送到服务器或 CDN
- **环境管理**：开发、测试、生产环境
- **回滚机制**：快速回滚到上一个版本

### 高频面试题

**Q: CI/CD 的好处是什么？**

**答案**：
1. **自动化**：减少人工操作，提高效率
2. **质量保证**：自动测试和检查，减少 bug
3. **快速交付**：缩短发布周期
4. **降低风险**：小步快跑，容易定位问题

**Q: 前端部署有哪些方式？**

**答案**：
1. **静态服务器**：Nginx、Apache
2. **CDN**：阿里云 OSS、腾讯云 COS、AWS S3
3. **容器化**：Docker + K8s
4. **Serverless**：Vercel、Netlify、Cloudflare Pages
