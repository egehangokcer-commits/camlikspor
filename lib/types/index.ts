// User roles
export const UserRole = {
  SUPER_ADMIN: "SUPER_ADMIN",
  DEALER_ADMIN: "DEALER_ADMIN",
  TRAINER: "TRAINER",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// Permissions
export const Permission = {
  // Pre-registration
  PRE_REGISTRATION_VIEW: "PRE_REGISTRATION_VIEW",
  PRE_REGISTRATION_CREATE: "PRE_REGISTRATION_CREATE",
  PRE_REGISTRATION_EDIT: "PRE_REGISTRATION_EDIT",
  PRE_REGISTRATION_DELETE: "PRE_REGISTRATION_DELETE",
  PRE_REGISTRATION_CONVERT: "PRE_REGISTRATION_CONVERT",

  // Students
  STUDENTS_VIEW: "STUDENTS_VIEW",
  STUDENTS_CREATE: "STUDENTS_CREATE",
  STUDENTS_EDIT: "STUDENTS_EDIT",
  STUDENTS_DELETE: "STUDENTS_DELETE",

  // Trainers
  TRAINERS_VIEW: "TRAINERS_VIEW",
  TRAINERS_CREATE: "TRAINERS_CREATE",
  TRAINERS_EDIT: "TRAINERS_EDIT",
  TRAINERS_DELETE: "TRAINERS_DELETE",
  TRAINERS_SALARY: "TRAINERS_SALARY",

  // Groups
  GROUPS_VIEW: "GROUPS_VIEW",
  GROUPS_CREATE: "GROUPS_CREATE",
  GROUPS_EDIT: "GROUPS_EDIT",
  GROUPS_DELETE: "GROUPS_DELETE",

  // Attendance
  ATTENDANCE_VIEW: "ATTENDANCE_VIEW",
  ATTENDANCE_TAKE: "ATTENDANCE_TAKE",

  // Accounting
  ACCOUNTING_PAYMENTS_VIEW: "ACCOUNTING_PAYMENTS_VIEW",
  ACCOUNTING_PAYMENTS_CREATE: "ACCOUNTING_PAYMENTS_CREATE",
  ACCOUNTING_CASH_REGISTER_VIEW: "ACCOUNTING_CASH_REGISTER_VIEW",
  ACCOUNTING_CASH_REGISTER_CREATE: "ACCOUNTING_CASH_REGISTER_CREATE",
  ACCOUNTING_DAILY_STATUS_VIEW: "ACCOUNTING_DAILY_STATUS_VIEW",
  ACCOUNTING_ONLINE_PAYMENTS_VIEW: "ACCOUNTING_ONLINE_PAYMENTS_VIEW",

  // Reports
  REPORTS_GENERAL: "REPORTS_GENERAL",
  REPORTS_ATTENDANCE: "REPORTS_ATTENDANCE",
  REPORTS_STUDENTS: "REPORTS_STUDENTS",
  REPORTS_MATERIALS: "REPORTS_MATERIALS",
  REPORTS_SALARIES: "REPORTS_SALARIES",
  REPORTS_BIRTHDAYS: "REPORTS_BIRTHDAYS",

  // SMS
  SMS_VIEW: "SMS_VIEW",
  SMS_SEND: "SMS_SEND",

  // Users
  USERS_VIEW: "USERS_VIEW",
  USERS_CREATE: "USERS_CREATE",
  USERS_EDIT: "USERS_EDIT",
  USERS_DELETE: "USERS_DELETE",

  // Settings
  SETTINGS_VIEW: "SETTINGS_VIEW",
  SETTINGS_EDIT: "SETTINGS_EDIT",

  // Dealers (SuperAdmin only)
  DEALERS_VIEW: "DEALERS_VIEW",
  DEALERS_CREATE: "DEALERS_CREATE",
  DEALERS_EDIT: "DEALERS_EDIT",
  DEALERS_DELETE: "DEALERS_DELETE",
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

// Gender
export const Gender = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  OTHER: "OTHER",
} as const;

export type Gender = (typeof Gender)[keyof typeof Gender];

// Pre-registration status
export const PreRegistrationStatus = {
  PENDING: "PENDING",
  CONTACTED: "CONTACTED",
  CONVERTED: "CONVERTED",
  CANCELLED: "CANCELLED",
} as const;

export type PreRegistrationStatus =
  (typeof PreRegistrationStatus)[keyof typeof PreRegistrationStatus];

// Attendance status
export const AttendanceStatus = {
  PRESENT: "PRESENT",
  ABSENT: "ABSENT",
  LATE: "LATE",
  EXCUSED: "EXCUSED",
} as const;

export type AttendanceStatus =
  (typeof AttendanceStatus)[keyof typeof AttendanceStatus];

// Payment types
export const PaymentType = {
  REGISTRATION_FEE: "REGISTRATION_FEE",
  MONTHLY_FEE: "MONTHLY_FEE",
  MATERIAL: "MATERIAL",
  OTHER: "OTHER",
} as const;

export type PaymentType = (typeof PaymentType)[keyof typeof PaymentType];

// Payment methods
export const PaymentMethod = {
  CASH: "CASH",
  CREDIT_CARD: "CREDIT_CARD",
  BANK_TRANSFER: "BANK_TRANSFER",
  ONLINE_PAYTR: "ONLINE_PAYTR",
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

// Payment status
export const PaymentStatus = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

// Transaction type
export const TransactionType = {
  INCOME: "INCOME",
  EXPENSE: "EXPENSE",
} as const;

export type TransactionType =
  (typeof TransactionType)[keyof typeof TransactionType];

// SMS status
export const SmsStatus = {
  PENDING: "PENDING",
  SENT: "SENT",
  FAILED: "FAILED",
  DELIVERED: "DELIVERED",
} as const;

export type SmsStatus = (typeof SmsStatus)[keyof typeof SmsStatus];

// Audit actions
export const AuditAction = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  VIEW: "VIEW",
} as const;

export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];

