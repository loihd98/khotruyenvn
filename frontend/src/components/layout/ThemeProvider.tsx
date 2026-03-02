"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { useEffect } from "react";
import { setTheme } from "@/store/slices/uiSlice";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.ui.theme);

  useEffect(() => {
    // One-time migration: if user never explicitly chose a theme, reset to dark default
    const userChoseTheme = localStorage.getItem("user_theme_choice");

    try {
      const persisted = localStorage.getItem("persist:ui");
      let resolvedTheme: "dark" | "light" = "dark";

      if (persisted && userChoseTheme) {
        // Only respect persisted theme if user explicitly toggled it
        const parsed = JSON.parse(persisted);
        if (parsed.theme) {
          resolvedTheme = JSON.parse(parsed.theme) as "dark" | "light";
        }
      }
      // else: no user choice → always dark

      dispatch(setTheme(resolvedTheme));
    } catch {
      dispatch(setTheme("dark"));
    }
  }, [dispatch]);

  useEffect(() => {
    // Apply theme class to <html> whenever Redux theme changes
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return <>{children}</>;
}
