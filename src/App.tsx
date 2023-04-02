import React, { useEffect, useState, useMemo } from 'react';
import './App.css';
import { ListItem, Box } from '@mui/material';
import List from '@mui/material/List';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import dayjs from 'dayjs';
import { fetch_periods, time, TimeRange, time_range_inter, isBetween } from './util';


interface Room {
  room_id: number;
  status: number;
  name: string;
  seating_capacity: number;
  open_time: dayjs.Dayjs;
  close_time: dayjs.Dayjs;
}

interface Period {
  period_id: number;
  start_time: dayjs.Dayjs;
  end_time: dayjs.Dayjs;
}

interface Reservation {
  resv_id: number;
  username: string;
  slot_id: number;
  name: string;
  title: string;
  status: number;
  start_time: dayjs.Dayjs;
  end_time: dayjs.Dayjs;
}

const fill_time_range_gaps = (time_ranges: any, start: dayjs.Dayjs|null=null, end: dayjs.Dayjs|null=null) =>  {
  if (time_ranges.length === 0) {
    if (start && end) {
      return [{ id: -1, start_time: start, end_time: end }];
    } else {
      return [];
    }
  } else {
    const res: any = [];
    // add first gap if there is any
    if (start && start.isBefore(time_ranges[0].start_time)) {
      res.push({ id: -1, start_time: start, end_time: time_ranges[0].start_time });
    }
    // add gaps in between
    for (let i = 0; i < time_ranges.length; i++) {
      res.push(time_ranges[i]);
      if (i < time_ranges.length - 1 && !time_ranges[i].end_time.isSame(time_ranges[i + 1].start_time)) {
        res.push({ id: time_ranges.length+i, start_time: time_ranges[i].end_time, end_time: time_ranges[i + 1].start_time });
      }
    }
    // add last gap if there is any
    if (end && end.isAfter(time_ranges[time_ranges.length - 1].end_time)) {
      res.push({ id: 2*time_ranges.length, start_time: time_ranges[time_ranges.length - 1].end_time, end_time: end });
    }
    return res;
  }
}

const calculateDuration = (
  periods: Period[],
  reservations: Reservation[],
  breakTime: number,
) => {
  /// `periods` and `reservations` are sorted by (start_time, end_time)
  /// `breakTime` is in seconds
  
  // fill gaps in periods and reservations
  let start: dayjs.Dayjs|null = null;
  let end: dayjs.Dayjs|null = null;
  if (periods.length > 0 && reservations.length > 0) {
    start = periods[0].start_time.isBefore(reservations[0].start_time) ? periods[0].start_time : reservations[0].start_time;
    end = periods[periods.length - 1].end_time.isAfter(reservations[reservations.length - 1].end_time) ? periods[periods.length - 1].end_time : reservations[reservations.length - 1].end_time;
  } else if (periods.length > 0) {
    start = periods[0].start_time;
    end = periods[periods.length - 1].end_time;
  } else if (reservations.length > 0) {
    start = reservations[0].start_time;
    end = reservations[reservations.length - 1].end_time;
  }
  const filledPeriods = fill_time_range_gaps(periods, start, end);
  const filledReservations = fill_time_range_gaps(reservations, start, end);

  // calculate durations of periods
  let totalDuration = 0;
  const resPeriods: { period: any; duration: number }[] = [];
  filledPeriods.forEach((period: TimeRange|Period) => {
    let duration = 'id' in period ? breakTime : period.end_time.diff(period.start_time, 'second');
    resPeriods.push({ 
      period, 
      duration: duration,
    });
    totalDuration += duration;
  });
  // calculate durations of reservations
  let i = 0;
  const resReservations: { reservation: any; duration: number }[] = [];
  filledReservations.forEach((reservation: TimeRange|Reservation) => {
    let duration = 0;
    let j = i < resPeriods.length ? i : resPeriods.length - 1;
    while (j < resPeriods.length) {
      let time_range = 'id' in reservation ? reservation : { id: -1, start_time: reservation.start_time, end_time: reservation.end_time };
      let inter = time_range_inter(resPeriods[j].period, time_range);
      if (inter) {
        let _duration = inter.end_time.diff(inter.start_time, 'second');
        if (_duration > 0) {
            duration += _duration * resPeriods[j].duration / resPeriods[j].period.end_time.diff(resPeriods[j].period.start_time, 'second');
        } else { break; }
      } else { 
        j--;
        break; 
      }
      j++;
    }
    resReservations.push({
      reservation,
      duration,
    });
    if (i === j) { i++; }
    else { i = j; }
  });

  return {
    totalDuration,
    resPeriods,
    resReservations,
  };
}


