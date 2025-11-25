"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import RichTextRenderer from "@/components/RichTextRenderer";
import ImageSlider from "@/components/ImageSlider";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Clock, FileText, ExternalLink, ArrowLeft } from "lucide-react";

interface EventImage {
  id: string;
  imageUrl: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  eventDate?: string;
  location?: string;
  eventType?: string;
  participantLimit?: number;
  applicationDeadline?: string;
  acceptsApplications: boolean;
  isPastEvent: boolean;
  driveLink?: string;
  details?: string;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
  };
  images: EventImage[];
}

export default function EventDetailPage() {
  const params = useParams();
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
        const errorData = await response.json().catch(() => ({}));
        console.error("Error fetching event:", errorData.error || "Etkinlik bulunamadı");
      }
    } catch (error) {
      console.error("Error fetching event:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="p-12">
            <CardContent>
              <h1 className="text-2xl font-bold mb-4">Etkinlik Bulunamadı</h1>
              <p className="text-muted-foreground mb-6">
                Aradığınız etkinlik bulunamadı veya kaldırılmış olabilir.
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
      </div>
    );
  }

  const canApply =
    event.acceptsApplications &&
    !event.isPastEvent &&
    (!event.applicationDeadline ||
      new Date(event.applicationDeadline) > new Date());

  const isDeadlinePassed =
    event.applicationDeadline &&
    new Date(event.applicationDeadline) < new Date();

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="max-w-7xl mx-auto">
            <Button
              asChild
              variant="ghost"
              className="mb-4 md:mb-6"
            >
              <Link href="/etkinlikler">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Etkinliklere Dön
              </Link>
            </Button>

            <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4">
              {event.category && (
                <Badge variant="secondary" className="text-sm px-3 py-1 font-medium">
                  {event.category.name}
                </Badge>
              )}
              {event.isPastEvent ? (
                <Badge variant="outline" className="px-3 py-1">
                  Geçmiş Etkinlik
                </Badge>
              ) : canApply ? (
                <Badge className="bg-green-500 hover:bg-green-600 text-white px-3 py-1">
                  Başvuru Açık
                </Badge>
              ) : (
                <Badge variant="outline" className="px-3 py-1">
                  Başvuru Kapalı
                </Badge>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 leading-tight">
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              {/* Image Slider */}
              {event.images.length > 0 && (
                <AnimateOnScroll>
                  <div>
                    <ImageSlider images={event.images} title={event.title} />
                  </div>
                </AnimateOnScroll>
              )}

              {/* Event Info Cards */}
              <AnimateOnScroll delay={100}>
                <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <Calendar className="w-5 h-5 text-primary-600" />
                    Etkinlik Bilgileri
                  </CardTitle>
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

                    {event.eventType && (
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs md:text-sm font-medium text-muted-foreground">Etkinlik Türü</p>
                          <p className="text-sm md:text-base font-semibold">{event.eventType}</p>
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

              {/* Description */}
              <AnimateOnScroll delay={200}>
                <Card>
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">Etkinlik Hakkında</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <RichTextRenderer content={event.description} />
                  </div>
                </CardContent>
              </Card>
              </AnimateOnScroll>

              {/* Past Event Details */}
              {event.isPastEvent && (
                <>
                  {event.driveLink && (
                    <AnimateOnScroll delay={300}>
                      <Card>
                      <CardHeader>
                        <CardTitle className="text-lg md:text-xl">Etkinlik Materyalleri</CardTitle>
                        <CardDescription>
                          Etkinlik sırasında paylaşılan materyallere buradan erişebilirsiniz.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button asChild size="lg" className="w-full sm:w-auto">
                          <a
                            href={event.driveLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Drive Linki
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                    </AnimateOnScroll>
                  )}

                  {event.details && (
                    <AnimateOnScroll delay={400}>
                      <Card>
                      <CardHeader>
                        <CardTitle className="text-lg md:text-xl">Etkinlik Detayları</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose prose-sm max-w-none">
                          <RichTextRenderer content={event.details} />
                        </div>
                      </CardContent>
                    </Card>
                    </AnimateOnScroll>
                  )}
                </>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <AnimateOnScroll delay={150}>
              <div className="sticky top-6 space-y-6">
                {/* Application Button */}
                {canApply && (
                  <Card className="border-2 border-primary-200 shadow-lg">
                    <CardHeader className="bg-primary-50">
                      <CardTitle className="text-primary-900 text-lg md:text-xl">Başvuru</CardTitle>
                      <CardDescription>
                        Etkinliğe katılmak için başvuru formunu doldurun
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <Button asChild size="lg" className="w-full">
                        <Link href={`/etkinlikler/${id}/basvuru`}>
                          Başvuru Formunu Doldur
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Info Card */}
                {!canApply && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg md:text-xl">Etkinlik Durumu</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {event.isPastEvent ? (
                        <div className="space-y-2">
                          <Badge variant="outline" className="w-full justify-center py-2">
                            Geçmiş Etkinlik
                          </Badge>
                          <p className="text-sm text-muted-foreground text-center">
                            Bu etkinlik tamamlanmıştır.
                          </p>
                        </div>
                      ) : isDeadlinePassed ? (
                        <div className="space-y-2">
                          <Badge variant="destructive" className="w-full justify-center py-2">
                            Başvuru Tarihi Geçti
                          </Badge>
                          <p className="text-sm text-muted-foreground text-center">
                            Başvuru tarihi geçmiştir.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Badge variant="outline" className="w-full justify-center py-2">
                            Başvuru Kapalı
                          </Badge>
                          <p className="text-sm text-muted-foreground text-center">
                            Bu etkinlik için başvuru kabul edilmemektedir.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Quick Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl">Hızlı Bilgiler</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {event.eventDate && (
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground">
                          {new Date(event.eventDate).toLocaleDateString("tr-TR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-3 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground">{event.location}</span>
                      </div>
                    )}
                    {event.participantLimit && (
                      <div className="flex items-center gap-3 text-sm">
                        <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground">
                          {event.participantLimit} Katılımcı
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              </AnimateOnScroll>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
