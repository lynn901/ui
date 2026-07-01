import { type Metadata } from "next"
import Link from "next/link"

import { Button } from "@/registry/new-york-v4/ui/button"

export const metadata: Metadata = {
  title: "关于",
  description: "关于 lynn901 个人组件库。",
}

export default function AboutPage() {
  return (
    <div className="container-wrapper flex-1">
      <div className="container max-w-2xl py-16">
        <p className="font-sans text-xs tracking-[0.25em] text-primary uppercase">
          关于
        </p>
        <h1 className="mt-3 font-heading text-4xl leading-tight font-medium">
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
