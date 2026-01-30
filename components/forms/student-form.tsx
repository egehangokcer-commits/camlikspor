"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  createStudentAction,
  updateStudentAction,
  type StudentFormState,
} from "@/lib/actions/students";

interface Branch {
  id: string;
  name: string;
}

interface Location {
  id: string;
  name: string;
}

interface Facility {
  id: string;
  name: string;
}

interface DiscountType {
  id: string;
  name: string;
  percentage: number;
}

interface StudentData {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  gender: string;
  tcKimlikNo?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  parentName: string;
  parentPhone: string;
  parentEmail?: string | null;
  parentTcKimlik?: string | null;
  emergencyContact?: string | null;
  emergencyPhone?: string | null;
  branchId: string;
  locationId: string;
  facilityId: string;
  monthlyFee: number;
  registrationFee: number;
  discountTypeId?: string | null;
  notes?: string | null;
}

interface Dictionary {
  common: {
    save: string;
    cancel: string;
    [key: string]: string;
  };
  students: {
    firstName: string;
    lastName: string;
    birthDate: string;
    gender: string;
    male: string;
    female: string;
    tcKimlik: string;
    phone: string;
    email: string;
    address: string;
    branch: string;
    location: string;
    facility: string;
    parentName: string;
    parentPhone: string;
    parentEmail: string;
    parentTcKimlik: string;
    emergencyContact: string;
    emergencyPhone: string;
    monthlyFee: string;
    registrationFee: string;
    discountType: string;
    notes: string;
    personalInfo: string;
    personalInfoDesc: string;
    parentInfo: string;
    parentInfoDesc: string;
    educationInfo: string;
    educationInfoDesc: string;
    feeInfo: string;
    feeInfoDesc: string;
    additionalInfo: string;
    noDiscount: string;
    selectGender: string;
    selectBranch: string;
    selectLocation: string;
    selectFacility: string;
    selectDiscount: string;
    update: string;
    [key: string]: string;
  };
  errors: Record<string, string>;
  success: Record<string, string>;
  [key: string]: unknown;
}

interface StudentFormProps {
  student?: StudentData;
  branches: Branch[];
  locations: Location[];
  facilities: Facility[];
  discountTypes: DiscountType[];
  locale: string;
  dictionary: Dictionary;
}

