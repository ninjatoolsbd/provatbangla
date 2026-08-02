import { Link } from "@tanstack/react-router";
import { Pause, Play, Radio } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { articles } from "@/lib/news-data";
import type { Article } from "@/lib/news-data";
import { cn } from "@/lib/utils";

const SPEED = 55; // px per second
const REFRESH_MS = 7000;
const VISIBLE = 10;

export function BreakingTicker() {
  const pool = articles;
  const [items, setItems] = useState<Article[]>(() => pool.slice(0, VISIBLE));
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [pulse, setPulse] = useState(false);
  const cursor = useRef(VISIBLE);

  const trackRef = useRef<HTMLDivElement>(null);
  const offset = useRef(0);
  const halfWidth = useRef(0);
  const running = useRef(true);

  running.current = !paused && !hovered;

  // measure one copy width so the loop wraps seamlessly
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      halfWidth.current = track.scrollWidth / 2;
      if (halfWidth.current > 0) offset.current %= halfWidth.current;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    return () => ro.disconnect();
  }, [items]);

  // rAF loop — pausing simply stops advancing, so it resumes exactly where it stopped
  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (running.current && halfWidth.current > 0) {
        offset.current = (offset.current + SPEED * dt) % halfWidth.current;
      }
      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${-offset.current}px,0,0)`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  // live headline feed: a fresh headline arrives at the front every few seconds
  useEffect(() => {
    const id = setInterval(() => {
      if (!running.current) return;
      const next = pool[cursor.current % pool.length];
      cursor.current += 1;
      setItems((prev) => {
        if (prev[0]?.id === next.id) return prev;
        return [next, ...prev.filter((a) => a.id !== next.id)].slice(0, VISIBLE);
      });
      setPulse(true);
      setTimeout(() => setPulse(false), 1200);
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, [pool]);

  const loop = [...items, ...items];

  return (
    <div className="border-b border-border bg-secondary">
      <div className="mx-auto flex max-w-[1240px] items-center gap-3 px-4 py-2">
        <span className="flex shrink-0 items-center gap-1.5 bg-primary px-2 py-1 text-xs font-bold text-primary-foreground">
          <Radio className={cn("size-3.5", pulse && "animate-pulse")} />
          সর্বশেষ
        </span>

        <div
          className="marquee-mask relative flex-1 overflow-hidden"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div
            ref={trackRef}
            className="flex gap-8 whitespace-nowrap will-change-transform"
            aria-live="off"
          >
            {loop.map((a, i) => (
              <Link
                key={`${a.id}-${i}`}
                to="/news/$id"
                params={{ id: String(a.id) }}
                className={cn(
                  "text-sm font-semibold transition-colors hover:text-primary",
                  i % items.length === 0 && pulse && "text-primary",
                )}
              >
                {a.title}
              </Link>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setPaused((v) => !v)}
          aria-label={paused ? "টিকার চালু করুন" : "টিকার থামান"}
          aria-pressed={paused}
          className="shrink-0 rounded-full border border-border bg-background p-1.5 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          {paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
        </button>
      </div>
    </div>
  );
}
