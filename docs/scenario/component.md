# 常见场景题实现

场景题考察综合能力，涉及组件设计、性能优化和交互实现。

## 1. Modal 对话框组件

```jsx | pure
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

// Modal 组件
function Modal({ visible, title, children, onOk, onCancel, footer }) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [visible]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onCancel?.();
    }, 300);
  };

  if (!visible && !isClosing) return null;

  const modalContent = (
    <div
      className={`modal-overlay ${isClosing ? 'closing' : ''}`}
      onClick={handleClose}
    >
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer !== null && (
          <div className="modal-footer">
            {footer || (
              <>
                <button onClick={handleClose}>取消</button>
                <button onClick={onOk}>确定</button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

// 使用 Hook 封装
function useModal() {
  const [visible, setVisible] = useState(false);

  return {
    visible,
    open: () => setVisible(true),
    close: () => setVisible(false),
    Modal: (props) => <Modal {...props} visible={visible} onCancel={() => setVisible(false)} />
  };
}
```

**设计要点**：
- 使用 `createPortal` 将弹窗渲染到 body 下，避免 z-index 层级问题
- 关闭时先播放动画再卸载组件
- 支持自定义 footer，传 `null` 可隐藏底部按钮

## 2. 虚拟列表

```jsx | pure
import React, { useState, useRef, useCallback, useEffect } from 'react';

function VirtualList({ items, itemHeight, height, renderItem }) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  // 可视区域能显示的条目数
  const visibleCount = Math.ceil(height / itemHeight);
  // 总高度
  const totalHeight = items.length * itemHeight;
  // 起始索引
  const startIndex = Math.floor(scrollTop / itemHeight);
  // 结束索引
  const endIndex = Math.min(startIndex + visibleCount + 1, items.length);
  // 偏移量
  const offsetY = startIndex * itemHeight;

  const visibleItems = items.slice(startIndex, endIndex);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ height, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 使用
function App() {
  const items = Array.from({ length: 10000 }, (_, i) => `Item ${i}`);

  return (
    <VirtualList
      items={items}
      itemHeight={50}
      height={400}
      renderItem={(item) => <div>{item}</div>}
    />
  );
}
```

**设计要点**：
- 只渲染可视区域 + 缓冲区的数据
- 通过 `transform: translateY` 实现偏移，避免重排
- 适用于大数据量列表渲染

## 3. 拖拽排序列表

```jsx | pure
import React, { useState, useRef } from 'react';

function DraggableList({ items: initialItems, onChange }) {
  const [items, setItems] = useState(initialItems);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const dragItem = useRef(null);

  const handleDragStart = (index) => {
    dragItem.current = index;
    setDraggingIndex(index);
  };

  const handleDragEnter = (index) => {
    if (dragItem.current === index) return;
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (dragOverIndex !== null && dragItem.current !== null) {
      const newItems = [...items];
      const [removed] = newItems.splice(dragItem.current, 1);
      newItems.splice(dragOverIndex, 0, removed);
      setItems(newItems);
      onChange?.(newItems);
    }
    setDraggingIndex(null);
    setDragOverIndex(null);
    dragItem.current = null;
  };

  return (
    <ul className="draggable-list">
      {items.map((item, index) => (
        <li
          key={item.id}
          draggable
          className={`
            ${draggingIndex === index ? 'dragging' : ''}
            ${dragOverIndex === index ? 'drag-over' : ''}
          `}
          onDragStart={() => handleDragStart(index)}
          onDragEnter={() => handleDragEnter(index)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => e.preventDefault()}
        >
          {item.content}
        </li>
      ))}
    </ul>
  );
}
```

**设计要点**：
- 使用 HTML5 原生拖拽 API
- 通过 `dragOverIndex` 实时反馈放置位置
- 拖拽结束时交换数据并通知父组件

## 4. 无限滚动列表

