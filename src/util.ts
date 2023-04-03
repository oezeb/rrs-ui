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

// const isBetween = (t: dayjs.Dayjs, a: dayjs.Dayjs, b: dayjs.Dayjs) => a.isBefore(b) ? a.isBefore(t) && t.isBefore(b) : b.isBefore(t) && t.isBefore(a);

// const time_range_inter = (a: TimeRange, b: TimeRange) => {
//   const _isBetween = (t: dayjs.Dayjs) => isBetween(t, b.start_time, b.end_time) || t.isSame(b.start_time) || t.isSame(b.end_time);
//   if (_isBetween(a.start_time)) {
//     return {
//         start_time: a.start_time,
//         end_time: a.end_time.isBefore(b.end_time) ? a.end_time : b.end_time,
//     };
//   } else if (_isBetween(a.end_time)) {
//     return {
//       start_time: a.start_time.isAfter(b.start_time) ? a.start_time : b.start_time,
//       end_time: a.end_time,
//     };
//   } else {
//     return null;
//   }
// };
  
export { time,  fetch_periods };

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

/*
// import React, { useEffect, useState, useMemo } from 'react';
// import './App.css';
// import { ListItem, Box } from '@mui/material';
// import List from '@mui/material/List';
// import EventSeatIcon from '@mui/icons-material/EventSeat';
// import dayjs from 'dayjs';
// import { fetch_periods, time, TimeRange, time_range_inter, isBetween } from './util';


// interface Period {
//   period_id: number;
//   start_time: dayjs.Dayjs;
//   end_time: dayjs.Dayjs;
// }

// interface Reservation {
//   resv_id: number;
//   username: string;
//   slot_id: number;
//   name: string;
//   title: string;
//   status: number;
//   start_time: dayjs.Dayjs;
//   end_time: dayjs.Dayjs;
// }

// interface Room {
//   room_id: number;
//   status: number;
//   name: string;
//   seating_capacity: number;
//   open_time: dayjs.Dayjs;
//   close_time: dayjs.Dayjs;
// }

// const Views = ({data, start, end, color}
//   : {data: (Period | Reservation)[], start: dayjs.Dayjs, end: dayjs.Dayjs, color: string}) => {
//   const totalDuration = end.diff(start, 'second');
//   console.log("Total Duration: ", totalDuration, " seconds");
//   const views: JSX.Element[] = [];
//   const view = (key:any, start:dayjs.Dayjs, end:dayjs.Dayjs, bgcolor=false) => {
//     return (
//       <Box
//         key={key}
//         height={`${100 * end.diff(start, 'second') / totalDuration}%`}
//         borderBottom="1px dotted rgba(0,0,0,.1)"
//         bgcolor={bgcolor? color : undefined }
//       />
//     );
//   };

//   data.forEach((item, i) => {
//     if (i <= 0 && start.isBefore(item.start_time)) {
//       views.push(view(data.length + i, start, item.start_time, true))
//     }

//     if (i > 0 && data[i - 1].end_time.isBefore(item.start_time)) {
//       views.push(view(data.length + i, data[i - 1].end_time, item.start_time, true))
//     }

//     let key = 'period_id' in item? item.period_id : item.resv_id;
//     views.push(view(key, item.start_time, item.end_time, false));

//     if (i >= data.length - 1 && item.end_time.isBefore(end)) {
//       views.push(view(2*data.length + i, item.end_time, end, true))
//     }
//   });

//   return (
//     <Box
//       height={140}
//     >{views}</Box>
//   );
// }

// const PeriodsView = ({periods, start, end}
//   : {periods: Period[], start: dayjs.Dayjs, end: dayjs.Dayjs}) => {
//     return (
//       <Views data={periods} start={start} end={end} color="rgba(0,0,0,.03)" />
//     );
// }

// const ReservationsView = ({reservations, start, end}
//   : {reservations: Reservation[], start: dayjs.Dayjs, end: dayjs.Dayjs}) => {
//   return (
//     <Views data={reservations} start={start} end={end} color="#ebfde0" />
//   );
// }


// // function ReservationsView({periods, reservations, breakTime}
// //   : {periods: Period[], reservations: Reservation[], breakTime: number}) {
// //   // const res = calculateDuration(periods, reservations, breakTime);
// //   return (
// //     <div
// //       style={{
// //         position: 'relative',
// //       }}
// //     >
// //       <ul 
// //         style={{
// //           height: '200px',
// //           width: '100%',
// //           borderTop: '1px dotted rgba(0,0,0,.1)',
// //           padding: '0',
// //           margin: '0',
// //         }}
// //       >
// //         {reservations.map((reservation) => {
// //           var duration = reservation.end_time.diff(reservation.start_time, 'second');
// //             var height = `${100 * resReservation.duration / res.totalDuration}%`;
// //             return (
// //               <li 
// //                 key={resReservation.reservation.id}
// //                 style={{
// //                   listStyle: 'none',
// //                   height: `calc(${height} - 1px)`,
// //                   borderBottom: '1px dotted rgba(0,0,0,.1)',
// //                   backgroundColor: 'id' in resReservation.reservation ? 'rgba(0,0,0,0)' : '#ebfde0',
// //                 }}
// //               >
// //                 <span
// //                   style={{
// //                     display: 'block',
// //                     textAlign: 'center',
// //                     overflow: 'hidden',
// //                     fontSize: '12px',
// //                     opacity: '.9',
// //                   }}
// //                 >
// //                 {'id' in resReservation.reservation ? '' : resReservation.reservation.title}
// //                 </span>
// //               </li>
// //         )})}
// //       </ul>
// //       <ul 
// //         style={{
// //           height: '200px',
// //           width: '100%',
// //           borderTop: '1px dotted rgba(0,0,0,.1)',
// //           padding: '0',
// //           margin: '0',
// //           position: 'absolute',
// //           top: '0',
// //           left: '0',
// //         }}
// //       >
// //         {res.resPeriods.map((resPeriod) => {
// //             var height = `${100 * resPeriod.duration / res.totalDuration}%`;
// //             return (
// //               <li 
// //                 key={resPeriod.period.id}
// //                 style={{
// //                   listStyle: 'none',
// //                   height: `calc(${height} - 1px)`,
// //                   borderBottom: '1px dotted rgba(0,0,0,.1)',
// //                   backgroundColor: 'id' in resPeriod.period ? 'rgba(0,0,0,.03)' : undefined,
// //                 }}
// //               >
// //               </li>
// //         )})}
// //       </ul>
// //     </div>
// //   );
// // }

// function RoomView({room}
//   : {room: Room}) {
//   const [periods, setPeriods] = useState<Period[]>([]);
//   const [reservations, setReservations] = useState<Reservation[]>([]);
//   let start = null, end = null;

//   useEffect(() => {
//     fetch_periods()
//       .then(periods => {
//         setPeriods(periods.map((period: TimeRange) => {
//           return {
//             period_id: period.id,
//             start_time: period.start_time,
//             end_time: period.end_time,
//           }
//         }));
//       })
//       .catch(err => console.error(err));

//     fetch(`/api/public/reservations?room_id=${room.room_id}`)
//       .then(res => res.json())
//       .then(data => {
//         const reservations = data.map((reservation: any) => {
//           return {
//             ...reservation,
//             start_time: time(reservation.start_time),
//             end_time: time(reservation.end_time),
//           };
//         });
//         setReservations(reservations);
//       });
//   }, [room.room_id]);

//   if (periods.length > 0 && reservations.length > 0) {
//     if (periods[0].start_time.isBefore(reservations[0].start_time)) {
//       start = periods[0].start_time;
//     }
//     else {
//       start = reservations[0].start_time;
//     }
//     if (periods[periods.length - 1].end_time.isAfter(reservations[reservations.length - 1].end_time)) {
//       end = periods[periods.length - 1].end_time;
//     }
//     else {
//       end = reservations[reservations.length - 1].end_time;
//     }
//   }

//   return (
//     <Box
//       width='140px'
//       border='1px solid #ccc'
//       boxShadow='0 0 4px rgba(0,0,0,.1)'
//       margin='3px'
//     >
//       <h6
//         style={{
//           fontSize: '.8em',
//           textAlign: 'center',
//           padding: '0.2em',
//           color: '#1669b8',
//           borderBottom: '1px solid #ccc',
//           margin: '0',
//         }}
//       >{room.name}</h6>
//       <div
//         style={{
//           display: 'flex',
//           fontSize: '.7em',
//           background: '#f8f8f8',
//           justifyContent: 'center',
//           color: '#999',
//           padding: '0 0.2em',
//           margin: '0',
//         }}
//       >
//         <span><EventSeatIcon fontSize='inherit'/>{room.seating_capacity}</span>
//       </div>
//       <div>
//         <Box>
//           {start && end && <PeriodsView periods={periods} start={start} end={end}/>
//           && <ReservationsView reservations={reservations} start={start} end={end}/>}
//         </Box>
//       </div>
//     </Box>
//   );
// }

// // function App() {
// //   const [rooms, setRooms] = useState<Room[]>([]);

// //   useEffect(() => {
// //     fetch('/api/rooms')
// //       .then(res => res.json())
// //       .then(data => {
// //         const rooms = data.map((room: any) => {
// //           return {
// //             ...room,
// //             open_time: time(room.open_time),
// //             close_time: time(room.close_time),
// //           };
// //         });
// //         setRooms(rooms);
// //       })
// //       .catch(err => console.error(err));
// //   }, []);

// //   return (
// //     <Box
// //       display='flex'
// //       flexWrap='wrap'
// //     >
// //       {rooms.map((room: Room) => (
// //         <RoomView key={room.room_id} room={room} />
// //       ))}
// //     </Box>
// //   );
// // }

// function App() {
//   const [periods, setPeriods] = useState<Period[]>([]);

//   useEffect(() => {
//     fetch_periods()
//       .then(periods => {
//         setPeriods(periods.map((period: TimeRange) => {
//           return {
//             period_id: period.id,
//             start_time: period.start_time,
//             end_time: period.end_time,
//           }
//         }));
//       })
//       .catch(err => console.error(err));
//   }
// }

// export default App;
*/