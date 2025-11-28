"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface Event {
  id: string;
  title: string;
  description: string;
  eventDate?: string;
  location?: string;
  acceptsApplications: boolean;
  isPastEvent: boolean;
  images: Array<{ imageUrl: string }>;
}

export default function EventsSection() {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/public/events?showOnHomepage=true&limit=3");
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  if (events.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Etkinliklerimiz</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden hover:shadow-xl transition-shadow">
              {event.images.length > 0 && (
                <div className="relative h-48">
                  <Image
                    src={event.images[0].imageUrl}
                    alt={event.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle>{event.title}</CardTitle>
                {event.eventDate && (
                  <CardDescription>
                    {new Date(event.eventDate).toLocaleDateString("tr-TR")}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div
                  className="text-muted-foreground mb-4 line-clamp-3"
                  dangerouslySetInnerHTML={{
                    __html: event.description.substring(0, 150) + "...",
                  }}
                />
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/etkinlikler/${event.id}`}>Detaylar</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button asChild variant="outline" size="lg">
            <Link href="/etkinlikler">Tüm Etkinlikleri Gör</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
