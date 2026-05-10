import React, { useEffect, useState } from "react";
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
  useGetAllLeedsQuery,
  useUpdateLeedMutation
} from "@/app/store/services/leeds.service";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatPhoneNumber } from "@/lib/utils";

interface Task {
  id: string;
  content: {
    fio: string;
    phone: string;
    discoveryMethod: string;
    startTime: string;
    endTime: string;
    classDays: string[];
    comment: string;
    course: any;
  };
}

interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

interface BoardData {
  tasks: { [key: string]: Task };
  columns: { [key: string]: Column };
  columnOrder: string[];
}



export const LeedsPage: React.FC = () => {
  const leeds = useGetAllLeedsQuery({});
  const { t } = useTranslation("leed");
  const defaultValue = {
    tasks: {},
    columns: {
      new: {
        id: "new",
        title: t("new"),
        taskIds: [],
      },
      inGroup: {
        id: "inGroup",
        title: t("inProcess"),
        taskIds: [],
      },
      waitingGroup: {
        id: "waitingGroup",
        title: t("waitingGroup"),
        taskIds: [],
      },
      refused: {
        id: "refused",
        title: t("refused"),
        taskIds: [],
      },
    },
    columnOrder: ["new", "inGroup", "waitingGroup", "refused"],
  };

  const getTasks = (): BoardData => {
    const tasks = leeds.data.reduce((acc: any, item: any) => {
      const taskId = `task-${item.id}`;
      acc[taskId] = {
        id: taskId,
        content: {
          fio: item.fio,
          phone: item.phone,
          discoveryMethod: item.discoveryMethod,
          comment: item.comment,
          startTime: item.startTime,
          endTime: item.endTime,
          classDays: item.classDays,
          course: item.course,
        },
      };
      return acc;
    }, {});

    const columns = {
      new: {
        id: "new",
        title: t("new"),
        taskIds: [],
      },
      inGroup: {
        id: "inGroup",
        title: t("inProcess"),
        taskIds: [],
      },
      waitingGroup: {
        id: "waitingGroup",
        title: t("waitingGroup"),
        taskIds: [],
      },
      refused: {
        id: "refused",
        title: t("refused"),
        taskIds: [],
      },
    };

    leeds.data.forEach((task: any) => {
      // @ts-ignore
      columns[task.status].taskIds.push(`task-${task.id}`);
    });

    return {
      tasks,
      columns,
      columnOrder: ["new", "inGroup", "waitingGroup", "refused"],
    };
  };

  const [data, setData] = useState<BoardData>(defaultValue);
  const [updateLeed] = useUpdateLeedMutation();
  useEffect(() => {
    if (leeds.isSuccess) {
      setData(getTasks());
    }
  }, [leeds.data]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const start = data.columns[source.droppableId];
    const finish = data.columns[destination.droppableId];

    if (start === finish) {
      const newTaskIds = Array.from(start.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...start,
        taskIds: newTaskIds,
      };

      const newState = {
        ...data,
        columns: {
          ...data.columns,
          [newColumn.id]: newColumn,
        },
      };

      setData(newState);
      return;
    }

    const startTaskIds = Array.from(start.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = {
      ...start,
      taskIds: startTaskIds,
    };

    const finishTaskIds = Array.from(finish.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = {
      ...finish,
      taskIds: finishTaskIds,
    };

    const newState = {
      ...data,
      columns: {
        ...data.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    };

    updateLeed({
      id: result.draggableId.slice(5),
      data:{status: result.destination?.droppableId},
    });
    setData(newState);
  };

  return (
    <div className="block w-auto overflow-x-auto ">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-4 gap-4 min-w-[900px] text-sm ">
          {data.columnOrder.map((columnId) => {
            const column = data.columns[columnId];
            const tasks = column.taskIds.map((taskId) => data.tasks[taskId]);

            return <Column key={column.id} column={column} tasks={tasks} />;
          })}
        </div>
      </DragDropContext>
      
    </div>
  );
};

interface ColumnProps {
  column: Column;
  tasks: Task[];
}

const Column: React.FC<ColumnProps> = ({ column, tasks }) => {
  const [createLeed, { isLoading }] = useCreateLeedMutation();
  const { t } = useTranslation("leed");
  const [isModal, setIsModal] = useState(false);
  return (
    <Card className="w-full min-w-[150px] text-sm block" key={column.id}>
      <CardHeader className="px-4 py-2 border-b sticky text-sm">
        <CardTitle className="text-lg">{column.title}</CardTitle>
      </CardHeader>
      <CardContent className="py-3 px-1 relative h-full text-sm">
        {column.id === "new" && (
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
              className=" text-sm rounded-lg w-[min(100%-20px,500px)]"
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
        <Droppable droppableId={column.id}>
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className=" text-sm grid gap-2 min-h-[154px] "
            >
              {tasks.map((task, index) => (
                <Task key={task.id} task={task} index={index} />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </CardContent>
    </Card>
  );
};

interface TaskProps {
  task: Task;
  index: number;
}

const Task: React.FC<TaskProps> = ({ task, index }) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          style={{
            ...provided.draggableProps.style,
          }}
          className=" text-sm flex flex-col bg-white p-2  rounded-lg border relative"
        >
          <div className="flex flex-col text-sm">
            <span className="font-medium text-sm">{task.content.fio}</span>
            {formatPhoneNumber(task.content.phone)}
            <p className="">
              {task.content.startTime} - {task.content.endTime}
            </p>
            {/* <p className="mt-1">{task.content.course.name}</p> */}
          </div>
          <Link
            to={`/leeds/${task.id.slice(5)}`}
            className="flex items-center justify-center hover:bg-primary hover:text-white rounded-full w-[40px] h-[40px] right-[12px] absolute p-2"
          >
            <CircleArrowRight />
          </Link>
        </div>
      )}
    </Draggable>
  );
};
