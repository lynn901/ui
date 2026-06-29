# Lynn901 自有组件库 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 fork 自 shadcn/ui 的个人仓库上，搭建 `@lynn901` 自有组件库的完整骨架——双远程 git 拓扑、`bases/lynn901/` 命名空间、BASES 注册、registry 入口、构建产物与 GitHub Pages 发布路径，使 `npx shadcn add` 能拉取自有组件。

**Architecture:** 双远程 fork 模式（upstream 官方 + origin 个人 fork）。`main` 纯镜像零提交，`main-custom` 承载所有自有内容。自有内容物理隔离在 `apps/v4/registry/bases/lynn901/`，通过在 `apps/v4/registry/bases.ts` 的 `BASES` 数组追加一条声明式注册（构建器由 `BASES` 驱动，无目录扫描），复用官方 `build-registry.mts` 生成 8 倍 style 组合产物，托管在 GitHub Pages。

**Tech Stack:** pnpm 10.33.4 + Turborepo, Next.js 16 (apps/v4), zod schema 校验, Base UI (`@base-ui/react`), GitHub Pages, shadcn CLI。

## Global Constraints

- **Node 版本**：v20.5.1（见 `.nvmrc`）。
- **包管理器**：pnpm@10.33.4（锁定，见根 `package.json` `packageManager`）。
- **远程地址**：upstream = `git@github.com:shadcn-ui/ui.git`；origin = `git@github.com:lynn901/ui.git`。
- **分支纪律**：`main` 永不提交（仅 `git reset --hard upstream/main` 同步）；所有自有提交只在 `main-custom`。
- **命名空间**：`@lynn901`，base 目录名 `lynn901`，registry `name: "lynn901"`。
- **底层 base**：Base UI（`dependencies: ["@base-ui/react"]`）。
- **构建命令**：在仓库根运行 `pnpm registry:build`（实际执行 `pnpm --filter=v4 registry:build` + lint:fix + format:write）。
- **快速定向构建**（迭代用，跳过格式化）：`pnpm --filter=v4 registry:build -- --style lynn901-nova --registry lynn901-nova`。
- **BASES 路径**：`apps/v4/registry/bases.ts`（非 `bases/index.ts`，后者不存在）。
- **提交约定**：`category(scope): message`，category 用 `feat/fix/refactor/docs/build/test/chore`，scope 用 `lynn901`。
- **A 类修改登记**：凡直接改官方文件处，必须追加到 `bases/lynn901/OVERRIDES.md`。
- **TDD 适配**：本项目无传统单元测试；验证形态为 `pnpm registry:build` 的 zod schema 校验 + `pnpm typecheck` + 产物存在性检查。每个任务的"红-绿"循环 = 构建失败→修正→构建通过且产物存在。

---

## File Structure

**新建文件：**

| 路径 | 职责 |
|---|---|
| `apps/v4/registry/bases/lynn901/registry.ts` | 自有 registry 顶层入口，仿 `bases/base/registry.ts`，聚合所有子 registry |
| `apps/v4/registry/bases/lynn901/ui/_registry.ts` | UI 子 registry 聚合（初始含 1 个示范组件 `button`） |
| `apps/v4/registry/bases/lynn901/ui/button.tsx` | 示范 UI 组件源码（fork 自官方 base button，验证整条链路） |
| `apps/v4/registry/bases/lynn901/lib/_registry.ts` | lib 子 registry（含 `utils`） |
| `apps/v4/registry/bases/lynn901/lib/utils.ts` | `cn()` 工具（复制自官方） |
| `apps/v4/registry/bases/lynn901/hooks/_registry.ts` | hooks 子 registry（初始空数组，预留） |
| `apps/v4/registry/bases/lynn901/components/_registry.ts` | components 子 registry（初始空数组，预留） |
| `apps/v4/registry/bases/lynn901/blocks/_registry.ts` | blocks 子 registry（初始空数组，预留） |
| `apps/v4/registry/bases/lynn901/examples/_registry.ts` | examples 子 registry（初始空数组，预留） |
| `apps/v4/registry/bases/lynn901/internal/_registry.ts` | internal 子 registry（初始空数组，预留） |
| `apps/v4/registry/bases/lynn901/OVERRIDES.md` | A 类官方文件修改登记表 |
| `.github/workflows/deploy-registry-pages.yml` | GitHub Pages 部署 Action（托管 `public/r/`） |

