// Marketing-site contact actions. Scoped here so the cinematic /m/[slug]
// and the /studio dashboard stay clean — they live outside this route group.
// Native scrolling and the CSS cursor keep the same core UX without loading
// a permanent animation loop on every mobile visit.
import FloatingActions from "@/components/FloatingActions";
import { MediaProvider } from "@/components/MediaProvider";
import { getMediaMap } from "@/lib/media";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const mediaMap = await getMediaMap();

  return (
    <MediaProvider map={mediaMap}>
      {children}
      <FloatingActions />
    </MediaProvider>
  );
}
