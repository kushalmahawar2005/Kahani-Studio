// Marketing-site chrome (smooth scroll, custom cursor, floating
// contact actions). Scoped here so the cinematic /m/[slug] and the /studio
// dashboard stay clean — they live outside this route group.
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/CustomCursor";
import ScrollProgress from "@/components/ScrollProgress";
import FloatingActions from "@/components/FloatingActions";
import { MediaProvider } from "@/components/MediaProvider";
import { getMediaMap } from "@/lib/media";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const mediaMap = await getMediaMap();

  return (
    <MediaProvider map={mediaMap}>
      <SmoothScroll />
      <ScrollProgress />
      <CustomCursor />
      {children}
      <FloatingActions />
    </MediaProvider>
  );
}
