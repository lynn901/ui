# lynn901 站点重设计（骨架）设计文档

- **日期**: 2026-06-30
- **作者**: lynn901
- **状态**: 待复审
- **关联**: `docs/superpowers/specs/2026-06-29-lynn901-component-library-design.md`（组件库总体设计）
- **范围**: 本 spec 只覆盖**站点重设计骨架**。组件详情页、8-style 并列预览、fumadocs 文档接入移至后续 spec。

## 1. 背景与动机

`@lynn901` 组件库的 registry 构建与发布骨架已全部打通（8 个 style 组合、GitHub Pages 托管、`npx shadcn add` 拉取，见关联 spec）。但承载它的 `apps/v4` Next.js 站点仍是 100% 官方 shadcn 营销站：

- **身份错位**：`siteConfig` 仍是 `name: "shadcn/ui"`、`url: "https://ui.shadcn.com"`、github `shadcn-ui/ui`；`app/layout.tsx` 的 metadata 写死 `creator: "shadcn"`、`twitter: "@shadcn"`。访客看不出这是 lynn901 的库。
- **信息噪音**：导航有 Home/Docs/Components/Blocks/Charts/Directory/Create 七项，其中 Blocks/Charts/Directory/Create 对个人库无意义；首页是官方 dashboard 卡片墙 + `/create` 生成器入口。
- **视觉非所愿**：官方 shadcn v4 的冷中性灰（zinc）+ 模板化布局不是想要的方向，需推倒重定义视觉语言。

**目标**：把 `apps/v4` 站点重设计为 lynn901 个人组件库的展示站——身份姓 lynn901、视觉全新（Editorial 暖色方向）、导航精简、首页兼顾"了解"与"浏览"。本阶段只做骨架，让站点立刻可用且好看；详情页/文档接入等有更多组件后另起 spec。

**定位**（已与用户确认）：个人工作台为主，但门面愿意花心思。功能务实、信息密度高，首页和关键展示位有设计感。

## 2. 技术路径决策

**走 A 类原地重构官方页面**（用户已确认）。

直接改 `apps/v4` 现有页面文件（`lib/config.ts`、`app/layout.tsx`、首页、导航、`lib/fonts.ts`、`app/globals.css`）。优点：快、直接、体验统一。代价：全部是 A 类修改（直接改上游文件），须登记 `apps/v4/registry/bases/lynn901/OVERRIDES.md`，rebase 同步上游时这些文件是唯一可能冲突点。

对个人库（低频同步）而言，A 类"一次性改透、冲突好解"的总成本低于"建独立页面层并行存在"的长期心智负担。设计文档（关联 spec）已将 lynn901 定位为"接受低频同步"，与此一致。

## 3. 视觉语言

### 3.1 风格方向

**B · Editorial / Warm Document**——期刊/作品集气质。暖色底 + 衬线标题 + 无衬线 UI，像一本设计期刊，有"阅读感"和门面感，克制但温暖。与官方冷中性灰彻底拉开。

### 3.2 字体

通过 `next/font/google`（现有机制，见 `apps/v4/lib/fonts.ts`）自托管，避免外部请求和布局抖动。

| 角色 | 字体 | 用途 |
|---|---|---|
| 英文标题 | **Fraunces**（光学尺寸现代衬线） | hero、章节大标题中的英文 |
| 中文标题 + 正文 | **思源宋体 Noto Serif SC**（全宋体） | hero、章节标题、说明文字、文档正文 |
| 英文 UI | **Inter** | 按钮、导航、标签、面包屑 |
| 技术词/代码 | **mono**（沿用现有 Geist Mono 或换 JetBrains Mono） | `npx shadcn add`、组件名、代码块 |

**关键约定**：
- 中文用全宋体（标题+正文都 Noto Serif SC），不用宋黑分工。Editorial 语境下宋体的"慢"是优点，强化"阅读物"仪式感。
- 正文 fallback 链：`"Noto Serif SC", "Microsoft YaHei", serif`——宋体加载失败时 fallback 到雅黑，不退到系统丑字体。工程兜底，不影响视觉。
- 技术词（`npx shadcn add`、`Base UI`、组件名 `button.tsx`）在中文流里用 mono/Inter 区分，"跳出来但不突兀"。

