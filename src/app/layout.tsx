import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_NAME, SITE_URL, organizationJsonLd, websiteJsonLd } from "@/lib/seo";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const viewport: Viewport = {
  themeColor: "#14361F",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "food",
  formatDetection: { telephone: true, email: true, address: true },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
  title: {
    default: "HS AgroFoods — Pure Spices & Dehydrated Veg & Fruit Powders",
    template: "%s | HS AgroFoods",
  },
  description:
    "HS AgroFoods (Hyderabad) brings India's finest cold-ground spices (Turmeric, Red Chilli, Coriander, Zeera, Shahi Garam Masala, Chaat Masala) and 100% natural dehydrated vegetable & fruit powders (Beetroot, Tomato, Raw Banana, Garlic, Carrot, Radish) straight to your kitchen.",
  keywords: [
    "HS AgroFoods",
    "HS Agro Foods Hyderabad",
    "pure Indian spices",
    "dehydrated vegetable powders",
    "dehydrated fruit powders",
    "beetroot powder",
    "tomato powder",
    "raw banana powder",
    "garlic powder",
    "carrot powder",
    "radish powder",
    "turmeric powder",
    "red chilli powder",
    "coriander powder",
    "zeera powder",
    "shahi garam masala",
    "chaat masala",
    "fruit chaat masala",
    "amchur mango powder",
  ],
  openGraph: {
    title: "HS AgroFoods — Pure Spices & Dehydrated Veg & Fruit Powders",
    description:
      "100% pure cold-ground Indian spices and natural low-temperature dehydrated fruit & vegetable powders. Zero artificial colors, zero preservatives.",
    siteName: "HS AgroFoods",
    locale: "en_IN",
    type: "website",
    url: SITE_URL,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "HS AgroFoods — Pure Spices & Dehydrated Veg & Fruit Powders" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "HS AgroFoods — Pure Spices & Dehydrated Veg & Fruit Powders",
    description:
      "100% pure cold-ground Indian spices and natural low-temperature dehydrated fruit & vegetable powders.",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: [
      { url: '/images/logo.png?v=2', type: 'image/png', sizes: 'any' },
    ],
    shortcut: ['/images/logo.png?v=2'],
    apple: [
      { url: '/images/logo.png?v=2', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" data-scroll-behavior="smooth" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col font-sans bg-[#FDF9F3] text-[#14361F] selection:bg-[#431D0D] selection:text-white"
      >
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        {children}
      </body>
    </html>
  );
}
