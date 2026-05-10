import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";

import { format, 
  // isBefore 
} from "date-fns";

import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {useMediaQuery} from "react-responsive"

interface CalendarProps {
  field: any;
  namespace: string;
  options: Array<{ value: string | boolean | number; label: string }>;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  onChange?: (date: DateRange | undefined) => void;
  // diabledValue: Date;
  type: string;
}

export function DatePickerWithRange({
  field,
  placeholder,
  className,
  disabled,
  onChange,
  // diabledValue,
  type,
}: CalendarProps) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: field.value.from ? new Date(field.value.from) : new Date(),
    to: field.value.to ? new Date(field.value.to) : new Date(),
  });
  const ismobil=useMediaQuery({query: '(max-width: 637px)'})

  const handleDateChange = (newDate: DateRange | undefined) => {
    if (newDate?.from && newDate?.to) {
      if (type && format(newDate.from, "LLL dd, y") !== format(field.value.from, "LLL dd, y")) {
        return;
      }
      setDate(newDate);
      if (onChange) {
        onChange(newDate);
      }
    } else {
      setDate(newDate);
      if (onChange) {
        onChange(newDate);
      }
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal px-3",
              !date && "text-muted-foreground"
            )}
            value={field?.value}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>{placeholder || "Pick a date"}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateChange}
            numberOfMonths={ismobil?1:2}
            disabled={
             false
              // type === "active"
              //   ? (dat) =>
              //       isBefore(
              //         dat,
              //         date?.from ? new Date(date?.from) : new Date()
              //       )
              //   : (date) => isBefore(date, diabledValue)
            }
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
