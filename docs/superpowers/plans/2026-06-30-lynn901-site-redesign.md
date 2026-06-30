# lynn901 站点重设计（骨架）实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `apps/v4` 站点从官方 shadcn 营销站重设计为 lynn901 个人组件库展示站——身份换装、Editorial 暖色视觉、导航精简、首页重写、新建关于页（骨架阶段）。

**Architecture:** A 类原地重构官方页面文件。先落底层 token（字体、配色），再换身份（siteConfig/metadata），再精简导航，最后重写首页与新建关于页。每个 task 独立 commit、独立 build 验证。详情页/文档接入移至后续 spec。

**Tech Stack:** Next.js 16 (app router)、Tailwind v4（`@theme inline` + CSS 变量）、`next/font/google`、fumadocs（本阶段不动）、pnpm@10 workspaces。

## Global Constraints

- 分支：`main-custom`（所有 lynn901 提交进此分支，已在上面）。
- Node：v22.x（已装，`nvm` 管理；非交互 shell 需先 `source ~/.nvm/nvm.sh`）。
- 包管理：`pnpm`（corepack 锁定 10.33.4）。workspace 运行用 `pnpm --filter=v4 <cmd>`。
- 质量门：`pnpm --filter=v4 build` 须通过（含 lint + typecheck）。本仓库 pre-PR 门是 `pnpm check`。
- Commit 规范：conventional commits，fork 提交 scope 用 `lynn901`，如 `feat(lynn901): ...` / `style(lynn901): ...`。
- 所有改动都是 A 类（直接改官方文件），**每个 task 完成后须追加 `OVERRIDES.md` 登记行**（Task 1 除外，字体/配色归并登记）。
- 配色用 hex（CSS 变量接受任意格式）；字体走 `next/font/google` 自托管。
- 不动：`content/docs/`、`DocsBaseSwitcher`、`[[...slug]]/page.tsx`、`registry/`（lynn901 已就绪）。
- 字体 fallback：`--font-heading` = `"Fraunces", "Noto Serif SC", serif`；`--font-sans` = `"Inter", "Noto Serif SC", "Microsoft YaHei", sans-serif`。

---

## File Structure

| 文件 | 责任 | 操作 |
|---|---|---|
| `apps/v4/lib/fonts.ts` | next/font 字体实例 + `fontVariables` | 改：加 Fraunces/Noto Serif SC/Inter，拆 heading/sans |
| `apps/v4/app/globals.css` | `:root`/`.dark` token 实值 + `@theme inline` | 改：替换品牌色 token |
| `apps/v4/lib/config.ts` | `siteConfig` + `META_THEME_COLORS` | 改：身份换装、navItems 精简、meta 色 |
| `apps/v4/app/layout.tsx` | 根布局 + metadata | 改：metadata 作者/creator/twitter、lang=zh-CN |
| `apps/v4/components/site-header.tsx` | 顶栏 | 改：移除 V0Button/ProjectForm/New，统一 button import |
| `apps/v4/components/main-nav.tsx` | 桌面导航 | 改：统一 button import |
| `apps/v4/components/mobile-nav.tsx` | 移动导航 | 改：裁剪 TOP_LEVEL_SECTIONS，统一 button import |
| `apps/v4/app/(app)/(root)/page.tsx` | 首页 | 改：重写为 hero + 组件墙 |
| `apps/v4/app/(app)/(root)/cards/` | 旧 dashboard 卡片墙 | 删（首页不再用） |
| `apps/v4/app/(app)/about/page.tsx` | 关于页 | 新建 |
| `apps/v4/registry/bases/lynn901/OVERRIDES.md` | A 类登记表 | 改：追加登记行 |

---

## Task 1: 接入字体（Fraunces + 思源宋体 + Inter）

**Files:**
- Modify: `apps/v4/lib/fonts.ts`

**Interfaces:**
- Produces: `fontVariables`（含新的 `.variable` 类名）、CSS 变量 `--font-heading`/`--font-sans`/`--font-mono`/`--font-serif-cn`。后续 task 不直接改 fonts.ts。

