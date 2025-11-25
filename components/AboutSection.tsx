"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Stat {
  id: string;
  title: string;
  value: string;
  icon?: string;
}

export default function AboutSection() {
  const [stats, setStats] = useState<Stat[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/public/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data.slice(0, 4));
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  if (stats.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">Biz Kimiz?</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Genç Girişimciler ve Oyun Geliştiricileri Derneği olarak, oyun
              geliştirme ekosistemini güçlendirmek ve genç girişimcileri
              desteklemek için çalışıyoruz.
            </p>
            <Button asChild>
              <Link href="/biz-kimiz">Tümünü Gör</Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat) => (
              <Card key={stat.id} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  {stat.icon && (
                    <div className="text-4xl mb-2">{stat.icon}</div>
                  )}
                  <div className="text-3xl font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground">{stat.title}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

