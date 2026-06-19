import { useEffect, useState } from "react";

export const THEMES = [
  { id: "classic", name: "Classic" },
  { id: "dark", name: "Dark" },
  { id: "hotdog", name: "Hotdog Stand" },
  { id: "ocean", name: "Ocean" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

const STORAGE_KEY = "outfit98-theme";

function applyTheme(theme: ThemeId) {
  const el = document.documentElement;
  if (theme === "classic") {
    el.removeAttribute("data-theme");
  } else {
    el.setAttribute("data-theme", theme);
  }
}

/** Persisted theme switcher. Applies `data-theme` on <html>; CSS vars do the rest. */
export function useTheme(): [ThemeId, (theme: ThemeId) => void] {
  const [theme, setTheme] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
      if (saved && THEMES.some((t) => t.id === saved)) return saved;
    } catch {
      /* ignore */
    }
    return "classic";
  });

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  return [theme, setTheme];
}
