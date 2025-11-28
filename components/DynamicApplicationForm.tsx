"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useToast } from "@/lib/toast";

interface FormField {
  id: string;
  fieldType: string;
  label: string;
  placeholder?: string;
  isRequired: boolean;
  helpText?: string;
  options?: string[];
}

interface DynamicApplicationFormProps {
  eventId: string;
  categoryId?: string;
}

export default function DynamicApplicationForm({
  eventId,
  categoryId,
}: DynamicApplicationFormProps) {
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm();

  useEffect(() => {
    fetchFields();
  }, [categoryId]);

  const fetchFields = async () => {
    try {
      const url = categoryId
        ? `/api/public/form-fields?categoryId=${categoryId}`
        : "/api/public/form-fields";
      const response = await fetch(url);
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
      if (!eventId) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Etkinlik ID bulunamadı",
        });
        setSubmitting(false);
        return;
      }

      const response = await fetch(`/api/events/${eventId}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ formData: data }),
      });

      const responseData = await response.json();

      if (response.ok) {
        toast({
          variant: "success",
          title: "Başarılı",
          description: responseData.message || "Başvurunuz başarıyla gönderildi!",
        });
        // Form'u temizle
        Object.keys(data).forEach((key) => {
          setValue(key, "");
        });
      } else {
        toast({
          variant: "destructive",
          title: "Hata",
          description: responseData.error || "Bir hata oluştu",
        });
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Bağlantı hatası. Lütfen tekrar deneyin.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">Yükleniyor...</div>
      </Card>
    );
  }

  if (fields.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          Bu etkinlik için başvuru formu henüz yapılandırılmamış.
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
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
                type={field.fieldType}
                {...register(field.id, { required: field.isRequired })}
                placeholder={field.placeholder}
              />
            )}
            {errors[field.id] && (
              <p className="text-sm text-destructive">Bu alan zorunludur</p>
            )}
          </div>
        ))}

        <Button
          type="submit"
          disabled={submitting}
          className="w-full"
        >
          {submitting ? "Gönderiliyor..." : "Başvur"}
        </Button>
      </form>
    </Card>
  );
}
