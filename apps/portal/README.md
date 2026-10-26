# portal

how-it-works-lab 平台入口应用。当前为工程脚手架阶段：仅包含最小首页与渲染冒烟测试，课程目录、学习路线与本地进度功能尚未实现。

## 命令

本仓库是 pnpm workspace，在根目录执行：

| 命令 | 作用 |
|---|---|
| `pnpm dev` | 本地开发服务器 |
| `pnpm test` | Vitest 组件测试 |
| `pnpm lint` | oxlint 检查 |
| `pnpm build` | 生产构建（tsc -b + vite build） |

## 目录

- `src/`：应用源码，`App.tsx` 为当前首页。
- `public/`：需保留固定名称的静态资源。

架构约束与开发顺序见主仓库《[课程模块技术架构指南](../../docs/course-architecture.md)》。
