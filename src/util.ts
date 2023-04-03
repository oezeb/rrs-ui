import { Period } from "./types";
import dayjs from "dayjs";

const time = (t: string) => {
  const re = /\d+:\d\d?(:\d\d?)?/;
  const res = re.exec(t);
  return dayjs(res ? `1970-01-01 ${res[0]}` : null);
}

let _periods: Period[]|null = null;
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
  
export { time,  fetch_periods };
