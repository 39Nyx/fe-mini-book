# 数据结构与算法

掌握数据结构与算法是前端面试的重要环节，也是提升编程思维的关键。

## 时间复杂度与空间复杂度

### Big O 表示法

```
O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(n³) < O(2ⁿ)
常数   对数      线性     线性对数     平方      立方      指数
```

### 常见复杂度分析

```js
// O(1) - 常数时间
function getFirst(arr) {
  return arr[0];
}

// O(n) - 线性时间
function findElement(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}

// O(log n) - 对数时间（二分查找）
function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

// O(n²) - 平方时间
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

## 常用数据结构

### 数组与链表

```js
// 数组 - 连续内存，随机访问 O(1)
const arr = [1, 2, 3, 4, 5];
arr[2]; // O(1) 访问
arr.push(6); // O(1) 尾部插入
arr.splice(2, 0, 10); // O(n) 中间插入

// 链表 - 非连续内存，插入删除 O(1)
class ListNode {
  constructor(val) {
    this.val = val;
    this.next = null;
  }
}

// 链表操作
function reverseList(head) {
  let prev = null, curr = head;
  while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}

// 快慢指针找中点
function findMiddle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  return slow;
}
```

### 栈与队列

```js
// 栈 - 后进先出 LIFO
class Stack {
  constructor() {
    this.items = [];
  }
  push(item) {
    this.items.push(item);
  }
  pop() {
    return this.items.pop();
  }
  peek() {
    return this.items[this.items.length - 1];
  }
  isEmpty() {
    return this.items.length === 0;
  }
}

// 队列 - 先进先出 FIFO
class Queue {
  constructor() {
    this.items = [];
  }
  enqueue(item) {
    this.items.push(item);
  }
  dequeue() {
    return this.items.shift();
  }
  front() {
    return this.items[0];
  }
}

// 用栈实现队列
class MyQueue {
  constructor() {
    this.stack1 = []; // 入队栈
    this.stack2 = []; // 出队栈
  }
  push(x) {
    this.stack1.push(x);
  }
  pop() {
    if (this.stack2.length === 0) {
      while (this.stack1.length) {
        this.stack2.push(this.stack1.pop());
      }
    }
    return this.stack2.pop();
  }
}
```

### 哈希表

```js
// JavaScript 对象/Map 就是哈希表实现
const map = new Map();
map.set('key', 'value');
map.get('key'); // O(1)
map.has('key'); // O(1)
map.delete('key'); // O(1)

// 两数之和
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

// 无重复字符的最长子串
function lengthOfLongestSubstring(s) {
  const map = new Map();
  let left = 0, maxLen = 0;
  
  for (let right = 0; right < s.length; right++) {
    if (map.has(s[right])) {
      left = Math.max(left, map.get(s[right]) + 1);
    }
    map.set(s[right], right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  
  return maxLen;
}
```

### 树

```js
// 二叉树节点
class TreeNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}

// 前序遍历（根-左-右）
function preorder(root) {
  if (!root) return [];
  const result = [];
  const stack = [root];
  
  while (stack.length) {
    const node = stack.pop();
    result.push(node.val);
    if (node.right) stack.push(node.right);
    if (node.left) stack.push(node.left);
  }
  
  return result;
}

// 层序遍历（BFS）
function levelOrder(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];
  
  while (queue.length) {
    const levelSize = queue.length;
    const currentLevel = [];
    
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      currentLevel.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    
    result.push(currentLevel);
  }
  
  return result;
}

// 二叉搜索树验证
function isValidBST(root, min = -Infinity, max = Infinity) {
  if (!root) return true;
  if (root.val <= min || root.val >= max) return false;
  return isValidBST(root.left, min, root.val) &&
         isValidBST(root.right, root.val, max);
}
```

## 经典算法

### 排序算法

```js
// 快速排序 O(n log n)
function quickSort(arr) {
  if (arr.length <= 1) return arr;
  
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);
  
  return [...quickSort(left), ...middle, ...quickSort(right)];
}

// 归并排序 O(n log n)
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

// 堆排序 O(n log n)
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

### 搜索算法

```js
// 深度优先搜索 DFS
function dfs(graph, start, visited = new Set()) {
  visited.add(start);
  console.log(start);
  
  for (const neighbor of graph[start]) {
    if (!visited.has(neighbor)) {
      dfs(graph, neighbor, visited);
    }
  }
}

// 广度优先搜索 BFS
function bfs(graph, start) {
  const visited = new Set([start]);
  const queue = [start];
  
  while (queue.length) {
    const node = queue.shift();
    console.log(node);
    
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
}

// 岛屿数量（DFS应用）
function numIslands(grid) {
  if (!grid.length) return 0;
  
  const rows = grid.length;
  const cols = grid[0].length;
  let count = 0;
  
  function dfs(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] === '0') {
      return;
    }
    grid[r][c] = '0'; // 标记为已访问
    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  }
  
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i][j] === '1') {
        count++;
        dfs(i, j);
      }
    }
  }
  
  return count;
}
```

### 动态规划

```js
// 斐波那契数列
function fibonacci(n) {
  if (n <= 1) return n;
  
  let prev = 0, curr = 1;
  for (let i = 2; i <= n; i++) {
    [prev, curr] = [curr, prev + curr];
  }
  return curr;
}

// 爬楼梯（每次1或2步）
function climbStairs(n) {
  if (n <= 2) return n;
  
  let dp1 = 1, dp2 = 2;
  for (let i = 3; i <= n; i++) {
    [dp1, dp2] = [dp2, dp1 + dp2];
  }
  return dp2;
}

// 最长递增子序列
function lengthOfLIS(nums) {
  const dp = new Array(nums.length).fill(1);
  
  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[i] > nums[j]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
  }
  
  return Math.max(...dp);
}

// 0-1 背包问题
function knapsack(weights, values, capacity) {
  const n = weights.length;
  const dp = new Array(capacity + 1).fill(0);
  
  for (let i = 0; i < n; i++) {
    for (let w = capacity; w >= weights[i]; w--) {
      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
    }
  }
  
  return dp[capacity];
}
```

### 双指针与滑动窗口

```js
// 盛最多水的容器
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

// 三数之和
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

// 滑动窗口最大值
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

## 高频面试题

### 1. 时间复杂度和空间复杂度的区别？

**答案**：
- **时间复杂度**：算法执行所需时间随输入规模增长的变化趋势
- **空间复杂度**：算法执行所需内存随输入规模增长的变化趋势

### 2. 数组和链表的区别？

| 特性 | 数组 | 链表 |
|------|------|------|
| 内存分配 | 连续 | 非连续 |
| 随机访问 | O(1) | O(n) |
| 插入删除 | O(n) | O(1) |
| 内存利用 | 可能浪费 | 灵活 |
| 缓存友好 | 是 | 否 |

### 3. 快排和归并排序的区别？

**答案**：
- **快排**：原地排序，空间复杂度 O(log n)，最坏 O(n²)，平均 O(n log n)
- **归并排序**：需要额外空间，空间复杂度 O(n)，稳定 O(n log n)

### 4. 什么是动态规划？

**答案**：动态规划是一种解决复杂问题的方法，通过将问题分解为子问题，存储子问题的解来避免重复计算。

**关键要素**：
1. 最优子结构
2. 重叠子问题
3. 状态转移方程

### 5. 如何判断链表有环？

```js
function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}
```

---

> 📌 **持续更新中**，更多内容敬请期待...
