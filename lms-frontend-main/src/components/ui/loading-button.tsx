import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { forwardRef } from "react";
import { useTranslation } from "react-i18next";

type LoadingButtonProps = ButtonProps & {
  isLoading?: boolean;
};

const ButtonLoading = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  function LoadingButton({ isLoading, children, ...props }, ref) {
    const {t}=useTranslation()
    const loading = isLoading ;

    return (
      <Button ref={ref} disabled={loading} {...props}>
        <>
          {loading ? t("waiting", {ns:'common'}) : children}
          {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
        </>
      </Button>
    );
  },
);

ButtonLoading.displayName = "ButtonLoading";

export { ButtonLoading };
