import { auth } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { i18n, type Locale } from "@/lib/i18n/config";
import { UserRole } from "@/lib/types";
import { getGroupById } from "@/lib/data/groups";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Edit,
  Users,
  Calendar,
  MapPin,
  GitBranch,
  User,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface GroupDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

const dayNames: Record<number, string> = {
  0: "Pazar",
  1: "Pazartesi",
  2: "Sali",
  3: "Carsamba",
  4: "Persembe",
  5: "Cuma",
  6: "Cumartesi",
};

export default async function GroupDetailPage({
  params,
}: GroupDetailPageProps) {
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

  const group = await getGroupById(id);

  if (!group || (dealerId && group.dealerId !== dealerId)) {
    notFound();
  }

  type Schedule = (typeof group.schedules)[number];
  type TrainerGroup = (typeof group.trainers)[number];
  type StudentGroup = (typeof group.students)[number];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/groups`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
            <p className="text-muted-foreground">Grup Detaylari</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/${locale}/groups/${id}/edit`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              {dictionary.common.edit}
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Grup Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Grup Adi</p>
                <p className="font-medium">{group.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Kapasite</p>
                <p className="font-medium">
                  {group.students.length} / {group.maxCapacity}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Durum</p>
                <Badge variant={group.isActive ? "default" : "secondary"}>
                  {group.isActive
                    ? dictionary.common.active
                    : dictionary.common.inactive}
                </Badge>
              </div>
            </div>
            {group.description && (
              <div>
                <p className="text-sm text-muted-foreground">Aciklama</p>
                <p>{group.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Konum Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <GitBranch className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Brans</p>
                  <p className="font-medium">{group.branch.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Tesis</p>
                  <p className="font-medium">{group.facility.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Donem</p>
                  <p className="font-medium">{group.period.name}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {group.schedules.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Ders Programi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {group.schedules
                  .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                  .map((schedule: Schedule) => (
                    <div
                      key={schedule.id}
                      className="flex items-center justify-between border-b pb-2 last:border-0"
                    >
                      <span className="font-medium">
                        {dayNames[schedule.dayOfWeek]}
                      </span>
                      <span className="text-muted-foreground">
                        {schedule.startTime} - {schedule.endTime}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {group.trainers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Antrenorler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {group.trainers.map((tg: TrainerGroup) => (
                  <div
                    key={tg.trainer.id}
                    className="flex items-center justify-between"
                  >
                    <span>
                      {tg.trainer.firstName} {tg.trainer.lastName}
                    </span>
                    {tg.isPrimary && (
                      <Badge variant="outline">Ana Antrenor</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {group.students.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ogrenciler ({group.students.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ogrenci No</TableHead>
                  <TableHead>Ad Soyad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.students.map((sg: StudentGroup) => (
                  <TableRow key={sg.student.id}>
                    <TableCell className="font-mono">
                      {sg.student.studentNumber}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/${locale}/students/${sg.student.id}`}
                        className="hover:underline"
                      >
                        {sg.student.firstName} {sg.student.lastName}
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
