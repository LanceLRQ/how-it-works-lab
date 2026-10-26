# how-it-works-lab

一个可长期扩展的计算机科学学习平台，通过多个 Git submodule 管理独立课程，以本仓库提供统一学习入口。

## 约定

- 平台公开访问、免登录；主站管理课程与公共学习路线，用户进度只保存在用户本地，不在服务端保存。
- 课程目录与学习路线是公开内容配置，与用户学习记录区分。具体接口与客户端存储格式尚未定稿；入口应用已选定 React + Vite + TypeScript，位于 `apps/portal`。
- 项目采用 MIT，原创部分版权署名为 LanceLRQ。许可范围见 `docs/licensing.md`；第三方依赖和 submodule 保留各自许可。
- 所有教程内容由 AI 基于公开文档和论文创作，不保证完全准确。创作声明与纠错要求见 `docs/ai-content-disclosure.md`，不得虚构引用、人工审核或正确性保证。
- Git 写操作必须得到用户明确指示；暂存与提交分开执行。初始化治理不代表获准提交、推送或添加 submodule。
- 只修改任务所需内容；以实际执行的检查结果说明完成情况，不把规划当作已经实现的功能。

## 完成标准

在仓库根目录执行，三条命令全部通过：

- `pnpm lint`
- `pnpm test`
- `pnpm build`

## 文档

- 公开文档放在 `docs/`。
- 设计新课程模块前，先读 `docs/course-architecture.md`；遵守已确认约束，结合实际需求选择推荐方案，不把其中待定的平台协议当作已实现接口。
- 过程文档（research、discussion、specs、plans、audit、reference、ui）放在 `docs/_internal/<category>/`。该目录已被 git 忽略：其中的文件和内容不进入提交、拉取请求和公开文件。
- 索引是 `docs/_internal/README.md`。创建或查找过程文档之前先读它，新文件在其中登记。
- 工作流类 skill 产出的规格和计划放到 `docs/_internal/specs/` 和 `docs/_internal/plans/`，不论该 skill 默认写到哪里。
- 本机备注（当前阶段、硬约束、本机路径）在 `docs/_internal/LOCAL.md`。该文件存在时，开工前先读它。

## 语言

文档使用简体中文，许可证正文保留官方英文原文。始终用简体中文回复；代码标识、命令和路径保持原样。
