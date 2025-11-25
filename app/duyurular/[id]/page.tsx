"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import RichTextRenderer from "@/components/RichTextRenderer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, ArrowLeft } from "lucide-react";
import AnimateOnScroll from "@/components/AnimateOnScroll";

interface Announcement {
  id: string;
  title: string;
  description: string;
  image?: string;
  link?: string;
  linkTitle?: string;
  publishedAt: string;
}

export default function AnnouncementDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchAnnouncement();
    }
  }, [id]);

  const fetchAnnouncement = async () => {
    try {
      const response = await fetch(`/api/public/announcements`);
      if (response.ok) {
        const data = await response.json();
        const found = data.find((a: Announcement) => a.id === id);
        setAnnouncement(found || null);
      }
    } catch (error) {
      console.error("Error fetching announcement:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Duyuru bulunamadı.
            </p>
            <div className="mt-4 text-center">
              <Button asChild variant="outline">
                <Link href="/duyurular">Duyurulara Dön</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto">
          <AnimateOnScroll>
            <div className="mb-6">
              <Button asChild variant="ghost">
                <Link href="/duyurular" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Duyurulara Dön
                </Link>
              </Button>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll delay={100}>
            <Card>
          {announcement.image && (
            <div className="relative h-96 w-full overflow-hidden rounded-t-lg">
              <img
                src={announcement.image}
                alt={announcement.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-3xl md:text-4xl">{announcement.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 text-base">
              <Calendar className="w-4 h-4" />
              {new Date(announcement.publishedAt).toLocaleDateString("tr-TR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Separator className="my-4" />
            <div className="prose prose-lg max-w-none">
              <RichTextRenderer content={announcement.description} />
            </div>
            {announcement.link && (
              <div className="mt-8">
                <Button asChild size="lg">
                  <Link href={announcement.link} target="_blank" rel="noopener noreferrer">
                    {announcement.linkTitle || "Devamını Oku"}
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
          </AnimateOnScroll>
        </div>
      </div>
    </div>
  );
}



