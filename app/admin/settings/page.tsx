"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import RichTextEditor from "@/components/admin/RichTextEditor";
import MultiImageUpload from "@/components/admin/MultiImageUpload";
import PermissionGuard from "@/components/admin/PermissionGuard";
import { Permission } from "@/lib/permissions";

interface FooterSettings {
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

interface AboutSettings {
  content?: string;
  contentBottom?: string;
  images?: Array<{ url: string; order: number }>;
}

interface LegalSettings {
  privacyPolicy?: string;
  termsOfService?: string;
}

export default function SettingsPage() {
  return (
    <PermissionGuard permission={Permission.MANAGE_SETTINGS}>
      <SettingsPageContent />
    </PermissionGuard>
  );
}

function SettingsPageContent() {
  const [footerSettings, setFooterSettings] = useState<FooterSettings>({});
  const [contactSettings, setContactSettings] = useState<ContactSettings>({});
  const [aboutSettings, setAboutSettings] = useState<AboutSettings>({});
  const [legalSettings, setLegalSettings] = useState<LegalSettings>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings");
      if (response.ok) {
        const data = await response.json();
        const footer = data.find((s: any) => s.key === "footer");
        const contact = data.find((s: any) => s.key === "contact");
        const about = data.find((s: any) => s.key === "about");
        const legal = data.find((s: any) => s.key === "legal");

        if (footer) {
          setFooterSettings(footer.value as FooterSettings);
        }
        if (contact) {
          setContactSettings(contact.value as ContactSettings);
        }
        if (about) {
          const aboutValue = about.value as AboutSettings;
          setAboutSettings({
            content: aboutValue.content || "",
            contentBottom: aboutValue.contentBottom || "",
            images: aboutValue.images || [],
          });
        }
        if (legal) {
          setLegalSettings(legal.value as LegalSettings);
        }
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (type: "footer" | "contact" | "about" | "legal") => {
    setSaving(true);
    try {
      const value = 
        type === "footer" ? footerSettings : 
        type === "contact" ? contactSettings : 
        type === "about" ? aboutSettings : 
        legalSettings;
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: type,
          value,
          type,
        }),
      });