- [ ] **Step 1: 改写 `apps/v4/lib/fonts.ts`**

完整替换文件内容：

```ts
import {
  Fraunces as FontFraunces,
  Geist_Mono as FontMono,
  Inter as FontInter,
  Noto_Sans_Arabic as FontNotoSansArabic,
  Noto_Sans_Hebrew as FontNotoSansHebrew,
  Noto_Serif_SC as FontNotoSerifSC,
} from "next/font/google"

import { cn } from "@/lib/utils"

// 英文标题衬线（Fraunces），中文标题/正文 fallback 到思源宋体
const fontHeading = FontFraunces({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600"],
})

// UI 无衬线（Inter），中文 UI fallback 到思源宋体
const fontSans = FontInter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600"],
})

// 中文宋体（标题 + 正文主力）
const fontSerifCN = FontNotoSerifSC({
  subsets: ["latin"],
  variable: "--font-serif-cn",
  weight: ["400", "500", "600", "700"],
})

const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400"],
})

const fontNotoSansArabic = FontNotoSansArabic({
  subsets: ["latin"],
  variable: "--font-ar",
})

const fontNotoSansHebrew = FontNotoSansHebrew({
  subsets: ["latin"],
  variable: "--font-he",
})

export const fontVariables = cn(
  fontHeading.variable,
  fontSans.variable,
  fontSerifCN.variable,
  fontMono.variable,
  fontNotoSansArabic.variable,
  fontNotoSansHebrew.variable
)
```

- [ ] **Step 2: 在 `globals.css` 的 `@theme inline` 块注册新字体变量 + 设 fallback 链**

修改 `apps/v4/app/globals.css`，把 L23-25 的：

```css
  --font-sans: var(--font-sans);
  --font-heading: var(--font-heading);
  --font-mono: var(--font-mono);
```

替换为（注意：fallback 链让中英混排各取所需字形）：

```css
  --font-sans: var(--font-sans), "Noto Serif SC", "Microsoft YaHei", sans-serif;
  --font-heading: var(--font-heading), "Noto Serif SC", serif;
  --font-mono: var(--font-mono), monospace;
  --font-serif-cn: var(--font-serif-cn), "Microsoft YaHei", serif;
```

> 说明：`var(--font-sans)` 是 next/font 注入的 Inter `.variable` 值，后面接 fallback。Tailwind 的 `font-sans`/`font-heading` 工具类会取这些值。

- [ ] **Step 3: 验证 build**

```bash
cd /home/yuan/ui && source ~/.nvm/nvm.sh && pnpm --filter=v4 build
```
Expected: 构建通过，无字体相关报错。若 `Noto_Serif_SC` 名字报错，确认 `next/font/google` 导出名（Google Fonts 上是 `Noto Serif SC`，next/font 转成 `Noto_Serif_SC`）。

- [ ] **Step 4: Commit**

```bash
cd /home/yuan/ui
git add apps/v4/lib/fonts.ts apps/v4/app/globals.css
git commit -m "feat(lynn901): adopt Fraunces + Noto Serif SC + Inter fonts"
```

---

## Task 2: 应用配色（羊皮纸 + 陶土，亮暗）

**Files:**
- Modify: `apps/v4/app/globals.css`（`:root` L75-117、`.dark` L119+）
- Modify: `apps/v4/lib/config.ts`（`META_THEME_COLORS`）

**Interfaces:**
- Produces: `--background`/`--foreground`/`--primary`/`--border`/`--card` 等品牌色 token（亮暗两套）。后续页面 task 消费这些 token。

- [ ] **Step 1: 替换 `:root`（亮色）token**

把 `apps/v4/app/globals.css` 的 `:root { ... }` 块（L75-117）整体替换为：