**实现要点**（`lib/fonts.ts`）：新增 `Fraunces`、`Noto_Serif_SC`、`Inter` 三个 `next/font/google` 实例，各自 `variable: "--font-..."`，加入 `fontVariables`。当前 Geist 同时占 `--font-sans` 和 `--font-heading`，需拆分：
- `--font-heading` → fallback 链 `"Fraunces", "Noto Serif SC", serif`（英文标题走 Fraunces，中文走 Noto Serif SC，浏览器按字符自动选可用字形）
- `--font-sans` → `"Inter", "Noto Serif SC", "Microsoft YaHei", sans-serif`（UI 用 Inter，但中文 UI 文案 fallback 到思源宋体保持全宋体一致性）
- `--font-mono` → 沿用现有 Geist Mono（或换 JetBrains Mono）
- 中文正文专用：直接用 `font-family: "Noto Serif SC", "Microsoft YaHei", serif`（不依赖 Inter fallback，确保正文是宋体）

在 `app/globals.css` 的 `@theme inline` 块（L20-73）注册新变量。`--font-heading` 的 fallback 链让中英标题混排时各取所需字形，无需为中英分别设变量。

### 3.3 配色

**羊皮纸 + 陶土**，亮暗同等重要（两套都精心设计）。

| 角色 | 亮色 | 暗色 |
|---|---|---|
| 底色 background | `#faf7f2`（羊皮纸暖米白） | `#1c1814`（暖墨棕，不掉回冷灰） |
| 前景 foreground | `#2a2520` | `#e8e0d4` |
| 强调色 accent/primary | `#8a4b2a`（陶土棕） | `#c47a4e`（亮陶土，暗底提亮） |
| 次级文字 muted | `#6f6557` | `#9a8f7e` |
| 边框 border | `#ece3d6` | `#2e2620` |
| 卡片 card | `#ffffff` | `#241f1a` |
| 软色 chip 背景 | `#efe3d6` | `#2e2620` |

**关键约定**：
- 暗色必须是暖深色（暖墨棕），绝不掉回冷灰 zinc——这是 B 方向暗色和官方暗色的关键区别。
- 强调色亮暗取不同值（亮 `#8a4b2a` / 暗 `#c47a4e`），暗底需更亮饱和才清晰。落到 design token：`--primary` 在 `:root` 和 `.dark` 分别取值。
- 以上是站点 UI 用的"品牌色"，与组件库 8 个 style 的配色分离。站点 chrome 用品牌色；组件预览区内的组件用各 style 自带配色。

**实现要点**（`app/globals.css`）：替换 `:root`（L75-117）和 `.dark`（L119+）的 token 实值。`META_THEME_COLORS`（`lib/config.ts:43-46`）同步改成 `light:#faf7f2 / dark:#1c1814`。`app/layout.tsx` L76-87 的内联 theme-color 切换脚本会自动跟随。

### 3.4 内容语言

**中文为主，英文技术点缀**。hero、文档、说明以中文为主；`npx shadcn add` 命令、组件名（button/card/dialog）、`Base UI` 等技术术语保留英文。

## 4. 信息架构

### 4.1 导航精简

`siteConfig.navItems`（`lib/config.ts:11-40`）从官方 7 项精简为 4 项：

| 项 | 路由 | 说明 |
|---|---|---|
| 组件 | `/docs/components` | 组件浏览入口（骨架阶段指向官方 docs 的 components 分区，后续 spec 改造为 lynn901 组件墙） |
| 文档 | `/docs` | 保留 fumadocs 文档（官方内容暂留，后续 spec 改造） |
| 关于 | `/about`（本 spec 新建，见 4.4） | 个人/库介绍页 |
| GitHub | 外链 `https://github.com/lynn901/ui` | |

**裁剪**：移除 Blocks / Charts / Directory / Create。`site-header.tsx` 中的 `V0Button`、`ProjectForm`、"New" 按钮（L50-55、L59-61、L63-71）整体移除——这些是官方 v0/preset 生成器入口。

