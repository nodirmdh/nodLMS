import { FileQuestion } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

export default function NotFound() {
    const {t} = useTranslation('common')
  return (
    <div className="flex flex-col items-center justify-center pt-[25vh] bg-background text-foreground">
      <div className="text-center space-y-6">
        <div className="animate-bounce">
          <FileQuestion className="w-24 h-24 text-muted-foreground mx-auto" />
        </div>
        <h1 className="text-2xl font-bold">404 - {t("notFound")}</h1>
        <p className="text-lg max-w-prose">{t("exists")}</p>
        <Button asChild className="mt-4" size="lg">
          <Link to="/">
            {t('goBack')}
          </Link>
        </Button>
      </div>
    </div>
  )
}