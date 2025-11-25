"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const memberApplicationSchema = z.object({
  firstName: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
  lastName: z.string().min(2, "Soyisim en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  phone: z.string().min(10, "Telefon numarası geçerli değil"),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string(),
  occupation: z.string().optional(),
  company: z.string().optional(),
  experience: z.string().optional(),
  portfolio: z.string().url("Geçerli bir URL giriniz").optional().or(z.literal("")),
  linkedin: z.string().url("Geçerli bir URL giriniz").optional().or(z.literal("")),
  github: z.string().url("Geçerli bir URL giriniz").optional().or(z.literal("")),
  website: z.string().url("Geçerli bir URL giriniz").optional().or(z.literal("")),
  motivation: z.string().optional(),
  expectations: z.string().optional(),
  gameDevelopmentExperience: z.string().optional(),
  preferredRole: z.string().optional(),
  skills: z.string().optional(),
});

type MemberApplicationForm = z.infer<typeof memberApplicationSchema>;

export default function MemberApplicationPage() {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<MemberApplicationForm>({
    resolver: zodResolver(memberApplicationSchema),
    defaultValues: {
      country: "Türkiye",
    },
  });

  const onSubmit = async (data: MemberApplicationForm) => {
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/member/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Başvurunuz başarıyla gönderildi! En kısa sürede size dönüş yapacağız.",
        });
        // Form'u temizle
        window.location.reload();
      } else {
        const errorData = await response.json();
        setMessage({
          type: "error",
          text: errorData.error || "Başvuru gönderilirken bir hata oluştu",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Başvuru gönderilirken bir hata oluştu",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto">
        <AnimateOnScroll>
          <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Üye Başvuru Formu</h1>
          <p className="text-muted-foreground text-lg">
            GGOG ailesine katılmak için formu doldurun
          </p>
          <Separator className="w-24 mx-auto mt-4" />
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll delay={100}>
          <Card>
          <CardHeader>
            <CardTitle>Kişisel Bilgiler</CardTitle>
            <CardDescription>
              Lütfen tüm alanları eksiksiz doldurun
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Kişisel Bilgiler */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Kişisel Bilgiler</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      Ad <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      {...register("firstName")}
                      placeholder="Adınız"
                    />
                    {errors.firstName && (
                      <p className="text-sm text-destructive">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      Soyad <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      {...register("lastName")}
                      placeholder="Soyadınız"
                    />
                    {errors.lastName && (
                      <p className="text-sm text-destructive">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      E-posta <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="ornek@email.com"
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Telefon <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="phone"
                      {...register("phone")}
                      placeholder="05XX XXX XX XX"
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Doğum Tarihi</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      {...register("dateOfBirth")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Şehir</Label>
                    <Input
                      id="city"
                      {...register("city")}
                      placeholder="Ankara"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Ülke</Label>
                    <Input
                      id="country"
                      {...register("country")}
                      defaultValue="Türkiye"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adres</Label>
                  <Textarea
                    id="address"
                    {...register("address")}
                    placeholder="Adres bilgileriniz"
                    rows={3}
                  />
                </div>
              </div>

              <Separator />

              {/* Mesleki Bilgiler */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Mesleki Bilgiler</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="occupation">Meslek/Unvan</Label>
                    <Input
                      id="occupation"
                      {...register("occupation")}
                      placeholder="Oyun Geliştirici, Tasarımcı, vb."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Şirket/Kurum</Label>
                    <Input
                      id="company"
                      {...register("company")}
                      placeholder="Şirket adı"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Deneyim</Label>
                  <Textarea
                    id="experience"
                    {...register("experience")}
                    placeholder="Oyun geliştirme ve sektör deneyiminiz hakkında bilgi veriniz"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredRole">Tercih Edilen Rol</Label>
                  <Select onValueChange={(value) => setValue("preferredRole", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Rol seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="developer">Geliştirici</SelectItem>
                      <SelectItem value="designer">Tasarımcı</SelectItem>
                      <SelectItem value="artist">Sanatçı</SelectItem>
                      <SelectItem value="producer">Yapımcı</SelectItem>
                      <SelectItem value="marketing">Pazarlama</SelectItem>
                      <SelectItem value="other">Diğer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">Yetenekler ve Beceriler</Label>
                  <Textarea
                    id="skills"
                    {...register("skills")}
                    placeholder="Sahip olduğunuz teknik yetenekler, kullandığınız araçlar ve programlar"
                    rows={4}
                  />
                </div>
              </div>

              <Separator />

              {/* Oyun Geliştirme Deneyimi */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Oyun Geliştirme Deneyimi</h3>
                <div className="space-y-2">
                  <Label htmlFor="gameDevelopmentExperience">
                    Oyun Geliştirme Deneyiminiz
                  </Label>
                  <Textarea
                    id="gameDevelopmentExperience"
                    {...register("gameDevelopmentExperience")}
                    placeholder="Daha önce geliştirdiğiniz oyunlar, projeler veya katıldığınız game jam'ler hakkında bilgi veriniz"
                    rows={5}
                  />
                </div>
              </div>

              <Separator />

              {/* Portföy ve Sosyal Medya */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Portföy ve Sosyal Medya</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="portfolio">Portföy Linki</Label>
                    <Input
                      id="portfolio"
                      type="url"
                      {...register("portfolio")}
                      placeholder="https://..."
                    />
                    {errors.portfolio && (
                      <p className="text-sm text-destructive">{errors.portfolio.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      type="url"
                      {...register("linkedin")}
                      placeholder="https://linkedin.com/in/..."
                    />
                    {errors.linkedin && (
                      <p className="text-sm text-destructive">{errors.linkedin.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="github">GitHub</Label>
                    <Input
                      id="github"
                      type="url"
                      {...register("github")}
                      placeholder="https://github.com/..."
                    />
                    {errors.github && (
                      <p className="text-sm text-destructive">{errors.github.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Web Sitesi</Label>
                    <Input
                      id="website"
                      type="url"
                      {...register("website")}
                      placeholder="https://..."
                    />
                    {errors.website && (
                      <p className="text-sm text-destructive">{errors.website.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Motivasyon */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Motivasyon ve Beklentiler</h3>
                <div className="space-y-2">
                  <Label htmlFor="motivation">
                    GGOG'a Neden Katılmak İstiyorsunuz?
                  </Label>
                  <Textarea
                    id="motivation"
                    {...register("motivation")}
                    placeholder="Derneğe katılma motivasyonunuzu paylaşınız"
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expectations">
                    GGOG'dan Beklentileriniz
                  </Label>
                  <Textarea
                    id="expectations"
                    {...register("expectations")}
                    placeholder="Dernekten beklentileriniz ve katkı sağlamak istediğiniz alanlar"
                    rows={4}
                  />
                </div>
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
                {submitting ? "Gönderiliyor..." : "Başvuruyu Gönder"}
              </Button>
            </form>
          </CardContent>
        </Card>
        </AnimateOnScroll>
        </div>
      </div>
    </div>
  );
}



