# syntax=docker/dockerfile:1.7
#
# 三阶段构建 apps/v4 (Next.js 16 文档站, lynn901 组件库)
#   deps    : 安装全 workspace 依赖 (含构建工具 bun)
#   builder : 构建 packages/shadcn -> registry 产物 -> next build (standalone)
#   runner  : 仅 .next/standalone + 静态资源, 非 root 运行
#
# 构建上下文为仓库根 (pnpm workspace 根), 因为 v4 的 build 依赖 packages/shadcn。

# ───────────────────────── deps ─────────────────────────
FROM node:20-bookworm-slim AS deps
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
# pnpm 通过 corepack 由 package.json 的 packageManager 字段锁定版本 (pnpm@10.33.4)
RUN corepack enable
# bun 仅用于跑 build-registry.mts (package.json 的 registry:build 写死 bun run)
RUN npm install -g bun@1 \
 && apt-get update && apt-get install -y --no-install-recommends ca-certificates \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# 先拷 lockfile 与 workspace 清单, 利用 pnpm 缓存层
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/v4/package.json ./apps/v4/
COPY packages/shadcn/package.json ./packages/shadcn/
COPY packages/react/package.json ./packages/react/
COPY packages/tests/package.json ./packages/tests/

# minimumReleaseAge=0: pnpm-workspace.yaml 默认要求包发布满 2 天,
# 会拒装 @ai-sdk/*-canary 等预发布版本, 构建期显式关闭以避免时间窗口抖动。
# --ignore-scripts: 跳过 postinstall。apps/v4 的 postinstall (fumadocs-mdx) 会
# 编译 source.config.ts, 但此阶段还没拷源码会失败; .source 缓存由 next build 时
# 的 createMDX 重新生成, builder 阶段会补跑 v4 postinstall。workspace 包的构建
# (tsup) 不在 postinstall 里, 由 build 阶段 pnpm build 触发。
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile \
      --ignore-scripts \
      --config.minimumReleaseAge=0 \
      --config.linkWorkspacePackages=true

# ───────────────────────── builder ─────────────────────────
FROM deps AS builder
WORKDIR /app

# 拷全部源码 (.dockerignore 已排除 node_modules/.next/.turbo 等)
COPY . .

# NEXT_PUBLIC_* 在构建期被内联进客户端 bundle, 运行时不可改。
# 默认 localhost 占位; 生产换域名通过 --build-arg 重建。
ARG NEXT_PUBLIC_APP_URL=http://localhost:4000
ARG NEXT_PUBLIC_V0_URL=https://v0.dev
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_V0_URL=$NEXT_PUBLIC_V0_URL
ENV NEXT_TELEMETRY_DISABLED=1

# 复刻 apps/v4/package.json 的 build: registry:build && next build
# registry:build = pnpm --filter=shadcn build (tsup) && bun run build-registry.mts
WORKDIR /app/apps/v4
# 补跑 v4 postinstall (fumadocs-mdx): install 阶段用 --ignore-scripts 跳过了,
# 此时源码已就位, 重跑生成 .source 目录供 next build 使用。
RUN pnpm exec fumadocs-mdx
RUN pnpm build

# ───────────────────────── runner ─────────────────────────
FROM node:20-bookworm-slim AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=4000
ENV HOSTNAME=0.0.0.0

WORKDIR /app

# 非 root 运行
RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs

# standalone 产物: server.js + 运行所需的最小 node_modules
COPY --from=builder --chown=nextjs:nodejs /app/apps/v4/.next/standalone ./
# 静态资源与 Next trace 未自动纳入的目录 (next.config 已声明 registry/styles)
COPY --from=builder --chown=nextjs:nodejs /app/apps/v4/.next/static ./apps/v4/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/v4/public ./apps/v4/public

USER nextjs

EXPOSE 4000
# standalone server.js 路径对应 monorepo 结构 (apps/v4 下构建, 根目录运行)
CMD ["node", "apps/v4/server.js"]
