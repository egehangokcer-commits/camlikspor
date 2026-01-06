import { auth } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { i18n, type Locale } from "@/lib/i18n/config";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/lib/types";
import { SettingsPageClient } from "@/components/settings/settings-page-client";
import {
  createPeriodAction,
  updatePeriodAction,
  deletePeriodAction,
} from "@/lib/actions/settings";
import { format } from "date-fns";

interface PeriodsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function PeriodsPage({ params }: PeriodsPageProps) {
  const session = await auth();
  const { locale: localeParam } = await params;

  const locale = i18n.locales.includes(localeParam as Locale)
    ? (localeParam as Locale)
    : i18n.defaultLocale;
  const dictionary = await getDictionary(locale);

  const dealerId =
    session?.user?.role === UserRole.SUPER_ADMIN
      ? undefined
      : session?.user?.dealerId || undefined;

  const periods = await prisma.period.findMany({
    where: dealerId ? { dealerId } : {},
    orderBy: { startDate: "desc" },
  });

  type Period = (typeof periods)[number];

  // Format dates for display and edit
  const formattedPeriods = periods.map((period: Period) => ({
    ...period,
    startDateFormatted: format(period.startDate, "dd.MM.yyyy"),
    endDateFormatted: format(period.endDate, "dd.MM.yyyy"),
    startDate: format(period.startDate, "yyyy-MM-dd"),
    endDate: format(period.endDate, "yyyy-MM-dd"),
  }));

  return (
    <SettingsPageClient
      title={dictionary.settings.periods}
      subtitle="Egitim donemlerini yonetin"
      iconName="Calendar"
      items={formattedPeriods}
      columns={[
        { key: "name", label: "Donem Adi" },
        { key: "startDateFormatted", label: "Baslangic" },
        { key: "endDateFormatted", label: "Bitis" },
      ]}
      dialogTitle="Donem"
      dialogFields={[
        { name: "name", label: "Donem Adi", type: "text", required: true },
        { name: "startDate", label: "Baslangic Tarihi", type: "date", required: true },
        { name: "endDate", label: "Bitis Tarihi", type: "date", required: true },
      ]}
      addButtonLabel="Donem Ekle"
      createAction={createPeriodAction}
      updateAction={updatePeriodAction}
      deleteAction={deletePeriodAction}
      dictionary={dictionary}
    />
  );
}
