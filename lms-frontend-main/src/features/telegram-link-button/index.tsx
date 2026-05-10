import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Send } from "lucide-react";
import { useIssueLinkCodeMutation } from "@/app/store/services/telegram.service";
import { useToast } from "@/components/ui/use-toast";

interface Props {
  studentId: number;
}

/**
 * Кнопка «Подключить Telegram».
 *
 * При клике бэк генерит 8-символьный код, фронт показывает его в модалке
 * + deep-link вида https://t.me/<bot_username>?start=<code> (если задано
 * `VITE_TELEGRAM_BOT_USERNAME`).
 */
export function TelegramLinkButton({ studentId }: Props) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [issue, issueState] = useIssueLinkCodeMutation();
  const { toast } = useToast();

  const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME as
    | string
    | undefined;

  const onOpenChange = async (next: boolean) => {
    setOpen(next);
    if (next && !code) {
      try {
        const res = await issue({ studentId }).unwrap();
        setCode(res.linkCode);
      } catch (err) {
        toast({
          title: "Не удалось сгенерировать код",
          description: (err as { data?: { message?: string } })?.data?.message,
        });
        setOpen(false);
      }
    }
  };

  const copy = () => {
    if (!code) return;
    navigator.clipboard
      .writeText(code)
      .then(() => toast({ title: "Код скопирован" }))
      .catch(() => toast({ title: "Скопируйте вручную" }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Send className="h-4 w-4 mr-1" />
          Telegram
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[min(100%-20px,420px)]">
        <DialogHeader>
          <DialogTitle>Привязать Telegram родителя</DialogTitle>
          <DialogDescription>
            Передайте код или ссылку ниже родителю. Он должен открыть бота
            и отправить <code>/start &lt;код&gt;</code>.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          {issueState.isLoading || !code ? (
            <div className="text-sm text-muted-foreground">
              Генерируем код…
            </div>
          ) : (
            <>
              <div className="text-3xl font-mono text-center tracking-widest border rounded-md py-4 bg-muted">
                {code}
              </div>
              {botUsername && (
                <a
                  href={`https://t.me/${botUsername}?start=${code}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm underline text-blue-600"
                >
                  Открыть t.me/{botUsername}?start={code}
                </a>
              )}
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Закрыть
          </Button>
          <Button onClick={copy} disabled={!code}>
            Скопировать код
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
