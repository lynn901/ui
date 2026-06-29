import { type Registry } from "shadcn/schema"

export const ui: Registry["items"] = [
  {
    name: "button",
    type: "registry:ui",
    files: [{ path: "ui/button.tsx", type: "registry:ui" }],
  },
]
