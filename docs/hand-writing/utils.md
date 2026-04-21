# 常用工具函数

面试中常要求手写一些实用的工具函数，考察对 JavaScript 的熟练程度。

## 千分位格式化

将数字转换为带千分位逗号的字符串：

```js
// 正则实现
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Intl API（推荐）
function formatNumberIntl(num) {
  return new Intl.NumberFormat('en-US').format(num);
}

// 手动实现
function formatNumberManual(num) {
  const str = num.toString();
  let result = '';
  let count = 0;
  
  for (let i = str.length - 1; i >= 0; i--) {
    result = str[i] + result;
    count++;
    if (count % 3 === 0 && i !== 0) {
      result = ',' + result;
    }
  }
  
  return result;
}

console.log(formatNumber(1234567));      // "1,234,567"
console.log(formatNumberIntl(1234567));  // "1,234,567"
```

## 图片懒加载

使用 IntersectionObserver 实现：

```js
function lazyLoadImages() {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        observer.unobserve(img);
      }
    });
  });

  document.querySelectorAll('img.lazy').forEach(img => {
    imageObserver.observe(img);
  });
}

// HTML 结构
// <img class="lazy" data-src="real-image.jpg" src="placeholder.jpg">
```

## 简单模板引擎

实现基本的模板字符串替换：

```js
function template(str, data) {
  return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? data[key] : match;
  });
}

// 使用
const str = 'Hello, {{name}}! You are {{age}} years old.';
const data = { name: 'Tom', age: 20 };
console.log(template(str, data)); // "Hello, Tom! You are 20 years old."
```

## 睡眠函数

实现类似其他语言的 sleep 功能：

```js
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 使用
async function demo() {
  console.log('开始');
  await sleep(1000);
  console.log('1秒后');
}
```

## 重试函数

异步操作失败时自动重试：

```js
async function retry(fn, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(delay);
    }
  }
}

// 使用
const result = await retry(() => fetchData(), 3, 1000);
```

## 数据类型判断

更精确的类型判断工具：

```js
function getType(value) {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}

// 使用
getType([]);         // "array"
getType({});         // "object"
getType(null);       // "null"
getType(undefined);  // "undefined"
getType(() => {});   // "function"
getType(/abc/);      // "regexp"
getType(new Date()); // "date"
```

## 函数记忆化

缓存函数结果，避免重复计算：

```js
function memoize(fn) {
  const cache = new Map();
  
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// 使用
const fibonacci = memoize(function(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});

console.log(fibonacci(50)); // 快速计算，不会栈溢出
```

## 高频面试题

### 1. 如何实现大文件分片上传？

**思路**：
1. 使用 `File.prototype.slice` 将文件切片
2. 为每片计算 hash（如 spark-md5）
3. 并发上传切片，支持断点续传
4. 服务端合并切片

```js
function createChunks(file, chunkSize = 2 * 1024 * 1024) {
  const chunks = [];
  let start = 0;
  
  while (start < file.size) {
    chunks.push(file.slice(start, start + chunkSize));
    start += chunkSize;
  }
  
  return chunks;
}
```

### 2. 如何实现一个 LRU 缓存？

```js
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }
  
  get(key) {
    if (!this.cache.has(key)) return -1;
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value); // 移到末尾
    return value;
  }
  
  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}
```

---

> 📌 **持续更新中**，更多内容敬请期待...
