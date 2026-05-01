"use client";
import React, { useEffect, useRef, useCallback, useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";

/* ─── Individual card ─── */
export interface ScrollStackItemProps {
  itemClassName?: string;
  children: ReactNode;
}

export const ScrollStackItem: React.FC<ScrollStackItemProps> = ({
  children,
  itemClassName = "",
}) => (
  <div
    className={`scroll-stack-card relative w-full rounded-2xl sm:rounded-[40px] shadow-[0_0_30px_rgba(0,0,0,0.12)] overflow-hidden origin-top ${itemClassName}`.trim()}
    style={{
      backfaceVisibility: "hidden",
      transformStyle: "preserve-3d",
    }}
  >
    {children}
  </div>
);

/* ─── Stack container ─── */
interface ScrollStackProps {
  className?: string;
  children: ReactNode;
  itemDistance?: number;
  itemScale?: number;
  itemStackDistance?: number;
  stackPosition?: string;
  scaleEndPosition?: string;
  baseScale?: number;
}

const MOBILE_QUERY = "(max-width: 639px)";

const ScrollStack: React.FC<ScrollStackProps> = ({
  children,
  className = "",
  itemDistance = 60,
  itemScale = 0.03,
  itemStackDistance = 22,
  stackPosition = "12%",
  scaleEndPosition = "8%",
  baseScale = 0.9,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLElement[]>([]);
  const offsetsRef = useRef<number[]>([]);
  const endOffsetRef = useRef<number>(0);
  const lastRef = useRef(new Map<number, { ty: number; s: number }>());
  const rafRef = useRef<number | null>(null);

  const pct = useCallback(
    (v: string | number, h: number) =>
      typeof v === "string" && v.includes("%")
        ? (parseFloat(v) / 100) * h
        : parseFloat(v as string),
    []
  );

  /* Measure each card's natural document position (without active transforms).
     Reading getBoundingClientRect AFTER a transform is applied returns the
     translated rect — that's what caused the scroll-down glitch. */
  const measure = useCallback(() => {
    const cards = cardsRef.current;
    if (!cards.length) return;

    cards.forEach((c) => {
      c.style.transform = "";
    });

    const sy = window.scrollY;
    offsetsRef.current = cards.map(
      (c) => c.getBoundingClientRect().top + sy
    );

    const endEl = wrapperRef.current?.querySelector(
      ".scroll-stack-end"
    ) as HTMLElement | null;
    endOffsetRef.current = endEl
      ? endEl.getBoundingClientRect().top + sy
      : Number.POSITIVE_INFINITY;

    lastRef.current.clear();
  }, []);

  const update = useCallback(() => {
    const cards = cardsRef.current;
    const offsets = offsetsRef.current;
    if (!cards.length || offsets.length !== cards.length) return;

    const scrollTop = window.scrollY;
    const vh = window.innerHeight;
    const stackPx = pct(stackPosition, vh);
    const scalePx = pct(scaleEndPosition, vh);
    const endTop = endOffsetRef.current;
    const pinEnd = endTop - vh * 0.6;

    cards.forEach((card, i) => {
      const cardTop = offsets[i];
      const triggerStart = cardTop - stackPx - itemStackDistance * i;
      const triggerEnd = cardTop - scalePx;
      const pinStart = triggerStart;

      const denom = triggerEnd - triggerStart || 1;
      const sp = Math.max(
        0,
        Math.min(1, (scrollTop - triggerStart) / denom)
      );
      const targetScale = baseScale + i * itemScale;
      const scale = 1 - sp * (1 - targetScale);

      let ty = 0;
      if (scrollTop >= pinStart && scrollTop <= pinEnd) {
        ty = scrollTop - cardTop + stackPx + itemStackDistance * i;
      } else if (scrollTop > pinEnd) {
        ty = pinEnd - cardTop + stackPx + itemStackDistance * i;
      }

      const rTy = Math.round(ty * 10) / 10;
      const rS = Math.round(scale * 1000) / 1000;
      const prev = lastRef.current.get(i);
      if (
        prev &&
        Math.abs(prev.ty - rTy) < 0.2 &&
        Math.abs(prev.s - rS) < 0.001
      )
        return;

      card.style.transform = `translate3d(0,${rTy}px,0) scale(${rS})`;
      lastRef.current.set(i, { ty: rTy, s: rS });
    });
  }, [
    baseScale,
    itemScale,
    itemStackDistance,
    pct,
    scaleEndPosition,
    stackPosition,
  ]);

  useEffect(() => {
    const inner = wrapperRef.current;
    if (!inner) return;

    const cards = Array.from(
      inner.querySelectorAll(".scroll-stack-card")
    ) as HTMLElement[];
    cardsRef.current = cards;

    cards.forEach((card, i) => {
      card.style.marginBottom =
        i < cards.length - 1 ? `${itemDistance}px` : "0px";
      card.style.willChange = "transform";
      card.style.transformOrigin = "top center";
    });

    const remeasureAndDraw = () => {
      measure();
      update();
    };

    remeasureAndDraw();

    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);
    };

    let resizeTimer: number | null = null;
    const onResize = () => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(remeasureAndDraw, 120);
    };

    /* Re-measure once images settle so cardTop matches final layout. */
    const imgs = Array.from(inner.querySelectorAll("img"));
    let pending = imgs.filter((img) => !img.complete).length;
    const onImgSettle = () => {
      pending -= 1;
      if (pending <= 0) remeasureAndDraw();
    };
    imgs.forEach((img) => {
      if (!img.complete) {
        img.addEventListener("load", onImgSettle, { once: true });
        img.addEventListener("error", onImgSettle, { once: true });
      }
    });

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        if (resizeTimer) window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(remeasureAndDraw, 120);
      });
      ro.observe(inner);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (resizeTimer) window.clearTimeout(resizeTimer);
      if (ro) ro.disconnect();
      lastRef.current.clear();
    };
  }, [itemDistance, measure, update]);

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`.trim()}>
      <div
        className="scroll-stack-inner pt-0 px-3 sm:px-6 md:px-20 pb-32 sm:pb-48 md:pb-64"
      >
        {children}
        <div className="scroll-stack-end w-full h-px" />
      </div>
    </div>
  );
};

export default ScrollStack;

/* ─── Pre-built image card ─── */
export function ScrollStackImageCard({
  src,
  title,
  subtitle,
  index,
}: {
  src: string;
  title: string;
  subtitle: string;
  index: number;
}) {
  return (
    <ScrollStackItem>
      <div className="relative w-full h-[55vh] sm:h-[65vh] md:h-[75vh]">
        <Image
          src={src}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 80vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 md:p-12 text-[#F9F9EA]">
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.4em] sm:tracking-[0.5em] opacity-70 block mb-2 sm:mb-3">
            {String(index + 1).padStart(2, "0")} · {subtitle}
          </span>
          <h3 className="text-2xl sm:text-4xl md:text-6xl font-[var(--font-playfair)] italic tracking-tight">
            {title}
          </h3>
        </div>
      </div>
    </ScrollStackItem>
  );
}
