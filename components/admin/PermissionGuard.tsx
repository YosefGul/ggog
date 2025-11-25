"use client";

import { useSession } from "next-auth/react";
import { Permission, hasPermission } from "@/lib/permissions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PermissionGuardProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function PermissionGuard({
  permission,
  children,
  fallback,
}: PermissionGuardProps) {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "VIEWER";

  if (!hasPermission(userRole, permission)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-destructive">Erişim Reddedildi</CardTitle>
            <CardDescription>
              Bu içeriğe erişim yetkiniz bulunmamaktadır.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-lg mb-4">
              <p className="text-sm text-muted-foreground">
                <strong>Mevcut Rolünüz:</strong> {userRole}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Bu içeriğe erişmek için yeterli yetkiniz bulunmamaktadır.
              </p>
            </div>
            <Button asChild className="w-full">
              <Link href="/admin">Dashboard'a Dön</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

