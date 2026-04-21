# 动态规划

动态规划是一种解决复杂问题的方法，通过将问题分解为子问题，存储子问题的解来避免重复计算。

## 关键要素

1. **最优子结构**：问题的最优解包含子问题的最优解
2. **重叠子问题**：子问题会被重复计算
3. **状态转移方程**：描述状态之间的关系

## 斐波那契数列

```js
// 动态规划解法 O(n)
function fibonacci(n) {
  if (n <= 1) return n;

  let prev = 0, curr = 1;
  for (let i = 2; i <= n; i++) {
    [prev, curr] = [curr, prev + curr];
  }
  return curr;
}
```

## 爬楼梯问题

每次可以爬 1 或 2 个台阶：

```js
function climbStairs(n) {
  if (n <= 2) return n;

  let dp1 = 1, dp2 = 2;
  for (let i = 3; i <= n; i++) {
    [dp1, dp2] = [dp2, dp1 + dp2];
  }
  return dp2;
}
```

**状态转移方程**：`dp[i] = dp[i-1] + dp[i-2]`

## 最长递增子序列（LIS）

```js
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
```

**状态转移方程**：`dp[i] = max(dp[j] + 1)`，其中 `j < i` 且 `nums[j] < nums[i]`

## 0-1 背包问题

```js
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

**状态转移方程**：`dp[w] = max(dp[w], dp[w - weight[i]] + value[i])`

## 解题步骤

1. **定义状态**：确定 dp 数组的含义
2. **找状态转移方程**：找到状态之间的关系
3. **确定初始值**：处理边界情况
4. **确定计算顺序**：自底向上或自顶向下

## 高频面试题

### 什么是动态规划？

**答案**：动态规划是一种解决复杂问题的方法，通过将问题分解为子问题，存储子问题的解来避免重复计算。

**关键要素**：
1. 最优子结构
2. 重叠子问题
3. 状态转移方程

### 动态规划和贪心算法的区别？

- **动态规划**：考虑所有可能的子问题，保证全局最优解
- **贪心算法**：每一步都选择局部最优解，不一定能保证全局最优

---

> 📌 **持续更新中**，更多内容敬请期待...