**修改文件：**

| 路径 | 改动 |
|---|---|
| `apps/v4/registry/bases.ts` | `BASES` 数组追加 `lynn901` 条目（A 类，登记 OVERRIDES） |

**生成产物（构建后自动产生，不手改）：**

| 路径 | 说明 |
|---|---|
| `apps/v4/registry/bases/__index__.tsx` | 构建器自动追加 lynn901 索引 |
| `apps/v4/registry/bases/__components__.tsx` | 构建器自动追加 lynn901 组件索引 |
| `apps/v4/public/r/styles/lynn901-{nova,sera,vega,luma,lyra,maia,mira,rhea}/*.json` | 8 倍 style 组合的可安装 JSON |
| `apps/v4/public/r/index.json` | registry 索引 |

---

## Task 1: 配置双远程 git 拓扑

**Files:**
- 无文件创建/修改，仅 git remote 操作

**Interfaces:**
- Produces: `upstream` → 官方，`origin` → 个人 fork；为后续所有任务提供正确远程基座。

- [ ] **Step 1: 确认当前远程状态**

Run: `git remote -v`
Expected: `origin  git@github.com:shadcn-ui/ui.git (fetch/push)`（当前 origin 错误指向官方）

- [ ] **Step 2: 把官方 origin 重命名为 upstream**

Run: `git remote rename origin upstream`
Expected: 无输出（成功）

- [ ] **Step 3: 新增 origin 指向个人 fork**

Run: `git remote add origin git@github.com:lynn901/ui.git`
Expected: 无输出（成功）

- [ ] **Step 4: 拉取两个远程的最新引用**

Run: `git fetch upstream && git fetch origin`
Expected: 两个远程的 refs 都更新，无错误。若 origin 报权限错，说明 SSH key 未配好——需用户在本地配 `ssh-keygen` 并把公钥加到 GitHub `lynn901` 账号。

- [ ] **Step 5: 验证远程配置正确**

Run: `git remote -v`
Expected:
```
origin    git@github.com:lynn901/ui.git (fetch)
origin    git@github.com:lynn901/ui.git (push)
upstream  git@github.com:shadcn-ui/ui.git (fetch)
upstream  git@github.com:shadcn-ui/ui.git (push)
```

- [ ] **Step 6: 验证 main 跟踪 upstream/main**

Run: `git config --get branch.main.remote && git config --get branch.main.merge`
Expected:
```
upstream
refs/heads/main
```

注：此任务无代码改动，不单独提交。

---

## Task 2: 创建 main-custom 分支并迁移设计文档提交

**Files:**
- 无文件修改，仅分支操作

**Interfaces:**
- Produces: `main-custom` 分支，跟踪 `origin/main-custom`，承载设计文档与所有后续自有提交。

- [ ] **Step 1: 确认当前 HEAD 与设计文档提交在 main 上**

Run: `git log --oneline -3`
Expected: 顶部为 `docs(specs): ...` 设计文档提交（commit hash 形如 `a7bbdffee`），其下是官方镜像提交。

- [ ] **Step 2: 从当前 main 创建 main-custom 分支**

Run: `git checkout -b main-custom`
Expected: `Switched to a new branch 'main-custom'`。此时设计文档提交随分支带过来。

- [ ] **Step 3: 把 main 回退到纯官方镜像（移除设计文档提交）**

Run: `git checkout main && git reset --hard upstream/main`
Expected: `HEAD is now at <官方commit>`。main 现在是纯官方镜像，零本地提交。设计文档提交只存在于 main-custom。

- [ ] **Step 4: 切回 main-custom 并推送到个人 fork**

Run: `git checkout main-custom && git push -u origin main-custom`
Expected: 推送成功，main-custom 跟踪 `origin/main-custom`。若 origin 报权限错，回到 Task 1 Step 4 排查 SSH。

- [ ] **Step 5: 验证两个分支状态**

