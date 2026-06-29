# Lynn901 自有组件库设计文档

- **日期**：2026-06-29
- **作者**：lynn901（头脑风暴产出）
- **状态**：待复审
- **基线仓库**：fork 自 `shadcn-ui/ui`，个人 fork 为 `github.com/lynn901/ui`

## 1. 背景与目标

基于 shadcn/ui 官方项目构建一套个人组件库 `@lynn901`。核心诉求：

- **保持 `main` 分支纯净**：仅用于与官方 shadcn 社区同步，零本地提交。
- **个人内容隔离**：所有自有组件库内容放在独立分支 `main-custom`，提交到个人 fork。
- **可交付**：以 shadcn 风格 registry 形式发布，用户可通过 `npx shadcn add` 安装。
- **可持续同步**：长期跟随官方上游更新，且同步成本可控、可预期。

## 2. 核心决策汇总

| 维度 | 决策 | 说明 |
|---|---|---|
| 与官方关系 | C — 全新组件 + fork/改造官方 | 既有全新组件，也有基于官方的改造 |
| 定制形式 | D — 混合策略 | B/C 隔离为主，A 直接改官方为辅，配 OVERRIDES.md |
| 交付目标 | B — shadcn 风格 registry | `npx shadcn add @lynn901/...`，启用 registry 构建流水线 |
| 底层 base | D — Base UI 起步 + 预留双 base 扩展 | `bases/lynn901/` 独立命名空间，未来可加 `bases/lynn901-radix/` |
| 分支策略 | A — 双远程 fork + rebase 同步 | upstream 官方 + origin fork，main 纯镜像，main-custom rebase |
| BASES 注册 | 方式 1 — 接受 8 倍 style 组合模型 | 只追加一行到 BASES 数组，零构建脚本改动 |
| 发布托管 | 方案 a — GitHub Pages 托管 `public/r/` | push 即发布，与官方托管架构同构 |
| 命名空间 | `@lynn901` | 沿用 GitHub 用户名 |

## 3. Git 拓扑与分支策略

### 3.1 远程拓扑

```
upstream  → git@github.com:shadcn-ui/ui.git    (官方, fetch only)
origin    → git@github.com:lynn901/ui.git      (个人 fork, push/pull)
```

**一次性远程配置修正**（当前 origin 错误指向官方，需修正）：

```bash
git remote rename origin upstream                          # 官方改名为 upstream
git remote add origin git@github.com:lynn901/ui.git        # fork 接为 origin
git fetch upstream && git fetch origin
```

### 3.2 分支职责

| 分支 | 跟踪 | 角色 | 同步方式 |
|---|---|---|---|
| `main` | `upstream/main` | 官方纯镜像，**零本地提交** | `git fetch upstream && git reset --hard upstream/main` |
| `main-custom` | `origin/main-custom` | 自有库长期分支，所有自有内容在此 | `git rebase main`（把上游更新垫到自有提交之下）|

**纪律**：`main` 分支永远不做提交，仅从官方同步；所有个人修改提交只在 `main-custom`。

### 3.3 同步上游工作流（低频，跟随官方发布节奏）

```bash
git checkout main
git fetch upstream
git reset --hard upstream/main          # main 永远等于官方
git checkout main-custom
git rebase main                         # 自有提交重放到官方最新之上
# 仅 OVERRIDES.md 登记的文件可能冲突 → 手动解 → git rebase --continue
git push -f origin main-custom          # rebase 改写历史, 必须 force push
```

### 3.4 日常开发工作流（高频）

```bash
git checkout main-custom
# ...编写/修改自有组件...
pnpm registry:build                     # 重新生成产物
git add -A && git commit -m "feat(lynn901): add ..."
git push origin main-custom
```

### 3.5 回退安全网

- rebase 出错：`git rebase --abort` 回到 rebase 前状态。
- 历史丢失：`git reflog`（约 90 天可追溯）+ fork 远程双重备份。
- main 用 `reset --hard` 无害，因为 main 设计为"零本地提交"，丢弃的只有工作区脏数据。

## 4. 目录隔离与命名空间

### 4.1 自有 base 物理布局

所有自有内容统一收纳在 `apps/v4/registry/bases/lynn901/`，与官方 `bases/base/`、`bases/radix/` 物理隔离：

```
apps/v4/registry/bases/
├── base/            ← 官方 Base UI (upstream, 只读参考, 不动)
├── radix/           ← 官方 Radix UI (upstream, 只读参考, 不动)
├── lynn901/         ← 【自有 base】全新 + fork + wrapper 全放这里
│   ├── registry.ts          ← 自有 registry 入口 (仿 base/registry.ts)
│   ├── ui/                  ← 全新组件 + fork 副本 + wrapper
│   ├── lib/  hooks/  components/  blocks/  examples/  internal/
│   └── OVERRIDES.md         ← 冲突登记表 (A 类直接修改清单)
├── __index__.tsx    ← 生成物 (构建器自动重写, 不手改)
└── __components__.tsx ← 生成物
```