```css
:root {
  --radius: 0.5rem;
  --background: #faf7f2;
  --foreground: #2a2520;
  --card: #ffffff;
  --card-foreground: #2a2520;
  --popover: #ffffff;
  --popover-foreground: #2a2520;
  --primary: #8a4b2a;
  --primary-foreground: #faf7f2;
  --secondary: #efe3d6;
  --secondary-foreground: #2a2520;
  --muted: #efe3d6;
  --muted-foreground: #6f6557;
  --accent: #efe3d6;
  --accent-foreground: #8a4b2a;
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: #faf7f2;
  --border: #ece3d6;
  --input: #ece3d6;
  --ring: #8a4b2a;
  --chart-1: #8a4b2a;
  --chart-2: #b08a6a;
  --chart-3: #6f6557;
  --chart-4: #c47a4e;
  --chart-5: #2a2520;
  --sidebar: #faf7f2;
  --sidebar-foreground: #2a2520;
  --sidebar-primary: #8a4b2a;
  --sidebar-primary-foreground: #faf7f2;
  --sidebar-accent: #efe3d6;
  --sidebar-accent-foreground: #8a4b2a;
  --sidebar-border: #ece3d6;
  --sidebar-ring: #8a4b2a;
  --surface: #f5f0e8;
  --surface-foreground: var(--foreground);
  --code: var(--surface);
  --code-foreground: var(--surface-foreground);
  --code-highlight: #efe3d6;
  --code-number: #b08a6a;
  --selection: #8a4b2a;
  --selection-foreground: #faf7f2;
}
```

- [ ] **Step 2: 替换 `.dark`（暗色）token**

把 `apps/v4/app/globals.css` 的 `.dark { ... }` 块整体替换为（只列需要改的，保持块完整）：

```css
.dark {
  --background: #1c1814;
  --foreground: #e8e0d4;
  --card: #241f1a;
  --card-foreground: #e8e0d4;
  --popover: #241f1a;
  --popover-foreground: #e8e0d4;
  --primary: #c47a4e;
  --primary-foreground: #1c1814;
  --secondary: #2e2620;
  --secondary-foreground: #e8e0d4;
  --muted: #2e2620;
  --muted-foreground: #9a8f7e;
  --accent: #2e2620;
  --accent-foreground: #d99a72;
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: #1c1814;
  --border: #2e2620;
  --input: #2e2620;
  --ring: #c47a4e;
  --chart-1: #c47a4e;
  --chart-2: #d99a72;
  --chart-3: #9a8f7e;
  --chart-4: #b08a6a;
  --chart-5: #e8e0d4;
  --sidebar: #1c1814;
  --sidebar-foreground: #e8e0d4;
  --sidebar-primary: #c47a4e;
  --sidebar-primary-foreground: #1c1814;
  --sidebar-accent: #2e2620;
  --sidebar-accent-foreground: #d99a72;
  --sidebar-border: #2e2620;
  --sidebar-ring: #c47a4e;
  --surface: #241f1a;
  --surface-foreground: var(--foreground);
  --code: var(--surface);
  --code-foreground: var(--surface-foreground);
  --code-highlight: #2e2620;
  --code-number: #b08a6a;
  --selection: #c47a4e;
  --selection-foreground: #1c1814;
}
```

> 注意：原文件 `.dark` 块后面可能还有 `--surface-*` 等剩余行，替换时确保块闭合 `}`。读原文件确认 `.dark` 块的完整范围再替换。

- [ ] **Step 3: 改 `META_THEME_COLORS`**

修改 `apps/v4/lib/config.ts` L43-46：

```ts
export const META_THEME_COLORS = {
  light: "#faf7f2",
  dark: "#1c1814",
}
```

- [ ] **Step 4: 验证 build + 暗色**

```bash
cd /home/yuan/ui && source ~/.nvm/nvm.sh && pnpm --filter=v4 build
```
Expected: 构建通过。`pnpm --filter=v4 dev` 后人工核对：亮色底为羊皮纸暖米白，暗色底为暖墨棕（非冷灰）。

