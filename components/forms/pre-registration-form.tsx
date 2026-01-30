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
  createPreRegistrationAction,
  updatePreRegistrationAction,
  type PreRegistrationFormState,
} from "@/lib/actions/pre-registration";
import { format } from "date-fns";

interface Branch {
  id: string;
  name: string;
}

interface PreRegistrationData {
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
}

interface Dictionary {
  common: {
    save: string;
    cancel: string;
    [key: string]: string;
  };
  preRegistration: {
    firstName: string;
    lastName: string;
    birthDate: string;
    gender: string;
    parentName: string;
    parentPhone: string;
    parentEmail: string;
    branchInterest: string;
    sourceLabel: string;
    notes: string;
    studentInfo: string;
    studentInfoDesc: string;
    parentInfo: string;
    parentInfoDesc: string;
    additionalInfo: string;
    selectGender: string;
    selectBranch: string;
    selectSource: string;
    notSelected: string;
    male: string;
    female: string;
    update: string;
    source: {
      website: string;
      phone: string;
      walkIn: string;
      referral: string;
      socialMedia: string;
    };
    [key: string]: unknown;
  };
  errors: Record<string, string>;
  success: Record<string, string>;
  [key: string]: unknown;
}

interface PreRegistrationFormProps {
  preRegistration?: PreRegistrationData;
  branches: Branch[];
  locale: string;
  dictionary: Dictionary;
}

export function PreRegistrationForm({
  preRegistration,
  branches,
  locale,
  dictionary,
}: PreRegistrationFormProps) {
  const router = useRouter();
  const isEdit = !!preRegistration;
  const t = dictionary.preRegistration;
  const common = dictionary.common;

  const boundAction = isEdit
    ? updatePreRegistrationAction.bind(null, preRegistration.id)
    : createPreRegistrationAction;

  const [state, formAction, isPending] = useActionState<PreRegistrationFormState, FormData>(
    boundAction,
    { errors: {}, message: "" }
  );

  useEffect(() => {
    if (state.success && state.messageKey) {
      const message = dictionary.success[state.messageKey] || state.message || state.messageKey;
      toast.success(message);
      router.push(`/${locale}/pre-registration`);
    } else if (state.errorKey) {
      const message = dictionary.errors[state.errorKey] || state.errorKey;
      toast.error(message);
    } else if (state.errors?._form) {
      toast.error(state.errors._form[0]);
    }
  }, [state, router, locale, dictionary]);

  return (
    <form action={formAction} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t.studentInfo as string}</CardTitle>
          <CardDescription>{t.studentInfoDesc as string}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">{t.firstName as string} *</Label>
            <Input
              id="firstName"
              name="firstName"
              defaultValue={preRegistration?.firstName || ""}
              required
            />
            {state.errors?.firstName && (
              <p className="text-sm text-destructive">{state.errors.firstName[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">{t.lastName as string} *</Label>
            <Input
              id="lastName"
              name="lastName"
              defaultValue={preRegistration?.lastName || ""}
              required
            />
            {state.errors?.lastName && (
              <p className="text-sm text-destructive">{state.errors.lastName[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate">{t.birthDate as string}</Label>
            <Input
              id="birthDate"
              name="birthDate"
              type="date"
              defaultValue={
                preRegistration?.birthDate
                  ? format(preRegistration.birthDate, "yyyy-MM-dd")
                  : ""
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">{t.gender as string}</Label>
            <Select
              name="gender"
              defaultValue={preRegistration?.gender || "none"}
            >
              <SelectTrigger>
                <SelectValue placeholder={t.selectGender as string} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t.notSelected as string}</SelectItem>
                <SelectItem value="MALE">{t.male as string}</SelectItem>
                <SelectItem value="FEMALE">{t.female as string}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.parentInfo as string}</CardTitle>
          <CardDescription>{t.parentInfoDesc as string}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="parentName">{t.parentName as string} *</Label>
            <Input
              id="parentName"
              name="parentName"
              defaultValue={preRegistration?.parentName || ""}
              required
            />
            {state.errors?.parentName && (
              <p className="text-sm text-destructive">{state.errors.parentName[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentPhone">{t.parentPhone as string} *</Label>
            <PhoneInput
              id="parentPhone"
              name="parentPhone"
              defaultValue={preRegistration?.parentPhone || ""}
              required
            />
            {state.errors?.parentPhone && (
              <p className="text-sm text-destructive">{state.errors.parentPhone[0]}</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="parentEmail">{t.parentEmail as string}</Label>
            <Input
              id="parentEmail"
              name="parentEmail"
              type="email"
              defaultValue={preRegistration?.parentEmail || ""}
            />
            {state.errors?.parentEmail && (
              <p className="text-sm text-destructive">{state.errors.parentEmail[0]}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.additionalInfo as string}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="branchInterest">{t.branchInterest as string}</Label>
            <Select
              name="branchInterest"
              defaultValue={preRegistration?.branchInterest || "none"}
            >
              <SelectTrigger>
                <SelectValue placeholder={t.selectBranch as string} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t.notSelected as string}</SelectItem>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.name}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">{t.sourceLabel as string}</Label>
            <Select
              name="source"
              defaultValue={preRegistration?.source || "none"}
            >
              <SelectTrigger>
                <SelectValue placeholder={t.selectSource as string} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t.notSelected as string}</SelectItem>
                <SelectItem value="WEBSITE">{t.source.website}</SelectItem>
                <SelectItem value="PHONE">{t.source.phone}</SelectItem>
                <SelectItem value="WALKIN">{t.source.walkIn}</SelectItem>
                <SelectItem value="REFERRAL">{t.source.referral}</SelectItem>
                <SelectItem value="SOCIAL_MEDIA">{t.source.socialMedia}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">{t.notes as string}</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={preRegistration?.notes || ""}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? (t.update as string) : common.save}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/${locale}/pre-registration`)}
        >
          {common.cancel}
        </Button>
      </div>
    </form>
  );
}