### 4.2 三种定制形式的物理归属

| 定制形式 | 物理位置 | 同步冲突 |
|---|---|---|
| **全新组件** | `bases/lynn901/ui/<new>.tsx` | 无（官方无此文件）|
| **B 薄封装 wrapper** | `bases/lynn901/ui/<comp>-wrapper.tsx`，import 官方 `@/registry/bases/base/ui/<comp>` | 无（官方文件不动）|
| **C fork 到自有命名空间** | 复制官方源码到 `bases/lynn901/ui/<comp>.tsx`，官方原版保留 | 无（官方文件不动）|
| **A 直接改官方文件** | 改 `bases/base/ui/<comp>.tsx` 等官方文件 | **有，登记进 OVERRIDES.md** |

### 4.3 命名空间隔离的设计意图

`bases/lynn901/` 下的文件官方仓库不存在——上游更新时 git 看不到这些路径，零冲突。只有动 `bases/base/` 等官方文件（A 类）才进入"冲突区"。`OVERRIDES.md` 是"越界动了哪些官方文件"的自首清单，理想状态下越短越好。

## 5. BASES 注册与 style 组合模型

### 5.1 BASES 数组注册（必然冲突点）

在 `apps/v4/registry/bases.ts` 的 `BASES` 数组中**追加一个元素**（注意：`BASES` 常量定义在 `registry/bases.ts`，不是 `registry/bases/index.ts`）：

```ts
{
  name: "lynn901",
  type: "registry:style",
  title: "Lynn901 UI",
  description: "Personal component library built on Base UI.",
  dependencies: ["@base-ui/react"],
}
```

**改动原则**：只追加、不重排、不改现有 `radix`/`base` 条目。追加式改动让上游重构 `index.ts` 时冲突解法机械——"我的那行还在不在，补回去即可"。

此改动属 A 类（改官方文件），登记进 OVERRIDES.md。

### 5.2 方式 1：接受 8 倍 style 组合模型

将 `lynn901` 作为标准 base 注册后，`STYLE_COMBINATIONS` 自动生成 `lynn901-nova`、`lynn901-sera`...`lynn901-rhea` 共 8 种 style 组合。

**选择理由**：

- 零构建脚本改动，完全复用官方流水线。
- 冲突区严格限制在 `index.ts` 一处（只追加一行），不动 `build-registry.mts`。
- 8 倍冗余产物对个人库无实质负担，但多一个高频冲突文件（`build-registry.mts`）会长期消耗同步精力。
- 权衡本质：宁可忍受"产物冗余"，也要避免"多一个高频冲突文件"。

未来若确实想精简到单 style，再单独评估迁移到方式 2（定制 `STYLE_COMBINATIONS` 过滤）。

## 6. registry.ts 入口与组件寻址

### 6.1 `bases/lynn901/registry.ts` 入口

仿照 `bases/base/registry.ts`，用 `registryItemSchema` 校验，聚合子 registry：

```ts
import { registryItemSchema, type Registry } from "shadcn/schema"
import { z } from "zod"

import { blocks } from "./blocks/_registry"
import { components } from "./components/_registry"
import { examples } from "./examples/_registry"
import { hooks } from "./hooks/_registry"
import { internal } from "./internal/_registry"
import { lib } from "./lib/_registry"
import { ui } from "./ui/_registry"

export const LYNN901_STYLE = {
  name: "lynn901",
  type: "registry:style",
  // ...style 元数据
} satisfies z.infer<typeof registryItemSchema>

export const registry: Registry = [
  LYNN901_STYLE,
  ...ui,
  ...lib,
  ...hooks,
  ...components,
  ...blocks,
  ...examples,
  ...internal,
]

export default registry
```

### 6.2 组件寻址

shadcn 的"复制式"寻址：`npx shadcn add @lynn901/button` 时，CLI 从托管的 registry JSON 读取 button 源码，复制进用户项目（非 npm install）。

| 安装命令 | 寻址来源 |
|---|---|
| `npx shadcn add @lynn901/button` | fork 仓库的 registry JSON |
| `npx shadcn add https://lynn901.github.io/ui/r/styles/lynn901-nova/button.json` | 直接 URL（托管后）|

### 6.3 子 registry 组织

每个子目录（`ui/`、`lib/` 等）有一个 `_registry.ts` 聚合该目录所有条目，被 `registry.ts` 导入。新增组件 = 在子目录加源码文件 + 在该目录 `_registry.ts` 加条目。模式与官方 `bases/base/` 一致，保证 fork 官方组件时能 1:1 复制结构。

## 7. 发布与托管

### 7.1 构建产物

`pnpm registry:build` 执行 `build-registry.mts`，针对 `lynn901` base 生成：

```
apps/v4/public/r/styles/
├── lynn901-nova/
│   ├── button.json          ← 自包含 JSON (源码内联)
│   ├── dialog.json
│   └── ...
├── lynn901-sera/  ...  lynn901-rhea/   ← 方式1: 全 8 种 style 组合
└── index.json               ← registry 索引
```