Run: `git branch -vv`
Expected:
```
* main-custom <hash> [origin/main-custom] docs(specs): ...
  main        <官方hash> [upstream/main] <官方commit message>
```

注：此任务无新代码改动（设计文档已在 main 上提交，随分支迁移）。

---

## Task 3: 创建 bases/lynn901/ 目录骨架与 OVERRIDES.md

**Files:**
- Create: `apps/v4/registry/bases/lynn901/OVERRIDES.md`
- Create: `apps/v4/registry/bases/lynn901/lib/_registry.ts`
- Create: `apps/v4/registry/bases/lynn901/hooks/_registry.ts`
- Create: `apps/v4/registry/bases/lynn901/components/_registry.ts`
- Create: `apps/v4/registry/bases/lynn901/blocks/_registry.ts`
- Create: `apps/v4/registry/bases/lynn901/examples/_registry.ts`
- Create: `apps/v4/registry/bases/lynn901/internal/_registry.ts`

**Interfaces:**
- Produces: 6 个子 registry 的空聚合文件（lib 除外，含 utils），供 Task 5 的 `registry.ts` 导入；OVERRIDES.md 初始登记表。

- [ ] **Step 1: 创建 lib/_registry.ts（含 utils 条目）**

文件 `apps/v4/registry/bases/lynn901/lib/_registry.ts`：

```ts
import { type Registry } from "shadcn/schema"

export const lib: Registry["items"] = [
  {
    name: "utils",
    type: "registry:lib",
    dependencies: ["clsx", "tailwind-merge"],
    files: [
      {
        path: "lib/utils.ts",
        type: "registry:lib",
      },
    ],
  },
]
```

- [ ] **Step 2: 创建 lib/utils.ts（cn 工具，复制自官方）**

文件 `apps/v4/registry/bases/lynn901/lib/utils.ts`：

```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 3: 创建 hooks/_registry.ts（空数组，预留）**

文件 `apps/v4/registry/bases/lynn901/hooks/_registry.ts`：

```ts
import { type Registry } from "shadcn/schema"

export const hooks: Registry["items"] = []
```

- [ ] **Step 4: 创建 components/_registry.ts（空数组，预留）**

文件 `apps/v4/registry/bases/lynn901/components/_registry.ts`：

```ts
import { type Registry } from "shadcn/schema"

export const components: Registry["items"] = []
```

- [ ] **Step 5: 创建 blocks/_registry.ts（空数组，预留）**

文件 `apps/v4/registry/bases/lynn901/blocks/_registry.ts`：

```ts
import { type Registry } from "shadcn/schema"

export const blocks: Registry["items"] = []
```

- [ ] **Step 6: 创建 examples/_registry.ts（空数组，预留）**

文件 `apps/v4/registry/bases/lynn901/examples/_registry.ts`：

```ts
import { type Registry } from "shadcn/schema"

export const examples: Registry["items"] = []
```

- [ ] **Step 7: 创建 internal/_registry.ts（空数组，预留）**

文件 `apps/v4/registry/bases/lynn901/internal/_registry.ts`：

```ts
import { type Registry } from "shadcn/schema"

export const internal: Registry["items"] = []
```

- [ ] **Step 8: 创建 OVERRIDES.md 登记表**

文件 `apps/v4/registry/bases/lynn901/OVERRIDES.md`：

```markdown
# Overrides — 官方文件直接修改登记表

本表记录所有直接修改官方(upstream)文件的改动。同步上游时,
仅本表登记的文件需要人工审查冲突, 其余官方文件可放心接受上游版本。

建表时机: 创建 bases/lynn901/ 目录时即建立, 初始登记 BASES 追加。
之后每次新增 A 类修改时追加一行。

