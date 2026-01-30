import { auth } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { i18n, type Locale } from "@/lib/i18n/config";
import { getStudents, type StudentListItem } from "@/lib/data/students";
import { UserRole } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Phone, MoreHorizontal, Eye, Edit, Trash } from "lucide-react";
import Link from "next/link";
import { format, differenceInYears } from "date-fns";
import { tr, enUS, es } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StudentsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    page?: string;
    branch?: string;
    facility?: string;
    search?: string;
  }>;
}

const dateLocales = {
  tr: tr,
  en: enUS,
  es: es,
};

export default async function StudentsPage({
  params,
  searchParams,
}: StudentsPageProps) {
  const session = await auth();
  const { locale: localeParam } = await params;
  const {
    page = "1",
    branch = "",
    facility = "",
    search = "",
  } = await searchParams;

  const locale = i18n.locales.includes(localeParam as Locale)
    ? (localeParam as Locale)
    : i18n.defaultLocale;
  const dictionary = await getDictionary(locale);
  const dateLocale = dateLocales[locale];

  const dealerId =
    session?.user?.role === UserRole.SUPER_ADMIN
      ? undefined
      : session?.user?.dealerId || undefined;

  const { data: students, total } = await getStudents(
    {
      dealerId,
      branchId: branch || undefined,
      facilityId: facility || undefined,
      search: search || undefined,
      isActive: true,
    },
    parseInt(page),
    10
  );

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {dictionary.students.title}
          </h1>
          <p className="text-muted-foreground">
            {dictionary.students.studentList}
          </p>
        </div>
        <Link href={`/${locale}/students/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {dictionary.students.addStudent}
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {dictionary.common.showing} {students.length} {dictionary.common.of}{" "}
            {total} {dictionary.common.entries}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              {dictionary.common.noData}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{dictionary.students.studentNumber}</TableHead>
                  <TableHead>{dictionary.students.fullName}</TableHead>
                  <TableHead>{dictionary.students.age}</TableHead>
                  <TableHead>{dictionary.students.branch}</TableHead>
                  <TableHead>{dictionary.students.facility}</TableHead>
                  <TableHead>{dictionary.students.parentPhone}</TableHead>
                  <TableHead>{dictionary.common.status}</TableHead>
                  <TableHead className="text-right">
                    {dictionary.common.actions}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student: StudentListItem) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-mono">
                      {student.studentNumber}
                    </TableCell>
                    <TableCell className="font-medium">
                      {student.firstName} {student.lastName}
                    </TableCell>
                    <TableCell>
                      {differenceInYears(new Date(), student.birthDate)}
                    </TableCell>
                    <TableCell>{student.branch.name}</TableCell>
                    <TableCell>{student.facility.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {student.parentPhone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={student.isActive ? "default" : "secondary"}
                      >
                        {student.isActive
                          ? dictionary.common.active
                          : dictionary.common.inactive}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/${locale}/students/${student.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              {dictionary.students.view}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/${locale}/students/${student.id}/edit`}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              {dictionary.common.edit}
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/${locale}/students?page=${p}&branch=${branch}&facility=${facility}&search=${search}`}
            >
              <Button
                variant={p === parseInt(page) ? "default" : "outline"}
                size="sm"
              >
                {p}
              </Button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
