import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Deutschcards",
    short_name: "Deutschcards",
    description: "Личный тренажёр немецких слов",
    start_url: "/review",
    display: "standalone",
    background_color: "#fafaf9",
    theme_color: "#bef264",
    lang: "ru",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  }
}