| 官方文件 | 改动类型 | 改动内容 | 为什么不能用 B/C | 登记日期 |
|---|---|---|---|---|
| apps/v4/registry/bases.ts | 追加 | BASES 数组追加 lynn901 条目 | 新 base 必须注册进中心化数组, wrapper/fork 无法替代 | 2026-06-29 |
```

注：`bases.ts` 的实际追加在 Task 4 完成；此步先登记，Task 4 完成后该条目才真正生效。

- [ ] **Step 9: 验证目录结构**

Run: `find apps/v4/registry/bases/lynn901 -type f | sort`
Expected:
```
apps/v4/registry/bases/lynn901/OVERRIDES.md
apps/v4/registry/bases/lynn901/blocks/_registry.ts
apps/v4/registry/bases/lynn901/components/_registry.ts
apps/v4/registry/bases/lynn901/examples/_registry.ts
apps/v4/registry/bases/lynn901/hooks/_registry.ts
apps/v4/registry/bases/lynn901/internal/_registry.ts
apps/v4/registry/bases/lynn901/lib/_registry.ts
apps/v4/registry/bases/lynn901/lib/utils.ts
```

- [ ] **Step 10: 提交**

```bash
git add apps/v4/registry/bases/lynn901/
git commit -m "feat(lynn901): scaffold bases/lynn901 directory and OVERRIDES registry"
```

---

## Task 4: 在 BASES 数组注册 lynn901（A 类修改）

**Files:**
- Modify: `apps/v4/registry/bases.ts`

**Interfaces:**
- Consumes: Task 3 创建的 `bases/lynn901/` 目录（构建器会用 `base.name` 拼出 `registry/bases/lynn901/registry.ts` 加载，故 Task 5 必须先于构建完成）。
- Produces: `BASES` 数组含 `lynn901` 条目；构建器据此生成 8 倍 style 组合。

⚠️ **执行顺序**：本任务改 `bases.ts` 后，构建器会尝试加载 `bases/lynn901/registry.ts`——该文件在 Task 5 创建。若此时构建会失败。**所以 Task 4 与 Task 5 必须一起完成后再构建验证**（见 Task 5 Step 末尾的联合验证）。本任务只改 `bases.ts`，不单独构建。

- [ ] **Step 1: 读取当前 bases.ts 确认 BASES 数组结构**

Run: `cat apps/v4/registry/bases.ts`
Expected: `BASES` 数组含 `radix` 和 `base` 两个条目，每个有 `name/type/title/description/dependencies/meta.logo`。

- [ ] **Step 2: 在 BASES 数组末尾追加 lynn901 条目**

用 Edit 工具，把 `base` 条目的收尾 `},` 之后、数组收尾 `]` 之前，追加：

```ts
  {
    name: "lynn901",
    type: "registry:style",
    title: "Lynn901 UI",
    description: "Personal component library built on Base UI.",
    dependencies: ["@base-ui/react"],
  },
```

具体 Edit：
- old_string（`base` 条目结尾 + 数组结尾）：
```ts
    meta: {
      logo: "<svg width='17' height='24' viewBox='0 0 17 24'><path fill='currentColor' d='M9.5001 7.01537C9.2245 6.99837 9 7.22385 9 7.49999V23C13.4183 23 17 19.4183 17 15C17 10.7497 13.6854 7.27351 9.5001 7.01537Z'></path><path fill='currentColor'   d='M8 9.8V12V23C3.58172 23 0 19.0601 0 14.2V12V1C4.41828 1 8 4.93989 8 9.8Z'></path></svg>",
    },
  },
]
```
- new_string：在上面的 `},` 和 `]` 之间插入 lynn901 条目（保留原有 `base` 条目不动）。

- [ ] **Step 3: 验证修改后 BASES 含三个条目**

Run: `grep -c "name:" apps/v4/registry/bases.ts`
Expected: `3`（radix, base, lynn901）

Run: `grep "lynn901" apps/v4/registry/bases.ts`
Expected: 一行 `name: "lynn901",`

- [ ] **Step 4: 确认 OVERRIDES.md 已登记此修改**

Run: `grep "bases.ts" apps/v4/registry/bases/lynn901/OVERRIDES.md`
Expected: 匹配到 Task 3 Step 8 写入的那一行。

- [ ] **Step 5: 提交（与 Task 5 联合，见 Task 5 Step 6）**

本任务不单独提交——`bases.ts` 改动与 Task 5 的 `registry.ts` 一起提交，避免提交一个会让构建失败的中间态。

---

## Task 5: 创建 lynn901/registry.ts 顶层入口

**Files:**
- Create: `apps/v4/registry/bases/lynn901/registry.ts`

**Interfaces:**
- Consumes: Task 3 的 6 个子 `_registry.ts` + `@/registry/fonts`（官方共享）。
- Produces: `registry` 默认导出，构建器 `import` 它生成产物。

- [ ] **Step 1: 创建 registry.ts（仿 bases/base/registry.ts）**

文件 `apps/v4/registry/bases/lynn901/registry.ts`：

```ts
import { registryItemSchema, type Registry } from "shadcn/schema"
import { z } from "zod"

