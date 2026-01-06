import { auth } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { i18n, type Locale } from "@/lib/i18n/config";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/lib/types";
import { SettingsPageClient } from "@/components/settings/settings-page-client";
import {
  createFacilityAction,
  updateFacilityAction,
  deleteFacilityAction,
} from "@/lib/actions/settings";

interface FacilitiesPageProps {
  params: Promise<{ locale: string }>;
}

export default async function FacilitiesPage({ params }: FacilitiesPageProps) {
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

  const facilities = await prisma.facility.findMany({
    where: dealerId ? { dealerId } : {},
    include: {
      location: { select: { name: true } },
    },
    orderBy: { name: "asc" },
  });

  type Facility = (typeof facilities)[number];

  // Flatten location name for display
  const formattedFacilities = facilities.map((facility: Facility) => ({
    ...facility,
    locationName: facility.location.name,
  }));

  return (
    <SettingsPageClient
      title={dictionary.settings.facilities}
      subtitle="Tesisleri yonetin"
      iconName="Building2"
      items={formattedFacilities}
      columns={[
        { key: "name", label: "Tesis Adi" },
        { key: "locationName", label: "Sube" },
        { key: "address", label: "Adres" },
      ]}
      dialogTitle="Tesis"
      dialogFields={[
        { name: "name", label: "Tesis Adi", type: "text", required: true },
        { name: "address", label: "Adres", type: "textarea" },
      ]}
      addButtonLabel="Tesis Ekle"
      createAction={createFacilityAction}
      updateAction={updateFacilityAction}
      deleteAction={deleteFacilityAction}
      dictionary={dictionary}
    />
  );
}
