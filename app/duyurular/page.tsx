"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import RichTextRenderer from "@/components/RichTextRenderer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { SkeletonList } from "@/components/ui/skeleton-card";
import { Skeleton } from "@/components/ui/skeleton";
import Breadcrumb, { BreadcrumbItem } from "@/components/ui/breadcrumb";

interface Announcement {
  id: string;
  title: string;
  description: string;
  image?: string;
  link?: string;
  linkTitle?: string;
  publishedAt: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch("/api/public/announcements");
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-10 w-48 mb-4" />
            <Skeleton className="h-6 w-96" />
          </div>
          <SkeletonList count={6} />
        </div>
      </div>
    );
  }

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Duyurular", href: "/duyurular" },
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-7xl mx-auto">
        <Breadcrumb items={breadcrumbItems} className="mb-8" />
        <AnimateOnScroll>
          <h1 className="text-4xl font-bold mb-4">Duyurular</h1>
          <p className="text-muted-foreground mb-8">
            Tüm duyurularımızı buradan takip edebilirsiniz.
          </p>
        </AnimateOnScroll>

        <AnimateOnScroll delay={100}>
        {announcements.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Henüz duyuru bulunmamaktadır.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements.map((announcement) => (
              <Card key={announcement.id} className="flex flex-col hover:shadow-lg transition-shadow">
                {announcement.image && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={announcement.image}
                      alt={announcement.title}
                      fill
                      className="object-cover rounded-t-lg"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="line-clamp-2">{announcement.title}</CardTitle>
                  <CardDescription>
                    {new Date(announcement.publishedAt).toLocaleDateString("tr-TR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="line-clamp-4">
                    <RichTextRenderer content={announcement.description} />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/duyurular/${announcement.id}`}>
                      Detayları Gör
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        </AnimateOnScroll>
      </div>
    </div>
  );
}

