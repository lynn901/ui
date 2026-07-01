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
