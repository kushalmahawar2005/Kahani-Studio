// Marketing-site chrome (smooth scroll, custom cursor, intro loader, floating
// contact actions). Scoped here so the cinematic /m/[slug] and the /studio
// dashboard stay clean — they live outside this route group.
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/CustomCursor";
import ScrollProgress from "@/components/ScrollProgress";
import IntroLoader from "@/components/IntroLoader";
import FloatingActions from "@/components/FloatingActions";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <IntroLoader />
      <SmoothScroll />
      <ScrollProgress />
      <CustomCursor />
      {children}
      <FloatingActions />
    </>
  );
}