      if (response.ok) {
        alert("Ayarlar kaydedildi");
      } else {
        alert("Kayıt başarısız");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Ayarlar</h1>

      <div className="space-y-8">
        {/* Footer Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Footer Ayarları</CardTitle>
            <CardDescription>
              Footer'da görüntülenecek bilgileri buradan yönetebilirsiniz
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="footer-address">Adres</Label>
                <Textarea
                  id="footer-address"
                  value={footerSettings.address || ""}
                  onChange={(e) =>
                    setFooterSettings({ ...footerSettings, address: e.target.value })
                  }
                  rows={3}
                  placeholder="Adres bilgileri"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="footer-phone">Telefon</Label>
                  <Input
                    id="footer-phone"
                    type="text"
                    value={footerSettings.phone || ""}
                    onChange={(e) =>
                      setFooterSettings({ ...footerSettings, phone: e.target.value })
                    }
                    placeholder="+90 312 XXX XX XX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footer-email">E-posta</Label>
                  <Input
                    id="footer-email"
                    type="email"
                    value={footerSettings.email || ""}
                    onChange={(e) =>
                      setFooterSettings({ ...footerSettings, email: e.target.value })
                    }
                    placeholder="info@ggog.org.tr"
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Sosyal Medya Linkleri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="footer-facebook">Facebook</Label>
                  <Input
                    id="footer-facebook"
                    type="url"
                    value={footerSettings.socialMedia?.facebook || ""}
                    onChange={(e) =>
                      setFooterSettings({
                        ...footerSettings,
                        socialMedia: {
                          ...footerSettings.socialMedia,
                          facebook: e.target.value,
                        },
                      })
                    }
                    placeholder="https://facebook.com/ggog"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footer-twitter">Twitter/X</Label>
                  <Input
                    id="footer-twitter"
                    type="url"
                    value={footerSettings.socialMedia?.twitter || ""}
                    onChange={(e) =>
                      setFooterSettings({
                        ...footerSettings,
                        socialMedia: {
                          ...footerSettings.socialMedia,
                          twitter: e.target.value,
                        },
                      })
                    }
                    placeholder="https://twitter.com/ggog"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footer-instagram">Instagram</Label>
                  <Input
                    id="footer-instagram"
                    type="url"
                    value={footerSettings.socialMedia?.instagram || ""}
                    onChange={(e) =>
                      setFooterSettings({
                        ...footerSettings,
                        socialMedia: {
                          ...footerSettings.socialMedia,
                          instagram: e.target.value,
                        },
                      })
                    }
                    placeholder="https://instagram.com/ggog"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footer-linkedin">LinkedIn</Label>
                  <Input
                    id="footer-linkedin"
                    type="url"
                    value={footerSettings.socialMedia?.linkedin || ""}
                    onChange={(e) =>
                      setFooterSettings({
                        ...footerSettings,
                        socialMedia: {
                          ...footerSettings.socialMedia,
                          linkedin: e.target.value,
                        },
                      })
                    }
                    placeholder="https://linkedin.com/company/ggog"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footer-youtube">YouTube</Label>
                  <Input
                    id="footer-youtube"
                    type="url"
                    value={footerSettings.socialMedia?.youtube || ""}
                    onChange={(e) =>
                      setFooterSettings({
                        ...footerSettings,
                        socialMedia: {
                          ...footerSettings.socialMedia,
                          youtube: e.target.value,
                        },
                      })
                    }
                    placeholder="https://youtube.com/@ggog"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footer-discord">Discord</Label>
                  <Input
                    id="footer-discord"
                    type="url"
                    value={footerSettings.socialMedia?.discord || ""}
                    onChange={(e) =>
                      setFooterSettings({
                        ...footerSettings,
                        socialMedia: {
                          ...footerSettings.socialMedia,
                          discord: e.target.value,
                        },
                      })
                    }
                    placeholder="https://discord.gg/ggog"
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={() => handleSave("footer")}
              disabled={saving}
              className="w-full"
            >
              {saving ? "Kaydediliyor..." : "Footer Ayarlarını Kaydet"}
            </Button>
          </CardContent>
        </Card>

        {/* Contact Settings */}
        <Card>
          <CardHeader>
            <CardTitle>İletişim Sayfası Ayarları</CardTitle>
            <CardDescription>
              İletişim sayfasında görüntülenecek bilgileri buradan yönetebilirsiniz
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contact-address">Adres</Label>
                <Textarea
                  id="contact-address"
                  value={contactSettings.address || ""}
                  onChange={(e) =>
                    setContactSettings({ ...contactSettings, address: e.target.value })
                  }
                  rows={3}
                  placeholder="Adres bilgileri"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-phone">Telefon</Label>
                  <Input
                    id="contact-phone"
                    type="text"
                    value={contactSettings.phone || ""}
                    onChange={(e) =>
                      setContactSettings({ ...contactSettings, phone: e.target.value })
                    }
                    placeholder="+90 312 XXX XX XX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">E-posta</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={contactSettings.email || ""}
                    onChange={(e) =>
                      setContactSettings({ ...contactSettings, email: e.target.value })
                    }
                    placeholder="info@ggog.org.tr"
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Sosyal Medya Linkleri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-facebook">Facebook</Label>
                  <Input
                    id="contact-facebook"
                    type="url"
                    value={contactSettings.socialMedia?.facebook || ""}
                    onChange={(e) =>
                      setContactSettings({
                        ...contactSettings,
                        socialMedia: {
                          ...contactSettings.socialMedia,
                          facebook: e.target.value,
                        },
                      })
                    }
                    placeholder="https://facebook.com/ggog"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-twitter">Twitter/X</Label>
                  <Input
                    id="contact-twitter"
                    type="url"
                    value={contactSettings.socialMedia?.twitter || ""}
                    onChange={(e) =>
                      setContactSettings({
                        ...contactSettings,
                        socialMedia: {
                          ...contactSettings.socialMedia,
                          twitter: e.target.value,
                        },
                      })
                    }
                    placeholder="https://twitter.com/ggog"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-instagram">Instagram</Label>
                  <Input
                    id="contact-instagram"
                    type="url"
                    value={contactSettings.socialMedia?.instagram || ""}
                    onChange={(e) =>
                      setContactSettings({
                        ...contactSettings,
                        socialMedia: {
                          ...contactSettings.socialMedia,
                          instagram: e.target.value,
                        },
                      })
                    }
                    placeholder="https://instagram.com/ggog"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-linkedin">LinkedIn</Label>
                  <Input
                    id="contact-linkedin"
                    type="url"
                    value={contactSettings.socialMedia?.linkedin || ""}
                    onChange={(e) =>
                      setContactSettings({
                        ...contactSettings,
                        socialMedia: {
                          ...contactSettings.socialMedia,
                          linkedin: e.target.value,
                        },
                      })
                    }
                    placeholder="https://linkedin.com/company/ggog"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-youtube">YouTube</Label>
                  <Input
                    id="contact-youtube"
                    type="url"
                    value={contactSettings.socialMedia?.youtube || ""}
                    onChange={(e) =>
                      setContactSettings({
                        ...contactSettings,
                        socialMedia: {
                          ...contactSettings.socialMedia,
                          youtube: e.target.value,
                        },
                      })
                    }
                    placeholder="https://youtube.com/@ggog"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-discord">Discord</Label>
                  <Input
                    id="contact-discord"
                    type="url"
                    value={contactSettings.socialMedia?.discord || ""}
                    onChange={(e) =>
                      setContactSettings({
                        ...contactSettings,
                        socialMedia: {
                          ...contactSettings.socialMedia,
                          discord: e.target.value,
                        },
                      })
                    }
                    placeholder="https://discord.gg/ggog"
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={() => handleSave("contact")}
              disabled={saving}
              className="w-full"
            >
              {saving ? "Kaydediliyor..." : "İletişim Ayarlarını Kaydet"}
            </Button>
          </CardContent>
        </Card>

        {/* About Page Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Biz Kimiz Sayfası Ayarları</CardTitle>
            <CardDescription>
              "Biz Kimiz?" sayfasında görüntülenecek içeriği buradan yönetebilirsiniz
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="about-content">Üst İçerik (Slider ile aynı yükseklikte gösterilir)</Label>
                <RichTextEditor
                  value={aboutSettings.content || ""}
                  onChange={(content) =>
                    setAboutSettings({ ...aboutSettings, content })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Bu içerik slider ile yan yana gösterilir. Maksimum ~500 karakter önerilir.
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Resim Slider</Label>
                <MultiImageUpload
                  value={aboutSettings.images || []}
                  onChange={(images) =>
                    setAboutSettings({ ...aboutSettings, images })
                  }
                  label="Biz Kimiz Sayfası Resimleri"
                  maxImages={10}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="about-content-bottom">Alt İçerik (İsteğe bağlı - Sayfanın altında gösterilir)</Label>
                <RichTextEditor
                  value={aboutSettings.contentBottom || ""}
                  onChange={(contentBottom) =>
                    setAboutSettings({ ...aboutSettings, contentBottom })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Bu içerik slider ve üst içerikten sonra gösterilir. İsteğe bağlıdır.
                </p>
              </div>
            </div>

            <Button
              onClick={() => handleSave("about")}
              disabled={saving}
              className="w-full"
            >
              {saving ? "Kaydediliyor..." : "Biz Kimiz İçeriğini Kaydet"}
            </Button>
          </CardContent>
        </Card>

        {/* Legal Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Yasal Metinler</CardTitle>
            <CardDescription>
              Gizlilik Politikası ve Kullanım Koşulları metinlerini buradan yönetebilirsiniz
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="privacy-policy">Gizlilik Politikası</Label>
                <RichTextEditor
                  value={legalSettings.privacyPolicy || ""}
                  onChange={(privacyPolicy) =>
                    setLegalSettings({ ...legalSettings, privacyPolicy })
                  }
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="terms-of-service">Kullanım Koşulları</Label>
                <RichTextEditor
                  value={legalSettings.termsOfService || ""}
                  onChange={(termsOfService) =>
                    setLegalSettings({ ...legalSettings, termsOfService })
                  }
                />
              </div>
            </div>

            <Button
              onClick={() => handleSave("legal")}
              disabled={saving}
              className="w-full"
            >
              {saving ? "Kaydediliyor..." : "Yasal Metinleri Kaydet"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
