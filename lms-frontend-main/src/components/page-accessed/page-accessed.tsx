import {FC} from 'react'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useTranslation } from 'react-i18next'
import {useNavigate } from 'react-router-dom';

interface IPage {
    paht:string;
    info:string;
    title:string;
} 

export const PageAccessed:FC<IPage> = ({title,info,paht}) => {
    const {t}=useTranslation("group")
    const navigate=useNavigate()
  return (
    <Card className="max-w-[750px] py-4">
      <CardHeader>
        <CardTitle className='text-center'>{title}</CardTitle>
        <CardDescription>{info}</CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between gap-2">
        <Button variant="outline" className='w-full' size="sm" onClick={()=>navigate(-1)}>{t("cancel")}</Button>
        <Button onClick={()=>navigate(paht)} className='w-full' size="sm">{t("add")}</Button>
      </CardFooter>
    </Card>
  )
}