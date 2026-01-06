import { auth } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { i18n, type Locale } from "@/lib/i18n/config";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GroupSmsForm } from "./sms-form";

interface GroupSmsPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function GroupSmsPage({ params }: GroupSmsPageProps) {
  const session = await auth();
  const { locale: localeParam, id } = await params;

  const locale = i18n.locales.includes(localeParam as Locale)
    ? (localeParam as Locale)
    : i18n.defaultLocale;
  const dictionary = await getDictionary(locale);

  const dealerId =
    session?.user?.role === UserRole.SUPER_ADMIN
      ? undefined
      : session?.user?.dealerId || undefined;

  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      students: {
        where: { isActive: true },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              parentPhone: true,
            },
          },
        },
      },
    },
  });

  if (!group || (dealerId && group.dealerId !== dealerId)) {
    notFound();
  }

  // Get unique phone numbers
  type StudentGroup = (typeof group.students)[number];
  const phoneNumbers: { phone: string; name: string; type: string }[] = [];
  group.students.forEach((sg: StudentGroup) => {
    if (sg.student.phone) {
      phoneNumbers.push({
        phone: sg.student.phone,
        name: `${sg.student.firstName} ${sg.student.lastName}`,
        type: "Ogrenci",
      });
    }
    if (sg.student.parentPhone) {
      phoneNumbers.push({
        phone: sg.student.parentPhone,
        name: `${sg.student.firstName} ${sg.student.lastName} (Veli)`,
        type: "Veli",
      });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/${locale}/groups/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {group.name} - SMS Gonder
          </h1>
          <p className="text-muted-foreground">
            Bu gruptaki ogrenci ve velilere SMS gonder
          </p>
        </div>
      </div>

      <GroupSmsForm
        groupId={id}
        groupName={group.name}
        phoneNumbers={phoneNumbers}
        locale={locale}
        dictionary={dictionary}
      />
    </div>
  );
}
