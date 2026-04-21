# 性能优化

前端性能优化是提升用户体验的关键环节。

## 性能指标

| 指标 | 说明 | 目标值 |
|------|------|--------|
| FCP (First Contentful Paint) | 首次内容绘制 | < 1.8s |
| LCP (Largest Contentful Paint) | 最大内容绘制 | < 2.5s |
| FID (First Input Delay) | 首次输入延迟 | < 100ms |
| TTI (Time to Interactive) | 可交互时间 | < 3.8s |
| CLS (Cumulative Layout Shift) | 累积布局偏移 | < 0.1 |

## 优化策略

### 1. 图片优化

```jsx | pure
// 使用 WebP 格式
// 响应式图片
<img srcset="small.jpg 300w, large.jpg 1000w"
     sizes="(max-width: 600px) 300px, 1000px">

// 懒加载
<img loading="lazy" src="image.jpg" alt="">
```

### 2. 代码分割

```js
const LazyComponent = React.lazy(() => import('./Component'));
```

### 3. 预加载关键资源

```html
<link rel="preload" href="critical.css" as="style">
<link rel="prefetch" href="next-page.js">
```

### 4. 使用 CDN

- 静态资源部署到 CDN
- 减少服务器负载
- 提高资源加载速度

### 5. 开启 Gzip/Brotli 压缩

```nginx
# Nginx 配置
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

### 6. 缓存策略

- 长期缓存静态资源（文件名加 hash）
- `Cache-Control: public, max-age=31536000, immutable`

### 7. 减少重排重绘

```js
// 优化：批量修改样式
element.style.cssText = 'width: 100px; height: 100px; margin: 10px;';

// 优化：离线操作 DOM
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const li = document.createElement('li');
  li.textContent = `Item ${i}`;
  fragment.appendChild(li);
}
document.getElementById('list').appendChild(fragment);

// 优化：使用 transform 和 opacity（触发 GPU 加速）
element.style.transform = 'translateX(100px)';
element.style.opacity = '0.5';
```

## 输入 URL 到页面显示的全过程

**高频面试题：输入 URL 到页面显示发生了什么？**

**答案**：
1. **DNS 解析**：域名解析为 IP 地址
2. **TCP 连接**：三次握手建立连接
3. **发送 HTTP 请求**：构建请求报文发送
4. **服务器处理**：服务器处理请求返回响应
5. **浏览器解析**：解析 HTML 构建 DOM，解析 CSS 构建 CSSOM
6. **渲染页面**：构建渲染树、布局、绘制

## 安全相关

### XSS（跨站脚本攻击）

- **攻击方式**：攻击者注入恶意脚本
- **防范措施**：
  - 转义用户输入
  - 设置 CSP（内容安全策略）
  - 使用 HttpOnly Cookie

### CSRF（跨站请求伪造）

- **攻击方式**：诱导用户在已登录状态下执行非预期操作
- **防范措施**：
  - 使用 CSRF Token
  - 设置 SameSite Cookie
  - 验证 Referer 头

### 高频面试题

**Q: 前端性能优化有哪些手段？**

**答案**：
1. **资源优化**：图片压缩、代码分割、懒加载
2. **网络优化**：CDN、HTTP/2、缓存策略
3. **渲染优化**：减少重排重绘、使用 CSS3 动画
4. **加载优化**：预加载关键资源、异步加载非关键资源
5. **代码优化**：Tree Shaking、按需加载