// Audit status
export const AuditStatus = {
  SUCCESS: "SUCCESS",
  FAILURE: "FAILURE",
} as const;

export type AuditStatus = (typeof AuditStatus)[keyof typeof AuditStatus];

// ============================================
// E-COMMERCE & SHOP TYPES
// ============================================

// Order status
export const OrderStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

// Shop payment status
export const ShopPaymentStatus = {
  PENDING: "PENDING",
  PAID: "PAID",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
} as const;

export type ShopPaymentStatus =
  (typeof ShopPaymentStatus)[keyof typeof ShopPaymentStatus];

// ============================================
// COMMISSION SYSTEM TYPES
// ============================================

// Commission status
export const CommissionStatus = {
  PENDING: "PENDING",
  PAID: "PAID",
  CANCELLED: "CANCELLED",
} as const;

export type CommissionStatus =
  (typeof CommissionStatus)[keyof typeof CommissionStatus];

// Payout frequency
export const PayoutFrequency = {
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  ON_DEMAND: "on-demand",
} as const;

export type PayoutFrequency =
  (typeof PayoutFrequency)[keyof typeof PayoutFrequency];

// ============================================
// DOMAIN TYPES
// ============================================

// Domain type
export const DealerDomainType = {
  CUSTOM: "custom",
  SUBDOMAIN: "subdomain",
} as const;

export type DealerDomainType =
  (typeof DealerDomainType)[keyof typeof DealerDomainType];

// Domain verification method
export const DomainVerificationMethod = {
  DNS: "dns",
  FILE: "file",
} as const;

export type DomainVerificationMethod =
  (typeof DomainVerificationMethod)[keyof typeof DomainVerificationMethod];

// ============================================
// WHITELABEL THEME TYPES
// ============================================

