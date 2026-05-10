import {
  Select as SelectUI,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

interface SelectProps {
  field: any;
  namespace: string;
  options: Array<{ value: string | boolean | number; label: string }>;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const Select = ({
  field,
  options,
  namespace,
  placeholder,
  className,
  disabled,
}: SelectProps) => {
  const { t } = useTranslation(namespace);

  return (
    <SelectUI
      onValueChange={field.onChange}
      defaultValue={field.value}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} className={className} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option, index) => (
            <SelectItem key={index} value={String(option.value)}>
              {t(option.label)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </SelectUI>
  );
};
