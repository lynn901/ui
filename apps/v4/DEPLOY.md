# 部署 lynn901 v4 文档站 (Podman)

本目录的 `apps/v4` 是 Next.js 16 文档站 (lynn901 组件库主站), 监听 4000 端口。
容器化文件在**仓库根**:

- `Containerfile` — 三阶段构建 (deps → builder → runner), 产出 standalone 精简镜像
- `compose.yml` — Podman Compose 编排
- `.dockerignore` — 排除本地构建产物与 env

## 前置

- podman 5.x (本机已装 5.8.2, 含 `podman compose` 子命令)
- Podman Desktop (本机已装, 本地 podman machine 已连接)

## 构建 & 启动

```bash
# 在仓库根执行
podman compose up -d --build
```

首次构建约 5–10 分钟 (pnpm install + shadcn tsup + registry 生成 + next build)。
后续构建命中 pnpm 缓存层会快很多。

访问: http://localhost:4000

## 常用命令

```bash
podman compose logs -f          # 跟踪日志
podman compose ps               # 查看状态
podman compose restart v4       # 重启
podman compose down             # 停止并移除容器 (保留镜像)
podman compose down --rmi local # 同时删除本地构建的镜像
```

Podman Desktop 里: 启动后在 **Containers / Compositions** 可直接看到 `compose.yml`
对应的服务, 可点按启停、查看日志、进入终端。

## 更换域名 (生产)

`NEXT_PUBLIC_APP_URL` 会被烘焙进客户端 bundle (OG 图、v0 跳转、绝对 URL),
**运行时改不了**, 必须重建镜像:

```bash
podman compose up -d --build \
  --build-arg NEXT_PUBLIC_APP_URL=https://你的域名
```

或直接编辑 `compose.yml` 里 `build.args.NEXT_PUBLIC_APP_URL` 后 `--build`。

## 镜像结构说明

| 阶段 | 基础镜像 | 作用 |
|------|---------|------|
| deps | node:20-bookworm-slim | corepack 装 pnpm + 装 bun + 全 workspace 依赖 |
| builder | (=deps) | `pnpm build` = shadcn tsup → `bun run build-registry.mts` → `next build` |
| runner | node:20-bookworm-slim | 仅 `.next/standalone` + 静态资源, 非 root (nextjs:1001) |

运行镜像不含 node_modules, 实测约 1.3 GB (含 Next trace 进镜像的 registry/styles
产物与 node 运行时; 若需更小可改用 node:20-alpine 并按需裁剪)。

## 已知约束

- **deps 阶段用 `--ignore-scripts`**:`apps/v4` 的 postinstall (`fumadocs-mdx`) 会
  编译 `source.config.ts`, 但 deps 阶段还没拷源码会失败。故 install 跳过所有脚本,
  builder 阶段拷源码后用 `pnpm exec fumadocs-mdx` 补跑生成 `.source`。
- `pnpm-workspace.yaml` 的 `minimumReleaseAge: 2880` 会被构建期用
  `--config.minimumReleaseAge=0` 显式关闭, 避免拒装 `@ai-sdk/*-canary`。
- **compose 不设 `image:`**:podman-compose 见 `image:` 会先尝试 pull (WSL2 下 Docker
  Hub 超时浪费 30s)。去掉后 build 产物自动命名为 `localhost/ui_v4:latest`
  (目录名_服务名)。
- 运行时无服务端密钥需求 (7 个 API 路由均为静态内容/search/rss/llm 文本,
  不调 AI SDK)。将来若新增需要密钥的 API, 在 `compose.yml` 的
  `environment` 注入, 优先用 Podman Desktop secrets 而非明文。
- 无持久卷: v4 是纯内容站, 运行时不写需保留的数据。

## 实测验证 (2026-07-01)

- 镜像构建成功: `localhost/lynn901-v4:test` / `localhost/ui_v4:latest`, 约 1.3 GB。
- 容器 `lynn901-v4` healthcheck 通过 (`Up (healthy)`)。
- 路由验证: `/` → 200 (title "安静地构建,基于 Base UI。 - lynn901/ui"),
  `/docs` → 200, `/r/styles/new-york-v4/button.json` → 200。
- 基础镜像 `node:20-bookworm-slim` 需本地 `podman pull` (WSL2 直连 Docker Hub 超时,
  开代理后可拉)。
