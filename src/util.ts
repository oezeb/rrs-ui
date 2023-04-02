import dayjs from 'dayjs';

interface TimeRange {
  id: number;
  start_time: dayjs.Dayjs;
  end_time: dayjs.Dayjs;
}

const time = (t: string) => {
  const re = /\d+:\d\d?(:\d\d?)?/;
  const res = re.exec(t);
  return res ? dayjs(`1970-01-01 ${res[0]}`) : undefined;
}

let _periods: TimeRange[]|null = null;
const fetch_periods = async (no_cache: boolean = true) => {
  if (no_cache === false && _periods != null) {
    return _periods;
  } else {
    const res = await fetch('/api/periods');
    const data = await res.json();
    _periods = [];
    data.forEach((period: any) => {
      const start_time = time(period.start_time);
      const end_time = time(period.end_time);
      if (start_time && end_time) {
        _periods?.push({
          ...period,
          start_time: start_time,
          end_time: end_time
        });
      }
    });
    return _periods;
  }
}

const isBetween = (t: dayjs.Dayjs, a: dayjs.Dayjs, b: dayjs.Dayjs) => a.isBefore(b) ? a.isBefore(t) && t.isBefore(b) : b.isBefore(t) && t.isBefore(a);

const time_range_inter = (a: TimeRange, b: TimeRange) => {
  const _isBetween = (t: dayjs.Dayjs) => isBetween(t, b.start_time, b.end_time) || t.isSame(b.start_time) || t.isSame(b.end_time);
  if (_isBetween(a.start_time)) {
    return {
        start_time: a.start_time,
        end_time: a.end_time.isBefore(b.end_time) ? a.end_time : b.end_time,
    };
  } else if (_isBetween(a.end_time)) {
    return {
      start_time: a.start_time.isAfter(b.start_time) ? a.start_time : b.start_time,
      end_time: a.end_time,
    };
  } else {
    return null;
  }
};
  
export { time, isBetween, time_range_inter, fetch_periods };
export type { TimeRange };

/*
Given two typescript arrays:
    periods: {
        period_id: number;
        start_time: dayjs.Dayjs;
        end_time: dayjs.Dayjs;
    }[];
    reservations: {
        resv_id: number;
        start_time: dayjs.Dayjs;
        end_time: dayjs.Dayjs;
    }[];
(both are sorted and have same Date, so only time is important)
And `breakTime: number` (in seconds).

Create new arrays that contains not only the previons elements but also
the gaps between them. Each gap will have `start_time`=`end_time` of the
previous element and `end_time`=`start_time` of the next element.
There may be gaps at the beginning and(or) the end of the array.

Our gaol is to calculate the `total duration` (in seconds) and
the `duration` (in seconds) of each element in the new arrays.

But there is only one problem: the `duration` of the gaps in new array of 
periods no matter how long they are, are counted as `breakTime`.

the duration in reservations array depend on the durations in periods.

write a function that returns the `total duration` of the two arrays 
where each element has a `duration` property.

An example to better understand:

Input:
```ts
const periods = [
    {
        period_id: 4,
        start_time: dayjs('1970-01-01 11:00'),
        end_time: dayjs('1970-01-01 12:00'),
    },
    {
        period_id: 5,
        start_time: dayjs('1970-01-01 14:00'),
        end_time: dayjs('1970-01-01 15:00'),
    }
];
const reservations = [
    {
        resv_id: 1,
        start_time: dayjs('1970-01-01 10:00'),
        end_time: dayjs('1970-01-01 11:30'),
    },
    {
        resv_id: 2,
        start_time: dayjs('1970-01-01 13:30'),
        end_time: dayjs('1970-01-01 14:30'),
    }
];
const breakTime = 900;
```

output:
```ts
resultPeriods = [
    {
        period_id: -1,
        start_time: dayjs('1970-01-01 10:00'),
        end_time: dayjs('1970-01-01 11:00'),
        duration: 900, // `breakTime`
    },
    {
        period_id: 4,
        start_time: dayjs('1970-01-01 11:00'),
        end_time: dayjs('1970-01-01 12:00'),
        duration: 3600, // `end_time - start_time`
    },
    {
        period_id: -1,
        start_time: dayjs('1970-01-01 12:00'),
        end_time: dayjs('1970-01-01 14:00'),
        duration: 900, // `breakTime`
    },
    {
        period_id: 5,
        start_time: dayjs('1970-01-01 14:00'),
        end_time: dayjs('1970-01-01 15:00'),
        duration: 3600, // `end_time - start_time`
    }
];
resultReservations = [
    {
        resv_id: 1,
        start_time: dayjs('1970-01-01 10:00'),
        end_time: dayjs('1970-01-01 11:30'),
        duration: 2700 // `duration` of the first period(`breakTime`=900)+30min from the second period
    },
    {
        resv_id: -1,
        start_time: dayjs('1970-01-01 11:30'),
        end_time: dayjs('1970-01-01 13:30'),
        duration: 2475 // 30min+(`breakTime`*1h30min/2h)
    },
    {
        resv_id: 2,
        start_time: dayjs('1970-01-01 13:30'),
        end_time: dayjs('1970-01-01 14:30'),
        duration: 2025 // (`breakTime`*30min/2h) + 30min
    }
    {
        resv_id: -1,
        start_time: dayjs('1970-01-01 14:30'),
        end_time: dayjs('1970-01-01 15:00'),
        duration: 1800 // 30min
    },
];

totalDuration=900+3600+900+3600=2700+2475+2025+1800=9000
```


*/