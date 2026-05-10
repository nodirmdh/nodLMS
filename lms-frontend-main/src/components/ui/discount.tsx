import { forwardRef } from "react";
import * as React from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}


const DisCountInput = forwardRef<HTMLInputElement, InputProps>(
  ({ className, onChange, ...props }, ref) => {
    const handleChange = (e:any) => {
      const value = e.target.value;
      const numericValue = Math.max(0, Math.min(100, parseInt(value, 10) || 0));
      if (onChange) {
        onChange({
          ...e,
          target: {
            ...e.target,
            value: numericValue,
          },
        });
      }
    };

    return (
      <div className="grid w-full items-center relative ">
          <Input
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
            id="discount"
            min="0"
            max="100"
            ref={ref}
            {...props}
            onChange={handleChange}
          />
          <span className="absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground">%</span>
      </div>
    );
  }
);
DisCountInput.displayName = "DisCountInput";

export { DisCountInput };
