import { FC } from "react";
import { IMaskInput } from "react-imask";

interface MaskedFieldProps {
  placeholder?: string;
  className?: string;
  error?: unknown;
  value: string;
  onInput: any;
  mask?: string;
  definitions?: any;
  disabled?: boolean;
}

export const MaskedField: FC<MaskedFieldProps> = ({
  value,
  onInput,
  placeholder,
  className,
  mask = "+{998} (00) 000-00-00",
  definitions,
  disabled = false,
}) => (
  <IMaskInput
    definitions={definitions}
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
      className ? className : ""
    }`}
    mask={mask}
    lazy={false}
    placeholder={placeholder}
    value={value ?? ""}
    defaultValue={value}
    unmask={true}
    onAccept={(e) => {
      setTimeout(() => {
        onInput(e);
      });
    }}
    disabled={disabled}
  />
);
