import React, { useState } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  ITask,
  TaskStatus,
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useGetAgendaQuery,
  useGetTasksQuery,
  useUpdateTaskMutation,
} from "@/app/store/services/tasks.service";

const STATUSES: TaskStatus[] = ["pending", "inProgress", "done", "cancelled"];

export const TasksPage: React.FC = () => {
  const { data: allTasks, isLoading } = useGetTasksQuery({});
  const { data: agenda } = useGetAgendaQuery();
  const [createTask, createState] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const { toast } = useToast();

  const [isModal, setIsModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState("");

  const onCreate = async () => {
    if (!title.trim()) return;
    await createTask({
      title,
      description: description || undefined,
      dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
    }).unwrap();
    setTitle("");
    setDescription("");
    setDueAt("");
    setIsModal(false);
    toast({ title: "Задача создана" });
  };

  const toggleDone = async (t: ITask) => {
    const nextStatus: TaskStatus =
      t.status === "done" ? "pending" : "done";
    await updateTask({ id: t.id, data: { status: nextStatus } });
  };

  const remove = async (id: number) => {
    await deleteTask(id);
  };

  return (
    <section className="grid gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Задачи</h2>
        <Dialog open={isModal} onOpenChange={setIsModal}>
          <DialogTrigger asChild>
            <Button size="sm">Новая задача</Button>
          </DialogTrigger>
          <DialogContent className="w-[min(100%-20px,500px)]">
            <DialogHeader>
              <DialogTitle>Новая задача</DialogTitle>
              <DialogDescription>
                Опишите задачу и задайте срок. Вы можете привязать её к
                студенту или лиду позже.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              <Input
                placeholder="Заголовок"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Textarea
                placeholder="Описание"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Input
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsModal(false)}
                disabled={createState.isLoading}
              >
                Отмена
              </Button>
              <Button
                onClick={onCreate}
                disabled={createState.isLoading || !title.trim()}
              >
                Создать
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">На сегодня-завтра</CardTitle>
        </CardHeader>
        <CardContent>
          {agenda && agenda.length > 0 ? (
            <ul className="grid gap-2">
              {agenda.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center gap-3 border rounded-md px-3 py-2"
                >
                  <Checkbox
                    checked={t.status === "done"}
                    onCheckedChange={() => toggleDone(t)}
                  />
                  <div className="flex-1">
                    <div
                      className={
                        t.status === "done"
                          ? "line-through text-muted-foreground"
                          : "font-medium"
                      }
                    >
                      {t.title}
                    </div>
                    {t.dueAt && (
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(t.dueAt), "dd.MM.yyyy HH:mm")}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(t.id)}
                  >
                    ×
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Задач на сегодня-завтра нет.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Все задачи</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>loading…</div>
          ) : allTasks && allTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {STATUSES.map((status) => (
                <div key={status} className="border rounded-md">
                  <div className="px-3 py-2 border-b font-medium capitalize">
                    {status}
                  </div>
                  <ul className="p-2 grid gap-2 min-h-[60px]">
                    {allTasks
                      .filter((t) => t.status === status)
                      .map((t) => (
                        <li
                          key={t.id}
                          className="text-sm border rounded p-2 flex flex-col gap-1"
                        >
                          <div className="font-medium">{t.title}</div>
                          {t.description && (
                            <div className="text-muted-foreground line-clamp-2">
                              {t.description}
                            </div>
                          )}
                          {t.dueAt && (
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(t.dueAt), "dd.MM HH:mm")}
                            </div>
                          )}
                          <div className="flex gap-1 mt-1">
                            {status !== "done" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateTask({
                                    id: t.id,
                                    data: { status: "done" },
                                  })
                                }
                              >
                                Готово
                              </Button>
                            )}
                            {status === "pending" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateTask({
                                    id: t.id,
                                    data: { status: "inProgress" },
                                  })
                                }
                              >
                                В работу
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => remove(t.id)}
                            >
                              Удалить
                            </Button>
                          </div>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Задач ещё нет.</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default TasksPage;
