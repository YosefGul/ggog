import { Metadata } from "next";

const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
const siteName = "GGOG - Genç Girişimciler ve Oyun Geliştiricileri Derneği";
const defaultDescription = "Genç Girişimciler ve Oyun Geliştiricileri Derneği - Oyun geliştirme ve girişimcilik alanında faaliyet gösteren dernek";

/**
 * Generate metadata for pages
 */
export function generateMetadata({
  title,
  description = defaultDescription,
  image,
  url,
  type = "website",
  publishedTime,
  modifiedTime,
}: {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "event";
  publishedTime?: string;
  modifiedTime?: string;
}): Metadata {
  const fullTitle = title.includes("GGOG") ? title : `${title} | GGOG`;
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const ogImage = image || `${siteUrl}/og-image.jpg`;

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      siteName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "tr_TR",
      type: type === "article" ? "article" : type === "event" ? "website" : "website",
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

/**
 * Get canonical URL
 */
export function getCanonicalUrl(path: string): string {
  const baseUrl = siteUrl.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}


