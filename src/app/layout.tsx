import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const SITE_URL = "https://kahaniclicks.store";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "Kahani Clicks | Wedding Photography & Cinematography in Rajasthan",
    template: "%s | Kahani Clicks",
  },
  description:
    "Award-winning wedding photographers & cinematographers in Rajasthan. Editorial wedding films, pre-wedding shoots, candid photography & destination weddings across India. Book your story today.",
  keywords: [
    "wedding photography Rajasthan",
    "wedding photographer Rajasthan",
    "wedding cinematography",
    "destination wedding photographer India",
    "pre-wedding shoot Rajasthan",
    "candid wedding photography",
    "wedding films",
    "best wedding photographer",
    "Jaipur wedding photographer",
    "Udaipur wedding photography",
    "Kahani Clicks",
  ],
  authors: [{ name: "Kahani Clicks" }],
  creator: "Kahani Clicks",
  publisher: "Kahani Clicks",
  category: "Wedding Photography",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Kahani Clicks | Wedding Photography & Cinematography in Rajasthan",
    description:
      "Award-winning wedding photographers & cinematographers in Rajasthan. Editorial wedding films, pre-wedding shoots & destination weddings across India.",
    url: SITE_URL,
    siteName: "Kahani Clicks",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kahani Clicks | Wedding Photography in Rajasthan",
    description:
      "Award-winning wedding photographers & cinematographers in Rajasthan. Editorial wedding films & candid photography across India.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

/* Structured data — helps Google show the studio as a rich result for
   wedding-related searches (LocalBusiness / Photographer). */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "ProfessionalService"],
  "@id": `${SITE_URL}/#business`,
  name: "Kahani Clicks",
  description:
    "Editorial wedding photography and cinematography studio based in Rajasthan, serving destination weddings across India.",
  url: SITE_URL,
  image: `${SITE_URL}/opengraph-image.jpg`,
  logo: `${SITE_URL}/logo_new.png`,
  telephone: "+91-96102-40176",
  priceRange: "₹₹₹",
  areaServed: { "@type": "Country", name: "India" },
  address: {
    "@type": "PostalAddress",
    addressRegion: "Rajasthan",
    addressCountry: "IN",
  },
  sameAs: [
    "https://www.instagram.com/kahani_click",
  ],
  makesOffer: [
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Wedding Photography" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Wedding Cinematography" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Pre-Wedding Shoots" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Destination Weddings" } },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-[#F9F9EA] text-[#1a1a1a] selection:bg-[#1a1a1a] selection:text-white"
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