import { fonts } from "@/registry/fonts"

import { blocks } from "./blocks/_registry"
import { components } from "./components/_registry"
import { examples } from "./examples/_registry"
import { hooks } from "./hooks/_registry"
import { internal } from "./internal/_registry"
import { lib } from "./lib/_registry"
import { ui } from "./ui/_registry"

// Shared between index and style.
const LYNN901_STYLE = {
  type: "registry:style",
  dependencies: ["class-variance-authority", "lucide-react", "@base-ui/react"],
  devDependencies: ["tw-animate-css", "shadcn"],
  registryDependencies: ["utils"],
  css: {
    '@import "tw-animate-css"': {},
    '@import "shadcn/tailwind.css"': {},
    "@layer base": {
      "*": {
        "@apply border-border outline-ring/50": {},
      },
      body: {
        "@apply bg-background text-foreground": {},
      },
    },
  },
  cssVars: {},
  files: [],
}

export const registry = {
  name: "lynn901",
  homepage: "https://lynn901.github.io/ui",
  items: z.array(registryItemSchema).parse([
    {
      name: "index",
      ...LYNN901_STYLE,
    },
    {
      name: "style",
      ...LYNN901_STYLE,
    },
    ...ui,
    ...examples,
    ...lib,
    ...components,
    ...blocks,
    ...hooks,
    ...internal,
    ...fonts,
  ]),
} satisfies Registry
```

注：`ui` 子 registry 在 Task 6 创建。本步先写好 import，Task 6 创建 `ui/_registry.ts` 后 import 才能解析。**所以 Task 5 与 Task 6 必须一起完成后再 typecheck/构建。**

- [ ] **Step 2: （联合验证，待 Task 6 完成后执行）**

本任务的 `registry.ts` 引用了尚不存在的 `./ui/_registry`，typecheck 会报错。联合验证放在 Task 6 Step 4。

- [ ] **Step 3: 提交（与 Task 6 联合，见 Task 6 Step 5）**

本任务不单独提交——避免提交无法解析 import 的中间态。

---

## Task 6: 创建 ui 子 registry 与示范 button 组件

**Files:**
- Create: `apps/v4/registry/bases/lynn901/ui/_registry.ts`
- Create: `apps/v4/registry/bases/lynn901/ui/button.tsx`

**Interfaces:**
- Consumes: `lib/utils`（Task 3 的 `cn`），`@base-ui/react`。
- Produces: `ui` 子 registry 导出含 `button` 条目；`registry.ts`（Task 5）的 `./ui/_registry` import 可解析。

- [ ] **Step 1: 创建 ui/button.tsx（fork 自官方 base button，验证 Base UI 链路）**

文件 `apps/v4/registry/bases/lynn901/ui/button.tsx`：

```tsx
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/registry/bases/lynn901/lib/utils"

