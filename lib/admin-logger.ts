import { prisma } from "@/lib/prisma";

export type AdminAction = 
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "SETTINGS_CHANGE"
  | "STATUS_CHANGE"
  | "BULK_DELETE"
  | "EXPORT"
  | "IMPORT";

export type EntityType =
  | "Event"
  | "Announcement"
  | "User"
  | "Settings"
  | "Slider"
  | "Partner"
  | "Category"
  | "FormField"
  | "OrganCategory"
  | "OrganMember"
  | "Stats"
  | "EventApplication"
  | "MemberApplication";

interface LogAdminActionParams {
  userId: string;
  action: AdminAction;
  entityType: EntityType;
  entityId?: string;
  entityName?: string;
  changes?: {
    old?: any;
    new?: any;
  };
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

/**
 * Admin işlemlerini logla
 * Hata durumunda sessizce fail eder (ana işlemi engellemez)
 */
export async function logAdminAction(params: LogAdminActionParams): Promise<void> {
  try {
    await prisma.adminLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId || null,
        entityName: params.entityName || null,
        changes: params.changes ? JSON.parse(JSON.stringify(params.changes)) : null,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
        metadata: params.metadata ? JSON.parse(JSON.stringify(params.metadata)) : null,
      },
    });
  } catch (error) {
    // Log hatası ana işlemi engellememeli
    console.error("Failed to log admin action:", error);
  }
}

/**
 * Request'ten IP adresini al
 */
export function getClientIp(request: Request): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return undefined;
}

/**
 * Request'ten User-Agent'ı al
 */
export function getUserAgent(request: Request): string | undefined {
  return request.headers.get("user-agent") || undefined;
}

/**
 * İki objeyi karşılaştır ve değişiklikleri bul
 */
export function getChanges(oldData: any, newData: any): { old: any; new: any } | undefined {
  if (!oldData || !newData) {
    return undefined;
  }

  const changes: { old: any; new: any } = { old: {}, new: {} };
  let hasChanges = false;

  // Tüm key'leri topla
  const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

  for (const key of allKeys) {
    // createdAt, updatedAt gibi otomatik alanları atla
    if (key === "createdAt" || key === "updatedAt" || key === "id") {
      continue;
    }

    const oldValue = oldData[key];
    const newValue = newData[key];

    // Değerler farklıysa ekle
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes.old[key] = oldValue;
      changes.new[key] = newValue;
      hasChanges = true;
    }
  }

  return hasChanges ? changes : undefined;
}

