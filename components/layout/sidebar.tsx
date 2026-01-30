"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  UserPlus,
  Users,
  Dumbbell,
  UsersRound,
  ClipboardCheck,
  Calculator,
  FileText,
  MessageSquare,
  UserCog,
  Settings,
  Building2,
  ChevronDown,
  Banknote,
  Package,
  ShoppingCart,
  Store,
  Palette,
  Coins,
} from "lucide-react";
import { UserRole } from "@/lib/types";
import {
  getAccessibleMenuItems,
  type MenuItem,
} from "@/lib/utils/permissions";
import { useState } from "react";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

const iconMap: Record<string, React.ElementType> = {
  dashboard: Home,
  "pre-registration": UserPlus,
  students: Users,
  trainers: Dumbbell,
  groups: UsersRound,
  attendance: ClipboardCheck,
  accounting: Calculator,
  reports: FileText,
  sms: MessageSquare,
  users: UserCog,
  settings: Settings,
  dealers: Building2,
  "dealer-payments": Banknote,
  products: Package,
  orders: ShoppingCart,
  "sub-dealers": Store,
  customization: Palette,
  commissions: Coins,
};

interface SidebarProps {
  locale: string;
  userRole: UserRole;
  userPermissions: string[];
  dictionary: Dictionary["sidebar"];
}

function SidebarItem({
  item,
  locale,
  currentPath,
  dictionary,
}: {
  item: MenuItem;
  locale: string;
  currentPath: string;
  dictionary: Dictionary["sidebar"];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = iconMap[item.key] || Home;
  const href = `/${locale}${item.href}`;
  // For items with children, use startsWith for active state
  // For items without children, use exact match only
  const hasChildren = item.children && item.children.length > 0;
  const isActive = hasChildren
    ? currentPath === href || currentPath.startsWith(`${href}/`)
    : currentPath === href;

  // Get label from dictionary
  const labelKey = item.labelKey.split(".")[1] as keyof Dictionary["sidebar"];
  const label = dictionary[labelKey] || item.key;

  if (item.children && item.children.length > 0) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            isActive
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </button>
        {isOpen && (
          <div className="ml-4 mt-1 space-y-1">
            {item.children.map((child) => (
              <SidebarItem
                key={child.key}
                item={child}
                locale={locale}
                currentPath={currentPath}
                dictionary={dictionary}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  );
}

export function Sidebar({
  locale,
  userRole,
  userPermissions,
  dictionary,
}: SidebarProps) {
  const pathname = usePathname();
  const menuItems = getAccessibleMenuItems(userPermissions, userRole);

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r bg-card">
      <div className="p-6 border-b">
        <Link href={`/${locale}/dashboard`}>
          <h1 className="text-xl font-bold">Futbol Okullari</h1>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.key}
            item={item}
            locale={locale}
            currentPath={pathname}
            dictionary={dictionary}
          />
        ))}
      </nav>
    </aside>
  );
}
