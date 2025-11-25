"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DynamicApplicationForm from "@/components/DynamicApplicationForm";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, MapPin, Users, Clock } from "lucide-react";

interface Event {
  id: string;
  title: string;
  eventDate?: string;
  location?: string;
  participantLimit?: number;
  applicationDeadline?: string;
  acceptsApplications: boolean;
  isPastEvent: boolean;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
  };
}

export default function EventApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/public/events/${id}`);
      if (response.ok) {
        const data = await response.json();
        setEvent(data);
      } else {
        router.push(`/etkinlikler/${id}`);
      }
    } catch (error) {
      console.error("Error fetching event:", error);
      router.push(`/etkinlikler/${id}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Etkinlik Bulunamadı</h1>
            <p className="text-muted-foreground mb-6">
              Aradığınız etkinlik bulunamadı.
            </p>
            <Button asChild>
              <Link href="/etkinlikler">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Etkinliklere Dön
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canApply =
    event.acceptsApplications &&
    !event.isPastEvent &&
    (!event.applicationDeadline ||
      new Date(event.applicationDeadline) > new Date());

  if (!canApply) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Badge variant="destructive" className="mb-4">
              Başvuru Kapalı
            </Badge>
            <h1 className="text-2xl font-bold mb-4">{event.title}</h1>
            <p className="text-muted-foreground mb-6">
              Bu etkinlik için başvuru kabul edilmemektedir veya başvuru tarihi geçmiştir.
            </p>
            <Button asChild>
              <Link href={`/etkinlikler/${id}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Etkinlik Detayına Dön
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isDeadlinePassed =
    event.applicationDeadline &&
    new Date(event.applicationDeadline) < new Date();

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto">
          {/* Header */}
          <AnimateOnScroll>
            <div className="mb-6 md:mb-8">
            <Button
              asChild
              variant="ghost"
              className="mb-4"
            >
              <Link href={`/etkinlikler/${id}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Etkinlik Detayına Dön
              </Link>
            </Button>

            <div className="flex flex-wrap items-center gap-2 mb-4">
              {event.category && (
                <Badge variant="secondary" className="text-sm font-medium px-3 py-1">
                  {event.category.name}
                </Badge>
              )}
              <Badge className="bg-green-500 hover:bg-green-600 text-white">
                Başvuru Açık
              </Badge>
            </div>

            <h1 className="text-2xl md:text-4xl font-bold mb-2">
              {event.title}
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Etkinliğe katılmak için formu doldurun
            </p>
            </div>
          </AnimateOnScroll>

          {/* Event Info Card */}
          <AnimateOnScroll delay={100}>
            <Card className="mb-6 md:mb-8">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Etkinlik Bilgileri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {event.eventDate && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs md:text-sm font-medium text-muted-foreground">Etkinlik Tarihi</p>
                      <p className="text-sm md:text-base font-semibold">
                        {new Date(event.eventDate).toLocaleDateString("tr-TR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {event.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs md:text-sm font-medium text-muted-foreground">Lokasyon</p>
                      <p className="text-sm md:text-base font-semibold">{event.location}</p>
                    </div>
                  </div>
                )}

                {event.participantLimit && (
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs md:text-sm font-medium text-muted-foreground">Katılımcı Sınırı</p>
                      <p className="text-sm md:text-base font-semibold">{event.participantLimit} Kişi</p>
                    </div>
                  </div>
                )}

                {event.applicationDeadline && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs md:text-sm font-medium text-muted-foreground">Son Başvuru Tarihi</p>
                      <p className={`text-sm md:text-base font-semibold ${isDeadlinePassed ? "text-destructive" : ""}`}>
                        {new Date(event.applicationDeadline).toLocaleDateString("tr-TR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      {isDeadlinePassed && (
                        <p className="text-xs text-destructive mt-1">Başvuru tarihi geçmiş</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          </AnimateOnScroll>

          {/* Application Form */}
          <AnimateOnScroll delay={200}>
            <Card className="border-2 border-primary-200 shadow-lg">
            <CardHeader className="bg-primary-50">
              <CardTitle className="text-primary-900 text-lg md:text-xl">Başvuru Formu</CardTitle>
              <CardDescription className="text-sm md:text-base">
                Lütfen tüm zorunlu alanları doldurun
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <DynamicApplicationForm eventId={event.id} categoryId={event.categoryId} />
            </CardContent>
          </Card>
          </AnimateOnScroll>
          </div>
        </div>
      </div>
    </div>
  );
}

