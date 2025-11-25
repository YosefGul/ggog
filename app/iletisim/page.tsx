"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";
import AnimateOnScroll from "@/components/AnimateOnScroll";

interface ContactSettings {
  address?: string;
  phone?: string;
  email?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
    discord?: string;
  };
}

export default function ContactPage() {
  const [settings, setSettings] = useState<ContactSettings>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/public/settings");
      if (response.ok) {
        const data = await response.json();
        const contact = data.find((s: any) => s.key === "contact");
        if (contact) {
          setSettings(contact.value as ContactSettings);
        }
      }
    } catch (error) {
      console.error("Error fetching contact settings:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/contact/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Mesajınız başarıyla gönderildi!" });
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setMessage({ type: "error", text: "Mesaj gönderimi başarısız" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Bir hata oluştu" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-7xl mx-auto">
        <AnimateOnScroll>
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">İletişim</h1>
            <p className="text-muted-foreground text-lg">
              Sorularınız için bizimle iletişime geçin
            </p>
            <Separator className="w-24 mx-auto mt-4" />
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll delay={100}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* İletişim Bilgileri */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>İletişim Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {settings.address && (
                  <div className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <Label className="font-semibold mb-1 block">Adres</Label>
                      <p className="text-muted-foreground">{settings.address}</p>
                    </div>
                  </div>
                )}
                {settings.phone && (
                  <div className="flex items-start gap-4">
                    <Phone className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <Label className="font-semibold mb-1 block">Telefon</Label>
                      <a
                        href={`tel:${settings.phone}`}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {settings.phone}
                      </a>
                    </div>
                  </div>
                )}
                {settings.email && (
                  <div className="flex items-start gap-4">
                    <Mail className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <Label className="font-semibold mb-1 block">E-posta</Label>
                      <a
                        href={`mailto:${settings.email}`}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {settings.email}
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sosyal Medya */}
            {settings.socialMedia && (
              <Card>
                <CardHeader>
                  <CardTitle>Sosyal Medya</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    {settings.socialMedia.facebook && (
                      <a
                        href={settings.socialMedia.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors"
                      >
                        <Facebook className="w-5 h-5 text-primary" />
                        <span className="text-sm">Facebook</span>
                      </a>
                    )}
                    {settings.socialMedia.twitter && (
                      <a
                        href={settings.socialMedia.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors"
                      >
                        <Twitter className="w-5 h-5 text-primary" />
                        <span className="text-sm">Twitter</span>
                      </a>
                    )}
                    {settings.socialMedia.instagram && (
                      <a
                        href={settings.socialMedia.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors"
                      >
                        <Instagram className="w-5 h-5 text-primary" />
                        <span className="text-sm">Instagram</span>
                      </a>
                    )}
                    {settings.socialMedia.linkedin && (
                      <a
                        href={settings.socialMedia.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors"
                      >
                        <Linkedin className="w-5 h-5 text-primary" />
                        <span className="text-sm">LinkedIn</span>
                      </a>
                    )}
                    {settings.socialMedia.youtube && (
                      <a
                        href={settings.socialMedia.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors"
                      >
                        <Youtube className="w-5 h-5 text-primary" />
                        <span className="text-sm">YouTube</span>
                      </a>
                    )}
                    {settings.socialMedia.discord && (
                      <a
                        href={settings.socialMedia.discord}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors"
                      >
                        <span className="text-primary font-bold">D</span>
                        <span className="text-sm">Discord</span>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* İletişim Formu */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Bize Ulaşın</CardTitle>
                <CardDescription>
                  Mesajınızı gönderin, size en kısa sürede dönüş yapalım
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Ad Soyad <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Adınız ve soyadınız"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      E-posta <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="ornek@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Konu</Label>
                    <Input
                      id="subject"
                      type="text"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      placeholder="Mesajınızın konusu"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">
                      Mesaj <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      required
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      rows={6}
                      placeholder="Mesajınızı buraya yazabilirsiniz..."
                    />
                  </div>
                  {message && (
                    <div
                      className={`p-4 rounded-md ${
                        message.type === "success"
                          ? "bg-green-50 text-green-800 border border-green-200"
                          : "bg-destructive/10 text-destructive border border-destructive/20"
                      }`}
                    >
                      {message.text}
                    </div>
                  )}
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full"
                    size="lg"
                  >
                    {submitting ? "Gönderiliyor..." : "Mesaj Gönder"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          </div>
        </AnimateOnScroll>
      </div>
    </div>
  );
}
