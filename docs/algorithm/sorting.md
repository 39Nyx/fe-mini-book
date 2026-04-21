# 排序算法

排序算法是算法学习的基础，掌握其实现原理和时间复杂度。

## 快速排序 O(n log n)

分治思想，选择基准值，将数组分为小于和大于两部分：

```js
function quickSort(arr) {
  if (arr.length <= 1) return arr;

  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);

  return [...quickSort(left), ...middle, ...quickSort(right)];
}
```

**特点**：
- 平均时间复杂度：O(n log n)
- 最坏时间复杂度：O(n²)
- 空间复杂度：O(log n)
- 不稳定排序

## 归并排序 O(n log n)

分治思想，将数组分为两半分别排序，然后合并：

```js
function mergeSort(arr) {
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;

  while (i < left.length && j < right.length) {
    if (left[i] < right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }

  return result.concat(left.slice(i)).concat(right.slice(j));
}
```

**特点**：
- 时间复杂度：O(n log n) 稳定
- 空间复杂度：O(n)
- 稳定排序

## 堆排序 O(n log n)

利用堆这种数据结构进行排序：

```js
function heapSort(arr) {
  const n = arr.length;

  // 建堆
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i);
  }

  // 排序
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    heapify(arr, i, 0);
  }

  return arr;
}

function heapify(arr, n, i) {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;

  if (left < n && arr[left] > arr[largest]) largest = left;
  if (right < n && arr[right] > arr[largest]) largest = right;

  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    heapify(arr, n, largest);
  }
}
```

**特点**：
- 时间复杂度：O(n log n)
- 空间复杂度：O(1)
- 不稳定排序

## 冒泡排序 O(n²)

```js
function bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}
```

## 高频面试题

### 快排和归并排序的区别？

| 特性 | 快速排序 | 归并排序 |
|------|---------|---------|
| 分治策略 | 先分区后处理 | 先处理子问题再合并 |
| 稳定性 | 不稳定 | 稳定 |
| 空间复杂度 | O(log n) | O(n) |
| 最坏情况 | O(n²) | O(n log n) |
| 适用场景 | 数据量大的数组排序 | 需要稳定排序的场景 |

---

> 📌 **持续更新中**，更多内容敬请期待...
