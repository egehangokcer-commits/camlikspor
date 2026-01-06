"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useEffect } from "react";
import {
  createPreRegistrationAction,
  updatePreRegistrationAction,
  type PreRegistrationFormState,
} from "@/lib/actions/pre-registration";

interface Branch {
  id: string;
  name: string;
}

interface PreRegistrationFormProps {
  locale: string;
  dictionary: {
    common: {
      save: string;
      cancel: string;
    };
    students: {
      firstName: string;
      lastName: string;
      birthDate: string;
      gender: string;
      male: string;
      female: string;
      other: string;
      parentName: string;
      parentPhone: string;
      parentEmail: string;
      branch: string;
      notes: string;
    };
    preRegistration: {
      addNew: string;
      source: {
        website: string;
        phone: string;
        walkIn: string;
      };
    };
  };
  branches?: Branch[];
  initialData?: {
    id: string;
    firstName: string;
    lastName: string;
    birthDate?: Date | null;
    gender?: string | null;
    parentName: string;
    parentPhone: string;
    parentEmail?: string | null;
    branchInterest?: string | null;
    notes?: string | null;
    source?: string | null;
  };
}

const initialState: PreRegistrationFormState = {};

export function PreRegistrationForm({
  locale,
  dictionary,
  branches = [],
  initialData,
}: PreRegistrationFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const formAction = isEditing
    ? updatePreRegistrationAction.bind(null, initialData.id)
    : createPreRegistrationAction;

  const [state, action, isPending] = useActionState(formAction, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      router.push(`/${locale}/pre-registration`);
    }
    if (state.errors?._form) {
      toast.error(state.errors._form[0]);
    }
  }, [state, router, locale]);

  return (
    <form action={action}>
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? "Onkayit Duzenle" : dictionary.preRegistration.addNew}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Student Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">{dictionary.students.firstName} *</Label>
              <Input
                id="firstName"
                name="firstName"
                defaultValue={initialData?.firstName}
                disabled={isPending}
              />
              {state.errors?.firstName && (
                <p className="text-sm text-destructive">{state.errors.firstName[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{dictionary.students.lastName} *</Label>
              <Input
                id="lastName"
                name="lastName"
                defaultValue={initialData?.lastName}
                disabled={isPending}
              />
              {state.errors?.lastName && (
                <p className="text-sm text-destructive">{state.errors.lastName[0]}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="birthDate">{dictionary.students.birthDate}</Label>
              <Input
                id="birthDate"
                name="birthDate"
                type="date"
                defaultValue={
                  initialData?.birthDate
                    ? new Date(initialData.birthDate).toISOString().split("T")[0]
                    : undefined
                }
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">{dictionary.students.gender}</Label>
              <Select name="gender" defaultValue={initialData?.gender || undefined}>
                <SelectTrigger>
                  <SelectValue placeholder="Seciniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">{dictionary.students.male}</SelectItem>
                  <SelectItem value="FEMALE">{dictionary.students.female}</SelectItem>
                  <SelectItem value="OTHER">{dictionary.students.other}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Parent Info */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Veli Bilgileri</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="parentName">{dictionary.students.parentName} *</Label>
                <Input
                  id="parentName"
                  name="parentName"
                  defaultValue={initialData?.parentName}
                  disabled={isPending}
                />
                {state.errors?.parentName && (
                  <p className="text-sm text-destructive">{state.errors.parentName[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentPhone">{dictionary.students.parentPhone} *</Label>
                <PhoneInput
                  id="parentPhone"
                  name="parentPhone"
                  defaultValue={initialData?.parentPhone || ""}
                  disabled={isPending}
                />
                {state.errors?.parentPhone && (
                  <p className="text-sm text-destructive">{state.errors.parentPhone[0]}</p>
                )}
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Label htmlFor="parentEmail">{dictionary.students.parentEmail}</Label>
              <Input
                id="parentEmail"
                name="parentEmail"
                type="email"
                defaultValue={initialData?.parentEmail || undefined}
                disabled={isPending}
              />
              {state.errors?.parentEmail && (
                <p className="text-sm text-destructive">{state.errors.parentEmail[0]}</p>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Ek Bilgiler</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="branchInterest">{dictionary.students.branch}</Label>
                <Select
                  name="branchInterest"
                  defaultValue={initialData?.branchInterest || undefined}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seciniz" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch: Branch) => (
                      <SelectItem key={branch.id} value={branch.name}>
                        {branch.name}
                      </SelectItem>
                    ))}
                    {branches.length === 0 && (
                      <>
                        <SelectItem value="Futbol">Futbol</SelectItem>
                        <SelectItem value="Basketbol">Basketbol</SelectItem>
                        <SelectItem value="Voleybol">Voleybol</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="source">Kaynak</Label>
                <Select name="source" defaultValue={initialData?.source || undefined}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seciniz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">
                      {dictionary.preRegistration.source.website}
                    </SelectItem>
                    <SelectItem value="phone">
                      {dictionary.preRegistration.source.phone}
                    </SelectItem>
                    <SelectItem value="walk-in">
                      {dictionary.preRegistration.source.walkIn}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Label htmlFor="notes">{dictionary.students.notes}</Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={initialData?.notes || undefined}
                disabled={isPending}
                rows={3}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            {dictionary.common.cancel}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Kaydediliyor..." : dictionary.common.save}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
