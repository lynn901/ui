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
