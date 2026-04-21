# 常用数据结构

掌握常见数据结构是算法学习的基础。

## 数组与链表

### 数组特性

- 连续内存，随机访问 O(1)
- 尾部插入 O(1)，中间插入 O(n)

```js
const arr = [1, 2, 3, 4, 5];
arr[2]; // O(1) 访问
arr.push(6); // O(1) 尾部插入
arr.splice(2, 0, 10); // O(n) 中间插入
```

### 链表

非连续内存，通过指针连接节点：

```js
class ListNode {
  constructor(val) {
    this.val = val;
    this.next = null;
  }
}

// 链表反转
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

## 栈与队列

### 栈（LIFO - 后进先出）

```js
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
```

### 队列（FIFO - 先进先出）

```js
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

## 哈希表

JavaScript 对象/Map 就是哈希表实现：

```js
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

## 树

### 二叉树

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

## 高频面试题

### 数组和链表的区别？

| 特性 | 数组 | 链表 |
|------|------|------|
| 内存分配 | 连续 | 非连续 |
| 随机访问 | O(1) | O(n) |
| 插入删除 | O(n) | O(1) |
| 内存利用 | 可能浪费 | 灵活 |
| 缓存友好 | 是 | 否 |

### 如何判断链表有环？

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