**Button import 不统一问题**（探索发现）：`site-header.tsx`/首页用 `@/styles/radix-nova/ui/button`，`main-nav.tsx`/`mobile-nav.tsx` 用 `@/registry/new-york-v4/ui/button`。重构时统一为 lynn901 品牌样式：站点 chrome 的 button 改用 `@/styles/lynn901-nova/ui/button`（已构建就绪）。

`mobile-nav.tsx` 的 `TOP_LEVEL_SECTIONS`（L19-61，11 项硬编码）需单独裁剪为 lynn901 版本。

### 4.2 首页（落地页）

**使命**：D——hero 介绍+安装，下面紧跟组件墙，一页兼顾"了解"和"浏览"。

**结构**（重写 `app/(app)/(root)/page.tsx`）：

1. **Hero 区**：
   - kicker：`个人组件库 · Base UI`
   - 标题：`安静地构建，基于 Base UI。`（"Base UI" 用 Fraunces 斜体陶土棕）
   - 副标题：`八种风格，同一根基。一行命令安装任意组件。`
   - 安装命令块：`$ npx shadcn add https://lynn901.github.io/ui/r/styles/lynn901-nova/button.json`（mono + 暖色软背景）
   - 两个按钮：`开始使用`（陶土棕主按钮）/ `浏览组件`（描边次按钮）

2. **组件墙**（方案 M · 叙事型大卡片）：
   - 2 列大卡片网格，每个组件卡含：组件名（中英，如"按钮 Button"）+ 一句中文描述 + 真实组件预览 + 安装标签（如 `· 2.1kb`）
   - 当前只有 button，用一张"更多组件开发中"占位卡（`card · dialog · input · …`）自然填充第二格
   - 区域头：`组件` + `查看全部 →`（骨架阶段"查看全部"可指向 docs 或占位）

3. **页脚条**：`底层 Base UI · 8 styles · shadcn registry 兼容`

**移除**：`Announcement`、官方 `CardsDemo`（`cards/` 整个目录的 16 个 dashboard 卡片）、移动端 `full-light.png`/`full-dark.png` 大图、`/create?preset=...` 入口。

**组件预览的取法**（骨架阶段）：首页 button 预览直接 `import { Button } from "@/styles/lynn901-nova/ui/button"`（已构建就绪），不走详情页路由、不走 fumadocs。

**静态化**：保留 `export const dynamic = "force-static"; revalidate = false`。

### 4.3 关于页（新建）

新建 `apps/v4/app/(app)/about/page.tsx`。内容：lynn901 个人组件库的简介——基于 shadcn/ui fork、底层 Base UI、8 个 style 组合、通过 shadcn registry 交付。用 Editorial 视觉语言（思源宋体标题 + 暖色底），hero 风格的短页，非长文档。给"关于"导航项一个落地页，避免空链接。

### 4.4 不在本 spec 范围

明确剔除（移至后续 spec）：
- 组件详情页 8-style 并列预览（G 方案）
- `content/docs/components/lynn901/` mdx 组
- `DocsBaseSwitcher` 接入 lynn901（数据源已含，但页面层未建）
- `ComponentPreviewTabs` 的 DirectionProvider 对 lynn901 选错分支的修复（`component-preview-tabs.tsx:49,260`，ltr 无影响，留到详情页 spec 一并处理）
- 官方 fumadocs 文档内容（`content/docs/` 235 篇 mdx）的裁剪/改造——骨架阶段保留原样，导航"文档"仍指向官方 docs

## 5. 改造点清单与 OVERRIDES 预登记

本 spec 全部是 A 类修改。需登记进 `apps/v4/registry/bases/lynn901/OVERRIDES.md` 的文件：

