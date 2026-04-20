# 浏览器与网络

深入理解浏览器工作原理和网络协议，是前端工程师的必备技能。

## 浏览器渲染原理

### 渲染流程

```
URL → DNS解析 → TCP连接 → HTTP请求 → 服务器响应 → 解析HTML → 构建DOM树
                                                                    ↓
渲染页面 ← 绘制(Paint) ← 布局(Layout) ← 构建渲染树(Render Tree) ← 构建CSSOM树
```

### 关键渲染路径

```js
// 1. 构建 DOM 树
// 将 HTML 解析为 DOM 节点

// 2. 构建 CSSOM 树
// 将 CSS 解析为样式规则

// 3. 构建渲染树
// 合并 DOM 和 CSSOM，计算样式

// 4. 布局（Layout/Reflow）
// 计算元素的几何信息（位置和大小）

// 5. 绘制（Paint）
// 将渲染树绘制到屏幕

// 6. 合成（Composite）
// 将多个图层合成为最终页面
```

### 重排（Reflow）与重绘（Repaint）

```js
// 触发重排的操作（性能开销大）
element.style.width = '100px';      // 改变尺寸
element.style.display = 'none';     // 改变显示
element.className = 'new-class';    // 改变类名
window.addEventListener('resize', handler); // 窗口大小变化

// 触发重绘的操作（性能开销较小）
element.style.color = 'red';        // 改变颜色
element.style.backgroundColor = '#fff'; // 改变背景色
element.style.visibility = 'hidden'; // 改变可见性

// 优化：批量修改样式
// 不好的做法
const element = document.getElementById('box');
element.style.width = '100px';
element.style.height = '100px';
element.style.margin = '10px';

// 好的做法：使用 cssText 或 class
element.style.cssText = 'width: 100px; height: 100px; margin: 10px;';
// 或
element.className = 'box-optimized';

// 优化：离线操作 DOM
// 使用 DocumentFragment
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const li = document.createElement('li');
  li.textContent = `Item ${i}`;
  fragment.appendChild(li);
}
document.getElementById('list').appendChild(fragment);
```

## 浏览器存储

### Cookie

```js
// 设置 Cookie
document.cookie = 'name=value; expires=Thu, 18 Dec 2025 12:00:00 UTC; path=/';

// 读取 Cookie
const cookies = document.cookie; // "name1=value1; name2=value2"

// 删除 Cookie
document.cookie = 'name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
```

**Cookie 特点**：
- 大小限制：4KB
- 每次请求自动携带，增加请求体积
- 可设置过期时间
- 可设置 HttpOnly、Secure、SameSite

### LocalStorage 与 SessionStorage

```js
// LocalStorage - 持久化存储
localStorage.setItem('key', 'value');
const value = localStorage.getItem('key');
localStorage.removeItem('key');
localStorage.clear();

// SessionStorage - 会话级存储
sessionStorage.setItem('key', 'value');
const value = sessionStorage.getItem('key');

// 存储对象需要序列化
const user = { name: 'Tom', age: 20 };
localStorage.setItem('user', JSON.stringify(user));
const userData = JSON.parse(localStorage.getItem('user'));
```

| 特性 | Cookie | LocalStorage | SessionStorage |
|------|--------|--------------|----------------|
| 容量 | 4KB | 5-10MB | 5-10MB |
| 生命周期 | 可设置 | 永久 | 会话结束 |
| 服务端读取 | 可以 | 不可以 | 不可以 |
| 每次请求携带 | 是 | 否 | 否 |

### IndexedDB

```js
// 打开数据库
const request = indexedDB.open('myDatabase', 1);

request.onupgradeneeded = (event) => {
  const db = event.target.result;
  const store = db.createObjectStore('users', { keyPath: 'id' });
  store.createIndex('name', 'name', { unique: false });
};

request.onsuccess = (event) => {
  const db = event.target.result;
  
  // 添加数据
  const transaction = db.transaction(['users'], 'readwrite');
  const store = transaction.objectStore('users');
  store.add({ id: 1, name: 'Tom', age: 20 });
};
```

## HTTP 协议

### HTTP 方法

| 方法 | 描述 | 幂等性 | 安全性 |
|------|------|--------|--------|
| GET | 获取资源 | 是 | 是 |
| POST | 创建资源 | 否 | 否 |
| PUT | 更新资源（完整） | 是 | 否 |
| PATCH | 更新资源（部分） | 否 | 否 |
| DELETE | 删除资源 | 是 | 否 |

### 常见状态码

| 状态码 | 含义 | 说明 |
|--------|------|------|
| 200 | OK | 请求成功 |
| 201 | Created | 创建成功 |
| 204 | No Content | 删除成功 |
| 301 | Moved Permanently | 永久重定向 |
| 302 | Found | 临时重定向 |
| 304 | Not Modified | 缓存有效 |
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未认证 |
| 403 | Forbidden | 无权限 |
| 404 | Not Found | 资源不存在 |
| 500 | Internal Server Error | 服务器内部错误 |
| 502 | Bad Gateway | 网关错误 |
| 503 | Service Unavailable | 服务不可用 |

