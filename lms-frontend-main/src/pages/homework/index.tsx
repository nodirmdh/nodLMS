import React, { useState } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  useCreateHomeworkMutation,
  useGetHomeworksQuery,
  useReviewSubmissionMutation,
  useGetHomeworkQuery,
} from "@/app/store/services/homework.service";

export const HomeworkPage: React.FC = () => {
  const [groupFilter, setGroupFilter] = useState<string>("");
  const groupId = groupFilter.trim() ? Number(groupFilter) : undefined;

  const { data: homeworks, isLoading } = useGetHomeworksQuery(
    groupId != null ? { groupId } : {},
  );
  const [createHomework, createState] = useCreateHomeworkMutation();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    groupId: "",
    dueDate: "",
  });

  const onCreate = async () => {
    if (!form.title || !form.description) return;
    await createHomework({
      title: form.title,
      description: form.description,
      groupId: form.groupId ? Number(form.groupId) : undefined,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
    }).unwrap();
    setOpen(false);
    setForm({ title: "", description: "", groupId: "", dueDate: "" });
    toast({ title: "Домашка создана" });
  };

  return (
    <section className="grid gap-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-xl font-bold">Домашние задания</h2>
        <div className="flex gap-2 items-center">
          <Input
            placeholder="ID группы"
            className="w-[140px]"
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
          />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">Новое задание</Button>
            </DialogTrigger>
            <DialogContent className="w-[min(100%-20px,500px)]">
              <DialogHeader>
                <DialogTitle>Новое задание</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3">
                <Input
                  placeholder="Заголовок"
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                />
                <Textarea
                  placeholder="Описание"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
                <Input
                  placeholder="ID группы (опционально)"
                  value={form.groupId}
                  onChange={(e) =>
                    setForm({ ...form, groupId: e.target.value })
                  }
                />
                <Input
                  type="datetime-local"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm({ ...form, dueDate: e.target.value })
                  }
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Отмена
                </Button>
                <Button
                  onClick={onCreate}
                  disabled={createState.isLoading}
                >
                  Создать
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div>loading…</div>
      ) : !homeworks?.length ? (
        <p className="text-muted-foreground text-sm">
          Заданий нет. Создайте первое.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {homeworks.map((hw) => (
            <HomeworkCard key={hw.id} id={hw.id} />
          ))}
        </div>
      )}
    </section>
  );
};

const HomeworkCard: React.FC<{ id: number }> = ({ id }) => {
  const { data: hw } = useGetHomeworkQuery(id);
  const [review, reviewState] = useReviewSubmissionMutation();
  if (!hw) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{hw.title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        <div className="text-sm whitespace-pre-line">{hw.description}</div>
        {hw.dueDate && (
          <div className="text-xs text-muted-foreground">
            Срок: {format(new Date(hw.dueDate), "dd.MM.yyyy HH:mm")}
          </div>
        )}
        <div className="text-xs text-muted-foreground">
          Сдано: {hw.submissions?.length ?? 0}
        </div>
        {hw.submissions && hw.submissions.length > 0 && (
          <div className="grid gap-1 mt-2 border-t pt-2">
            {hw.submissions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between text-sm"
              >
                <span>
                  Студент #{s.studentId} — {s.status}
                  {s.grade != null ? ` · ${s.grade}` : ""}
                </span>
                {s.status !== "reviewed" && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={reviewState.isLoading}
                    onClick={() =>
                      review({
                        submissionId: s.id,
                        data: { grade: 5, status: "reviewed" },
                      })
                    }
                  >
                    Зачесть
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HomeworkPage;