| 文件 | 改动 | 说明 |
|---|---|---|
| `apps/v4/lib/config.ts` | 替换 siteConfig（name/url/links/navItems）+ META_THEME_COLORS | 身份换装、导航精简、配色 meta |
| `apps/v4/app/layout.tsx` | 替换 metadata（creator/twitter/authors/keywords） | 身份换装 |
| `apps/v4/lib/fonts.ts` | 新增 Fraunces/Noto Serif SC/Inter，拆分 --font-heading/sans | 字体接入 |
| `apps/v4/app/globals.css` | 替换 :root/.dark token 实值 | 配色 |
| `apps/v4/app/(app)/(root)/page.tsx` | 重写首页（hero + 组件墙 M） | 首页 |
| `apps/v4/app/(app)/(root)/cards/` | 整体移除或替换 | 移除官方 dashboard 卡片墙 |
| `apps/v4/components/site-header.tsx` | 移除 V0Button/ProjectForm/"New"，统一 button import | 导航精简 |
| `apps/v4/components/main-nav.tsx` | 统一 button import（navItems 由 config 驱动） | 导航 |
| `apps/v4/components/mobile-nav.tsx` | 裁剪 TOP_LEVEL_SECTIONS，统一 button import | 导航 |
| `apps/v4/components/announcement.tsx` | 移除或改为 lynn901 公告 | 首页 |
| `apps/v4/app/(app)/about/page.tsx` | 新建关于页 | 导航落地（见 4.3） |

`OVERRIDES.md` 现有 1 行（bases.ts），本 spec 新增约 8-10 行。每行注明改动类型与理由，让 rebase 时冲突可预期、好解。

## 6. 错误处理与边界

- **字体加载失败**：思源宋体 fallback 链含 `Microsoft YaHei`，不退到系统丑字体；Fraunces/Inter 失败退到 `serif`/`sans-serif`。
- **组件预览 import 失败**：`@/styles/lynn901-nova/ui/button` 已构建就绪（探索已验证）。若未来 build 产物缺失，首页 button 预览会构建期报错——这是期望行为（早失败），不是运行时风险。
- **暗色 token 遗漏**：`globals.css` 的 `.dark` 块必须同步改，否则暗色模式掉回冷灰。spec 自检时重点核对。
- **rebase 冲突**：本 spec 改的都是"替换内容"而非"微调"，冲突时通常能干净保留 lynn901 版本（改动意图明确）。

## 7. 验证

1. **构建**：`pnpm --filter=v4 build` 通过（含 lint/typecheck）。
2. **本地跑**：`pnpm --filter=v4 dev`（端口 4000），人工核对：
   - 首页：hero 中文标题 + 安装命令 + 组件墙（button 卡 + 占位卡）渲染正确，配色为羊皮纸暖米白。
   - 导航：只剩 组件/文档/关于/GitHub 四项，无 V0/Create 入口。
   - 暗色：切换后底色为暖墨棕（非冷灰），强调色为亮陶土。
   - 字体：英文标题 Fraunces 衬线，中文标题/正文思源宋体，UI Inter，命令 mono。
3. **元数据**：浏览器标签页标题、og 信息为 lynn901（非 shadcn）。
4. **OVERRIDES**：`OVERRIDES.md` 新增行齐全，每行有理由。
5. **上游同步模拟**：`git fetch` 后 dry-run rebase，确认冲突只在 OVERRIDES 登记文件内。

## 8. 未来扩展（后续 spec）

- 组件详情页：8-style 并列预览（G 方案），含 `<StyleGrid>` 复用组件、`<Lynn901InstallCommand>` 安装命令组件（homepage 取 `registry/bases/lynn901/registry.ts:38`，style 列表取 `registry/styles.tsx` STYLES）。
- fumadocs 文档接入：建 `content/docs/components/lynn901/` mdx 组，复用 `[[...slug]]/page.tsx` 三段判断。
- DirectionProvider 修复：`component-preview-tabs.tsx` 判断改为 `base === "base" || base === "lynn901"`。
- 官方文档内容裁剪：`content/docs/` 按个人库需求精简。
- 补全 lynn901 组件：在 `registry/bases/lynn901/ui/` 实现 card/dialog/input 等，`pnpm registry:build` 重新生成 `styles/lynn901-*/ui/` 与索引，组件墙逐步填满。
