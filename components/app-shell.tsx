"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, BookOpen, GraduationCap, Puzzle } from "lucide-react"
import { cn } from "@/lib/utils"

const links = [
  { href: "/review", label: "Повторение", icon: GraduationCap },
  { href: "/articles", label: "Артикли", icon: Puzzle },
  { href: "/dictionary", label: "Словарь", icon: BookOpen },
  { href: "/statistics", label: "Статистика", icon: BarChart3 },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return <div className="min-h-svh overflow-x-clip bg-stone-50 text-stone-900">
    <header className="mx-auto flex h-20 max-w-5xl items-center justify-between px-5 sm:px-8">
      <Link href="/review" className="font-heading text-xl font-semibold tracking-tight">deutsch<span className="text-lime-700">cards</span></Link>
      <nav className="hidden shrink-0 items-center gap-1 rounded-full bg-white p-1 shadow-sm ring-1 ring-stone-200 md:flex">
        {links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={cn("flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition", pathname === href ? "bg-lime-300 text-stone-900" : "text-stone-500 hover:text-stone-950")}><Icon size={16}/>{label}</Link>)}
      </nav>
    </header>
    <main className="mx-auto min-h-[calc(100svh-5rem)] max-w-5xl px-5 pb-28 sm:px-8 md:pb-10">{children}</main>
    <nav className="fixed inset-x-4 bottom-4 z-20 flex h-16 items-stretch rounded-2xl bg-stone-900 p-1.5 text-stone-400 shadow-xl md:hidden">
      {links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={cn("flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[9px] font-medium leading-none", pathname === href && "bg-lime-300 text-stone-950")}><Icon size={18}/><span className="max-w-full truncate">{label}</span></Link>)}
    </nav>
  </div>
}
