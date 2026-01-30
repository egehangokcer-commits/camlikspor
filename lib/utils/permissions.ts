import { Permission, UserRole } from "@/lib/types";

// Role-based default permissions
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    // Only dealer management for Super Admin
    Permission.DEALERS_VIEW,
    Permission.DEALERS_CREATE,
    Permission.DEALERS_EDIT,
    Permission.DEALERS_DELETE,
  ],
  [UserRole.DEALER_ADMIN]: [
    // Pre-registration
    Permission.PRE_REGISTRATION_VIEW,
    Permission.PRE_REGISTRATION_CREATE,
    Permission.PRE_REGISTRATION_EDIT,
    Permission.PRE_REGISTRATION_DELETE,
    Permission.PRE_REGISTRATION_CONVERT,
    // Students
    Permission.STUDENTS_VIEW,
    Permission.STUDENTS_CREATE,
    Permission.STUDENTS_EDIT,
    Permission.STUDENTS_DELETE,
    // Trainers
    Permission.TRAINERS_VIEW,
    Permission.TRAINERS_CREATE,
    Permission.TRAINERS_EDIT,
    Permission.TRAINERS_DELETE,
    Permission.TRAINERS_SALARY,
    // Groups
    Permission.GROUPS_VIEW,
    Permission.GROUPS_CREATE,
    Permission.GROUPS_EDIT,
    Permission.GROUPS_DELETE,
    // Attendance
    Permission.ATTENDANCE_VIEW,
    Permission.ATTENDANCE_TAKE,
    // Accounting
    Permission.ACCOUNTING_PAYMENTS_VIEW,
    Permission.ACCOUNTING_PAYMENTS_CREATE,
    Permission.ACCOUNTING_CASH_REGISTER_VIEW,
    Permission.ACCOUNTING_CASH_REGISTER_CREATE,
    Permission.ACCOUNTING_DAILY_STATUS_VIEW,
    Permission.ACCOUNTING_ONLINE_PAYMENTS_VIEW,
    // Reports
    Permission.REPORTS_GENERAL,
    Permission.REPORTS_ATTENDANCE,
    Permission.REPORTS_STUDENTS,
    Permission.REPORTS_MATERIALS,
    Permission.REPORTS_SALARIES,
    Permission.REPORTS_BIRTHDAYS,
    // SMS
    Permission.SMS_VIEW,
    Permission.SMS_SEND,
    // Users
    Permission.USERS_VIEW,
    Permission.USERS_CREATE,
    Permission.USERS_EDIT,
    Permission.USERS_DELETE,
    // Settings
    Permission.SETTINGS_VIEW,
    Permission.SETTINGS_EDIT,
  ],
  [UserRole.TRAINER]: [
    Permission.ATTENDANCE_VIEW,
    Permission.ATTENDANCE_TAKE,
    Permission.STUDENTS_VIEW,
    Permission.GROUPS_VIEW,
  ],
};

export function hasPermission(
  userPermissions: string[],
  requiredPermission: Permission
): boolean {
  return userPermissions.includes(requiredPermission);
}

export function hasAnyPermission(
  userPermissions: string[],
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.some((p) => userPermissions.includes(p));
}

export function hasAllPermissions(
  userPermissions: string[],
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.every((p) => userPermissions.includes(p));
}

