# how-it-works-lab

一个可长期扩展的计算机科学学习平台：通过独立课程、交互实验和跨课程学习路线，帮助读者理解机制、动手实践并验证学习结果。

## 平台方向

- 本仓库提供统一入口，计划通过 Git submodule 管理独立课程仓库。
- 网站公开访问、免登录，主站负责课程管理并提供公共学习路线接口。
- 用户进度保存在用户本地，服务端不保存学习记录。
- 课程目录和公共学习路线作为公开内容维护，与个人学习数据分开。

## 当前状态

已完成仓库治理、pnpm workspace 脚手架（入口应用 `apps/portal`，React + Vite + TypeScript，提供 lint / test / build 命令）与课程接入：transformer、ai-agents、cryptography、fft-basic、large-language-model 五门课程以 git submodule 挂在 `modules/`，统一构建发布命令 `pnpm build:release`（`scripts/build-release.mjs` + `catalog/courses.json` 注册表）已跑通全部五门课程的「同步 submodule → 课程自建 → 组装 → 校验 → manifest 快照」链路，产物挂在 `/study/<课程id>/` 子路径。门户仍是占位首页，课程目录、学习路线与本地进度功能尚未实现。

下一步是门户页面落地与 M0 课程接入协议（课程元数据与目录 JSON）。

## AI 创作与准确性说明

本项目所有教程内容均由 AI 创作，基于公开文档和论文进行整理、解释与教学化改写。内容可能包含事实错误、推导或代码缺陷、过度简化及过时信息，**不保证 100% 准确，也不保证完整性和时效性**。涉及具体结论或实际应用时，请结合所引用的原始资料独立核实。

引用的原文、论文插图和第三方材料仍归原权利人所有，不因被 AI 整理而成为本项目原创。完整说明及纠错方式见 [AI 创作与内容声明](docs/ai-content-disclosure.md)。

## 开发文档

开发下一个课程模块前，请先阅读 [课程模块技术架构指南](docs/course-architecture.md)。该文档面向开发者和开发 agent，总结现有课程的工程经验，并区分已确认约束、推荐方案与尚未实现的平台接口。

## 许可

本项目采用 [MIT License](LICENSE)，版权署名为 LanceLRQ，另见 [NOTICE](NOTICE)。在遵守许可证条件的前提下，允许商业使用、修改和分发。

除另有明确标注外，本仓库发布的原创代码、文档、教程、插图与课程内容均采用该许可。第三方内容和未来接入的 submodule 保留各自许可，不因被本仓库引用而自动变更。

具体范围与分发要求见 [许可说明](docs/licensing.md)。
