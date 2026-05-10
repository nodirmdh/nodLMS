import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { addMinutes, format, parse } from "date-fns";
import { useState, useEffect } from "react";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;



type Days = "even" | "odd" | "every" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"|"nodays";

export function getDays(value: Days[]): string {
  const daysMap: { [key in Days]?: string[] } = {
    even: ["tuesday", "thursday", "saturday"],
    odd: ["monday", "wednesday", "friday"],
    every: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
  };

  const result: string[] = [];

  value.forEach((day) => {
    if (daysMap[day]) {
      result.push(...daysMap[day]!);
    } else {
      result.push(day);
    }
  });

  return result.join(" ");
}

export function removeElementByIndex(array:any[], index:number) {
  if (index >= 0 && index < array.length) {
    array.splice(index, 1);
  }
  return array;
}


export function filterOutNonMatching(
  data:{value: string,label: string}[], groups:{groupId:string,discount:number,discountComment:string}[]
){
  return data.filter(item => {
    return !groups.some(group => group.groupId == item.value);
  });
}

export function filterAndAddLabel(data:{value: string,label: string}[], groups:{groupId:string,discount:number,discountComment:string}[]){
  if(!data||!groups){
    return []
  }
  return groups.map(group => {
      const match = data.find(item => item.value == group.groupId);
      if (match) {
          return { ...group, groupId: match.label };
      }
      return group;
  });
  return []
}



export function formatPhoneNumber(number:string) {
  if(!number){
    return ""
  }
  const cleaned = ('' + number).replace(/\D/g, '');

  const match = cleaned.match(/^(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})$/);

  if (match) {
    return `+${match[1]} ${match[2]}  ${match[3]} ${match[4]} ${match[5]}`;
  }

  return null;
}






export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateTimeArray(
  startTime: string,
  endTime: string
): string[] {
  const times: string[] = [];

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  let currentMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  while (currentMinutes < endMinutes) {
    // Ensure end time is exclusive
    const hours = Math.floor(currentMinutes / 60);
    const minutes = currentMinutes % 60;
    const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
    times.push(formattedTime);
    currentMinutes += 30; // increment by 30 minutes
  }

  return times;
}

export function addThirtyMinutes(timeStr: string) {
  // Парсим строку времени в объект Date
  const time = parse(timeStr, "HH:mm", new Date());

  // Добавляем 30 минут
  const newTime = addMinutes(time, 30);

  // Форматируем новую дату обратно в строку 'HH:mm'
  return format(newTime, "HH:mm");
}

type AnyObject = { [key: string]: any };

export function cleanObject(obj: AnyObject): AnyObject {
  const cleanedObj: AnyObject = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key) && obj[key] !== "") {
      cleanedObj[key] = obj[key];
    }
  }

  return cleanedObj;
}


export function formatAmount(value: string | number) {
  if(!value){
    return ""
  }
  // Agar `value` raqam bo'lsa, avval uni stringga aylantiramiz
  const stringValue = typeof value === "number" ? value.toString() : value;

  // Raqamning butun va kasr qismlarini ajratish
  const [integerPart, decimalPart] = stringValue.split(",");

  // Butun qismini formatlash
  const formattedIntegerPart = integerPart
    .replace(/\s+/g, "") // Bo'sh joylarni olib tashlash
    .replace(/\B(?=(\d{3})+(?!\d))/g, " "); // Har uchta raqamdan keyin bo'sh joy qo'yish

  // Agar kasr qismi mavjud bo'lsa, uni ham qo'shish
  return decimalPart ? `${formattedIntegerPart},${decimalPart}` : formattedIntegerPart;
}
export function formatNumber(value: string) {
  const cleanValue = value.replace(/\s+/g, '');
  return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, '');
}

export function toUrlParams(data: { [key: string]: string | undefined }): string {
  const params = new URLSearchParams();

  for (const key in data) {
    if (data[key]) {
      params.append(key, data[key] as string);
    }
  }

  return `&${params.toString()}`;
}

export function toAuthRoleCheck(allRole:string[],values:string[]){
  let count =0
  allRole.forEach((roles)=>{
    values.forEach((role)=>{
      if(roles===role){
        count++
      }
    })
  })
  if(count>0){
    return true
  }
  return false
}

export const formatDate = (dateStr: string): string => {
  if (dateStr.length !== 8&&!dateStr) return dateStr;
  const day = dateStr.slice(0, 2);
  const month = dateStr.slice(2, 4);
  const year = dateStr.slice(4, 8);
  return `${day}.${month}.${year}`;
};