- [ ] **Step 5: Commit**

```bash
cd /home/yuan/ui
git add apps/v4/app/globals.css apps/v4/lib/config.ts
git commit -m "style(lynn901): apply parchment + terracotta palette (light/dark)"
```

---

## Task 3: 身份换装（siteConfig + metadata）

**Files:**
- Modify: `apps/v4/lib/config.ts`（`siteConfig`）
- Modify: `apps/v4/app/layout.tsx`（metadata、lang）

**Interfaces:**
- Produces: `siteConfig`（lynn901 身份、4 项 navItems）。Task 4/5 的导航组件消费 `siteConfig.navItems`。

- [ ] **Step 1: 改 `siteConfig`**

把 `apps/v4/lib/config.ts` L1-41 的 `siteConfig` 整体替换为：

```ts
export const siteConfig = {
  name: "lynn901/ui",
  url: "https://lynn901.github.io/ui",
  ogImage: "https://lynn901.github.io/ui/og.jpg",
  description:
    "lynn901 的个人组件库——基于 Base UI，八种风格，同一根基。一行命令安装任意组件。",
  links: {
    github: "https://github.com/lynn901/ui",
  },
  navItems: [
    {
      href: "/docs/components",
      label: "组件",
    },
    {
      href: "/docs",
      label: "文档",
    },
    {
      href: "/about",
      label: "关于",
    },
  ],
}
```

> 说明：移除 `links.twitter`（无）。navItems 砍到 3 项（组件/文档/关于），GitHub 在 site-header 单独走 `GitHubLink` 组件（Task 4 保留）。`META_THEME_COLORS` 已在 Task 2 改过，不再动。

- [ ] **Step 2: 改 `layout.tsx` metadata + lang**

修改 `apps/v4/app/layout.tsx`：

(a) L24 keywords：
```ts
  keywords: ["Next.js", "React", "Tailwind CSS", "Components", "lynn901", "Base UI"],
```

(b) L25-30 authors：
```ts
  authors: [
    {
      name: "lynn901",
      url: "https://lynn901.github.io/ui",
    },
  ],
```

(c) L31 creator：
```ts
  creator: "lynn901",
```

(d) L34 locale：
```ts
    locale: "zh_CN",
```

(e) L53 twitter creator：
```ts
    creator: "@lynn901",
```

(f) L74 lang：
```ts
    <html lang="zh-CN" suppressHydrationWarning className={fontVariables}>
```

- [ ] **Step 3: 验证 build**

```bash
cd /home/yuan/ui && source ~/.nvm/nvm.sh && pnpm --filter=v4 build
```
Expected: 构建通过。dev 后浏览器标签标题为 `lynn901/ui`。

- [ ] **Step 4: Commit**

```bash
cd /home/yuan/ui
git add apps/v4/lib/config.ts apps/v4/app/layout.tsx
git commit -m "feat(lynn901): rebrand site config and metadata to lynn901"
```

---

## Task 4: 精简导航（site-header + main-nav + mobile-nav）

**Files:**
- Modify: `apps/v4/components/site-header.tsx`
- Modify: `apps/v4/components/main-nav.tsx`
- Modify: `apps/v4/components/mobile-nav.tsx`

**Interfaces:**
- Consumes: `siteConfig.navItems`（Task 3 产出，3 项）。
- Produces: 顶栏只剩 组件/文档/关于 + GitHubLink + ModeSwitcher + CommandMenu。

- [ ] **Step 1: 改 `site-header.tsx`——移除官方入口、统一 button import**

(a) 删除 import（L16-17）：
```ts
import { ProjectForm } from "@/app/(app)/create/components/project-form"
import { V0Button } from "@/app/(app)/create/components/v0-button"
```

(b) 把 button import（L15）改为 lynn901 品牌样式：
```ts
import { Button } from "@/styles/lynn901-nova/ui/button"
```

