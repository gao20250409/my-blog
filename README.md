# 我的开发博客 (My Dev Blog)

一个使用 Astro 构建的现代开发博客，展示了多框架集成和双 CSS 框架的最佳实践。

## ✨ 特性

- 🏝️ **组件岛屿架构**：React 和 Vue 组件的选择性水合
- 🎨 **双 CSS 框架**：UnoCSS + Tailwind CSS 共存
- 📝 **MDX 支持**：在 Markdown 中嵌入交互式组件
- 🔧 **类型安全**：TypeScript + Astro Content Collections
- ⚡ **极致性能**：静态生成 + 最小 JavaScript

## 🚀 项目结构

```text
my-dev-blog/
├── src/
│   ├── pages/
│   │   ├── index.astro          # 首页：文章列表（用 UnoCSS）
│   │   ├── posts/
│   │   │   └── hello-astro.mdx  # 文章（支持 React/Vue islands）
│   │   └── about.astro          # 关于页（用 Tailwind CSS）
│   ├── components/
│   │   ├── ui/
│   │   │   ├── ButtonUno.astro      # UnoCSS 按钮
│   │   │   └── CardTailwind.astro   # Tailwind 卡片
│   │   ├── islands/
│   │   │   ├── CounterReact.tsx     # React 岛屿：计数器
│   │   │   └── ThemeSwitcherVue.vue # Vue 岛屿：主题切换
│   │   └── layout/
│   │       └── BaseLayout.astro     # 布局（支持双 CSS）
│   ├── content/
│   │   └── config.ts                # Content Collections 配置
│   └── styles/
│       ├── unocss.ts                # UnoCSS 配置
│       └── tailwind.css             # Tailwind 入口
├── astro.config.mjs                 # Astro 配置
├── uno.config.ts                    # UnoCSS 配置
└── package.json
```

## 🛠️ 技术栈

- **框架**: Astro 5.x
- **UI 组件**: React 18 + Vue 3
- **CSS**: UnoCSS + Tailwind CSS
- **内容**: MDX + Content Collections
- **类型**: TypeScript

## 🧞 命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 📖 页面说明

- **首页** (`/`): 使用 UnoCSS，展示文章列表和交互式组件
- **关于页** (`/about`): 使用 Tailwind CSS，展示个人信息
- **文章页** (`/posts/*`): MDX 格式，支持嵌入 React/Vue 组件

## 🎯 核心概念演示

### 1. 组件岛屿 (Islands)
- `CounterReact.tsx`: React 计数器组件
- `ThemeSwitcherVue.vue`: Vue 主题切换组件

### 2. 双 CSS 框架
- UnoCSS: 用于首页和通用组件
- Tailwind CSS: 用于关于页面

### 3. 类型安全内容
- Content Collections 提供类型安全的内容管理
- TypeScript 支持所有组件

## 🌐 访问地址

开发服务器启动后，访问 `http://localhost:4321`

## 📚 学习资源

- [Astro 文档](https://docs.astro.build)
- [UnoCSS 文档](https://unocss.dev)
- [Tailwind CSS 文档](https://tailwindcss.com)