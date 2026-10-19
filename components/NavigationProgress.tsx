"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Slim bar at the top of the screen from the moment an internal link is clicked
// until the new page's URL is in place.
export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const url = `${pathname}?${searchParams.toString()}`;
  // URL the user was on when they clicked; the bar runs while we're still on it
  const [startedOn, setStartedOn] = useState<string | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest("a");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      const next = new URL(link.href, window.location.href);
      if (next.origin !== window.location.origin) return;
      if (next.pathname === window.location.pathname && next.search === window.location.search) return;

      setStartedOn(`${window.location.pathname}?${window.location.search.replace(/^\?/, "")}`);
      // Give up quietly if the navigation never completes (cancelled, offline…)
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = setTimeout(() => setStartedOn(null), 15000);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  if (startedOn === null) return null;
  return <div className="nav-progress" data-state={startedOn === url ? "loading" : "done"} role="progressbar" aria-label="Loading page" />;
}
