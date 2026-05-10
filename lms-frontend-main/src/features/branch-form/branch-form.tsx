import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { branchSchema } from "./schema";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { BranchBody } from "@/app/store/services/branch.service";
import { useToast } from "@/components/ui/use-toast";
import { ButtonLoading } from "@/components/ui/loading-button";

interface BranchFormProps {
  type: "create" | "update";
  initialValues: BranchBody;
  submitForm: (values: BranchBody) => Promise<any>;
  isLoading:boolean
}

export const BranchForm = ({
  type,
  initialValues,
  submitForm,
  isLoading
}: BranchFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation(["branch", "common"]);

  const form = useForm<z.infer<typeof branchSchema>>({
    resolver: zodResolver(branchSchema),
    values: initialValues,
  });

  const onSubmit = (values: z.infer<typeof branchSchema>) =>
    submitForm(values)
      .then(() => {
        navigate("/branches");
        toast({
          title: t("success", { ns: "common" }),
          description: ``,
        });
      })
      .catch(() =>
        toast({
          title: t("error", { ns: "common" }),
          description: ``,
          variant: "destructive",
        })
      );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="w-full max-w-4xl">
          <CardHeader>
            <CardTitle className="text-2xl">{t(type)}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className={"grid gap-2"}>
                  <FormLabel>{t("name")}</FormLabel>
                  <FormControl>
                    <Input required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className={"grid gap-2"}>
                  <FormLabel>{t("address")}</FormLabel>
                  <FormControl>
                    <Input required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <div className="w-full flex row gap-3">
              <Link to={"/branches"} className="w-1/2">
                <Button variant="outline" className="w-full">
                  {t("cancel", { ns: "common" })}
                </Button>
              </Link>
              <ButtonLoading className="grow" isLoading={isLoading}>
                {t(type)}
              </ButtonLoading>
            </div>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};