const buttonVariants = cva(
  "cn-button group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "cn-button-variant-default",
        outline: "cn-button-variant-outline",
        secondary: "cn-button-variant-secondary",
        ghost: "cn-button-variant-ghost",
        destructive: "cn-button-variant-destructive",
        link: "cn-button-variant-link",
      },
      size: {
        default: "cn-button-size-default",
        xs: "cn-button-size-xs",
        sm: "cn-button-size-sm",
        lg: "cn-button-size-lg",
        icon: "cn-button-size-icon",
        "icon-xs": "cn-button-size-icon-xs",
        "icon-sm": "cn-button-size-icon-sm",
        "icon-lg": "cn-button-size-icon-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
```

注：import 路径用 `@/registry/bases/lynn901/lib/utils`（自有命名空间内的 utils）。这是官方 base button 的当前实现：基于 `@base-ui/react/button` 的 `ButtonPrimitive`，变体通过语义 token（`cn-button`、`cn-button-variant-*`、`cn-button-size-*`）表达，样式定义在各 style 的 CSS 中。已按 `apps/v4/registry/bases/base/ui/button.tsx` 实际内容 1:1 复制，仅 `cn` 的 import 路径改为 lynn901 命名空间。

- [ ] **Step 2: 创建 ui/_registry.ts（含 button 条目）**

文件 `apps/v4/registry/bases/lynn901/ui/_registry.ts`：

```ts
import { type Registry } from "shadcn/schema"

export const ui: Registry["items"] = [
  {
    name: "button",
    type: "registry:ui",
    files: [{ path: "ui/button.tsx", type: "registry:ui" }],
    meta: {
      links: {
        docs: "https://lynn901.github.io/ui/docs/components/button",
      },
    },
  },
]
```

- [ ] **Step 3: typecheck 验证（红→绿，联合 Task 4+5）**

Run: `pnpm typecheck`
Expected: PASS（无错误）。若报 `Cannot find module "./ui/_registry"`，确认 Task 5 Step 1 的 registry.ts 与 Task 6 Step 2 的 ui/_registry.ts 都已创建。若报 `Cannot find module "@/registry/fonts"`，确认未误删官方 `apps/v4/registry/fonts.ts`。

- [ ] **Step 4: 联合构建验证（Task 4+5+6 一起）**

Run: `pnpm --filter=v4 registry:build -- --style lynn901-nova --registry lynn901-nova`
Expected: 构建成功，无 `❌ Registry validation failed for lynn901`。这是整条链路首次端到端验证——zod schema 校验通过 + 产物生成。

Run: `ls apps/v4/public/r/styles/lynn901-nova/`
Expected: 含 `button.json`（及 `index.json` 等索引文件）。

Run: `head -c 200 apps/v4/public/r/styles/lynn901-nova/button.json`
Expected: JSON 内容，含 `"name":"button"`，源码内联在 `files[].content`。

- [ ] **Step 5: 联合提交（Task 4+5+6）**

```bash
git add apps/v4/registry/bases.ts \
        apps/v4/registry/bases/lynn901/registry.ts \
        apps/v4/registry/bases/lynn901/ui/
git commit -m "feat(lynn901): register base, add registry entry and button component

- Append lynn901 to BASES array in apps/v4/registry/bases.ts
- Add bases/lynn901/registry.ts entry (mirrors bases/base/registry.ts)
- Add ui/button.tsx + ui/_registry.ts as first component
Verified: pnpm registry:build --style lynn901-nova succeeds, button.json generated."
```

---

## Task 7: 完整构建并提交全部 8 倍 style 产物

**Files:**
- 无新源码；构建生成 `__index__.tsx`、`__components__.tsx`、`public/r/styles/lynn901-*`。

**Interfaces:**
- Produces: 完整 8 倍 style 组合的可安装 JSON + 更新的索引文件，供 Task 8 发布。

- [ ] **Step 1: 运行完整 registry:build（含 lint:fix + format）**

Run: `pnpm registry:build`
Expected: 完整流水线成功——构建所有 base（含 lynn901）、生成全部 style 组合、写运行时索引、导出 `public/r/`、lint:fix、format:write。无 schema 校验失败。

注：完整 build 比 `--style` 定向构建慢（生成全部 16 + 8 组合 + 格式化），但这是提交前的标准构建。

- [ ] **Step 2: 验证 8 倍 style 产物全部生成**

Run: `ls apps/v4/public/r/styles/ | grep lynn901`
Expected:
```
lynn901-luma
lynn901-lyra
lynn901-maia
lynn901-mira
lynn901-nova
lynn901-rhea
lynn901-sera
lynn901-vega
```
（8 个目录）

Run: `ls apps/v4/public/r/styles/lynn901-nova/`
Expected: 含 `button.json`。

- [ ] **Step 3: 验证 bases 索引已含 lynn901**

Run: `grep -c "lynn901" apps/v4/registry/bases/__index__.tsx`
Expected: 大于 0（构建器自动写入 lynn901 索引）。

Run: `grep -c "lynn901" apps/v4/registry/bases/__components__.tsx`
Expected: 大于 0。

- [ ] **Step 4: typecheck 最终验证**

Run: `pnpm typecheck`
Expected: PASS。

- [ ] **Step 5: 提交构建产物**

```bash
git add -A
git commit -m "build(lynn901): generate full 8-style registry output

Full pnpm registry:build produces lynn901-{nova,sera,vega,luma,lyra,maia,mira,rhea}
installable JSON plus updated __index__/__components__ indexes."
git push origin main-custom
```

---

## Task 8: 配置 GitHub Pages 发布

**Files:**
- Create: `.github/workflows/deploy-registry-pages.yml`

**Interfaces:**
- Produces: push 到 `main-custom` 即自动把 `apps/v4/public/r/` 发布到 `https://lynn901.github.io/ui/r/`。

- [ ] **Step 1: 创建 GitHub Pages 部署 Action**

文件 `.github/workflows/deploy-registry-pages.yml`：

```yaml
name: Deploy Registry to Pages

on:
  push:
    branches: [main-custom]
    paths:
      - "apps/v4/public/r/**"
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - name: Setup Pages
        uses: actions/configure-pages@v5
      - name: Build Pages root (serve public/r at /r/)
        # upload-pages-artifact treats `path`'s CONTENTS as the site root, so
        # serving apps/v4/public/r directly would drop the /r/ segment from the
        # URL (giving /styles/... instead of /r/styles/...). Mirror the official
        # shadcn hosting layout by nesting r/ under a temp root, so the registry
        # is served at https://lynn901.github.io/ui/r/styles/...
        run: |
          mkdir -p "${{ runner.temp }}/pages/r"
          cp -r apps/v4/public/r/. "${{ runner.temp }}/pages/r/"
      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ${{ runner.temp }}/pages
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

注：`upload-pages-artifact` 把 `path` 指向目录的**内容**作为站点根。直接传 `apps/v4/public/r` 会丢失 `/r/` 段（URL 变 `/ui/styles/...`）。故 workflow 先把 `public/r` 复制到临时目录的 `r/` 子路径下再上传，使站点根 = `https://lynn901.github.io/ui/`，`public/r/styles/lynn901-nova/button.json` 对应 URL `https://lynn901.github.io/ui/r/styles/lynn901-nova/button.json`，与官方 `/r/styles/` 同构。

- [ ] **Step 2: 提交 Action**

```bash
git add .github/workflows/deploy-registry-pages.yml
git commit -m "ci(lynn901): deploy registry public/r to GitHub Pages"
git push origin main-custom
```

- [ ] **Step 3: 在 GitHub 配置 Pages 源（手动，用户操作）**

提示用户在 GitHub 网页操作（无法用命令完成）：
1. 打开 `https://github.com/lynn901/ui/settings/pages`
2. "Build and deployment" → Source 选 **GitHub Actions**
3. 保存

Action 下次 push 到 main-custom 且改动 `apps/v4/public/r/**` 时自动部署。

- [ ] **Step 4: 触发首次部署并验证**

Run: `git commit --allow-empty -m "ci(lynn901): trigger pages deploy" && git push origin main-custom`
Expected: 推送成功。等 GitHub Actions 跑完（约 1-2 分钟）。

Run: `curl -sI https://lynn901.github.io/ui/r/styles/lynn901-nova/button.json | head -1`
Expected: `HTTP/2 200`。若 404，检查：(a) GitHub Pages 源是否设为 GitHub Actions；(b) Action 是否成功（看 `https://github.com/lynn901/ui/actions`）；(c) URL 路径是否含 `/ui/`（仓库名）。

- [ ] **Step 5: 端到端冒烟测试**

在一个临时空目录：
```bash
mkdir /tmp/lynn901-smoke && cd /tmp/lynn901-smoke
npm init -y
npx shadcn@latest init -d
npx shadcn@latest add https://lynn901.github.io/ui/r/styles/lynn901-nova/button.json
```
Expected: button 组件成功安装到本地项目，`components/ui/button.tsx` 生成。若失败，检查 button.json 的 `files[].content` 是否内联了源码、`registryDependencies` 指向的 `utils` 是否可解析。

---

## Task 9: 编写自有库 README

**Files:**
- Create: `apps/v4/registry/bases/lynn901/README.md`

**Interfaces:**
- Produces: 自有库的使用与维护说明，含同步流程速查。

- [ ] **Step 1: 创建 README**

文件 `apps/v4/registry/bases/lynn901/README.md`：

````markdown
# @lynn901 — Personal Component Library

基于 shadcn/ui fork 的个人组件库，底层 Base UI，通过 shadcn registry 交付。

## 安装

```bash
npx shadcn add https://lynn901.github.io/ui/r/styles/lynn901-nova/<component>.json
```

可用 style 组合：`lynn901-nova` `lynn901-sera` `lynn901-vega` `lynn901-luma` `lynn901-lyra` `lynn901-maia` `lynn901-mira` `lynn901-rhea`。

## 本地开发

```bash
# 快速迭代（单 style，跳过格式化）
pnpm --filter=v4 registry:build -- --style lynn901-nova --registry lynn901-nova

# 完整构建（提交前必跑，含 lint+format，生成全部 8 style）
pnpm registry:build
```

新增组件：在 `ui/` 加源码 + 在 `ui/_registry.ts` 加条目 → 构建。

## 同步上游

见 `OVERRIDES.md`。标准流程：

```bash
git checkout main && git fetch upstream && git reset --hard upstream/main
git checkout main-custom && git rebase main
# 仅 OVERRIDES.md 登记的文件可能冲突 → 解 → git rebase --continue
git push -f origin main-custom
pnpm registry:build && git add -A && git commit -m "chore(lynn901): rebuild after upstream sync" && git push origin main-custom
```

## 定制形式

- **全新组件 / B wrapper / C fork**：放本目录，零同步冲突。
- **A 直接改官方文件**：登记 `OVERRIDES.md`，同步时需人工解冲突。

## 架构决策

见 `docs/superpowers/specs/2026-06-29-lynn901-component-library-design.md`。
````

- [ ] **Step 2: 提交**

```bash
git add apps/v4/registry/bases/lynn901/README.md
git commit -m "docs(lynn901): add library README with install, dev, sync instructions"
git push origin main-custom
```

---

## Self-Review

**1. Spec coverage（设计文档各节 → 任务映射）：**

- 第 3 节 Git 拓扑与分支策略 → Task 1（远程）+ Task 2（分支）。✅
- 第 4 节 目录隔离与命名空间 → Task 3（骨架）。✅
- 第 5 节 BASES 注册与 style 组合模型 → Task 4（注册）+ Task 6/7（8 倍产物）。✅
- 第 6 节 registry.ts 入口与组件寻址 → Task 5（入口）+ Task 6（示范组件）。✅
- 第 7 节 发布与托管 → Task 8（GitHub Pages）。✅
- 第 8 节 同步冲突处理与 OVERRIDES.md → Task 3 Step 8（建表）+ Task 4 Step 4（登记）+ Task 9 README（同步流程速查）。✅
- 第 9 节 测试与验证 → Task 6 Step 4（产物检查）+ Task 8 Step 5（端到端冒烟）。✅
- 第 10 节 未来扩展 → 计划范围外（YAGNI），README 已提。✅

**2. Placeholder scan：** 无 TBD/TODO/"implement later"。每个代码步骤含完整代码。A 类登记、构建命令、验证命令均具体。✅

**3. Type consistency：**
- `LYNN901_STYLE` 在 Task 5 定义，结构与官方 `BASE_STYLE`/`RADIX_STYLE` 一致（`type/dependencies/devDependencies/registryDependencies/css/cssVars/files`）。✅
- `ui/_registry.ts` 导出 `ui: Registry["items"]`，与 `lib/hooks` 等同模式，被 `registry.ts` 解构 `...ui`。✅
- `BASES` 条目字段（`name/type/title/description/dependencies`）与官方 `radix`/`base` 条目一致。✅
- button.tsx import 路径 `@/registry/bases/lynn901/lib/utils` 与文件实际位置一致。✅

**4. 顺序依赖已标注：** Task 4+5+6 标注"联合构建验证"，避免提交会让构建失败的中间态。✅
