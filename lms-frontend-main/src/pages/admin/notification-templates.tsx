import React, { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  INotificationTemplate,
  NotificationChannel,
  useCreateTemplateMutation,
  useDeleteTemplateMutation,
  useListTemplatesQuery,
  usePreviewTemplateMutation,
  useUpdateTemplateMutation,
} from "@/app/store/services/notification-templates.service";

const CHANNELS: { value: NotificationChannel; label: string }[] = [
  { value: "sms", label: "SMS" },
  { value: "telegram", label: "Telegram" },
  { value: "email", label: "Email" },
  { value: "push", label: "Push" },
];

export const NotificationTemplatesPage: React.FC = () => {
  const [channelFilter, setChannelFilter] = useState<
    NotificationChannel | "all"
  >("all");
  const { data, isLoading } = useListTemplatesQuery(
    channelFilter === "all" ? {} : { channel: channelFilter },
  );
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <section className="grid gap-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-xl font-bold">Шаблоны уведомлений</h2>
        <div className="flex gap-2 items-center">
          <Select
            value={channelFilter}
            onValueChange={(v) =>
              setChannelFilter(v as NotificationChannel | "all")
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все каналы</SelectItem>
              {CHANNELS.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <CreateTemplateDialog open={createOpen} onOpenChange={setCreateOpen} />
        </div>
      </div>

      {isLoading ? (
        <div>loading…</div>
      ) : !data?.length ? (
        <p className="text-muted-foreground text-sm">
          Шаблонов пока нет. Запустите <code>npm run seed</code> в бэкенде или
          создайте первый.
        </p>
      ) : (
        <div className="grid gap-3">
          {data.map((tpl) => (
            <TemplateRow key={tpl.id} tpl={tpl} />
          ))}
        </div>
      )}
    </section>
  );
};

const CreateTemplateDialog: React.FC<{
  open: boolean;
  onOpenChange: (b: boolean) => void;
}> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const [create, createState] = useCreateTemplateMutation();
  const [form, setForm] = useState<{
    code: string;
    channel: NotificationChannel;
    locale: string;
    subject: string;
    body: string;
  }>({
    code: "",
    channel: "sms",
    locale: "ru",
    subject: "",
    body: "",
  });

  const submit = async () => {
    if (!form.code || !form.body) return;
    try {
      await create({
        code: form.code,
        channel: form.channel,
        locale: form.locale || "ru",
        subject: form.subject || undefined,
        body: form.body,
      }).unwrap();
      onOpenChange(false);
      setForm({
        code: "",
        channel: "sms",
        locale: "ru",
        subject: "",
        body: "",
      });
      toast({ title: "Шаблон создан" });
    } catch (err) {
      toast({
        title: "Не удалось создать",
        description: (err as { data?: { message?: string } })?.data?.message,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">Новый шаблон</Button>
      </DialogTrigger>
      <DialogContent className="w-[min(100%-20px,550px)]">
        <DialogHeader>
          <DialogTitle>Новый шаблон</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <label className="text-sm">
            Код (латиница, например <code>debt.reminder</code>)
            <Input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />
          </label>
          <label className="text-sm">
            Канал
            <Select
              value={form.channel}
              onValueChange={(v) =>
                setForm({ ...form, channel: v as NotificationChannel })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHANNELS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className="text-sm">
            Локаль
            <Input
              value={form.locale}
              onChange={(e) => setForm({ ...form, locale: e.target.value })}
            />
          </label>
          <label className="text-sm">
            Subject (для email; для SMS оставьте пустым)
            <Input
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
          </label>
          <label className="text-sm">
            Тело. Переменные: <code>{"{{ student.fio }}"}</code>,{" "}
            <code>{"{{ amount }}"}</code>
            <Textarea
              rows={5}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
            />
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button
            onClick={submit}
            disabled={createState.isLoading || !form.code || !form.body}
          >
            Создать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const TemplateRow: React.FC<{ tpl: INotificationTemplate }> = ({ tpl }) => {
  const [edit, setEdit] = useState(false);
  const [updateTpl, updateState] = useUpdateTemplateMutation();
  const [deleteTpl] = useDeleteTemplateMutation();
  const [preview, previewState] = usePreviewTemplateMutation();
  const { toast } = useToast();

  const [form, setForm] = useState({
    subject: tpl.subject ?? "",
    body: tpl.body,
    enabled: tpl.enabled,
  });
  const [variablesJson, setVariablesJson] = useState<string>(
    `{\n  "student": { "fio": "Иванов Иван" },\n  "amount": "150 000"\n}`,
  );
  const [previewOutput, setPreviewOutput] = useState<{
    subject: string | null;
    body: string;
  } | null>(null);

  const dirty = useMemo(
    () =>
      form.subject !== (tpl.subject ?? "") ||
      form.body !== tpl.body ||
      form.enabled !== tpl.enabled,
    [form, tpl],
  );

  const save = async () => {
    try {
      await updateTpl({
        id: tpl.id,
        data: {
          subject: form.subject || undefined,
          body: form.body,
          enabled: form.enabled,
        },
      }).unwrap();
      setEdit(false);
      toast({ title: "Сохранено" });
    } catch (err) {
      toast({
        title: "Ошибка",
        description: (err as { data?: { message?: string } })?.data?.message,
      });
    }
  };

  const remove = async () => {
    if (!confirm(`Удалить шаблон ${tpl.code}/${tpl.channel}?`)) return;
    await deleteTpl(tpl.id);
  };

  const doPreview = async () => {
    try {
      const variables = variablesJson.trim()
        ? JSON.parse(variablesJson)
        : {};
      const res = await preview({ id: tpl.id, variables }).unwrap();
      setPreviewOutput({ subject: res.subject, body: res.body });
    } catch (err) {
      toast({
        title: "Не удалось сделать preview",
        description:
          err instanceof SyntaxError ? "Неверный JSON" : String(err),
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span className="font-mono text-sm">
            {tpl.code} · {tpl.channel} · {tpl.locale}
          </span>
          <div className="flex gap-2 items-center">
            <label className="text-xs flex items-center gap-1">
              <Checkbox
                checked={form.enabled}
                onCheckedChange={(v) =>
                  setForm({ ...form, enabled: v === true })
                }
              />
              enabled
            </label>
            {!edit ? (
              <>
                <Button size="sm" variant="outline" onClick={() => setEdit(true)}>
                  Редактировать
                </Button>
                <Button size="sm" variant="destructive" onClick={remove}>
                  Удалить
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEdit(false);
                    setForm({
                      subject: tpl.subject ?? "",
                      body: tpl.body,
                      enabled: tpl.enabled,
                    });
                  }}
                >
                  Отмена
                </Button>
                <Button
                  size="sm"
                  onClick={save}
                  disabled={!dirty || updateState.isLoading}
                >
                  Сохранить
                </Button>
              </>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {edit ? (
          <>
            <label className="text-sm">
              Subject
              <Input
                value={form.subject}
                onChange={(e) =>
                  setForm({ ...form, subject: e.target.value })
                }
              />
            </label>
            <label className="text-sm">
              Body
              <Textarea
                rows={5}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
              />
            </label>
          </>
        ) : (
          <pre className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-md">
            {tpl.subject ? `Subject: ${tpl.subject}\n\n` : ""}
            {tpl.body}
          </pre>
        )}

        <div className="border-t pt-3 grid gap-2">
          <div className="text-xs text-muted-foreground">
            Preview — введите JSON с переменными, нажмите «Сгенерировать»:
          </div>
          <Textarea
            rows={4}
            value={variablesJson}
            onChange={(e) => setVariablesJson(e.target.value)}
            className="font-mono text-xs"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={doPreview}
              disabled={previewState.isLoading}
            >
              Сгенерировать preview
            </Button>
          </div>
          {previewOutput && (
            <pre className="text-sm whitespace-pre-wrap bg-green-50 p-3 rounded-md border">
              {previewOutput.subject
                ? `Subject: ${previewOutput.subject}\n\n`
                : ""}
              {previewOutput.body}
            </pre>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationTemplatesPage;
