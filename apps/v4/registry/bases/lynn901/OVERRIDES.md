# Overrides — 官方文件直接修改登记表

本表记录所有直接修改官方(upstream)文件的改动。同步上游时,
仅本表登记的文件需要人工审查冲突, 其余官方文件可放心接受上游版本。

建表时机: 创建 bases/lynn901/ 目录时即建立, 初始登记 BASES 追加。
之后每次新增 A 类修改时追加一行。

| 官方文件 | 改动类型 | 改动内容 | 为什么不能用 B/C | 登记日期 |
|---|---|---|---|---|
| apps/v4/registry/bases.ts | 追加 | BASES 数组追加 lynn901 条目 | 新 base 必须注册进中心化数组, wrapper/fork 无法替代 | 2026-06-29 |
| apps/v4/lib/fonts.ts | 改写 | 字体实例改为 Fraunces/Noto Serif SC/Inter | 字体加载是站点级配置, lynn901 命名空间无法承载 | 2026-06-30 |
| apps/v4/app/globals.css | 改写 | :root/.dark token 换为羊皮纸+陶土配色, @theme inline 注册新字体变量 | 全局 CSS 变量是站点级, 无法隔离 | 2026-06-30 |
| apps/v4/lib/config.ts | 改写 | siteConfig 换 lynn901 身份, navItems 精简为3项, META_THEME_COLORS 换品牌色 | 站点配置是站点级, 无法隔离 | 2026-06-30 |
| apps/v4/app/layout.tsx | 改写 | metadata 作者/creator/twitter 换 lynn901, lang=zh-CN | 根布局是站点级, 无法隔离 | 2026-06-30 |
| apps/v4/components/site-header.tsx | 改写 | 移除 V0Button/ProjectForm/New, 统一 button import | 顶栏是站点级 chrome, 无法隔离 | 2026-06-30 |
| apps/v4/components/main-nav.tsx | 改 | button import 改为 lynn901-nova | 同上 | 2026-06-30 |
| apps/v4/components/mobile-nav.tsx | 改写 | 裁剪 TOP_LEVEL_SECTIONS, 统一 button import | 同上 | 2026-06-30 |
| apps/v4/components/site-footer.tsx | 改 | twitter 链接改指向 github, builder 改为 lynn901 | siteConfig 移除 twitter 后 footer 引用需同步, 站点级 chrome | 2026-06-30 |
| apps/v4/app/(app)/(root)/page.tsx | 改写 | 首页重写为 hero+组件墙 | 首页是站点级, 无法隔离 | 2026-06-30 |
| apps/v4/app/(app)/(root)/cards/ | 删除 | 移除官方 dashboard 卡片墙 | 同上 | 2026-06-30 |
| apps/v4/app/(app)/about/page.tsx | 新建 | 关于页 | 新建文件, 非 A 类(但登记备查) | 2026-06-30 |
