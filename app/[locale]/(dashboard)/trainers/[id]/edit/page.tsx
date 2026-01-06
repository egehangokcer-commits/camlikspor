import { auth } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { i18n, type Locale } from "@/lib/i18n/config";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/lib/types";
import { getTrainerById } from "@/lib/data/trainers";
import { TrainerForm } from "@/components/forms/trainer-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";

interface EditTrainerPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function EditTrainerPage({ params }: EditTrainerPageProps) {
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

  const trainerData = await getTrainerById(id);

  if (!trainerData || (dealerId && trainerData.dealerId !== dealerId)) {
    notFound();
  }

  // Calculate total paid salary from salary payments
  type SalaryPayment = NonNullable<typeof trainerData.salaryPayments>[number];
  const totalPaidSalary = trainerData.salaryPayments?.reduce(
    (sum: number, payment: SalaryPayment) => sum + (payment.amount || 0),
    0
  ) || 0;

  const trainer = {
    ...trainerData,
    totalPaidSalary,
  };

  const [branches, taskDefinitions] = await Promise.all([
    prisma.branch.findMany({
      where: dealerId ? { dealerId, isActive: true } : { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.taskDefinition.findMany({
      where: dealerId ? { dealerId, isActive: true } : { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/${locale}/trainers/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {dictionary.common.edit}: {trainer.firstName} {trainer.lastName}
          </h1>
          <p className="text-muted-foreground">
            Antrenor bilgilerini guncelleyin
          </p>
        </div>
      </div>

      <TrainerForm
        trainer={trainer}
        branches={branches}
        taskDefinitions={taskDefinitions}
        locale={locale}
        dictionary={dictionary}
      />
    </div>
  );
}
