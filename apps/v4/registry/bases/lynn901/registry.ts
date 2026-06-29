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