function ReservationsView({periods, reservations, breakTime}
  : {periods: Period[], reservations: Reservation[], breakTime: number}) {
  const res = calculateDuration(periods, reservations, breakTime);
  return (
    <div
      style={{
        position: 'relative',
      }}
    >
      <ul 
        style={{
          height: '200px',
          width: '100%',
          borderTop: '1px dotted rgba(0,0,0,.1)',
          padding: '0',
          margin: '0',
        }}
      >
        {res.resReservations.map((resReservation) => {
            var height = `${100 * resReservation.duration / res.totalDuration}%`;
            return (
              <li 
                key={resReservation.reservation.id}
                style={{
                  listStyle: 'none',
                  height: `calc(${height} - 1px)`,
                  borderBottom: '1px dotted rgba(0,0,0,.1)',
                  backgroundColor: 'id' in resReservation.reservation ? 'rgba(0,0,0,0)' : '#ebfde0',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    overflow: 'hidden',
                    fontSize: '12px',
                    opacity: '.9',
                  }}
                >
                {'id' in resReservation.reservation ? '' : resReservation.reservation.title}
                </span>
              </li>
        )})}
      </ul>
      <ul 
        style={{
          height: '200px',
          width: '100%',
          borderTop: '1px dotted rgba(0,0,0,.1)',
          padding: '0',
          margin: '0',
          position: 'absolute',
          top: '0',
          left: '0',
        }}
      >
        {res.resPeriods.map((resPeriod) => {
            var height = `${100 * resPeriod.duration / res.totalDuration}%`;
            return (
              <li 
                key={resPeriod.period.id}
                style={{
                  listStyle: 'none',
                  height: `calc(${height} - 1px)`,
                  borderBottom: '1px dotted rgba(0,0,0,.1)',
                  backgroundColor: 'id' in resPeriod.period ? 'rgba(0,0,0,.03)' : undefined,
                }}
              >
              </li>
        )})}
      </ul>
    </div>
  );
}

function RoomView({room, periods, breakTime}
  : {room: Room, periods: Period[], breakTime: number}) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  
  useEffect(() => {
    fetch(`/api/public/reservations?room_id=${room.room_id}`)
      .then(res => res.json())
      .then(data => {
        setReservations(data.map((reservation: any) => {
          return {
            ...reservation,
            start_time: time(reservation.start_time),
            end_time: time(reservation.end_time),
          };
        }));
      });
  }, [room.room_id]);

  return (
    <div
      style={{
        width: '140px',
        border: '1px solid #ccc',
        boxShadow: '0 0 4px rgba(0,0,0,.1)',
        marginRight: '7.2px',
      }}
    >
      <h6
        style={{
          fontSize: '.8em',
          textAlign: 'center',
          padding: '0.2em',
          color: '#1669b8',
          borderBottom: '1px solid #ccc',
          margin: '0',
        }}
      >{room.name}</h6>
      <div
        style={{
          display: 'flex',
          fontSize: '.7em',
          background: '#f8f8f8',
          justifyContent: 'center',
          color: '#999',
          padding: '0 0.2em',
          margin: '0',
        }}
      >
        <span><EventSeatIcon fontSize='inherit'/>{room.seating_capacity}</span>
      </div>
      <div>
        <ReservationsView periods={periods} reservations={reservations} breakTime={breakTime}/>
      </div>
    </div>
  );
}


