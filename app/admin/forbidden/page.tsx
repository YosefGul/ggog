import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ForbiddenPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login-admin");
  }

  const userRole = (user as any).role || "VIEWER";

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-destructive">Erişim Reddedildi</CardTitle>
          <CardDescription>
            Bu sayfaya erişim yetkiniz bulunmamaktadır.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Mevcut Rolünüz:</strong> {userRole}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Bu sayfaya erişmek için yeterli yetkiniz bulunmamaktadır. Lütfen sistem yöneticinizle iletişime geçin.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link href="/admin">Dashboard'a Dön</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

