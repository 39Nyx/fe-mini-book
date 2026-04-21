# Webpack 构建工具

Webpack 是现代前端最流行的模块打包工具。

## 核心概念

```js
// webpack.config.js
module.exports = {
  // 入口
  entry: './src/index.js',
  
  // 输出
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash:8].js',
    clean: true
  },
  
  // 模块处理
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        type: 'asset/resource'
      }
    ]
  },
  
  // 插件
  plugins: [
    new HtmlWebpackPlugin({ template: './public/index.html' }),
    new MiniCssExtractPlugin()
  ],
  
  // 优化
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  },
  
  // 开发服务器
  devServer: {
    port: 3000,
    hot: true,
    open: true
  }
};
```

## Loader 与 Plugin 的区别

| 特性 | Loader | Plugin |
|------|--------|--------|
| 作用 | 转换模块源代码 | 扩展 webpack 功能 |
| 执行时机 | 模块加载时 | 整个编译周期 |
| 配置位置 | module.rules | plugins 数组 |
| 示例 | babel-loader、css-loader | HtmlWebpackPlugin、CleanWebpackPlugin |

## 代码分割

```js
// 动态导入实现代码分割
const module = await import('./module.js');

// React 懒加载
const LazyComponent = React.lazy(() => import('./Component'));

// webpack 配置
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  }
};
```

### 高频面试题

**Q: Webpack 的构建流程是什么？**

**答案**：
1. **初始化参数**：合并配置文件和 shell 参数
2. **开始编译**：初始化 Compiler，加载插件
3. **确定入口**：从 entry 找出所有入口文件
4. **编译模块**：调用 Loader 转换模块，解析依赖
5. **完成编译**：得到模块依赖关系和转换后的内容
6. **输出资源**：组装 Chunk，转换文件，写入文件系统

**Q: Webpack 的热更新原理？**

**答案**：
1. 修改代码 → Webpack 重新编译
2. Webpack-dev-server 通过 WebSocket 通知浏览器
3. 浏览器获取更新后的模块（HMR Runtime）
4. 替换旧模块，不刷新页面
