import { $Enums } from '@prisma/client';
import { startOfMonth, endOfMonth, addDays, getDay, format } from 'date-fns';

export function countLessonsInMonth(month, classDays) {
  const year = new Date().getFullYear(); // текущий год
  const start = startOfMonth(new Date(year, month - 1));
  const end = endOfMonth(new Date(year, month - 1));

  let lessonCount = 0;

  for (let day = start; day <= end; day = addDays(day, 1)) {
    const dayOfWeek = format(day, 'EEEE'); // форматируем день в строку (например, 'Monday')

    if (classDays.includes('every')) {
      if (dayOfWeek !== 'Sunday') {
        lessonCount++;
      }
    } else if (classDays.includes('odd')) {
      if (
        dayOfWeek === 'Monday' ||
        dayOfWeek === 'Wednesday' ||
        dayOfWeek === 'Friday'
      ) {
        lessonCount++;
      }
    } else if (classDays.includes('even')) {
      if (
        dayOfWeek === 'Tuesday' ||
        dayOfWeek === 'Thursday' ||
        dayOfWeek === 'Saturday'
      ) {
        lessonCount++;
      }
    } else if (classDays.includes(dayOfWeek)) {
      lessonCount++;
    }
  }

  return lessonCount;
}
