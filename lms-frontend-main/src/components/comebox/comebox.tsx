import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "../ui/scroll-area";

export type ComboboxOptions = {
  value: string;
  label: string;
};

type Mode = "single" | "multiple";

interface ComboboxProps {
  mode?: Mode;
  options: ComboboxOptions[];
  selected: string | string[];
  className?: string;
  placeholder?: string;
  onChange: (event: string | string[]) => void;
  onCreate?: (value: string) => void;
}

export function Combobox({
  options,
  selected, // Default value
  className,
  placeholder,
  mode = "single",
  onChange,
  onCreate,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState<string>("");

  return (
    <div className={`${cn("block", className)} w-full`}>
      <Popover open={open} onOpenChange={setOpen} >
        <PopoverTrigger asChild className="w-full">
          <Button
            key={"combobox-trigger"}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-sm font-normal p-2"
          >
            {selected && selected.length > 0 ? (
              <div className="relative mr-auto flex flex-grow flex-wrap items-center overflow-hidden">
                <span>
                  {mode === "multiple" && Array.isArray(selected)
                    ? selected
                        .map(
                          (selectedValue: string) =>
                            options.find((item) => item.value === selectedValue)
                              ?.label
                        )
                        .join(", ")
                    : mode === "single" &&
                      options.find((item) => item.value === selected)?.label}
                </span>
              </div>
            ) : (
              placeholder ?? "Select Item..."
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[min(100%-20px,700px)] max-w-sm p-0">
          <Command
           filter={(value, search) => {
            let count = 0;
          
            options.forEach((item) => {
              if (
                (item.label.toLowerCase().includes(search.toLowerCase()) ||
                item.value.toString().includes(search))&&item.value===value
              ) {
                count++;
              }
            });
        
            if (count > 0||value.includes(search)) return 1;
          
            return 0;
          }}
          
          >
            <CommandInput
              placeholder={placeholder ?? "Cari Item..."}
              className="w-full"
              value={query}
              onValueChange={(value: string) => setQuery(value)}
            />
            <CommandEmpty
              onClick={() => {
                if (onCreate) {
                  onCreate(query);
                  setQuery("");
                }
              }}
              className="flex cursor-pointer items-center justify-center gap-1 italic"
            >
              <p>Create: </p>
              <p className="block max-w-48 truncate font-semibold text-primary">
                {query}
              </p>
            </CommandEmpty>
            <ScrollArea className="max-w-full ">
              <div className="max-h-80 w-full">
                <CommandGroup>
                  <CommandList>
                    {options.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={(currentValue) => {
                          onChange(
                            currentValue === selected ? "" : currentValue
                          );
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selected === option.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {option.label}
                      </CommandItem>
                    ))}
                  </CommandList>
                </CommandGroup>
              </div>
            </ScrollArea>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
