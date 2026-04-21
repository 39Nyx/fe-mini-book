# 跨域解决方案

跨域是前端开发中常见的问题，需要理解同源策略和解决方案。

## 什么是跨域？

浏览器的**同源策略**（Same-Origin Policy）限制了一个源（origin）的文档或脚本如何与另一个源的资源进行交互。

**同源的定义**：协议、域名、端口都相同。

## CORS（跨域资源共享）

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

## 其他跨域方案

### 1. JSONP（只支持 GET）

```js
function handleResponse(data) {
  console.log(data);
}
const script = document.createElement('script');
script.src = 'https://api.example.com/data?callback=handleResponse';
document.body.appendChild(script);
```

### 2. 代理服务器（开发环境）

```js
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
```

### 3. postMessage（窗口间通信）

```js
// 父窗口
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://trusted.com') return;
  console.log(event.data);
});

// 子窗口
window.parent.postMessage('Hello', 'https://parent.com');
```

| 方案 | 支持方法 | 适用场景 |
|------|----------|----------|
| CORS | 所有 | 现代浏览器推荐方案 |
| JSONP | 仅 GET | 老旧浏览器兼容 |
| 代理 | 所有 | 开发环境、服务端 |
| postMessage | - | iframe 间通信 |

### 高频面试题

**Q: 什么是同源策略？跨域解决方案有哪些？**

**答案**：
- **同源策略**：协议、域名、端口都相同的策略
- **解决方案**：
  - CORS（推荐）：服务端设置 Access-Control-* 头部
  - JSONP：仅支持 GET，利用 script 标签
  - 代理服务器：开发环境或生产环境转发请求
  - postMessage：iframe 窗口间通信