```jsx | pure
import React, { useState, useEffect, useRef, useCallback } from 'react';

function InfiniteScroll({ fetchData, renderItem, hasMore }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const observerRef = useRef(null);
  const lastItemRef = useRef(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const newItems = await fetchData(page);
      setItems(prev => [...prev, ...newItems]);
      setPage(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, fetchData]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    return () => observerRef.current?.disconnect();
  }, [loadMore]);

  useEffect(() => {
    if (lastItemRef.current) {
      observerRef.current?.observe(lastItemRef.current);
    }
  }, [items]);

  return (
    <div className="infinite-scroll">
      {items.map((item, index) => (
        <div
          key={item.id}
          ref={index === items.length - 1 ? lastItemRef : null}
        >
          {renderItem(item)}
        </div>
      ))}
      {loading && <div className="loading">加载中...</div>}
      {!hasMore && <div className="no-more">没有更多了</div>}
    </div>
  );
}
```

**设计要点**：
- 使用 `IntersectionObserver` 监听最后一个元素
- 元素进入视口时触发加载更多
- 自动处理 loading 和 hasMore 状态

## 5. 文件上传组件

```jsx | pure
import React, { useState, useRef } from 'react';

function FileUploader({
  accept,
  multiple = false,
  maxSize = 5 * 1024 * 1024,
  onUpload
}) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const validateFile = (file) => {
    if (file.size > maxSize) {
      return `文件 ${file.name} 超过大小限制`;
    }
    if (accept && !accept.split(',').some(type => file.type.match(type.trim()))) {
      return `文件 ${file.name} 格式不支持`;
    }
    return null;
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const errors = [];
    const validFiles = [];

    selectedFiles.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        validFiles.push({
          file,
          id: Math.random().toString(36).substr(2, 9),
          progress: 0,
          status: 'pending'
        });
      }
    });

    if (errors.length) {
      alert(errors.join('\n'));
    }

    setFiles(prev => multiple ? [...prev, ...validFiles] : validFiles);
  };

  const uploadFile = async (fileItem) => {
    const formData = new FormData();
    formData.append('file', fileItem.file);

    try {
      setFiles(prev => prev.map(f =>
        f.id === fileItem.id ? { ...f, status: 'uploading' } : f
      ));

      await onUpload?.(formData, (progress) => {
        setFiles(prev => prev.map(f =>
          f.id === fileItem.id ? { ...f, progress } : f
        ));
      });

      setFiles(prev => prev.map(f =>
        f.id === fileItem.id ? { ...f, status: 'done', progress: 100 } : f
      ));
    } catch (error) {
      setFiles(prev => prev.map(f =>
        f.id === fileItem.id ? { ...f, status: 'error' } : f
      ));
    }
  };

  const handleUpload = async () => {
    setUploading(true);
    const pendingFiles = files.filter(f => f.status === 'pending');
    await Promise.all(pendingFiles.map(uploadFile));
    setUploading(false);
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="file-uploader">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <div
        className="upload-area"
        onClick={() => inputRef.current?.click()}
        onDrop={(e) => {
          e.preventDefault();
          handleFileChange({ target: { files: e.dataTransfer.files } });
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        <p>点击或拖拽文件到此处上传</p>
        <p className="hint">支持 {accept} 格式，单个文件不超过 {maxSize / 1024 / 1024}MB</p>
      </div>

      {files.length > 0 && (
        <div className="file-list">
          {files.map(file => (
            <div key={file.id} className={`file-item ${file.status}`}>
              <span className="file-name">{file.file.name}</span>
              <div className="progress-bar">
                <div className="progress" style={{ width: `${file.progress}%` }} />
              </div>
              <span className="file-status">{file.status}</span>
              <button onClick={() => removeFile(file.id)}>删除</button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading || files.length === 0}
      >
        {uploading ? '上传中...' : '开始上传'}
      </button>
    </div>
  );
}
```

**设计要点**：
- 支持点击选择和拖拽上传
- 文件类型和大小校验
- 上传进度实时反馈
- 支持多文件并行上传

---

> 📌 **持续更新中**，更多内容敬请期待...
