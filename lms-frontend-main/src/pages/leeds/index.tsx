import React, { useEffect, useMemo, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CircleArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LeedForm } from "@/features/leed-form";
import {
  useCreateLeedMutation,
} from "@/app/store/services/leeds.service";
import {
  IKanbanColumn,
  IKanbanLeed,
  LeedStatus,
  useGetKanbanQuery,
  useMoveLeedMutation,
} from "@/app/store/services/leeds-kanban.service";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatPhoneNumber } from "@/lib/utils";

type ColumnState = {
  status: LeedStatus;
  title: string;
  items: IKanbanLeed[];
};

const COLUMN_ORDER: LeedStatus[] = [
  "new",
  "waitingGroup",
  "inGroup",
  "finished",
  "refused",
];

export const LeedsPage: React.FC = () => {
  const { data, isSuccess } = useGetKanbanQuery();
  const [moveLeed] = useMoveLeedMutation();
  const { t } = useTranslation("leed");

  const titles = useMemo<Record<LeedStatus, string>>(
    () => ({
      new: t("new"),
      waitingGroup: t("waitingGroup"),
      inGroup: t("inProcess"),
      finished: t("finished", { defaultValue: "Finished" }),
      refused: t("refused"),
    }),
    [t],
  );

  const [columns, setColumns] = useState<Record<LeedStatus, ColumnState>>(
    () => emptyState(titles),
  );

  useEffect(() => {
    if (!isSuccess || !data) return;
    const next: Record<LeedStatus, ColumnState> = emptyState(titles);
    for (const c of data.columns) {
      next[c.status] = {
        status: c.status,
        title: titles[c.status],
        items: c.items,
      };
    }
    setColumns(next);
  }, [data, isSuccess, titles]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const sourceCol = columns[source.droppableId as LeedStatus];
    const destCol = columns[destination.droppableId as LeedStatus];
    if (!sourceCol || !destCol) return;

    const leedId = Number(draggableId.replace("leed-", ""));
    const leed = sourceCol.items.find((l) => l.id === leedId);
    if (!leed) return;

    // optimistic update
    const sourceItems = [...sourceCol.items];
    sourceItems.splice(source.index, 1);
    const destItems =
      sourceCol.status === destCol.status
        ? sourceItems
        : [...destCol.items];
    destItems.splice(destination.index, 0, {
      ...leed,
      status: destCol.status,
    });

    setColumns((prev) => ({
      ...prev,
      [sourceCol.status]: { ...sourceCol, items: sourceItems },
      [destCol.status]: { ...destCol, items: destItems },
    }));

    moveLeed({
      id: leedId,
      status: destCol.status,
      position: destination.index,
    });
  };

  return (
    <div className="block w-auto overflow-x-auto">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-5 gap-4 min-w-[1100px] text-sm">
          {COLUMN_ORDER.map((status) => (
            <Column
              key={status}
              column={columns[status]}
              allowAdd={status === "new"}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

function emptyState(
  titles: Record<LeedStatus, string>,
): Record<LeedStatus, ColumnState> {
  return COLUMN_ORDER.reduce(
    (acc, s) => ({
      ...acc,
      [s]: { status: s, title: titles[s], items: [] },
    }),
    {} as Record<LeedStatus, ColumnState>,
  );
}

interface ColumnProps {
  column: ColumnState;
  allowAdd: boolean;
}

const Column: React.FC<ColumnProps> = ({ column, allowAdd }) => {
  const [createLeed, { isLoading }] = useCreateLeedMutation();
  const { t } = useTranslation("leed");
  const [isModal, setIsModal] = useState(false);

  return (
    <Card className="w-full min-w-[180px] text-sm block">
      <CardHeader className="px-4 py-2 border-b sticky text-sm">
        <CardTitle className="text-base flex items-center justify-between">
          <span>{column.title}</span>
          <span className="text-xs text-muted-foreground">
            {column.items.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="py-3 px-1 relative h-full text-sm">
        {allowAdd && (
          <Dialog open={isModal}>
            <DialogTrigger asChild>
              <Button
                className="w-full mb-2 text-sm"
                variant="outline"
                onClick={() => setIsModal(true)}
              >
                {t("add")}
              </Button>
            </DialogTrigger>
            <DialogContent
              hideCloseClick={setIsModal}
              className="text-sm rounded-lg w-[min(100%-20px,500px)]"
              onInteractOutside={() => setIsModal(false)}
              onEscapeKeyDown={() => setIsModal(false)}
              hideCloseButton={false}
            >
              <LeedForm
                type="CREATE"
                initialValues={{
                  fio: "",
                  phone: "",
                  startTime: "00:00",
                  comment: "",
                  endTime: "00:00",
                  classDays: ["every"],
                  courseId: "1",
                  discoveryMethod: "",
                }}
                submitForm={createLeed}
                isLoading={isLoading}
                closeModal={() => setIsModal(false)}
              />
            </DialogContent>
          </Dialog>
        )}
        <Droppable droppableId={column.status}>
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="text-sm grid gap-2 min-h-[154px]"
            >
              {column.items.map((leed, index) => (
                <Card_ key={leed.id} leed={leed} index={index} />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </CardContent>
    </Card>
  );
};

const Card_: React.FC<{ leed: IKanbanLeed; index: number }> = ({
  leed,
  index,
}) => {
  return (
    <Draggable draggableId={`leed-${leed.id}`} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          style={{ ...provided.draggableProps.style }}
          className="text-sm flex flex-col bg-white p-2 rounded-lg border relative"
        >
          <div className="flex flex-col text-sm pr-10">
            <span className="font-medium text-sm">{leed.fio}</span>
            <span>{formatPhoneNumber(leed.phone)}</span>
            <p className="">
              {leed.startTime} - {leed.endTime}
            </p>
            {leed.course?.name && (
              <p className="text-xs text-muted-foreground mt-1">
                {leed.course.name}
              </p>
            )}
            {leed.status === "refused" && leed.refusedReason && (
              <p className="text-xs text-red-500 mt-1">
                {leed.refusedReason}
              </p>
            )}
          </div>
          <Link
            to={`/leeds/${leed.id}`}
            className="flex items-center justify-center hover:bg-primary hover:text-white rounded-full w-[40px] h-[40px] right-[12px] absolute p-2 top-1"
          >
            <CircleArrowRight />
          </Link>
        </div>
      )}
    </Draggable>
  );
};

// re-export for existing `import { LeedsPage }` consumers
export default LeedsPage;

// keep an unused reference to IKanbanColumn so it isn't tree-shaken from types
export type { IKanbanColumn };
