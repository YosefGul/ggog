"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import RichTextRenderer from "./RichTextRenderer";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slider {
  id: string;
  title: string;
  description: string;
  image?: string;
  link?: string;
  linkTitle?: string;
  hasLink: boolean;
}

export default function HeroSlider() {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    fetchSliders();
  }, []);

  useEffect(() => {
    if (sliders.length > 0 && !isPaused) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % sliders.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [sliders.length, isPaused]);

  const fetchSliders = async () => {
    try {
      const response = await fetch("/api/public/sliders");
      if (response.ok) {
        const data = await response.json();
        setSliders(data);
      }
    } catch (error) {
      console.error("Error fetching sliders:", error);
    }
  };

  if (sliders.length === 0) {
    return null;
  }

  const currentSlider = sliders[currentIndex];

  return (
    <div
      className="relative h-[600px] md:h-[700px] overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-800"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Image */}
      {currentSlider.image && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
          style={{ backgroundImage: `url(${currentSlider.image})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/70 to-black/40" />
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto px-4 md:px-4 h-full flex items-center relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center max-w-7xl mx-auto w-full">
          <div className="text-white space-y-4 md:space-y-6 px-8 md:px-0">
            <h1 className="text-3xl md:text-6xl font-bold leading-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              {currentSlider.title}
            </h1>
            <div className="text-base md:text-xl text-white leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] [&_*]:text-white [&_p]:text-white [&_strong]:text-white [&_em]:text-white [&_u]:text-white [&_li]:text-white [&_ul]:text-white [&_ol]:text-white [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_h4]:text-white [&_h5]:text-white [&_h6]:text-white">
              <RichTextRenderer content={currentSlider.description} />
            </div>
            {currentSlider.hasLink && currentSlider.link && (
              <div className="pt-2 md:pt-4">
                <Button asChild size="lg" className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6">
                  <Link href={currentSlider.link}>
                    {currentSlider.linkTitle || "Devamını Oku"}
                  </Link>
                </Button>
              </div>
            )}
          </div>
          {currentSlider.image && (
            <div className="hidden md:block relative">
              <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/20">
                <Image
                  src={currentSlider.image}
                  alt={currentSlider.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 0px, 50vw"
                  priority={currentIndex === 0}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {sliders.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentIndex
                ? "w-8 h-3 bg-white"
                : "w-3 h-3 bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      {sliders.length > 1 && (
        <>
          <button
            onClick={() =>
              setCurrentIndex((prev) => (prev - 1 + sliders.length) % sliders.length)
            }
            className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 md:p-3 transition-all z-20"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4 md:w-6 md:h-6 text-white" />
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % sliders.length)}
            className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 md:p-3 transition-all z-20"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4 md:w-6 md:h-6 text-white" />
          </button>
        </>
      )}
    </div>
  );
}