> 等等——site-header 改完 Button 后若不再用 Button（"New" 按钮被删），就删掉 Button import 和未用 import（`Suspense`、`PlusSignIcon`、`HugeiconsIcon`、`Link`）。先看 Step (c) 删完再用 lint 判断。

(c) 删除 L48-71 三个 designer 分支（V0Button/ProjectForm/"New" 按钮），即从：
```tsx
            <div className="hidden items-center gap-2 group-has-data-[slot=designer]/layout:md:flex">
```
到：
```tsx
            <div className="flex items-center gap-2 group-has-data-[slot=designer]/layout:hidden">
              <Separator orientation="vertical" />
              <Button asChild size="sm" className="h-[31px] rounded-lg">
                <Link href="/create">
                  <HugeiconsIcon icon={PlusSignIcon} />
                  New
                </Link>
              </Button>
            </div>
          </div>
```
全部删除。删除后 `<div className="ml-auto ...">` 内只剩 CommandMenu + Separator + GitHubLink + Separator + ModeSwitcher。结尾 `</div>` 保留。

(d) 删除不再使用的 import：`Suspense`、`Link`、`PlusSignIcon`、`HugeiconsIcon`、`Button`（若 "New" 删后无其他 Button 用）。

- [ ] **Step 2: 改 `main-nav.tsx`——统一 button import**

把 `apps/v4/components/main-nav.tsx` L8 的：
```ts
import { Button } from "@/registry/new-york-v4/ui/button"
```
改为：
```ts
import { Button } from "@/styles/lynn901-nova/ui/button"
```

- [ ] **Step 3: 改 `mobile-nav.tsx`——统一 button import + 裁剪 TOP_LEVEL_SECTIONS**

(a) L12 button import：
```ts
import { Button } from "@/registry/new-york-v4/ui/button"
```
改为：
```ts
import { Button } from "@/styles/lynn901-nova/ui/button"
```

(b) 裁剪 `TOP_LEVEL_SECTIONS`（L19-61，11 项硬编码）为 lynn901 精简版。读原文件确认结构后，替换为只保留 Components / Installation / Theming / Registry / Changelog 5 项（砍掉 RTL / Skills / MCP Server / Forms 等个人库无关项）。具体每项的 `href` 保持原样，只删数组元素。

> 若不确定哪些保留，最小可行做法：只保留 `Components`（`/docs/components`）和 `Changelog`（`/docs/changelog`）两项，其余删。个人库骨架阶段够用。

- [ ] **Step 4: 验证 build + lint**

```bash
cd /home/yuan/ui && source ~/.nvm/nvm.sh && pnpm --filter=v4 build
```
Expected: 构建通过，无 unused import 报错（lint 会抓）。dev 后顶栏只剩 组件/文档/关于 + GitHub + 明暗切换，无 V0/Create/New。

- [ ] **Step 5: Commit**

```bash
cd /home/yuan/ui
git add apps/v4/components/site-header.tsx apps/v4/components/main-nav.tsx apps/v4/components/mobile-nav.tsx
git commit -m "feat(lynn901): trim navigation and unify button import to lynn901-nova"
```

---

## Task 5: 重写首页（hero + 组件墙 M 方案）

**Files:**
- Modify: `apps/v4/app/(app)/(root)/page.tsx`
- Delete: `apps/v4/app/(app)/(root)/cards/`（整个目录）

**Interfaces:**
- Consumes: `@/styles/lynn901-nova/ui/button`（已构建就绪）、品牌色 token（Task 2）、字体（Task 1）。
- Produces: 新首页（hero + 组件墙）。

- [ ] **Step 1: 删除旧 cards 目录**

```bash
cd /home/yuan/ui
git rm -r "apps/v4/app/(app)/(root)/cards"
```

- [ ] **Step 2: 重写 `page.tsx`**

完整替换 `apps/v4/app/(app)/(root)/page.tsx`：