export function StudentForm({
  student,
  branches,
  locations,
  facilities,
  discountTypes,
  locale,
  dictionary,
}: StudentFormProps) {
  const router = useRouter();
  const isEditing = !!student;
  const t = dictionary.students;
  const common = dictionary.common;

  const boundUpdateAction = student
    ? updateStudentAction.bind(null, student.id)
    : createStudentAction;

  const [state, formAction, isPending] = useActionState<StudentFormState, FormData>(
    boundUpdateAction,
    { errors: {}, message: "" }
  );

  useEffect(() => {
    if (state.success && state.messageKey) {
      const message = dictionary.success[state.messageKey] || state.message || state.messageKey;
      toast.success(message);
      router.push(`/${locale}/students`);
    } else if (state.messageKey && !state.success) {
      const message = dictionary.errors[state.messageKey] || state.message || state.messageKey;
      toast.error(message);
    }
  }, [state, router, locale, dictionary]);

  return (
    <form action={formAction} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t.personalInfo}</CardTitle>
          <CardDescription>{t.personalInfoDesc}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">{t.firstName} *</Label>
            <Input
              id="firstName"
              name="firstName"
              defaultValue={student?.firstName}
              required
            />
            {state.errors?.firstName && (
              <p className="text-sm text-destructive">{state.errors.firstName[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">{t.lastName} *</Label>
            <Input
              id="lastName"
              name="lastName"
              defaultValue={student?.lastName}
              required
            />
            {state.errors?.lastName && (
              <p className="text-sm text-destructive">{state.errors.lastName[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate">{t.birthDate} *</Label>
            <Input
              id="birthDate"
              name="birthDate"
              type="date"
              defaultValue={
                student?.birthDate
                  ? new Date(student.birthDate).toISOString().split("T")[0]
                  : ""
              }
              required
            />
            {state.errors?.birthDate && (
              <p className="text-sm text-destructive">{state.errors.birthDate[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">{t.gender} *</Label>
            <Select name="gender" defaultValue={student?.gender || ""}>
              <SelectTrigger>
                <SelectValue placeholder={t.selectGender} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">{t.male}</SelectItem>
                <SelectItem value="FEMALE">{t.female}</SelectItem>
              </SelectContent>
            </Select>
            {state.errors?.gender && (
              <p className="text-sm text-destructive">{state.errors.gender[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tcKimlikNo">{t.tcKimlik}</Label>
            <Input
              id="tcKimlikNo"
              name="tcKimlikNo"
              defaultValue={student?.tcKimlikNo || ""}
              maxLength={11}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t.phone}</Label>
            <PhoneInput
              id="phone"
              name="phone"
              defaultValue={student?.phone || ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t.email}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={student?.email || ""}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">{t.address}</Label>
            <Textarea
              id="address"
              name="address"
              defaultValue={student?.address || ""}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.parentInfo}</CardTitle>
          <CardDescription>{t.parentInfoDesc}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="parentName">{t.parentName} *</Label>
            <Input
              id="parentName"
              name="parentName"
              defaultValue={student?.parentName}
              required
            />
            {state.errors?.parentName && (
              <p className="text-sm text-destructive">{state.errors.parentName[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentPhone">{t.parentPhone} *</Label>
            <PhoneInput
              id="parentPhone"
              name="parentPhone"
              defaultValue={student?.parentPhone}
              required
            />
            {state.errors?.parentPhone && (
              <p className="text-sm text-destructive">{state.errors.parentPhone[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentEmail">{t.parentEmail}</Label>
            <Input
              id="parentEmail"
              name="parentEmail"
              type="email"
              defaultValue={student?.parentEmail || ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentTcKimlik">{t.parentTcKimlik}</Label>
            <Input
              id="parentTcKimlik"
              name="parentTcKimlik"
              defaultValue={student?.parentTcKimlik || ""}
              maxLength={11}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyContact">{t.emergencyContact}</Label>
            <Input
              id="emergencyContact"
              name="emergencyContact"
              defaultValue={student?.emergencyContact || ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyPhone">{t.emergencyPhone}</Label>
            <PhoneInput
              id="emergencyPhone"
              name="emergencyPhone"
              defaultValue={student?.emergencyPhone || ""}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.educationInfo}</CardTitle>
          <CardDescription>{t.educationInfoDesc}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="branchId">{t.branch} *</Label>
            <Select name="branchId" defaultValue={student?.branchId || ""}>
              <SelectTrigger>
                <SelectValue placeholder={t.selectBranch} />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.errors?.branchId && (
              <p className="text-sm text-destructive">{state.errors.branchId[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="locationId">{t.location} *</Label>
            <Select name="locationId" defaultValue={student?.locationId || ""}>
              <SelectTrigger>
                <SelectValue placeholder={t.selectLocation} />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.errors?.locationId && (
              <p className="text-sm text-destructive">{state.errors.locationId[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="facilityId">{t.facility} *</Label>
            <Select name="facilityId" defaultValue={student?.facilityId || ""}>
              <SelectTrigger>
                <SelectValue placeholder={t.selectFacility} />
              </SelectTrigger>
              <SelectContent>
                {facilities.map((facility) => (
                  <SelectItem key={facility.id} value={facility.id}>
                    {facility.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.errors?.facilityId && (
              <p className="text-sm text-destructive">{state.errors.facilityId[0]}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.feeInfo}</CardTitle>
          <CardDescription>{t.feeInfoDesc}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="monthlyFee">{t.monthlyFee} (TL)</Label>
            <Input
              id="monthlyFee"
              name="monthlyFee"
              type="number"
              min="0"
              step="0.01"
              defaultValue={student?.monthlyFee || 0}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="registrationFee">{t.registrationFee} (TL)</Label>
            <Input
              id="registrationFee"
              name="registrationFee"
              type="number"
              min="0"
              step="0.01"
              defaultValue={student?.registrationFee || 0}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discountTypeId">{t.discountType}</Label>
            <Select name="discountTypeId" defaultValue={student?.discountTypeId || "none"}>
              <SelectTrigger>
                <SelectValue placeholder={t.selectDiscount} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t.noDiscount}</SelectItem>
                {discountTypes.map((discount) => (
                  <SelectItem key={discount.id} value={discount.id}>
                    {discount.name} (%{discount.percentage})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.additionalInfo}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="notes">{t.notes}</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={student?.notes || ""}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? t.update : common.save}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/${locale}/students`)}
        >
          {common.cancel}
        </Button>
      </div>
    </form>
  );
}
