"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin } from "lucide-react";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { SkeletonList } from "@/components/ui/skeleton-card";
import { Skeleton } from "@/components/ui/skeleton";
import Breadcrumb, { BreadcrumbItem } from "@/components/ui/breadcrumb";

interface Category {
  id: string;
  name: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  eventDate?: string;
  location?: string;
  eventType?: string;
  acceptsApplications: boolean;
  isPastEvent: boolean;
  category?: Category;
  images: Array<{ imageUrl: string }>;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [filter, setFilter] = useState<"all" | "accepting" | "past">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchEvents();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/public/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/public/events");
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((event) => {
    if (selectedCategory !== "all" && event.category?.id !== selectedCategory) {
      return false;
    }
    if (filter === "accepting") return event.acceptsApplications && !event.isPastEvent;
    if (filter === "past") return event.isPastEvent;
    return true;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <SkeletonList count={6} />
        </div>
      </div>
    );
  }

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Etkinlikler", href: "/etkinlikler" },
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-7xl mx-auto">
        <Breadcrumb items={breadcrumbItems} className="mb-8" />
        <AnimateOnScroll>
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Etkinliklerimiz</h1>
            <p className="text-muted-foreground text-lg">
              Oyun geliştirme dünyasından etkinlikler ve workshop'lar
            </p>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll delay={100}>
          <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-center">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Kategori Seç" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <TabsList>
                <TabsTrigger value="all">Tümü</TabsTrigger>
                <TabsTrigger value="accepting">Başvuru Alıyor</TabsTrigger>
                <TabsTrigger value="past">Geçmiş</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll delay={200}>
          {filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Bu kriterlere uygun etkinlik bulunamadı.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event, index) => (
                <AnimateOnScroll key={event.id} delay={300 + index * 50}>
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group">
                    {event.images.length > 0 && (
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={event.images[0].imageUrl}
                          alt={event.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        {event.acceptsApplications && !event.isPastEvent && (
                          <Badge className="absolute top-4 right-4 bg-green-500">
                            Başvuru Açık
                          </Badge>
                        )}
                        {event.isPastEvent && (
                          <Badge variant="secondary" className="absolute top-4 right-4">
                            Geçmiş Etkinlik
                          </Badge>
                        )}
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                        {event.category && (
                          <Badge variant="outline">{event.category.name}</Badge>
                        )}
                      </div>
                      {event.eventDate && (
                        <CardDescription className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(event.eventDate).toLocaleDateString("tr-TR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </CardDescription>
                      )}
                      {event.location && (
                        <CardDescription className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div
                        className="text-muted-foreground line-clamp-3 text-sm"
                        dangerouslySetInnerHTML={{
                          __html: event.description.substring(0, 150) + "...",
                        }}
                      />
                    </CardContent>
                    <CardFooter>
                      <Button
                        asChild
                        className="w-full"
                        variant={event.acceptsApplications && !event.isPastEvent ? "default" : "outline"}
                      >
                        <Link href={`/etkinlikler/${event.id}`}>
                          {event.acceptsApplications && !event.isPastEvent
                            ? "Başvur"
                            : "Detaylar"}
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </AnimateOnScroll>
              ))}
            </div>
          )}
        </AnimateOnScroll>
      </div>
    </div>
  );
}
