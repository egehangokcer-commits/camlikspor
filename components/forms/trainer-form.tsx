"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { BankSelect } from "@/components/ui/bank-select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Loader2, Wallet } from "lucide-react";
import {
  createTrainerAction,
  updateTrainerAction,
  type TrainerFormState,
} from "@/lib/actions/trainers";

interface Branch {
  id: string;
  name: string;
}

interface TaskDefinition {
  id: string;
  name: string;
}

interface TrainerData {
  id: string;
  firstName: string;
  lastName: string;
  birthDate?: Date | null;
  gender?: string | null;
  tcKimlikNo?: string | null;
  phone: string;
  email?: string | null;
  address?: string | null;
  taskDefinitionId?: string | null;
  salary: number;
  salaryType?: string | null;
  bankName?: string | null;
  bankAccount?: string | null;
  notes?: string | null;
  branches: { branch: { id: string; name: string } }[];
  totalPaidSalary?: number;
}

interface Dictionary {
  common: {
    save: string;
    cancel: string;
    [key: string]: string;
  };
  trainers: {
    firstName: string;
    lastName: string;
    birthDate: string;
    gender: string;
    tcKimlik: string;
    phone: string;
    email: string;
    address: string;
    branches: string;
    task: string;
    salary: string;
    salaryType: string;
    bankName: string;
    bankAccount: string;
    notes: string;
    personalInfo: string;
    personalInfoDesc: string;
    taskBranchInfo: string;
    taskBranchInfoDesc: string;
    salaryInfo: string;
    salaryInfoDesc: string;
    additionalInfo: string;
    totalPaidSalary: string;
    selectGender: string;
    selectTask: string;
    noTask: string;
    selectSalaryType: string;
    fixed: string;
    perHour: string;
    perSession: string;
    update: string;
    male: string;
    female: string;
    [key: string]: string;
  };
  errors: Record<string, string>;
  success: Record<string, string>;
  [key: string]: unknown;
}

interface TrainerFormProps {
  trainer?: TrainerData;
  branches: Branch[];
  taskDefinitions: TaskDefinition[];
  locale: string;
  dictionary: Dictionary;
}

export function TrainerForm({
  trainer,
  branches,
  taskDefinitions,
  locale,
  dictionary,
}: TrainerFormProps) {
  const router = useRouter();
  const isEditing = !!trainer;
  const t = dictionary.trainers;
  const common = dictionary.common;

  const boundUpdateAction = trainer
    ? updateTrainerAction.bind(null, trainer.id)
    : createTrainerAction;

  const [state, formAction, isPending] = useActionState<TrainerFormState, FormData>(
    boundUpdateAction,
    { errors: {}, message: "" }
  );

  const selectedBranchIds = trainer?.branches.map((b) => b.branch.id) || [];

  useEffect(() => {
    if (state.success && state.messageKey) {
      const message = dictionary.success[state.messageKey] || state.message || state.messageKey;
      toast.success(message);
      router.push(`/${locale}/trainers`);
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
              defaultValue={trainer?.firstName}
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
              defaultValue={trainer?.lastName}
              required
            />
            {state.errors?.lastName && (
              <p className="text-sm text-destructive">{state.errors.lastName[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate">{t.birthDate}</Label>
            <Input
              id="birthDate"
              name="birthDate"
              type="date"
              defaultValue={
                trainer?.birthDate
                  ? new Date(trainer.birthDate).toISOString().split("T")[0]
                  : ""
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">{t.gender}</Label>
            <Select name="gender" defaultValue={trainer?.gender || ""}>
              <SelectTrigger>
                <SelectValue placeholder={t.selectGender} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">{t.male}</SelectItem>
                <SelectItem value="FEMALE">{t.female}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tcKimlikNo">{t.tcKimlik}</Label>
            <Input
              id="tcKimlikNo"
              name="tcKimlikNo"
              defaultValue={trainer?.tcKimlikNo || ""}
              maxLength={11}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t.phone} *</Label>
            <PhoneInput
              id="phone"
              name="phone"
              defaultValue={trainer?.phone}
              required
            />
            {state.errors?.phone && (
              <p className="text-sm text-destructive">{state.errors.phone[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t.email}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={trainer?.email || ""}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">{t.address}</Label>
            <Textarea
              id="address"
              name="address"
              defaultValue={trainer?.address || ""}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.taskBranchInfo}</CardTitle>
          <CardDescription>{t.taskBranchInfoDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="taskDefinitionId">{t.task}</Label>
            <Select
              name="taskDefinitionId"
              defaultValue={trainer?.taskDefinitionId || "none"}
            >
              <SelectTrigger>
                <SelectValue placeholder={t.selectTask} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t.noTask}</SelectItem>
                {taskDefinitions.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t.branches}</Label>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {branches.map((branch) => (
                <div key={branch.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`branch-${branch.id}`}
                    name="branchIds"
                    value={branch.id}
                    defaultChecked={selectedBranchIds.includes(branch.id)}
                  />
                  <label
                    htmlFor={`branch-${branch.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {branch.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.salaryInfo}</CardTitle>
          <CardDescription>{t.salaryInfoDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing && trainer?.totalPaidSalary !== undefined && (
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <Wallet className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">{t.totalPaidSalary}</p>
                <p className="text-2xl font-bold text-green-600">
                  {trainer.totalPaidSalary.toLocaleString("tr-TR")} TL
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="salary">{t.salary} (TL)</Label>
              <Input
                id="salary"
                name="salary"
                type="number"
                min="0"
                step="0.01"
                defaultValue={trainer?.salary || 0}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salaryType">{t.salaryType}</Label>
              <Select name="salaryType" defaultValue={trainer?.salaryType || ""}>
                <SelectTrigger>
                  <SelectValue placeholder={t.selectSalaryType} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">{t.fixed}</SelectItem>
                  <SelectItem value="per_hour">{t.perHour}</SelectItem>
                  <SelectItem value="per_session">{t.perSession}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankName">{t.bankName}</Label>
              <BankSelect
                name="bankName"
                id="bankName"
                defaultValue={trainer?.bankName || ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankAccount">{t.bankAccount}</Label>
              <Input
                id="bankAccount"
                name="bankAccount"
                defaultValue={trainer?.bankAccount || ""}
                placeholder="TR00 0000 0000 0000 0000 0000 00"
              />
            </div>
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
              defaultValue={trainer?.notes || ""}
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
          onClick={() => router.push(`/${locale}/trainers`)}
        >
          {common.cancel}
        </Button>
      </div>
    </form>
  );
}
