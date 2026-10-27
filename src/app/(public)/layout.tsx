import type { ReactNode } from "react";
import { PublicShell } from "@/components/PublicShell";

/**
 * The frame for every page anyone can open. It lives in a layout, not in each page, so it stays in place
 * when you move between these pages: then each page's PageTransition is the first thing that changes,
 * which is what React needs before it will play the transition (one placed after new HTML is skipped).
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return <PublicShell>{children}</PublicShell>;
}