```tsx
import { type Metadata } from "next"
import Link from "next/link"
import { IconArrowRight } from "@tabler/icons-react"

import { Button } from "@/styles/lynn901-nova/ui/button"

const title = "安静地构建，基于 Base UI。"
const description =
  "lynn901 的个人组件库——八种风格，同一根基。一行命令安装任意组件。"

export const dynamic = "force-static"
export const revalidate = false

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    images: [
      {
        url: `/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [
      {
        url: `/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`,
      },
    ],
  },
}

export default function IndexPage() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="container-wrapper flex-1">
        <div className="container flex flex-col items-center py-16 text-center md:py-24">
          <p className="font-sans text-xs uppercase tracking-[0.25em] text-primary">
            个人组件库 · Base UI
          </p>
          <h1 className="mt-3 max-w-3xl font-heading text-4xl font-medium leading-tight md:text-5xl">
            安静地构建，
            <br />
            基于 <em className="italic text-primary">Base UI</em>。
          </h1>
          <p className="mt-5 max-w-xl font-serif-cn text-base text-muted-foreground">
            {description}
          </p>
          <code className="mt-6 rounded bg-secondary px-3 py-2 font-mono text-xs text-primary">
            $ npx shadcn add https://lynn901.github.io/ui/r/styles/lynn901-nova/button.json
          </code>
          <div className="mt-6 flex gap-3">
            <Button asChild className="rounded-lg">
              <Link href="/docs/components">
                开始使用 <IconArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button asChild variant="ghost" className="rounded-lg">
              <Link href="/docs/components">浏览组件</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 组件墙（方案 M：2 列叙事大卡片） */}
      <section className="container-wrapper border-t border-border">
        <div className="container py-12">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="font-heading text-2xl font-medium">组件</h2>
            <Link
              href="/docs/components"
              className="font-sans text-sm text-primary hover:underline"
            >
              查看全部 →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Button 卡 */}
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="font-heading text-lg">
                按钮 <em className="italic text-primary">Button</em>
              </div>
              <p className="mt-1 font-serif-cn text-sm text-muted-foreground">
                触发操作的基础元素，支持变体与尺寸。
              </p>
              <div className="mt-4 flex items-center gap-2">
                <Button className="rounded-lg">Button</Button>
                <Button variant="ghost" className="rounded-lg">
                  Ghost
                </Button>
                <span className="ml-2 font-mono text-xs text-muted-foreground">
                  · 2.1kb
                </span>
              </div>
            </div>

            {/* 占位卡：更多组件开发中 */}
            <div className="flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border p-6 text-center">
              <p className="font-serif-cn text-base text-primary">
                更多组件开发中
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                card · dialog · input · select · tabs · …
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 页脚条 */}
      <section className="container-wrapper border-t border-border">
        <div className="container py-6">
          <p className="font-serif-cn text-center text-sm text-muted-foreground">
            底层 Base UI · 8 styles · shadcn registry 兼容
          </p>
        </div>
      </section>
    </div>
  )
}
```

> 说明：用 `font-heading`（Fraunces+思源宋体 fallback）、`font-serif-cn`（思源宋体主力）、`font-sans`（Inter UI）、`font-mono`（命令）。`text-primary`/`bg-card`/`border-border` 等取 Task 2 的品牌色 token。`<em>` 包英文 "Base UI"/"Button" 走 Fraunces 斜体。

- [ ] **Step 3: 验证 build + 人工核对**

```bash
cd /home/yuan/ui && source ~/.nvm/nvm.sh && pnpm --filter=v4 build
```
Expected: 构建通过。dev 后人工核对：
- hero 中文标题 + Base UI 斜体陶土棕 + 安装命令块
- 组件墙：button 卡（真实 button 预览）+ 占位卡
- 配色为羊皮纸暖米白
- 无 `CardsDemo`/`Announcement`/`/create` 残留

- [ ] **Step 4: Commit**

```bash
cd /home/yuan/ui
git add -A "apps/v4/app/(app)/(root)/"
git commit -m "feat(lynn901): rewrite homepage with hero and component wall"
```

---

## Task 6: 新建关于页

**Files:**
- Create: `apps/v4/app/(app)/about/page.tsx`

**Interfaces:**
- Consumes: 品牌色 token、字体。无外部依赖。

- [ ] **Step 1: 创建 `apps/v4/app/(app)/about/page.tsx`**

```tsx
import { type Metadata } from "next"
import Link from "next/link"

