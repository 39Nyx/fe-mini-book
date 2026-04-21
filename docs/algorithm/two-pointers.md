# 双指针与滑动窗口

双指针和滑动窗口是解决数组和字符串问题的常用技巧。

## 双指针技巧

### 盛最多水的容器

使用左右两个指针，逐步收缩：

```js
function maxArea(height) {
  let left = 0, right = height.length - 1;
  let maxArea = 0;

  while (left < right) {
    const area = Math.min(height[left], height[right]) * (right - left);
    maxArea = Math.max(maxArea, area);

    if (height[left] < height[right]) left++;
    else right--;
  }

  return maxArea;
}
```

### 三数之和

```js
function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const result = [];

  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;

    let left = i + 1, right = nums.length - 1;
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        while (left < right && nums[left] === nums[left + 1]) left++;
        while (left < right && nums[right] === nums[right - 1]) right--;
        left++;
        right--;
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }

  return result;
}
```

## 滑动窗口

### 滑动窗口最大值

使用单调队列优化：

```js
function maxSlidingWindow(nums, k) {
  const result = [];
  const deque = []; // 存储索引，保持递减

  for (let i = 0; i < nums.length; i++) {
    // 移除窗口外的元素
    while (deque.length && deque[0] <= i - k) {
      deque.shift();
    }

    // 保持递减
    while (deque.length && nums[deque[deque.length - 1]] < nums[i]) {
      deque.pop();
    }

    deque.push(i);

    if (i >= k - 1) {
      result.push(nums[deque[0]]);
    }
  }

  return result;
}
```

## 双指针应用场景

1. **数组求和**：两数之和、三数之和
2. **链表操作**：找中点、判断有环
3. **字符串处理**：回文串、最长公共子串
4. **滑动窗口**：最长无重复子串、最小覆盖子串

## 滑动窗口模板

```js
function slidingWindow(s, t) {
  let left = 0, right = 0;
  const window = {};
  const need = {};

  while (right < s.length) {
    // 扩大窗口
    const c = s[right];
    right++;
    // 更新窗口数据

    // 判断是否需要收缩
    while (windowNeedsShrink) {
      // 收缩窗口
      const d = s[left];
      left++;
      // 更新窗口数据
    }
  }

  return result;
}
```

## 高频面试题

### 时间复杂度和空间复杂度的区别？

**答案**：
- **时间复杂度**：算法执行所需时间随输入规模增长的变化趋势
- **空间复杂度**：算法执行所需内存随输入规模增长的变化趋势

### 常见的复杂度级别？

```
O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(n³) < O(2ⁿ)
常数   对数      线性     线性对数     平方      立方      指数
```

---

> 📌 **持续更新中**，更多内容敬请期待...
