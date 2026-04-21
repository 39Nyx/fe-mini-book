# 数组方法手写实现

数组方法是 JavaScript 中最常用的 API，理解其内部实现有助于写出更优雅的代码。

## map

对数组每个元素执行回调，返回新数组：

```js
Array.prototype.myMap = function(callback, thisArg) {
  if (this == null) {
    throw new TypeError('this is null or undefined');
  }
  if (typeof callback !== 'function') {
    throw new TypeError(callback + ' is not a function');
  }

  const result = [];
  const array = Object(this);
  const len = array.length >>> 0;

  for (let i = 0; i < len; i++) {
    if (i in array) {
      result[i] = callback.call(thisArg, array[i], i, array);
    }
  }

  return result;
};

// 使用
[1, 2, 3].myMap(x => x * 2); // [2, 4, 6]
```

## filter

筛选满足条件的元素，返回新数组：

```js
Array.prototype.myFilter = function(callback, thisArg) {
  if (this == null) {
    throw new TypeError('this is null or undefined');
  }
  if (typeof callback !== 'function') {
    throw new TypeError(callback + ' is not a function');
  }

  const result = [];
  const array = Object(this);
  const len = array.length >>> 0;

  for (let i = 0; i < len; i++) {
    if (i in array) {
      if (callback.call(thisArg, array[i], i, array)) {
        result.push(array[i]);
      }
    }
  }

  return result;
};

// 使用
[1, 2, 3, 4].myFilter(x => x > 2); // [3, 4]
```

## reduce

累积计算，将数组归约为单个值：

```js
Array.prototype.myReduce = function(callback, initialValue) {
  if (this == null) {
    throw new TypeError('this is null or undefined');
  }
  if (typeof callback !== 'function') {
    throw new TypeError(callback + ' is not a function');
  }

  const array = Object(this);
  const len = array.length >>> 0;
  let accumulator = initialValue;
  let startIndex = 0;

  if (arguments.length < 2) {
    if (len === 0) {
      throw new TypeError('Reduce of empty array with no initial value');
    }
    accumulator = array[0];
    startIndex = 1;
  }

  for (let i = startIndex; i < len; i++) {
    if (i in array) {
      accumulator = callback(accumulator, array[i], i, array);
    }
  }

  return accumulator;
};

// 使用
[1, 2, 3, 4].myReduce((sum, x) => sum + x, 0); // 10
```

## flat

数组扁平化，将嵌套数组展开：

```js
// 递归实现
Array.prototype.myFlat = function(depth = 1) {
  const result = [];

  (function flat(arr, d) {
    for (const item of arr) {
      if (Array.isArray(item) && d > 0) {
        flat(item, d - 1);
      } else {
        result.push(item);
      }
    }
  })(this, depth);

  return result;
};

// reduce 实现
Array.prototype.myFlatReduce = function(depth = 1) {
  return depth > 0
    ? this.reduce((acc, val) =>
        acc.concat(Array.isArray(val) ? val.myFlatReduce(depth - 1) : val), [])
    : this.slice();
};

// 使用
[1, [2, [3, [4]]]].myFlat(2); // [1, 2, 3, [4]]
```

## forEach

遍历数组，无返回值：

```js
Array.prototype.myForEach = function(callback, thisArg) {
  if (this == null) {
    throw new TypeError('this is null or undefined');
  }
  if (typeof callback !== 'function') {
    throw new TypeError(callback + ' is not a function');
  }

  const array = Object(this);
  const len = array.length >>> 0;

  for (let i = 0; i < len; i++) {
    if (i in array) {
      callback.call(thisArg, array[i], i, array);
    }
  }
};
```

## find

查找第一个满足条件的元素：

```js
Array.prototype.myFind = function(callback, thisArg) {
  if (this == null) {
    throw new TypeError('this is null or undefined');
  }
  if (typeof callback !== 'function') {
    throw new TypeError(callback + ' is not a function');
  }

  const array = Object(this);
  const len = array.length >>> 0;

  for (let i = 0; i < len; i++) {
    if (i in array && callback.call(thisArg, array[i], i, array)) {
      return array[i];
    }
  }

  return undefined;
};
```

## 高频面试题

### 1. map 和 forEach 的区别？

| 特性 | map | forEach |
|------|-----|---------|
| 返回值 | 新数组 | undefined |
| 链式调用 | 支持 | 不支持 |
| 是否改变原数组 | 否 | 否 |
| 可跳过/中断 | 不可 | 不可（可用 some/every） |

### 2. reduce 有哪些应用场景？

1. **求和/求积**：`arr.reduce((sum, x) => sum + x, 0)`
2. **找最大/最小值**：`arr.reduce((max, x) => x > max ? x : max)`
3. **数组转对象**：按某个属性分组
4. **数组去重**：`arr.reduce((acc, x) => acc.includes(x) ? acc : [...acc, x], [])`
5. **实现 map/filter**：可以通过 reduce 模拟

### 3. 如何实现数组扁平化？

```js
// 方法1: 递归
function flatten(arr) {
  return arr.reduce((acc, val) => 
    acc.concat(Array.isArray(val) ? flatten(val) : val), []);
}

// 方法2: Infinity
arr.flat(Infinity);

// 方法3: JSON
JSON.parse('[' + JSON.stringify(arr).replace(/[\[\]]/g, '') + ']');
```

---

> 📌 **持续更新中**，更多内容敬请期待...
