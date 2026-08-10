"use client";
import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import Reveal from "./Reveal";
import VideoLightbox from "./VideoLightbox";
import { useMediaMap, resolveMedia } from "@/components/MediaProvider";

const INSTAGRAM =
  "https://www.instagram.com/kahani_click?utm_source=qr&igsh=MmY0eG51NHppbmZj";

type Reel = {
  id: string;
  title: string;
  tag: string;
  src: string;
  poster: string;
};

/* Portrait reels — video plays on hover (desktop) or in-view (touch). */
const REELS: Reel[] = [
  { id: "vows", title: "Eternal Vows", tag: "Wedding Film", src: "s1.mp4", poster: "1000407545.jpg" },
  { id: "rituals", title: "Sacred Rituals", tag: "Ceremony", src: "r2.mp4", poster: "CA9A1703.JPG" },
  { id: "joy", title: "Candid Joy", tag: "Highlights", src: "s2.mp4", poster: "1000928369.jpg" },
  { id: "golden", title: "Golden Hour", tag: "Pre-Wedding", src: "s2.mp4", poster: "CA9A3856.JPG" },
  { id: "embrace", title: "The Embrace", tag: "Teaser", src: "r1.mp4", poster: "1000407549.jpg" },
];

export default function Reels() {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const media = useMediaMap();
  const resolvedReels = REELS.map((r) => ({
    ...r,
    src: resolveMedia(media, r.src),
    poster: resolveMedia(media, r.poster),
  }));

  return (
    <section id="reels" className="py-20 md:py-32 bg-[#F9F9EA] border-y border-charcoal/5">
      <div className="mx-auto max-w-[1800px] px-6 md:px-12">
        <Reveal>
          <div className="flex flex-col md:flex-row items-baseline justify-between mb-10 md:mb-16 gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-400">
                The Reels
              </span>
              <h3 className="mt-3 text-4xl sm:text-5xl md:text-6xl font-display tracking-tight italic">
                Moments in motion.
              </h3>
            </div>
            <a
              href={INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500 hover:text-charcoal hover:italic transition-all"
              data-cursor="link"
            >
              Watch on Instagram ↗
            </a>
          </div>
        </Reveal>
      </div>

      {/* Horizontal scroller with soft edge fades */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-6 md:w-16 bg-gradient-to-r from-[#F9F9EA] to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-6 md:w-16 bg-gradient-to-l from-[#F9F9EA] to-transparent z-10" />

        <div className="flex gap-3 md:gap-5 overflow-x-auto snap-x snap-mandatory px-6 md:px-12 pb-4 no-scrollbar">
          {resolvedReels.map((reel, i) => (
            <ReelCard
              key={reel.id}
              reel={reel}
              index={i}
              onOpen={() => setPreviewIndex(i)}
            />
          ))}
        </div>
      </div>

      <VideoLightbox
        items={resolvedReels.map((r) => ({ src: r.src, title: r.title, tag: r.tag, poster: r.poster }))}
        index={previewIndex}
        onClose={() => setPreviewIndex(null)}
        onNav={(n) => setPreviewIndex(n)}
      />
    </section>
  );
}

function ReelCard({
  reel,
  index,
  onOpen,
}: {
  reel: Reel;
  index: number;
  onOpen: () => void;
}) {
  const wrapRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canHover = useRef(false);
  /* Pause off-screen videos to save resources; resume when in view. */
  const inView = useInView(wrapRef, { amount: 0.2 });

  useEffect(() => {
    canHover.current = window.matchMedia("(hover: hover)").matches;
  }, []);

  /* All videos autoplay (muted) whenever they're on screen. */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (inView) v.play().catch(() => {});
    else v.pause();
  }, [inView]);

  /* Sound on only while hovering (desktop). */
  const soundOn = () => {
    const v = videoRef.current;
    if (!v || !canHover.current) return;
    v.muted = false;
    v.play().catch(() => {});
  };
  const soundOff = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
  };

  return (
    <button
      type="button"
      ref={wrapRef}
      onClick={onOpen}
      data-cursor="view"
      onMouseEnter={soundOn}
      onMouseLeave={soundOff}
      style={{ animationDelay: `${index * 60}ms` }}
      className="group relative shrink-0 snap-center w-[68vw] sm:w-[300px] md:w-[340px] aspect-[9/16] overflow-hidden rounded-2xl bg-zinc-200 border border-charcoal/10 text-left"
    >
      <video
        ref={videoRef}
        src={reel.src}
        poster={reel.poster}
        loop
        muted
        autoPlay
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
      />

      {/* Gradient + label */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

      {/* Sound affordance — muted icon by default, hides on hover (sound on) */}
      <div className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm border border-white/30 text-cream opacity-90 group-hover:opacity-0 transition-opacity duration-300">
        <span className="text-sm">🔇</span>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 text-cream">
        <span className="text-[9px] font-bold uppercase tracking-[0.4em] opacity-80">
          {reel.tag}
        </span>
        <h4 className="mt-1 text-2xl md:text-3xl font-display italic">
          {reel.title}
        </h4>
      </div>
    </button>
  );
}
