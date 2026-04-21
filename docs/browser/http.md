# HTTP 协议与缓存

HTTP 协议是 Web 的基石，理解 HTTP 对前端开发至关重要。

## HTTP 方法

| 方法 | 描述 | 幂等性 | 安全性 |
|------|------|--------|--------|
| GET | 获取资源 | 是 | 是 |
| POST | 创建资源 | 否 | 否 |
| PUT | 更新资源（完整） | 是 | 否 |
| PATCH | 更新资源（部分） | 否 | 否 |
| DELETE | 删除资源 | 是 | 否 |

## 常见状态码

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

## HTTP 缓存

```
浏览器请求 → 检查缓存 → 有缓存且未过期 → 直接使用缓存
                              ↓
                        缓存过期 → 携带缓存标识请求服务器
                                          ↓
                              资源未修改(304) → 更新缓存时间，使用缓存
                                          ↓
                              资源已修改(200) → 返回新资源，更新缓存
```

### 缓存头部

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
| header | Cache-Control/Expires | Last-Modified/ETag |

### 高频面试题

**Q: 强缓存和协商缓存的区别？**

**答案**：
- **强缓存**：直接使用本地缓存，不向服务器请求（200 from cache）
  - 控制头：`Cache-Control`、`Expires`
- **协商缓存**：向服务器验证缓存是否有效（304）
  - 控制头：`Last-Modified/If-Modified-Since`、`ETag/If-None-Match`
