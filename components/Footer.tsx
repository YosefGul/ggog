"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import NewsletterSubscription from "./NewsletterSubscription";
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import RichTextRenderer from "./RichTextRenderer";

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

interface LegalSettings {
  privacyPolicy?: string;
  termsOfService?: string;
}

const footerLinks = {
  about: [
    { href: "/biz-kimiz", label: "Biz Kimiz?" },
    { href: "/organlarimiz", label: "Organlarımız" },
    { href: "/uye-basvuru", label: "Üye Başvuru" },
  ],
  events: [
    { href: "/etkinlikler", label: "Etkinliklerimiz" },
    { href: "/duyurular", label: "Duyurular" },
  ],
  contact: [
    { href: "/iletisim", label: "İletişim" },
  ],
};

export default function Footer() {
  const [settings, setSettings] = useState<FooterSettings>({});
  const [legalSettings, setLegalSettings] = useState<LegalSettings>({});
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/public/settings");
      if (response.ok) {
        const data = await response.json();
        const footer = data.find((s: any) => s.key === "footer");
        const legal = data.find((s: any) => s.key === "legal");
        if (footer) {
          setSettings(footer.value as FooterSettings);
        }
        if (legal) {
          setLegalSettings(legal.value as LegalSettings);
        }
      }
    } catch (error) {
      console.error("Error fetching footer settings:", error);
    }
  };

  return (
    <footer className="bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950 text-white pb-20 md:pb-12 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                GGOG
              </h3>
            </Link>
            <p className="text-neutral-400 mb-6 leading-relaxed text-sm">
              Genç Girişimciler ve Oyun Geliştiricileri Derneği olarak, oyun geliştirme ekosistemini güçlendirmek için buradayız.
            </p>
            {settings.socialMedia && (
              <div className="flex flex-wrap gap-3">
                {settings.socialMedia.facebook && (
                  <a
                    href={settings.socialMedia.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-neutral-800/50 hover:bg-primary-600 transition-all duration-200 flex items-center justify-center group border border-neutral-700 hover:border-primary-500"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
                  </a>
                )}
                {settings.socialMedia.twitter && (
                  <a
                    href={settings.socialMedia.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-neutral-800/50 hover:bg-primary-600 transition-all duration-200 flex items-center justify-center group border border-neutral-700 hover:border-primary-500"
                    aria-label="Twitter"
                  >
                    <Twitter className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
                  </a>
                )}
                {settings.socialMedia.instagram && (
                  <a
                    href={settings.socialMedia.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-neutral-800/50 hover:bg-primary-600 transition-all duration-200 flex items-center justify-center group border border-neutral-700 hover:border-primary-500"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
                  </a>
                )}
                {settings.socialMedia.linkedin && (
                  <a
                    href={settings.socialMedia.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-neutral-800/50 hover:bg-primary-600 transition-all duration-200 flex items-center justify-center group border border-neutral-700 hover:border-primary-500"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
                  </a>
                )}
                {settings.socialMedia.youtube && (
                  <a
                    href={settings.socialMedia.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-neutral-800/50 hover:bg-primary-600 transition-all duration-200 flex items-center justify-center group border border-neutral-700 hover:border-primary-500"
                    aria-label="YouTube"
                  >
                    <Youtube className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
                  </a>
                )}
                {settings.socialMedia.discord && (
                  <a
                    href={settings.socialMedia.discord}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-neutral-800/50 hover:bg-primary-600 transition-all duration-200 flex items-center justify-center group border border-neutral-700 hover:border-primary-500"
                    aria-label="Discord"
                  >
                    <span className="text-sm font-bold text-neutral-400 group-hover:text-white transition-colors">D</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base font-semibold mb-6 text-white uppercase tracking-wider text-sm">
              Hakkımızda
            </h4>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-neutral-400 hover:text-primary-400 transition-colors text-sm flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 text-neutral-500 group-hover:text-primary-400 transition-colors" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Events & Announcements */}
          <div>
            <h4 className="text-base font-semibold mb-6 text-white uppercase tracking-wider text-sm">
              Etkinlikler
            </h4>
            <ul className="space-y-3">
              {footerLinks.events.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-neutral-400 hover:text-primary-400 transition-colors text-sm flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 text-neutral-500 group-hover:text-primary-400 transition-colors" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h4 className="text-base font-semibold mb-6 text-white uppercase tracking-wider text-sm">
              İletişim
            </h4>
            <div className="space-y-4 mb-6">
              {settings.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
                  <p className="text-neutral-400 text-sm leading-relaxed">{settings.address}</p>
                </div>
              )}
              {settings.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-primary-400 flex-shrink-0" />
                  <a
                    href={`tel:${settings.phone}`}
                    className="text-neutral-400 hover:text-primary-400 transition-colors text-sm"
                  >
                    {settings.phone}
                  </a>
                </div>
              )}
              {settings.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-primary-400 flex-shrink-0" />
                  <a
                    href={`mailto:${settings.email}`}
                    className="text-neutral-400 hover:text-primary-400 transition-colors text-sm"
                  >
                    {settings.email}
                  </a>
                </div>
              )}
            </div>
            <div>
              <h5 className="text-sm font-semibold mb-3 text-white">Bülten</h5>
              <NewsletterSubscription />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-neutral-800/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-neutral-500 text-sm">
              &copy; {new Date().getFullYear()} GGOG. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <button
                onClick={() => setPrivacyModalOpen(true)}
                className="text-neutral-500 hover:text-primary-400 transition-colors cursor-pointer"
              >
                Gizlilik Politikası
              </button>
              <span className="text-neutral-700">•</span>
              <button
                onClick={() => setTermsModalOpen(true)}
                className="text-neutral-500 hover:text-primary-400 transition-colors cursor-pointer"
              >
                Kullanım Koşulları
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      <Dialog open={privacyModalOpen} onOpenChange={setPrivacyModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gizlilik Politikası</DialogTitle>
          </DialogHeader>
          <div className="prose prose-sm max-w-none">
            {legalSettings.privacyPolicy ? (
              <RichTextRenderer content={legalSettings.privacyPolicy} />
            ) : (
              <p className="text-muted-foreground">
                Gizlilik politikası henüz eklenmemiş.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Terms of Service Modal */}
      <Dialog open={termsModalOpen} onOpenChange={setTermsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kullanım Koşulları</DialogTitle>
          </DialogHeader>
          <div className="prose prose-sm max-w-none">
            {legalSettings.termsOfService ? (
              <RichTextRenderer content={legalSettings.termsOfService} />
            ) : (
              <p className="text-muted-foreground">
                Kullanım koşulları henüz eklenmemiş.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </footer>
  );
}
