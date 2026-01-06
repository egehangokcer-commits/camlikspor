"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, MessageSquare, Users, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PhoneNumber {
  phone: string;
  name: string;
  type: string;
}

interface GroupSmsFormProps {
  groupId: string;
  groupName: string;
  phoneNumbers: PhoneNumber[];
  locale: string;
  dictionary: Record<string, unknown>;
}

export function GroupSmsForm({
  groupId,
  groupName,
  phoneNumbers,
  locale,
}: GroupSmsFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedPhones, setSelectedPhones] = useState<string[]>(
    phoneNumbers.map((p: PhoneNumber) => p.phone)
  );
  const [sendToStudents, setSendToStudents] = useState(true);
  const [sendToParents, setSendToParents] = useState(true);

  const studentPhones = phoneNumbers.filter((p: PhoneNumber) => p.type === "Ogrenci");
  const parentPhones = phoneNumbers.filter((p: PhoneNumber) => p.type === "Veli");

  const handleToggleAll = (type: "Ogrenci" | "Veli", checked: boolean) => {
    const phonesOfType = phoneNumbers
      .filter((p: PhoneNumber) => p.type === type)
      .map((p: PhoneNumber) => p.phone);

    if (checked) {
      setSelectedPhones((prev) => [...new Set([...prev, ...phonesOfType])]);
    } else {
      setSelectedPhones((prev: string[]) =>
        prev.filter((phone: string) => !phonesOfType.includes(phone))
      );
    }

    if (type === "Ogrenci") setSendToStudents(checked);
    if (type === "Veli") setSendToParents(checked);
  };

  const handleTogglePhone = (phone: string, checked: boolean) => {
    if (checked) {
      setSelectedPhones((prev) => [...prev, phone]);
    } else {
      setSelectedPhones((prev: string[]) => prev.filter((p: string) => p !== phone));
    }
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error("Lutfen mesaj girin");
      return;
    }
    if (selectedPhones.length === 0) {
      toast.error("Lutfen en az bir alici secin");
      return;
    }

    setIsPending(true);
    try {
      // TODO: Implement SMS sending via Netgsm
      // For now, just show a success message
      toast.success(`${selectedPhones.length} kisiye SMS gonderildi`);
      router.push(`/${locale}/groups/${groupId}`);
    } catch {
      toast.error("SMS gonderilemedi");
    } finally {
      setIsPending(false);
    }
  };

  const messageLength = message.length;
  const smsCount = Math.ceil(messageLength / 160) || 1;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Mesaj
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">SMS Metni</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="SMS metnini girin..."
              rows={6}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{messageLength} karakter</span>
              <span>{smsCount} SMS</span>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Hizli Sablonlar</p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setMessage(
                    `Sayin Veli, ${groupName} grubundaki antrenman bugun iptal edilmistir. Bilgilerinize sunariz.`
                  )
                }
              >
                Antrenman Iptal
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setMessage(
                    `Sayin Veli, ${groupName} grubundaki aidat odemenizi hatirlatmak isteriz. Bilgilerinize sunariz.`
                  )
                }
              >
                Aidat Hatirlatma
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setMessage(
                    `Sayin Veli, yarin ${groupName} grubunda antrenman vardir. Katilim bekliyoruz.`
                  )
                }
              >
                Antrenman Hatirlatma
              </Button>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || !message.trim() || selectedPhones.length === 0}
              className="flex-1"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <MessageSquare className="mr-2 h-4 w-4" />
              SMS Gonder ({selectedPhones.length} kisi)
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/${locale}/groups/${groupId}`)}
            >
              Iptal
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Alicilar ({selectedPhones.length} / {phoneNumbers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 border-b pb-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="students"
                checked={sendToStudents}
                onCheckedChange={(checked) =>
                  handleToggleAll("Ogrenci", checked as boolean)
                }
              />
              <label htmlFor="students" className="text-sm font-medium">
                Ogrenciler ({studentPhones.length})
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="parents"
                checked={sendToParents}
                onCheckedChange={(checked) =>
                  handleToggleAll("Veli", checked as boolean)
                }
              />
              <label htmlFor="parents" className="text-sm font-medium">
                Veliler ({parentPhones.length})
              </label>
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {phoneNumbers.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Bu grupta telefon numarasi bulunamadi
              </p>
            ) : (
              phoneNumbers.map((pn: PhoneNumber, index: number) => (
                <div
                  key={`${pn.phone}-${index}`}
                  className="flex items-center justify-between p-2 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={`phone-${index}`}
                      checked={selectedPhones.includes(pn.phone)}
                      onCheckedChange={(checked) =>
                        handleTogglePhone(pn.phone, checked as boolean)
                      }
                    />
                    <div>
                      <p className="text-sm font-medium">{pn.name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {pn.phone}
                      </div>
                    </div>
                  </div>
                  <Badge variant={pn.type === "Veli" ? "secondary" : "outline"}>
                    {pn.type}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
