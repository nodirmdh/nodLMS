import "./schedule.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useDateI18n } from "@/hooks/use-date-i18n.ts";
import { Event } from "@/pages/dashboard";
import { generateTimeArray } from "@/lib/utils.ts";
import { useMediaQuery } from "react-responsive";
interface ScheduleProps {
  date: string;
  prevDate: string;
  nextDate: string;
  handleDate: (type: "prev" | "next") => void;
  events: Event[];
}

export const Schedule = ({
  date,
  prevDate,
  nextDate,
  handleDate,
  events,
}: ScheduleProps) => {
  const { get18nDate } = useDateI18n();
  const isSmallScreen = useMediaQuery({ query: "(max-width: 768px)" });
  const mobile = useMediaQuery({ query: "(max-width: 456px)" });
  const times = generateTimeArray("08:00", "22:00");

  const getTop = (startTime: string): number => {
    const [hour, minute] = startTime.split(":").map(Number);
    return (hour - 8) * 60 + minute;
  };

  const getHeight = (startTime: string, endTime: string): number => {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    return (endHour - startHour) * 60 + (endMinute - startMinute);
  };

  const getEvents = (): Event[][] => {
    const eventsCols: Event[][] = mobile
      ? [[], []]
      : isSmallScreen
      ? [[], [], [], []]
      : [[], [], [], [], [], [], [], [], []];

    events.forEach((event) => {
      let placed = false;

      for (const col of eventsCols) {
        let isConflict = false;

        for (const _event of col) {
          const eventTimes = generateTimeArray(event.startTime, event.endTime);
          const existingEventTimes = generateTimeArray(
            _event.startTime,
            _event.endTime
          );

          if (eventTimes.some((time) => existingEventTimes.includes(time))) {
            isConflict = true;
            break;
          }
        }

        if (!isConflict) {
          col.push(event);
          placed = true;
          break;
        }
      }

      if (!placed) {
        eventsCols.push([event]);
      }
    });

    return eventsCols;
  };

  return (
    <div className="calendar text-sm">
      <div className="calendar-header">
        <button onClick={() => handleDate("prev")} className="">
          <ChevronLeft /> {get18nDate(prevDate)}
        </button>
        <span className="">{get18nDate(date)}</span>
        <button onClick={() => handleDate("next")} className="">
          {get18nDate(nextDate)}
          <ChevronRight />
        </button>
      </div>
      <div className="calendar-body">
        <div className="calendar-times">
          {times.map((hour) => (
            <div key={hour} className="calendar-time">{`${hour}`}</div>
          ))}
        </div>
        <div className="calendar-events">
          {getEvents().map((eventCol, index) => (
            <div
              className="calendar-events-day w-min-[120px] w-full "
              key={index}
            >
              {eventCol.map((event) => {
                return (
                  <Link
                    to={`/lessons/${event.id}`}
                    key={event.id}
                    className={`calendar-event text-white overflow-hidden ${
                      event.status === "waiting"
                        ? "text-whitebg-primary bg-primary text-white opacity-80"
                        : event.status === "waitingConfirm"
                        ? "text-whitebg-primary opacity-80 text-black bg-purple-600"
                        : event.status === "completed"
                        ? "text-whitebg-primary opacity-80  text-black bg-green-400 "
                        : " bg-red-600 text-white"
                    }`}
                    style={{
                      top: getTop(event.startTime),
                      height: getHeight(event.startTime, event.endTime),
                    }}
                  >
                    <span className="calendar-event-time">
                      {event.startTime} - {event.endTime}
                    </span>
                    <span className="calendar-event-title">{event.name}</span>
                    <span className="calendar-event-course">
                      {event.group
                        ? event.mentor?.user?.fio
                        : event.responsible?.fio}
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