### HTTP 缓存

```
浏览器请求 → 检查缓存 → 有缓存且未过期 → 直接使用缓存
                              ↓
                        缓存过期 → 携带缓存标识请求服务器
                                          ↓
                              资源未修改(304) → 更新缓存时间，使用缓存
                                          ↓
                              资源已修改(200) → 返回新资源，更新缓存
```

**缓存头部**：

```http
# 强缓存
Cache-Control: max-age=3600  # 缓存1小时
Expires: Wed, 21 Oct 2025 07:28:00 GMT

# 协商缓存
Last-Modified: Wed, 21 Oct 2024 07:28:00 GMT
ETag: "33a64df5"

# 请求时携带
If-Modified-Since: Wed, 21 Oct 2024 07:28:00 GMT
If-None-Match: "33a64df5"
```

| 特性 | 强缓存 | 协商缓存 |
|------|--------|----------|
| 状态码 | 200 (from cache) | 304 |
| 是否请求服务器 | 否 | 是 |
|  header | Cache-Control/Expires | Last-Modified/ETag |

## TCP/IP

### 三次握手与四次挥手

```
三次握手（建立连接）：

客户端                    服务端
  | ---- SYN=1, seq=x ----> |
  |                         |
  | <--- SYN=1, ACK=1, ---- |
  |      seq=y, ack=x+1     |
  |                         |
  | ---- ACK=1, seq=x+1 --->|
  |      ack=y+1            |
  |                         |

四次挥手（断开连接）：

客户端                    服务端
  | ---- FIN=1, seq=u ----> |
  |                         |
  | <------- ACK=1 ---------|
  |       ack=u+1           |
  |                         |
  | <------ FIN=1 -----------
  |       seq=v             |
  |                         |
  | ---- ACK=1, ack=v+1 --->|
```

### TCP vs UDP

| 特性 | TCP | UDP |
|------|-----|-----|
| 连接 | 面向连接 | 无连接 |
| 可靠性 | 可靠传输 | 不可靠 |
| 顺序 | 保证顺序 | 不保证 |
| 流量控制 | 有 | 无 |
| 拥塞控制 | 有 | 无 |
| 头部开销 | 20字节 | 8字节 |
| 适用场景 | HTTP、FTP、邮件 | 视频流、DNS、游戏 |

## 跨域解决方案

### CORS（跨域资源共享）

```http
# 简单请求
GET /data HTTP/1.1
Host: api.example.com
Origin: https://example.com

HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Methods: GET, POST
Access-Control-Allow-Headers: Content-Type

# 预检请求（非简单请求）
OPTIONS /data HTTP/1.1
Host: api.example.com
Origin: https://example.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: X-Custom-Header

HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Methods: POST
Access-Control-Allow-Headers: X-Custom-Header
```

### 其他跨域方案

```js
// 1. JSONP（只支持 GET）
function handleResponse(data) {
  console.log(data);
}
const script = document.createElement('script');
script.src = 'https://api.example.com/data?callback=handleResponse';
document.body.appendChild(script);

// 2. 代理服务器（开发环境）
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'https://api.example.com',
        changeOrigin: true
      }
    }
  }
};

// 3. postMessage（窗口间通信）
// 父窗口
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://trusted.com') return;
  console.log(event.data);
});

// 子窗口
window.parent.postMessage('Hello', 'https://parent.com');
```

## 性能优化

### 性能指标

| 指标 | 说明 | 目标值 |
|------|------|--------|
| FCP (First Contentful Paint) | 首次内容绘制 | < 1.8s |
| LCP (Largest Contentful Paint) | 最大内容绘制 | < 2.5s |
| FID (First Input Delay) | 首次输入延迟 | < 100ms |
| TTI (Time to Interactive) | 可交互时间 | < 3.8s |
| CLS (Cumulative Layout Shift) | 累积布局偏移 | < 0.1 |

### 优化策略

```js
// 1. 图片优化
// 使用 WebP 格式
// 响应式图片
<img srcset="small.jpg 300w, large.jpg 1000w"
     sizes="(max-width: 600px) 300px, 1000px">

// 懒加载
<img loading="lazy" src="image.jpg" alt="">

// 2. 代码分割
const LazyComponent = React.lazy(() => import('./Component'));

// 3. 预加载关键资源
<link rel="preload" href="critical.css" as="style">
<link rel="prefetch" href="next-page.js">

// 4. 使用 CDN
// 静态资源部署到 CDN

// 5. 开启 Gzip/Brotli 压缩
// Nginx 配置
// gzip on;
// gzip_types text/plain text/css application/json application/javascript;

// 6. 缓存策略
// 长期缓存静态资源（文件名加 hash）
// Cache-Control: public, max-age=31536000, immutable
```

## 高频面试题

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

---

> 📌 **持续更新中**，更多内容敬请期待...
