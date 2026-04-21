# 浏览器与网络

深入理解浏览器工作原理和网络协议，是前端工程师的必备技能。

## 目录

| 模块 | 说明 | 链接 |
|------|------|------|
| **渲染原理** | DOM 树、CSSOM、渲染流程、重排重绘 | [查看](/browser/rendering) |
| **浏览器存储** | Cookie、LocalStorage、SessionStorage、IndexedDB | [查看](/browser/storage) |
| **HTTP 协议** | HTTP 方法、状态码、缓存机制 | [查看](/browser/http) |
| **TCP/IP** | 三次握手、四次挥手、TCP vs UDP | [查看](/browser/tcp-ip) |
| **跨域解决方案** | CORS、JSONP、代理、postMessage | [查看](/browser/cors) |
| **性能优化** | 性能指标、优化策略、安全防护 | [查看](/browser/performance) |

## 知识地图

```
浏览器与网络
├── 渲染原理
│   ├── DOM/CSSOM 构建
│   ├── 渲染流程
│   └── 重排与重绘优化
├── 存储方案
│   ├── Cookie
│   ├── LocalStorage/SessionStorage
│   └── IndexedDB
├── HTTP 协议
│   ├── HTTP 方法与状态码
│   └── 缓存策略
├── TCP/IP
│   ├── 三次握手与四次挥手
│   └── TCP vs UDP
├── 跨域方案
│   ├── CORS
│   ├── JSONP
│   ├── 代理
│   └── postMessage
└── 性能优化
    ├── 核心指标
    ├── 优化策略
    └── 安全防护
```

## 学习建议

1. **理解渲染流程**：掌握浏览器如何将 HTML/CSS 渲染为页面
2. **掌握缓存机制**：理解强缓存和协商缓存的区别和应用场景
3. **熟悉网络协议**：理解 TCP/IP 和 HTTP 的工作原理
4. **解决跨域问题**：掌握常见的跨域解决方案
5. **性能优化实践**：学会使用性能指标和优化策略

## 高频面试题精选

### 1. 输入 URL 到页面显示发生了什么？

**答案**：
1. **DNS 解析**：域名解析为 IP 地址
2. **TCP 连接**：三次握手建立连接
3. **发送 HTTP 请求**：构建请求报文发送
4. **服务器处理**：服务器处理请求返回响应
5. **浏览器解析**：解析 HTML 构建 DOM，解析 CSS 构建 CSSOM
6. **渲染页面**：构建渲染树、布局、绘制

### 2. 强缓存和协商缓存的区别？

**答案**：
- **强缓存**：直接使用本地缓存，不向服务器请求（200 from cache）
  - 控制头：`Cache-Control`、`Expires`
- **协商缓存**：向服务器验证缓存是否有效（304）
  - 控制头：`Last-Modified/If-Modified-Since`、`ETag/If-None-Match`

### 3. 什么是 XSS 和 CSRF？如何防范？

**XSS（跨站脚本攻击）**：
- 攻击者注入恶意脚本
- 防范：转义用户输入、CSP、HttpOnly Cookie

**CSRF（跨站请求伪造）**：
- 诱导用户在已登录状态下执行非预期操作
- 防范：CSRF Token、SameSite Cookie、验证 Referer

### 4. 重排和重绘的区别？如何优化？

**答案**：
- **重排（Reflow）**：元素尺寸、位置变化，需要重新计算布局
- **重绘（Repaint）**：外观变化（颜色、背景），不影响布局

**优化**：
- 批量修改样式（使用 class 或 cssText）
- 离线操作 DOM（DocumentFragment）
- 使用 transform 和 opacity（触发 GPU 加速）
- 避免频繁读取布局属性（offsetHeight、scrollTop 等）

### 5. TCP 为什么需要三次握手？

**答案**：
1. 确认双方发送和接收能力正常
2. 同步初始序列号
3. 防止历史重复连接初始化
