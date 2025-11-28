"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import RichTextRenderer from "./RichTextRenderer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  description: string;
  image?: string;
  link?: string;
  linkTitle?: string;
  publishedAt?: string;
}

export default function AnnouncementsSection() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (announcements.length > 0 && !isPaused) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => {
          const maxIndex = Math.max(0, announcements.length - 2);
          return prev >= maxIndex ? 0 : prev + 1;
        });
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [announcements.length, isPaused]);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch("/api/public/announcements");
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  };

  if (announcements.length === 0) {
    return null;
  }

  const maxIndex = Math.max(0, announcements.length - 2);
  const visibleAnnouncements = announcements.slice(currentIndex, currentIndex + 2);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Duyurular</h2>
        <div className="max-w-6xl mx-auto">
          <div
            className="relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Slider Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {visibleAnnouncements.map((announcement) => (
                <Card key={announcement.id} className="flex flex-col h-[420px]">
                  {announcement.image && (
                    <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                      <Image
                        src={announcement.image}
                        alt={announcement.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                      />
                    </div>
                  )}
                  <CardHeader className="flex-shrink-0">
                    <CardTitle className="line-clamp-2">{announcement.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden flex flex-col min-h-0">
                    <div className="text-sm text-muted-foreground overflow-hidden line-clamp-4 [&_.prose]:line-clamp-4 [&_.prose_p]:mb-0 [&_.prose_ul]:mb-0 [&_.prose_ol]:mb-0 [&_.prose_li]:mb-0 [&_.prose_*]:line-clamp-4 [&_.prose]:overflow-hidden">
                      <RichTextRenderer content={announcement.description} />
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2 flex-shrink-0">
                    <Button asChild variant="outline" className="flex-1" size="sm">
                      <Link href={`/duyurular/${announcement.id}`}>
                        Detayları Gör
                      </Link>
                    </Button>
                    {announcement.link && (
                      <Button asChild variant="default" className="flex-1" size="sm">
                        <Link href={announcement.link} target="_blank" rel="noopener noreferrer">
                          {announcement.linkTitle || "Devamını Oku"}
                        </Link>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Navigation Arrows */}
            {announcements.length > 2 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 bg-white hover:bg-gray-100 shadow-lg rounded-full p-2 md:p-3 transition-all z-10"
                  aria-label="Önceki duyurular"
                >
                  <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 bg-white hover:bg-gray-100 shadow-lg rounded-full p-2 md:p-3 transition-all z-10"
                  aria-label="Sonraki duyurular"
                >
                  <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
                </button>
              </>
            )}

            {/* Dots Navigation */}
            {announcements.length > 2 && (
              <div className="flex justify-center mt-8 space-x-2">
                {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentIndex
                        ? "w-8 h-3 bg-primary-600"
                        : "w-3 h-3 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                    aria-label={`Slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