import { Button } from "@/styles/lynn901-nova/ui/button"

export const metadata: Metadata = {
  title: "关于",
  description: "关于 lynn901 个人组件库。",
}

export default function AboutPage() {
  return (
    <div className="container-wrapper flex-1">
      <div className="container max-w-2xl py-16">
        <p className="font-sans text-xs uppercase tracking-[0.25em] text-primary">
          关于
        </p>
        <h1 className="mt-3 font-heading text-4xl font-medium leading-tight">
          lynn901<span className="text-primary">/ui</span>
        </h1>
        <div className="mt-6 space-y-4 font-serif-cn text-base leading-relaxed text-muted-foreground">
          <p>
            这是 lynn901 的个人组件库，基于 shadcn/ui 的 fork 构建。底层采用
            Base UI，通过 shadcn registry 交付——一行命令即可把组件装进任何项目。
          </p>
          <p>
            八种风格（nova、sera、vega、luma、lyra、maia、mira、rhea），同一根基。
            每个组件都可在不同风格间切换，找到适合你项目的那一款。
          </p>
          <p>
            这是一个个人工作台：用来沉淀自己在日常开发中反复使用的组件与设计决策，
            也欢迎你取用。
          </p>
        </div>
        <div className="mt-8 flex gap-3">
          <Button asChild className="rounded-lg">
            <Link href="/docs/components">浏览组件</Link>
          </Button>
          <Button asChild variant="ghost" className="rounded-lg">
            <Link href="https://github.com/lynn901/ui">GitHub</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 验证 build**

```bash
cd /home/yuan/ui && source ~/.nvm/nvm.sh && pnpm --filter=v4 build
```
Expected: 构建通过。dev 后访问 `/about` 看到关于页。

- [ ] **Step 3: Commit**

```bash
cd /home/yuan/ui
git add "apps/v4/app/(app)/about/page.tsx"
git commit -m "feat(lynn901): add about page"
```

---

## Task 7: 登记 OVERRIDES + 全量验证

**Files:**
- Modify: `apps/v4/registry/bases/lynn901/OVERRIDES.md`

**Interfaces:**
- 无代码接口，纯文档登记。

- [ ] **Step 1: 追加 OVERRIDES 登记行**

在 `apps/v4/registry/bases/lynn901/OVERRIDES.md` 的表格末尾（现有 `bases.ts` 行之后）追加：

```markdown
| apps/v4/lib/fonts.ts | 改写 | 字体实例改为 Fraunces/Noto Serif SC/Inter | 字体加载是站点级配置, lynn901 命名空间无法承载 | 2026-06-30 |
| apps/v4/app/globals.css | 改写 | :root/.dark token 换为羊皮纸+陶土配色, @theme inline 注册新字体变量 | 全局 CSS 变量是站点级, 无法隔离 | 2026-06-30 |
| apps/v4/lib/config.ts | 改写 | siteConfig 换 lynn901 身份, navItems 精简为3项, META_THEME_COLORS 换品牌色 | 站点配置是站点级, 无法隔离 | 2026-06-30 |
| apps/v4/app/layout.tsx | 改写 | metadata 作者/creator/twitter 换 lynn901, lang=zh-CN | 根布局是站点级, 无法隔离 | 2026-06-30 |
| apps/v4/components/site-header.tsx | 改写 | 移除 V0Button/ProjectForm/New, 统一 button import | 顶栏是站点级 chrome, 无法隔离 | 2026-06-30 |
| apps/v4/components/main-nav.tsx | 改 | button import 改为 lynn901-nova | 同上 | 2026-06-30 |
| apps/v4/components/mobile-nav.tsx | 改写 | 裁剪 TOP_LEVEL_SECTIONS, 统一 button import | 同上 | 2026-06-30 |
| apps/v4/app/(app)/(root)/page.tsx | 改写 | 首页重写为 hero+组件墙 | 首页是站点级, 无法隔离 | 2026-06-30 |
| apps/v4/app/(app)/(root)/cards/ | 删除 | 移除官方 dashboard 卡片墙 | 同上 | 2026-06-30 |
| apps/v4/app/(app)/about/page.tsx | 新建 | 关于页 | 新建文件, 非 A 类(但登记备查) | 2026-06-30 |
```

- [ ] **Step 2: 全量质量门**

```bash
cd /home/yuan/ui && source ~/.nvm/nvm.sh && pnpm check
```
Expected: lint + typecheck + format:check 全通过。若 format 失败，跑 `pnpm format:write` 后重新 `pnpm check`。

- [ ] **Step 3: 全量 build**

```bash
cd /home/yuan/ui && source ~/.nvm/nvm.sh && pnpm --filter=v4 build
```
Expected: 构建通过。

- [ ] **Step 4: 人工最终核对（dev）**

```bash
cd /home/yuan/ui && source ~/.nvm/nvm.sh && pnpm --filter=v4 dev
```
访问 `http://localhost:4000`，核对清单：
- [ ] 标签页标题 `lynn901/ui`，og 信息为 lynn901
- [ ] 顶栏：组件 / 文档 / 关于 + GitHub 图标 + 明暗切换，无 V0/Create/New
- [ ] 首页：hero 中文标题（Base UI 斜体陶土棕）+ 安装命令 + 组件墙（button 卡 + 占位卡）+ 页脚条
- [ ] 亮色底羊皮纸暖米白，暗色底暖墨棕（非冷灰）
- [ ] 字体：英文标题 Fraunces 衬线，中文标题/正文思源宋体，UI Inter，命令 mono
- [ ] `/about` 关于页正常渲染
- [ ] 切换暗色后配色协调，强调色为亮陶土

- [ ] **Step 5: Commit**

```bash
cd /home/yuan/ui
git add apps/v4/registry/bases/lynn901/OVERRIDES.md
git commit -m "docs(lynn901): register site redesign overrides"
```

---

## Verification（端到端）

1. **质量门**：`pnpm check`（lint + typecheck + format:check）全通过。
2. **构建**：`pnpm --filter=v4 build` 通过。
3. **运行**：`pnpm --filter=v4 dev`（:4000），按 Task 7 Step 4 清单人工核对。
4. **元数据**：浏览器标签、view-source 看 og 为 lynn901。
5. **OVERRIDES**：`OVERRIDES.md` 新增 10 行齐全。
6. **上游同步模拟**（可选）：`git fetch upstream` 后 `git rebase main` dry-run，确认冲突只在 OVERRIDES 登记文件内（siteConfig/globals.css/fonts.ts/layout/header/nav/page）。

## Self-Review

- **Spec 覆盖**：spec 第 3 节字体→Task 1；3.3 配色→Task 2；3.4+4.1 身份/导航→Task 3/4；4.2 首页→Task 5；4.3 关于页→Task 6；第 5 节 OVERRIDES→Task 7。全覆盖。
- **placeholder 扫描**：无 TBD/TODO。每个 step 有完整代码或精确命令。
- **类型一致**：`siteConfig.navItems` 在 Task 3 定义为 3 项 `{href,label}[]`，Task 4 消费一致；`Button` import 统一为 `@/styles/lynn901-nova/ui/button`；字体变量名 `--font-heading`/`--font-sans`/`--font-serif-cn` 在 Task 1 定义、Task 5 消费一致。
- **已知边界**：mobile-nav 的 TOP_LEVEL_SECTIONS 裁剪给了最小可行 fallback（Step 3b）；`.dark` 块替换需读原文件确认完整范围（Task 2 Step 2 注明）。