`public/r/` 下的 JSON 是用户 `npx shadcn add` 的拉取目标。

### 7.2 托管方案 a：GitHub Pages

在 fork（`lynn901/ui`）开启 GitHub Pages，从 `main-custom` 分支的 `apps/v4/public/r/` 目录提供静态服务。用户访问 `https://lynn901.github.io/ui/r/styles/lynn901-nova/button.json`。

**选择理由**：

- 零额外基础设施，复用 fork 仓库。
- push 即发布，与官方托管架构同构（官方 registry 也托管在站点静态目录）。
- 与"个人库"定位匹配。

**实现注意**：GitHub Pages 默认托管仓库根或 `/docs`，而 registry JSON 在 `apps/v4/public/r/`。用一个轻量 GitHub Action（`.github/workflows/deploy-registry-pages.yml`）部署：`upload-pages-artifact` 会把 `path` 指向目录的**内容**作为站点根，故直接传 `apps/v4/public/r` 会丢失 `/r/` 段（URL 变成 `/ui/styles/...`）。为与官方 `/r/styles/` 同构，workflow 先把 `apps/v4/public/r` 复制到临时目录的 `r/` 子路径下再上传，使 registry 服务于 `https://lynn901.github.io/ui/r/styles/...`。

## 8. 同步冲突处理与 OVERRIDES.md

### 8.1 OVERRIDES.md 登记表格式

放在 `apps/v4/registry/bases/lynn901/OVERRIDES.md`，记录每一处 A 类直接修改。

**建表时机**：OVERRIDES.md 在创建 `bases/lynn901/` 目录时即建立，初始就登记第一条——`index.ts` 的 BASES 追加（见 5.1）。之后每次新增 A 类修改时追加一行。表格式样：

```markdown
# Overrides — 官方文件直接修改登记表

本表记录所有直接修改官方(upstream)文件的改动。同步上游时,
仅本表登记的文件需要人工审查冲突, 其余官方文件可放心接受上游版本。

| 官方文件 | 改动类型 | 改动内容 | 为什么不能用 B/C | 登记日期 |
|---|---|---|---|---|
| apps/v4/registry/bases.ts | 追加 | BASES 数组追加 lynn901 条目 | 新 base 必须注册进中心化数组, wrapper/fork 无法替代 | 2026-06-29 |
| ... | ... | ... | ... | ... |
```

每列用意：

- **官方文件**：精确路径，同步时 `git diff` 比对的就是它。
- **改动类型**：追加 / 修改 / 删除——追加最易解，修改次之。
- **为什么不能用 B/C**：强制反思"这次越界是否真的必要"，是技术债的审批栏。

### 8.2 标准同步流程（含冲突处理）

```bash
# 1. 更新 main 镜像
git checkout main
git fetch upstream
git reset --hard upstream/main

# 2. 切到自有分支, rebase 到官方最新
git checkout main-custom
git rebase main

# 3. 若冲突, 仅可能发生在 OVERRIDES.md 登记的文件上:
#    打开 OVERRIDES.md, 逐项核对登记的文件
#    - 多数是"我的追加行被上游重构冲掉" → 重新补回追加内容
#    - 解完: git add <文件> && git rebase --continue

# 4. 推送 (rebase 改写历史, 必须 force push)
git push -f origin main-custom

# 5. (可选) 重新构建发布
pnpm registry:build
git add -A && git commit -m "chore(lynn901): rebuild after upstream sync"
git push origin main-custom
```

### 8.3 同步频率

跟随官方 release 节奏（非每个 commit），建议每月或官方发版时同步一次，避免每次 rebase 太重。

## 9. 测试与验证

每次构建后验证：

- `pnpm registry:build` 成功（无 schema 校验错误）。
- `pnpm typecheck` 通过。
- 产物检查：`apps/v4/public/r/styles/lynn901-nova/<comp>.json` 存在且源码内联。
- 端到端冒烟：在空项目执行 `npx shadcn add https://lynn901.github.io/ui/r/styles/lynn901-nova/button.json` 能成功安装。

## 10. 未来扩展

- **第二个 base**：未来加 Radix 支持时，新增 `bases/lynn901-radix/`，不影响现有 `bases/lynn901/` 结构（命名空间预留兑现）。
- **文档站**：在方案 a 基础上 fork `apps/v4` 文档站展示自有组件（从 B 升级到 D）。
- **精简 style 组合**：若 8 倍产物成为负担，评估迁移到方式 2（定制 `STYLE_COMBINATIONS` 过滤到单 style）。

## 11. 范围界定（YAGNI）

本设计**不包含**以下内容，留待未来按需引入：

- 双 base（Radix）支持——当前仅 Base UI，已预留扩展位。
- npm 包发布——与 shadcn copy-in 哲学相悖，不采用。
- 自建文档站——当前以 registry 交付为起点，文档站后期再加。
- CI/CD 自动化同步——当前手动 rebase，频率低，自动化收益不足。
