import dayjs from "dayjs";

export interface Dict {
    [key: string]: any;
}

export interface Period {
    period_id: number;
    start_time: dayjs.Dayjs;
    end_time: dayjs.Dayjs;
}

export interface Reservation {
  resv_id: number;
  username: string;
  slot_id: number;
  name: string;
  title: string;
  status: number;
  start_time: dayjs.Dayjs;
  end_time: dayjs.Dayjs;
}

export interface Room {
  room_id: number;
  status: number;
  name: string;
  seating_capacity: number;
  open_time: dayjs.Dayjs;
  close_time: dayjs.Dayjs;
}

export interface RoomType {
    type: number;
    label: string;
}

export interface User {
    username: string;
    password: string;
    role: number;
    name: string;
    email?: string;
};