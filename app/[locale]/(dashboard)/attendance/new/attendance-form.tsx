"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Check, X, Clock, CalendarOff, Users } from "lucide-react";
import {
  createAttendanceSessionAction,
  getGroupStudents,
  type AttendanceStatus,
  type GroupStudent,
} from "@/lib/actions/attendance";
import { cn } from "@/lib/utils";

interface Group {
  id: string;
  name: string;
}

interface Trainer {
  id: string;
  firstName: string;
  lastName: string;
}

interface AttendanceFormProps {
  groups: Group[];
  trainers: Trainer[];
  initialGroupId?: string;
  initialStudents: GroupStudent[];
  locale: string;
  dictionary: Record<string, unknown>;
}

const statusConfig: Record<AttendanceStatus, { label: string; icon: React.ReactNode; color: string }> = {
  PRESENT: { label: "Var", icon: <Check className="h-4 w-4" />, color: "bg-green-500 hover:bg-green-600 text-white" },
  ABSENT: { label: "Yok", icon: <X className="h-4 w-4" />, color: "bg-red-500 hover:bg-red-600 text-white" },
  LATE: { label: "Gec", icon: <Clock className="h-4 w-4" />, color: "bg-yellow-500 hover:bg-yellow-600 text-white" },
  EXCUSED: { label: "Izinli", icon: <CalendarOff className="h-4 w-4" />, color: "bg-blue-500 hover:bg-blue-600 text-white" },
};

export function AttendanceForm({
  groups,
  trainers,
  initialGroupId,
  initialStudents,
  locale,
}: AttendanceFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(initialGroupId || "");
  const [selectedTrainerId, setSelectedTrainerId] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [students, setStudents] = useState<GroupStudent[]>(initialStudents);
  const [attendances, setAttendances] = useState<Record<string, AttendanceStatus>>({});
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  // Initialize all students as PRESENT by default
  useEffect(() => {
    const initialAttendances: Record<string, AttendanceStatus> = {};
    students.forEach((student) => {
      if (!attendances[student.id]) {
        initialAttendances[student.id] = "PRESENT";
      }
    });
    if (Object.keys(initialAttendances).length > 0) {
      setAttendances((prev) => ({ ...prev, ...initialAttendances }));
    }
  }, [students]);

  // Load students when group changes
  const handleGroupChange = async (groupId: string) => {
    setSelectedGroupId(groupId);
    if (!groupId) {
      setStudents([]);
      setAttendances({});
      return;
    }

    setIsLoadingStudents(true);
    try {
      const groupStudents = await getGroupStudents(groupId);
      setStudents(groupStudents);
      // Reset attendances for new students
      const newAttendances: Record<string, AttendanceStatus> = {};
      groupStudents.forEach((student) => {
        newAttendances[student.id] = "PRESENT";
      });
      setAttendances(newAttendances);
    } catch {
      toast.error("Ogrenciler yuklenemedi");
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendances((prev) => ({ ...prev, [studentId]: status }));
  };

  const setAllStatus = (status: AttendanceStatus) => {
    const newAttendances: Record<string, AttendanceStatus> = {};
    students.forEach((student) => {
      newAttendances[student.id] = status;
    });
    setAttendances(newAttendances);
  };

  const handleSubmit = async () => {
    if (!selectedGroupId) {
      toast.error("Lutfen bir grup secin");
      return;
    }
    if (!selectedTrainerId) {
      toast.error("Lutfen bir antrenor secin");
      return;
    }
    if (students.length === 0) {
      toast.error("Bu grupta ogrenci yok");
      return;
    }

    setIsPending(true);
    try {
      const attendanceRecords = Object.entries(attendances).map(
        ([studentId, status]) => ({
          studentId,
          status,
        })
      );

      const result = await createAttendanceSessionAction(
        selectedGroupId,
        selectedTrainerId,
        new Date(selectedDate),
        attendanceRecords
      );

      if (result.success) {
        toast.success(result.message);
        router.push(`/${locale}/attendance`);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Bir hata olustu");
    } finally {
      setIsPending(false);
    }
  };

  const presentCount = Object.values(attendances).filter((s) => s === "PRESENT").length;
  const absentCount = Object.values(attendances).filter((s) => s === "ABSENT").length;
  const lateCount = Object.values(attendances).filter((s) => s === "LATE").length;
  const excusedCount = Object.values(attendances).filter((s) => s === "EXCUSED").length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Yoklama Bilgileri</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="group">Grup *</Label>
            <Select value={selectedGroupId} onValueChange={handleGroupChange}>
              <SelectTrigger>
                <SelectValue placeholder="Grup secin" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trainer">Antrenor *</Label>
            <Select value={selectedTrainerId} onValueChange={setSelectedTrainerId}>
              <SelectTrigger>
                <SelectValue placeholder="Antrenor secin" />
              </SelectTrigger>
              <SelectContent>
                {trainers.map((trainer) => (
                  <SelectItem key={trainer.id} value={trainer.id}>
                    {trainer.firstName} {trainer.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Tarih *</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {selectedGroupId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Ogrenciler ({students.length})
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setAllStatus("PRESENT")}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  Hepsini Var
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setAllStatus("ABSENT")}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  Hepsini Yok
                </Button>
              </div>
            </div>
            {students.length > 0 && (
              <div className="flex gap-4 text-sm">
                <span className="text-green-600">Var: {presentCount}</span>
                <span className="text-red-600">Yok: {absentCount}</span>
                <span className="text-yellow-600">Gec: {lateCount}</span>
                <span className="text-blue-600">Izinli: {excusedCount}</span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {isLoadingStudents ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                Bu grupta ogrenci bulunamadi
              </div>
            ) : (
              <div className="space-y-3">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        {student.photoUrl ? (
                          <img
                            src={student.photoUrl}
                            alt={`${student.firstName} ${student.lastName}`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium">
                            {student.firstName[0]}
                            {student.lastName[0]}
                          </span>
                        )}
                      </div>
                      <span className="font-medium">
                        {student.firstName} {student.lastName}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {(Object.keys(statusConfig) as AttendanceStatus[]).map(
                        (status) => (
                          <Button
                            key={status}
                            type="button"
                            size="sm"
                            variant="outline"
                            className={cn(
                              "w-20",
                              attendances[student.id] === status &&
                                statusConfig[status].color
                            )}
                            onClick={() => handleStatusChange(student.id, status)}
                          >
                            {statusConfig[status].icon}
                            <span className="ml-1 text-xs">
                              {statusConfig[status].label}
                            </span>
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || !selectedGroupId || !selectedTrainerId || students.length === 0}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Yoklamayi Kaydet
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/${locale}/attendance`)}
        >
          Iptal
        </Button>
      </div>
    </div>
  );
}
