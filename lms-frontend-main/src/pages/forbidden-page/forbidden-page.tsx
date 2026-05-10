import { ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"

export default function ForbiddenPage() {
  const {t} = useTranslation('common')
  return (
    <div className="flex flex-col items-center justify-center pt-[25vh] bg-background text-foreground">
      <div className="text-center space-y-6">
        <ShieldAlert className="w-24 h-24 text-destructive mx-auto" />
        <h1 className="text-2xl font-bold">403 - {t('forbidden')}</h1>
        <p className="text-base">{t('permission')}</p>
        <Button
          onClick={() => window.location.href = '/'}
          className="mt-4"
          size="sm"
        >
          {t('goBack')}
        </Button>
      </div>
    </div>
  )
}
