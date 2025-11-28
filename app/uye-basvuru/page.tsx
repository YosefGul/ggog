"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { useToast } from "@/lib/toast";
import Breadcrumb, { BreadcrumbItem } from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface FormField {
  id: string;
  fieldType: string;
  label: string;
  placeholder?: string;
  isRequired: boolean;
  helpText?: string;
  options?: string[];
}

export default function MemberApplicationPage() {
  const [submitting, setSubmitting] = useState(false);
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm();

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      const response = await fetch("/api/public/member-form-fields");
      if (response.ok) {
        const data = await response.json();
        setFields(data);
      }
    } catch (error) {
      console.error("Error fetching form fields:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    setSubmitting(true);

    try {
      const response = await fetch("/api/member/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          variant: "success",
          title: "Başarılı",
          description: "Başvurunuz başarıyla gönderildi! En kısa sürede size dönüş yapacağız.",
        });
        // Form'u temizle
        reset();
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Hata",
          description: errorData.error || "Başvuru gönderilirken bir hata oluştu",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Başvuru gönderilirken bir hata oluştu",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Üye Başvurusu", href: "/uye-basvuru" },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-10 w-48 mb-8" />
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-64 mb-4" />
                <Skeleton className="h-4 w-96" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto">
          <Breadcrumb items={breadcrumbItems} className="mb-8" />
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
                <CardTitle>Başvuru Formu</CardTitle>
                <CardDescription>
                  Lütfen tüm alanları eksiksiz doldurun
                </CardDescription>
              </CardHeader>
              <CardContent>
                {fields.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Form alanları henüz yapılandırılmamış. Lütfen daha sonra tekrar deneyin.
                  </p>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {fields.map((field) => (
                      <div key={field.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={field.id}>
                            {field.label}
                            {field.isRequired && <span className="text-destructive ml-1">*</span>}
                            {!field.isRequired && !field.helpText && (
                              <span className="text-muted-foreground ml-2 text-sm font-normal">(Opsiyonel)</span>
                            )}
                          </Label>
                        </div>
                        {field.helpText && (
                          <p className="text-sm text-muted-foreground italic">{field.helpText}</p>
                        )}
                        {field.fieldType === "textarea" ? (
                          <Textarea
                            id={field.id}
                            {...register(field.id, { required: field.isRequired })}
                            placeholder={field.placeholder}
                            rows={4}
                          />
                        ) : field.fieldType === "select" ? (
                          <div>
                            <Select
                              onValueChange={(value) => {
                                setValue(field.id, value, { shouldValidate: true });
                              }}
                              value={watch(field.id) || ""}
                            >
                              <SelectTrigger id={field.id}>
                                <SelectValue placeholder={field.placeholder || "Seçiniz"} />
                              </SelectTrigger>
                              <SelectContent>
                                {field.options?.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {field.isRequired && (
                              <input
                                type="hidden"
                                {...register(field.id, { required: field.isRequired })}
                              />
                            )}
                          </div>
                        ) : field.fieldType === "checkbox" ? (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={field.id}
                              {...register(field.id)}
                            />
                            <Label htmlFor={field.id} className="font-normal">
                              {field.label}
                            </Label>
                          </div>
                        ) : (
                          <Input
                            id={field.id}
                            type={field.fieldType === "tel" ? "tel" : field.fieldType === "url" ? "url" : field.fieldType}
                            {...register(field.id, {
                              required: field.isRequired,
                              ...(field.fieldType === "email" && {
                                pattern: {
                                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                  message: "Geçerli bir e-posta adresi giriniz",
                                },
                              }),
                              ...(field.fieldType === "url" && {
                                pattern: {
                                  value: /^https?:\/\/.+/i,
                                  message: "Geçerli bir URL giriniz",
                                },
                              }),
                            })}
                            placeholder={field.placeholder}
                          />
                        )}
                        {errors[field.id] && (
                          <p className="text-sm text-destructive">
                            {errors[field.id]?.message?.toString() || "Bu alan zorunludur"}
                          </p>
                        )}
                      </div>
                    ))}

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full"
                      size="lg"
                    >
                      {submitting ? "Gönderiliyor..." : "Başvuruyu Gönder"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </AnimateOnScroll>
        </div>
      </div>
    </div>
  );
}
