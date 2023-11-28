import { eachDayOfInterval, parse, getDay } from 'date-fns';

export function createStartDate(startDate: string) {
  const date = new Date(startDate);
  date.setHours(0, 0, 0, 0);

  return date;
}

export function createEndDate(endDate: string) {
  const date = new Date(endDate);
  date.setHours(23, 59, 59, 59);

  return date;
}

export function getKoreanDayOfWeek(): string {
  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
  const today = new Date().getDay();

  return daysOfWeek[today];
}

export function getDate(ymd?: string) {
  const date = new Date(ymd).toISOString().split('T')[0];

  return date;
}

// export function getTotalDays(startDate: string, endDate: string) {
//   const parsedStartDate = parse(startDate, 'yyyy-MM-dd', new Date());
//   const parsedEndDate = parse(endDate, 'yyyy-MM-dd', new Date());

//   const allDates = eachDayOfInterval({
//     start: parsedStartDate,
//     end: parsedEndDate,
//   });

//   return allDates.length;
// }

export function getTotalDays(
  startDate: string,
  endDate: string,
  actionDays: string[],
) {
  const parsedStartDate = parse(startDate, 'yyyy-MM-dd', new Date());
  const parsedEndDate = parse(endDate, 'yyyy-MM-dd', new Date());
  const mapper = {
    일: 0,
    월: 1,
    화: 2,
    수: 3,
    목: 4,
    금: 5,
    토: 6,
  };
  const allDates = eachDayOfInterval({
    start: parsedStartDate,
    end: parsedEndDate,
  });

  const actionDaysNumber: number[] = actionDays.map((v) => mapper[v]);

  const includedDates = allDates.filter((date) => {
    const day = getDay(date);
    return actionDaysNumber.includes(day);
  });

  return includedDates.length;
}
