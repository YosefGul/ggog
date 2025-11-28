/**
 * Structured Data (JSON-LD) generators for SEO
 */

export interface OrganizationSchema {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  contactPoint?: {
    telephone?: string;
    contactType?: string;
    email?: string;
  };
  sameAs?: string[];
}

export interface EventSchema {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  location?: {
    name?: string;
    address?: string;
  };
  image?: string;
  organizer?: {
    name: string;
    url: string;
  };
  url: string;
}

export interface ArticleSchema {
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author?: {
    name: string;
    url?: string;
  };
  publisher: {
    name: string;
    logo?: string;
  };
  url: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema(data: OrganizationSchema): object {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: data.name,
    url: data.url,
    ...(data.logo && { logo: data.logo }),
    ...(data.description && { description: data.description }),
    ...(data.contactPoint && {
      contactPoint: {
        "@type": "ContactPoint",
        ...data.contactPoint,
      },
    }),
    ...(data.sameAs && { sameAs: data.sameAs }),
  };
}

/**
 * Generate Event schema
 */
export function generateEventSchema(data: EventSchema): object {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: data.name,
    description: data.description,
    startDate: data.startDate,
    ...(data.endDate && { endDate: data.endDate }),
    ...(data.location && {
      location: {
        "@type": "Place",
        ...(data.location.name && { name: data.location.name }),
        ...(data.location.address && { address: data.location.address }),
      },
    }),
    ...(data.image && { image: data.image }),
    ...(data.organizer && {
      organizer: {
        "@type": "Organization",
        name: data.organizer.name,
        url: data.organizer.url,
      },
    }),
    url: data.url,
  };
}

/**
 * Generate Article schema
 */
export function generateArticleSchema(data: ArticleSchema): object {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: data.headline,
    description: data.description,
    ...(data.image && { image: data.image }),
    datePublished: data.datePublished,
    ...(data.dateModified && { dateModified: data.dateModified }),
    ...(data.author && {
      author: {
        "@type": "Person",
        name: data.author.name,
        ...(data.author.url && { url: data.author.url }),
      },
    }),
    publisher: {
      "@type": "Organization",
      name: data.publisher.name,
      ...(data.publisher.logo && { logo: data.publisher.logo }),
    },
    url: data.url,
  };
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate FAQ schema
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}


