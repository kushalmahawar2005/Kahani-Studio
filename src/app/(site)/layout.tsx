// Marketing-site chrome (smooth scroll, custom cursor, intro loader, floating
// contact actions). Scoped here so the cinematic /m/[slug] and the /studio
// dashboard stay clean — they live outside this route group.
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/CustomCursor";
import ScrollProgress from "@/components/ScrollProgress";
import IntroLoader from "@/components/IntroLoader";
import FloatingActions from "@/components/FloatingActions";
import { MediaProvider } from "@/components/MediaProvider";
import { getMediaMap } from "@/lib/media";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const mediaMap = await getMediaMap();

  return (
    <MediaProvider map={mediaMap}>
      <IntroLoader />
      <SmoothScroll />
      <ScrollProgress />
      <CustomCursor />
      {children}
      <FloatingActions />
    </MediaProvider>
  );
}