// Header style
export const HeaderStyle = {
  DEFAULT: "default",
  CENTERED: "centered",
  MINIMAL: "minimal",
} as const;

export type HeaderStyle = (typeof HeaderStyle)[keyof typeof HeaderStyle];

// Footer style
export const FooterStyle = {
  DEFAULT: "default",
  SIMPLE: "simple",
  EXPANDED: "expanded",
} as const;

export type FooterStyle = (typeof FooterStyle)[keyof typeof FooterStyle];

// Product grid columns
export const ProductGridCols = {
  TWO: 2,
  THREE: 3,
  FOUR: 4,
} as const;

export type ProductGridCols =
  (typeof ProductGridCols)[keyof typeof ProductGridCols];

// ============================================
// INTERFACES
// ============================================

// Sub-dealer interface
export interface SubDealer {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  parentDealerId: string | null;
  hierarchyLevel: number;
  inheritParentProducts: boolean;
  canCreateOwnProducts: boolean;
  isActive: boolean;
  customDomain: string | null;
  subdomain: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Sub-dealer list item (for tables)
export interface SubDealerListItem {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  isActive: boolean;
  hierarchyLevel: number;
  inheritParentProducts: boolean;
  canCreateOwnProducts: boolean;
  customDomain: string | null;
  subdomain: string | null;
  createdAt: Date;
  _count: {
    subDealers: number;
    products: number;
    orders: number;
  };
}

// Commission settings interface
export interface CommissionSettings {
  id: string;
  parentDealerId: string;
  childDealerId: string;
  productCommissionRate: number;
  orderCommissionRate: number;
  fixedOrderCommission: number;
  minimumPayout: number;
  payoutFrequency: string;
  isActive: boolean;
  effectiveFrom: Date;
  effectiveTo: Date | null;
}

// Commission transaction interface
export interface CommissionTransactionItem {
  id: string;
  orderId: string;
  orderNumber: string;
  orderTotal: number;
  commissionAmount: number;
  commissionRate: number;
  status: string;
  paidAt: Date | null;
  createdAt: Date;
  childDealerName: string;
}

// Commission report interface
export interface CommissionReport {
  totalCommission: number;
  pendingCommission: number;
  paidCommission: number;
  transactionCount: number;
  transactions: CommissionTransactionItem[];
}

// Theme settings interface
export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  mutedColor: string;
  headingFont: string;
  bodyFont: string;
}

// Layout settings interface
export interface LayoutSettings {
  headerStyle: HeaderStyle;
  footerStyle: FooterStyle;
  productGridCols: ProductGridCols;
  showHeroSection: boolean;
  showFeatures: boolean;
  showGallery: boolean;
  showShopPreview: boolean;
  showContact: boolean;
}

// Theme preset interface
export interface ThemePreset {
  id: string;
  name: string;
  description: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  mutedColor: string;
  headingFont: string;
  bodyFont: string;
  headerStyle: string;
  footerStyle: string;
  productGridCols: number;
  showHeroSection: boolean;
  showFeatures: boolean;
  showGallery: boolean;
  showShopPreview: boolean;
  showContact: boolean;
  isSystem: boolean;
}

// Dealer domain interface
export interface DealerDomainInfo {
  id: string;
  domain: string;
  type: string;
  verified: boolean;
  verifiedAt: Date | null;
  isPrimary: boolean;
  isActive: boolean;
  verificationToken: string;
  verificationMethod: string;
  createdAt: Date;
}

// Dealer with theme for public pages
export interface DealerPublicInfo {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  heroImage: string | null;
  heroTitle: string | null;
  heroSubtitle: string | null;
  aboutText: string | null;
  contactAddress: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  socialFacebook: string | null;
  socialInstagram: string | null;
  socialTwitter: string | null;
  socialYoutube: string | null;
  features: string | null;
  themeSettings: string | null;
  layoutSettings: string | null;
  customCss: string | null;
  faviconUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  themePreset: ThemePreset | null;
}
