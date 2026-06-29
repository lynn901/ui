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