export function getDefaultPermissionsForRole(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

// Menu items with required permissions
export interface MenuItem {
  key: string;
  labelKey: string; // i18n key
  href: string;
  icon?: string;
  permission?: Permission;
  children?: MenuItem[];
}

// Menu items for DEALER_ADMIN and TRAINER
export const MENU_ITEMS: MenuItem[] = [
  {
    key: "dashboard",
    labelKey: "sidebar.dashboard",
    href: "/dashboard",
  },
  {
    key: "pre-registration",
    labelKey: "sidebar.preRegistration",
    href: "/pre-registration",
    permission: Permission.PRE_REGISTRATION_VIEW,
  },
  {
    key: "students",
    labelKey: "sidebar.students",
    href: "/students",
    permission: Permission.STUDENTS_VIEW,
  },
  {
    key: "trainers",
    labelKey: "sidebar.trainers",
    href: "/trainers",
    permission: Permission.TRAINERS_VIEW,
  },
  {
    key: "groups",
    labelKey: "sidebar.groups",
    href: "/groups",
    permission: Permission.GROUPS_VIEW,
  },
  {
    key: "attendance",
    labelKey: "sidebar.attendance",
    href: "/attendance",
    permission: Permission.ATTENDANCE_VIEW,
  },
  {
    key: "accounting",
    labelKey: "sidebar.accounting",
    href: "/accounting/payments",
    permission: Permission.ACCOUNTING_PAYMENTS_VIEW,
    children: [
      {
        key: "payments",
        labelKey: "sidebar.payments",
        href: "/accounting/payments",
        permission: Permission.ACCOUNTING_PAYMENTS_VIEW,
      },
      {
        key: "cash-register",
        labelKey: "sidebar.cashRegister",
        href: "/accounting/cash-register",
        permission: Permission.ACCOUNTING_CASH_REGISTER_VIEW,
      },
      {
        key: "daily-status",
        labelKey: "sidebar.dailyStatus",
        href: "/accounting/daily-status",
        permission: Permission.ACCOUNTING_DAILY_STATUS_VIEW,
      },
      {
        key: "online-payments",
        labelKey: "sidebar.onlinePayments",
        href: "/accounting/online-payments",
        permission: Permission.ACCOUNTING_ONLINE_PAYMENTS_VIEW,
      },
    ],
  },
  {
    key: "reports",
    labelKey: "sidebar.reports",
    href: "/reports",
    permission: Permission.REPORTS_GENERAL,
  },
  {
    key: "sms",
    labelKey: "sidebar.sms",
    href: "/sms",
    permission: Permission.SMS_VIEW,
  },
  {
    key: "users",
    labelKey: "sidebar.users",
    href: "/users",
    permission: Permission.USERS_VIEW,
  },
  {
    key: "settings",
    labelKey: "sidebar.settings",
    href: "/settings",
    permission: Permission.SETTINGS_VIEW,
  },
  {
    key: "products",
    labelKey: "sidebar.products",
    href: "/products",
    permission: Permission.SETTINGS_VIEW,
  },
  {
    key: "orders",
    labelKey: "sidebar.orders",
    href: "/orders",
    permission: Permission.SETTINGS_VIEW,
  },
  {
    key: "sub-dealers",
    labelKey: "sidebar.subDealers",
    href: "/sub-dealers",
    permission: Permission.SETTINGS_VIEW,
  },
  {
    key: "customization",
    labelKey: "sidebar.customization",
    href: "/customization",
    permission: Permission.SETTINGS_VIEW,
  },
  {
    key: "commissions",
    labelKey: "sidebar.commissions",
    href: "/commissions",
    permission: Permission.SETTINGS_VIEW,
  },
];

// Menu items for SUPER_ADMIN (only dealer management)
export const SUPER_ADMIN_MENU_ITEMS: MenuItem[] = [
  {
    key: "dashboard",
    labelKey: "sidebar.dashboard",
    href: "/dashboard",
  },
  {
    key: "dealers",
    labelKey: "sidebar.dealers",
    href: "/dealers",
    permission: Permission.DEALERS_VIEW,
  },
  {
    key: "dealer-payments",
    labelKey: "sidebar.dealerPayments",
    href: "/dealers/payments",
    permission: Permission.DEALERS_VIEW,
  },
];

export function getAccessibleMenuItems(
  userPermissions: string[],
  role: UserRole
): MenuItem[] {
  // SUPER_ADMIN gets a special menu (only dealer management)
  if (role === UserRole.SUPER_ADMIN) {
    return SUPER_ADMIN_MENU_ITEMS;
  }

  // For other roles, filter based on permissions
  const filterItems = (items: MenuItem[]): MenuItem[] => {
    return items
      .filter((item) => {
        if (!item.permission) return true;
        return userPermissions.includes(item.permission);
      })
      .map((item) => ({
        ...item,
        children: item.children ? filterItems(item.children) : undefined,
      }))
      .filter((item) => !item.children || item.children.length > 0);
  };

  return filterItems(MENU_ITEMS);
}
