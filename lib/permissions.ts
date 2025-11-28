export enum Permission {
  // Dashboard
  VIEW_DASHBOARD = "VIEW_DASHBOARD",
  
  // Content Management
  MANAGE_SLIDERS = "MANAGE_SLIDERS",
  MANAGE_PARTNERS = "MANAGE_PARTNERS",
  MANAGE_STATS = "MANAGE_STATS",
  MANAGE_CATEGORIES = "MANAGE_CATEGORIES",
  MANAGE_EVENTS = "MANAGE_EVENTS",
  MANAGE_FORM_FIELDS = "MANAGE_FORM_FIELDS",
  MANAGE_ANNOUNCEMENTS = "MANAGE_ANNOUNCEMENTS",
  
  // Applications
  MANAGE_APPLICATIONS = "MANAGE_APPLICATIONS",
  MANAGE_MEMBER_APPLICATIONS = "MANAGE_MEMBER_APPLICATIONS",
  
  // Critical
  MANAGE_ORGAN_CATEGORIES = "MANAGE_ORGAN_CATEGORIES",
  MANAGE_ORGAN_MEMBERS = "MANAGE_ORGAN_MEMBERS",
  MANAGE_SETTINGS = "MANAGE_SETTINGS",
  MANAGE_USERS = "MANAGE_USERS",
  MANAGE_NEWSLETTER = "MANAGE_NEWSLETTER",
}

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "MODERATOR" | "VIEWER";

// Role-based permission mapping
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    // All permissions
    Permission.VIEW_DASHBOARD,
    Permission.MANAGE_SLIDERS,
    Permission.MANAGE_PARTNERS,
    Permission.MANAGE_STATS,
    Permission.MANAGE_CATEGORIES,
    Permission.MANAGE_EVENTS,
    Permission.MANAGE_FORM_FIELDS,
    Permission.MANAGE_ANNOUNCEMENTS,
    Permission.MANAGE_APPLICATIONS,
    Permission.MANAGE_MEMBER_APPLICATIONS,
    Permission.MANAGE_ORGAN_CATEGORIES,
    Permission.MANAGE_ORGAN_MEMBERS,
    Permission.MANAGE_SETTINGS,
    Permission.MANAGE_USERS,
    Permission.MANAGE_NEWSLETTER,
  ],
  ADMIN: [
    // All permissions except user management (or limited)
    Permission.VIEW_DASHBOARD,
    Permission.MANAGE_SLIDERS,
    Permission.MANAGE_PARTNERS,
    Permission.MANAGE_STATS,
    Permission.MANAGE_CATEGORIES,
    Permission.MANAGE_EVENTS,
    Permission.MANAGE_FORM_FIELDS,
    Permission.MANAGE_ANNOUNCEMENTS,
    Permission.MANAGE_APPLICATIONS,
    Permission.MANAGE_MEMBER_APPLICATIONS,
    Permission.MANAGE_ORGAN_CATEGORIES,
    Permission.MANAGE_ORGAN_MEMBERS,
    Permission.MANAGE_SETTINGS,
    // Note: ADMIN can view users but not manage them fully
  ],
  EDITOR: [
    // Content management only
    Permission.VIEW_DASHBOARD,
    Permission.MANAGE_SLIDERS,
    Permission.MANAGE_PARTNERS,
    Permission.MANAGE_STATS,
    Permission.MANAGE_CATEGORIES,
    Permission.MANAGE_EVENTS,
    Permission.MANAGE_FORM_FIELDS,
    Permission.MANAGE_ANNOUNCEMENTS,
  ],
  MODERATOR: [
    // Applications management only
    Permission.VIEW_DASHBOARD,
    Permission.MANAGE_APPLICATIONS,
    Permission.MANAGE_MEMBER_APPLICATIONS,
  ],
  VIEWER: [
    // Read-only access
    Permission.VIEW_DASHBOARD,
  ],
};

// Page to permission mapping
const PAGE_PERMISSIONS: Record<string, Permission> = {
  "/admin": Permission.VIEW_DASHBOARD,
  "/admin/forbidden": Permission.VIEW_DASHBOARD, // Everyone with dashboard access can see forbidden page
  "/admin/sliders": Permission.MANAGE_SLIDERS,
  "/admin/partners": Permission.MANAGE_PARTNERS,
  "/admin/stats": Permission.MANAGE_STATS,
  "/admin/categories": Permission.MANAGE_CATEGORIES,
  "/admin/events": Permission.MANAGE_EVENTS,
  "/admin/form-fields": Permission.MANAGE_FORM_FIELDS,
  "/admin/applications": Permission.MANAGE_APPLICATIONS,
  "/admin/member-applications": Permission.MANAGE_MEMBER_APPLICATIONS,
  "/admin/organ-categories": Permission.MANAGE_ORGAN_CATEGORIES,
  "/admin/organ-members": Permission.MANAGE_ORGAN_MEMBERS,
  "/admin/announcements": Permission.MANAGE_ANNOUNCEMENTS,
  "/admin/settings": Permission.MANAGE_SETTINGS,
  "/admin/users": Permission.MANAGE_USERS,
  "/admin/analytics": Permission.VIEW_DASHBOARD,
  "/admin/logs": Permission.MANAGE_USERS,
  "/admin/newsletter": Permission.MANAGE_NEWSLETTER,
  "/admin/member-form-fields": Permission.MANAGE_FORM_FIELDS,
};

/**
 * Check if a user role has a specific permission
 */
export function hasPermission(userRole: string, permission: Permission): boolean {
  const role = userRole.toUpperCase() as UserRole;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

/**
 * Check if a user role can access a specific page
 */
export function canAccessPage(userRole: string, page: string): boolean {
  // First, try exact match
  let permission = PAGE_PERMISSIONS[page];
  
  // If not found, try to match parent routes (for dynamic routes like /admin/events/new, /admin/events/[id], etc.)
  if (!permission) {
    // Remove trailing slash
    const normalizedPage = page.endsWith("/") ? page.slice(0, -1) : page;
    
    // Try to find parent route by checking progressively shorter paths
    const pathParts = normalizedPage.split("/").filter(Boolean);
    
    // Start from the full path and work backwards
    for (let i = pathParts.length; i >= 2; i--) {
      const parentPath = "/" + pathParts.slice(0, i).join("/");
      if (PAGE_PERMISSIONS[parentPath]) {
        permission = PAGE_PERMISSIONS[parentPath];
        break;
      }
    }
  }
  
  if (!permission) {
    // Unknown page - deny access by default
    return false;
  }
  
  return hasPermission(userRole, permission);
}

/**
 * Get all permissions for a user role
 */
export function getUserPermissions(userRole: string): Permission[] {
  const role = userRole.toUpperCase() as UserRole;
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if user can manage other users
 */
export function canManageUsers(userRole: string): boolean {
  return hasPermission(userRole, Permission.MANAGE_USERS);
}

/**
 * Check if user is Super Admin
 */
export function isSuperAdmin(userRole: string): boolean {
  return userRole.toUpperCase() === "SUPER_ADMIN";
}

