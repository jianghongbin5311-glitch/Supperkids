# 如何添加背景图片

## 方法 1：使用 public 文件夹中的图片（推荐）

### 步骤：
1. 将你的背景图片（如 `background.jpg` 或 `background.png`）放到 `public` 文件夹中
2. 在页面组件中使用以下代码：

```tsx
<div className="min-h-screen bg-sunny flex flex-col relative overflow-hidden">
  {/* Background image */}
  <div 
    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
    style={{
      backgroundImage: 'url("/background.jpg")',  // 图片路径
      opacity: 0.3  // 透明度，可以调整 0-1
    }}
  />
  
  {/* Content overlay */}
  <div className="relative z-10 flex flex-col min-h-screen">
    {/* 你的内容 */}
  </div>
</div>
```

### 示例：修改 Home.tsx
将现有的 SVG 背景替换为：
```tsx
backgroundImage: 'url("/background.jpg")'
```

## 方法 2：使用外部 URL

```tsx
style={{
  backgroundImage: 'url("https://example.com/background.jpg")',
  opacity: 0.3
}}
```

## 方法 3：使用 src 文件夹中的图片（需要导入）

```tsx
import backgroundImage from '@/assets/background.jpg';

// 然后在 style 中使用：
style={{
  backgroundImage: `url(${backgroundImage})`,
  opacity: 0.3
}}
```

## 背景样式选项

- `bg-cover` - 覆盖整个区域，可能裁剪图片
- `bg-contain` - 完整显示图片，可能有空白
- `bg-center` - 居中显示
- `bg-top` - 顶部对齐
- `bg-no-repeat` - 不重复
- `bg-repeat` - 重复平铺

## 透明度调整

- `opacity: 0.1` - 非常淡
- `opacity: 0.3` - 较淡（推荐）
- `opacity: 0.5` - 中等
- `opacity: 0.8` - 较深
- `opacity: 1.0` - 完全不透明
