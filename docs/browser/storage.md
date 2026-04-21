# 浏览器存储

浏览器提供了多种数据存储方案，适用于不同场景。

## Cookie

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

## LocalStorage 与 SessionStorage

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

## IndexedDB

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

### 高频面试题

**Q: Cookie、LocalStorage、SessionStorage 的区别？**

**答案**：
- **Cookie**：4KB，每次请求携带，可设置过期时间，服务端可读写
- **LocalStorage**：5-10MB，持久化存储，仅在客户端，需手动清除
- **SessionStorage**：5-10MB，会话级存储，页面关闭后清除