// fetch('/api/periods')
//     .then(res => res.json())
//     .then(data => {
//       let sum = 0;
//       let periods: (Period|null)[] = [];
//       let prevPeriod: Period|null = null;
//       data.forEach((period: any) => {
//           const start_time = time(period.start_time);
//           const end_time = time(period.end_time);
//           if (prevPeriod && start_time.diff(prevPeriod.end_time) !== 0) {
//             periods.push(null);
//             sum += breakTime;
//           } 
//           prevPeriod = { ...period, start_time, end_time };
//           periods.push(prevPeriod);
//           sum += end_time.diff(start_time, 'second');
//         });
//       setTimeSum(sum);
//       setPeriods(periods);
//       console.log("periods fetched");
//     })
//     .catch(err => console.error(err));


// function PeriodsView({ periods, timeSum, breakTime }: 
//   { periods: (Period|null)[], timeSum: number, breakTime: number }) {
//   return (
//     <ul 
//           style={{
//             height: '200px',
//             borderTop: '1px dotted rgba(0,0,0,.1)',
//             padding: '0',
//             margin: '0',
//           }}
//         >
//           {periods.map((period: Period|null) => {
//             var height = period ? `${100 * (period.end_time.diff(period.start_time, 'second') / timeSum)}%` : `${100 * (breakTime / timeSum)}%`;
//             return (
//               <li 
//                 key={period?.period_id}
//                 style={{
//                   listStyle: 'none',
//                   height: `calc(${height} - 1px)`,
//                   borderBottom: '1px dotted rgba(0,0,0,.1)',
//                   backgroundColor: period ? undefined : 'rgba(0,0,0,.03)',
//                 }}
//               >
//               </li>
//             )})}
//         </ul>
//   );
// }

function App() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const breakTime = 15 * 60;

  useEffect(() => {
    fetch('/api/rooms')
      .then(res => res.json())
      .then(data => {
        const rooms = data.map((room: any) => {
          return {
            ...room,
            open_time: time(room.open_time),
            close_time: time(room.close_time),
          };
        });
        setRooms(rooms);
      })
      .catch(err => console.error(err));
      
    fetch_periods()
      .then(periods => {
        setPeriods(periods.map((period: TimeRange) => {
          return {
            period_id: period.id,
            start_time: period.start_time,
            end_time: period.end_time,
          }
        }));
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        overflow: 'auto',
        flex: '1 1 auto',
        width: '100%',
      }}
    >
    {rooms.map((room: Room) => (
      <RoomView room={room} periods={periods} breakTime={breakTime}/>
    ))}
    </div>
  );

//   return (
//     <div
//       style={{
//         display: 'flex',
//         overflow: 'auto',
//         flex: '1 1 auto',
//         width: '100%',
//       }}
//     >
//     {rooms.map((room: Room) => (
//       <div
//         style={{
//           width: '140px',
//           border: '1px solid #ccc',
//           boxShadow: '0 0 4px rgba(0,0,0,.1)',
//           marginRight: '7.2px',
//         }}
//       >
//         <h6
//           style={{
//             fontSize: '.8em',
//             textAlign: 'center',
//             padding: '0.2em',
//             color: '#1669b8',
//             borderBottom: '1px solid #ccc',
//             margin: '0',
//           }}
//         >{room.name}</h6>
//         <div
//           style={{
//             display: 'flex',
//             fontSize: '.7em',
//             background: '#f8f8f8',
//             justifyContent: 'center',
//             color: '#999',
//             padding: '0 0.2em',
//             margin: '0',
//           }}
//         >
//           <span><EventSeatIcon fontSize='inherit'/>{room.seating_capacity}</span>
//         </div>
//         <div>
//           <PeriodsView periods={periods} timeSum={timeSum} breakTime={breakTime} />
//         </div>
//       </div>
//     ))}
//     </div>
//   );
}

export default App;
