"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import RichTextRenderer from "@/components/RichTextRenderer";
import ImageSlider from "@/components/ImageSlider";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import Breadcrumb, { BreadcrumbItem } from "@/components/ui/breadcrumb";

interface Stat {
  id: string;
  title: string;
  value: string;
  icon?: string;
}

interface AboutSettings {
  content?: string;
  contentBottom?: string;
  images?: Array<{ url: string; order: number }>;
}

export default function AboutPage() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [aboutContent, setAboutContent] = useState<string>("");
  const [aboutContentBottom, setAboutContentBottom] = useState<string>("");
  const [aboutImages, setAboutImages] = useState<Array<{ url: string; order: number }>>([]);

  useEffect(() => {
    fetchStats();
    fetchAboutContent();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/public/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchAboutContent = async () => {
    try {
      const response = await fetch("/api/public/settings");
      if (response.ok) {
        const data = await response.json();
        const about = data.find((s: any) => s.key === "about");
        if (about) {
          const aboutValue = about.value as AboutSettings;
          setAboutContent(aboutValue.content || "");
          setAboutContentBottom(aboutValue.contentBottom || "");
          setAboutImages(aboutValue.images || []);
        }
      }
    } catch (error) {
      console.error("Error fetching about content:", error);
    }
  };

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Biz Kimiz?", href: "/biz-kimiz" },
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-7xl mx-auto">
        <Breadcrumb items={breadcrumbItems} className="mb-8" />
        <AnimateOnScroll>
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Biz Kimiz?
            </h1>
            <Separator className="w-24 mx-auto" />
          </div>
        </AnimateOnScroll>

        {/* Image Slider and Content Side by Side */}
        <AnimateOnScroll delay={100}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-12">
          {/* Image Slider - Left Side */}
          {aboutImages.length > 0 && (
            <div className="order-2 lg:order-1 h-full">
              <div className="h-full flex items-stretch">
                <ImageSlider
                  images={aboutImages.map((img, index) => ({
                    id: `img-${index}`,
                    imageUrl: img.url,
                  }))}
                  title="Biz Kimiz"
                  autoSlide={true}
                />
              </div>
            </div>
          )}

          {/* About Content with Frame Design - Right Side */}
          <div className="order-1 lg:order-2 h-full flex items-stretch">
            <div className="relative w-full flex flex-col">
              {/* Decorative Frame */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 rounded-2xl transform rotate-1 shadow-xl"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-secondary-50 via-white to-primary-50 rounded-2xl transform -rotate-1 shadow-xl"></div>
              
              {/* Content Container */}
              <div className="relative bg-white rounded-2xl p-8 md:p-12 shadow-2xl border-2 border-primary-100 flex-1 flex flex-col">
                {/* Corner Decorations */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-primary-300 rounded-tl-2xl"></div>
                <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-primary-300 rounded-tr-2xl"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-primary-300 rounded-bl-2xl"></div>
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-primary-300 rounded-br-2xl"></div>
                
                {/* Content */}
                <div className="prose prose-lg max-w-none flex-1 overflow-y-auto">
                  {aboutContent ? (
                    <RichTextRenderer content={aboutContent} />
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                        Genç Girişimciler ve Oyun Geliştiricileri Derneği (GGOG), oyun
                        geliştirme ekosistemini güçlendirmek ve genç girişimcileri
                        desteklemek amacıyla kurulmuş bir dernektir.
                      </p>
                      <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                        Misyonumuz, Türkiye'deki oyun geliştirme topluluğunu bir araya getirmek,
                        bilgi paylaşımını artırmak ve sektördeki profesyonellerin gelişimine
                        katkıda bulunmaktır.
                      </p>
                      <p className="text-muted-foreground text-lg leading-relaxed">
                        Düzenli olarak gerçekleştirdiğimiz etkinlikler, workshop'lar ve networking
                        organizasyonları ile üyelerimizin hem teknik hem de profesyonel gelişimlerine
                        destek oluyoruz.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          </div>
        </AnimateOnScroll>

        {/* Bottom Content - Optional */}
        {aboutContentBottom && (
          <AnimateOnScroll delay={200}>
          <div className="mb-12">
            <div className="relative">
              {/* Decorative Frame */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 rounded-2xl transform rotate-1 shadow-xl"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-secondary-50 via-white to-primary-50 rounded-2xl transform -rotate-1 shadow-xl"></div>
              
              {/* Content Container */}
              <div className="relative bg-white rounded-2xl p-8 md:p-12 shadow-2xl border-2 border-primary-100">
                {/* Corner Decorations */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-primary-300 rounded-tl-2xl"></div>
                <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-primary-300 rounded-tr-2xl"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-primary-300 rounded-bl-2xl"></div>
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-primary-300 rounded-br-2xl"></div>
                
                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <RichTextRenderer content={aboutContentBottom} />
                </div>
              </div>
            </div>
          </div>
          </AnimateOnScroll>
        )}

        {stats.length > 0 && (
          <AnimateOnScroll delay={300}>
            <div className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-8">Rakamlarla GGOG</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <Card key={stat.id} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    {stat.icon && (
                      <div className="text-5xl mb-4">{stat.icon}</div>
                    )}
                    <CardTitle className="text-4xl font-bold text-primary mb-2">
                      {stat.value}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {stat.title}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
          </AnimateOnScroll>
        )}
      </div>
    </div>
  );
}
