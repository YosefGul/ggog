"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { useToast } from "@/lib/toast";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface FormField {
  id: string;
  fieldType: string;
  label: string;
  placeholder?: string;
  isRequired: boolean;
  helpText?: string;
  options?: string[];
  order: number;
}

export default function MemberFormFieldsPage() {
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFieldType, setSelectedFieldType] = useState<string>("text");
  const { toast } = useToast();

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/member-form-fields");
      if (response.ok) {
        const data = await response.json();
        setFields(data);
      }
    } catch (error) {
      console.error("Error fetching fields:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu alanı silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/member-form-fields/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          variant: "success",
          title: "Başarılı",
          description: "Alan başarıyla silindi",
        });
        fetchFields();
      } else {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Alan silinirken bir hata oluştu",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Alan silinirken bir hata oluştu",
      });
    }
  };

  const handleSave = async (formData: FormData) => {
    try {
      const fieldType = formData.get("fieldType") as string;
      const label = formData.get("label") as string;
      const placeholder = formData.get("placeholder") as string;
      const isRequired = formData.get("isRequired") === "on";
      const helpText = formData.get("helpText") as string;
      const options = formData.get("options") as string;
      const order = parseInt(formData.get("order") as string) || 0;

      const data: any = {
        fieldType,
        label,
        placeholder: placeholder || null,
        isRequired,
        helpText: helpText || null,
        order,
      };

      if (fieldType === "select" && options) {
        data.options = options.split("\n").filter((o) => o.trim());
      }

      const url = selectedField
        ? `/api/admin/member-form-fields/${selectedField.id}`
        : "/api/admin/member-form-fields";
      const method = selectedField ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          variant: "success",
          title: "Başarılı",
          description: selectedField ? "Alan güncellendi" : "Alan eklendi",
        });
        setIsDialogOpen(false);
        setSelectedField(null);
        fetchFields();
      } else {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "İşlem başarısız oldu",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Bir hata oluştu",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="space-y-4 w-full max-w-4xl">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Üye Başvuru Form Alanları</h1>
          <p className="text-muted-foreground mt-1">
            Üye başvuru formunda gösterilecek alanları yönetin
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setSelectedField(null);
            setSelectedFieldType("text");
          } else {
            setSelectedFieldType(selectedField?.fieldType || "text");
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setSelectedField(null);
              setSelectedFieldType("text");
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Alan Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedField ? "Alan Düzenle" : "Yeni Alan Ekle"}
              </DialogTitle>
              <DialogDescription>
                Üye başvuru formu için yeni bir alan ekleyin veya mevcut alanı düzenleyin
              </DialogDescription>
            </DialogHeader>
            <form action={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fieldType">Alan Tipi *</Label>
                  <Select
                    name="fieldType"
                    value={selectedFieldType}
                    onValueChange={setSelectedFieldType}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Metin</SelectItem>
                      <SelectItem value="email">E-posta</SelectItem>
                      <SelectItem value="tel">Telefon</SelectItem>
                      <SelectItem value="number">Sayı</SelectItem>
                      <SelectItem value="date">Tarih</SelectItem>
                      <SelectItem value="url">URL</SelectItem>
                      <SelectItem value="textarea">Çok Satırlı Metin</SelectItem>
                      <SelectItem value="select">Seçim Listesi</SelectItem>
                      <SelectItem value="checkbox">Onay Kutusu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="order">Sıra</Label>
                  <Input
                    type="number"
                    name="order"
                    defaultValue={selectedField?.order || fields.length}
                    min="0"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="label">Etiket *</Label>
                <Input
                  name="label"
                  defaultValue={selectedField?.label || ""}
                  placeholder="Örn: Ad Soyad"
                  required
                />
              </div>
              <div>
                <Label htmlFor="placeholder">Placeholder</Label>
                <Input
                  name="placeholder"
                  defaultValue={selectedField?.placeholder || ""}
                  placeholder="Örn: Adınızı giriniz"
                />
              </div>
              <div>
                <Label htmlFor="helpText">Yardım Metni</Label>
                <Textarea
                  name="helpText"
                  defaultValue={selectedField?.helpText || ""}
                  placeholder="Kullanıcıya gösterilecek açıklama metni"
                  rows={2}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  name="isRequired"
                  id="isRequired"
                  defaultChecked={selectedField?.isRequired || false}
                />
                <Label htmlFor="isRequired" className="cursor-pointer">
                  Zorunlu Alan
                </Label>
              </div>
              {selectedFieldType === "select" && (
                <div>
                  <Label htmlFor="options">Seçenekler (Her satıra bir seçenek) *</Label>
                  <Textarea
                    name="options"
                    defaultValue={
                      selectedField?.options
                        ? selectedField.options.join("\n")
                        : ""
                    }
                    placeholder="Seçenek 1&#10;Seçenek 2&#10;Seçenek 3"
                    rows={4}
                    required
                  />
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setSelectedField(null);
                  }}
                >
                  İptal
                </Button>
                <Button type="submit">Kaydet</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Alanları</CardTitle>
          <CardDescription>
            Üye başvuru formunda gösterilecek alanların listesi
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Henüz alan eklenmemiş. Yeni alan eklemek için yukarıdaki butona tıklayın.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Sıra</TableHead>
                    <TableHead>Etiket</TableHead>
                    <TableHead>Tip</TableHead>
                    <TableHead>Zorunlu</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field) => (
                    <TableRow key={field.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          {field.order}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{field.label}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{field.fieldType}</Badge>
                      </TableCell>
                      <TableCell>
                        {field.isRequired ? (
                          <Badge variant="destructive">Evet</Badge>
                        ) : (
                          <Badge variant="secondary">Hayır</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedField(field);
                              setSelectedFieldType(field.fieldType);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(field.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

