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
  title: string;
  status: number;
  secu_level: number;
  room_id: number;
  session_id: number;
  start_time: dayjs.Dayjs;
  end_time: dayjs.Dayjs;
}

export interface Room {
  room_id: number;
  status: number;
  name: string;
  capacity: number;
  open_time: dayjs.Dayjs;
  close_time: dayjs.Dayjs;
}

export interface RoomTrans {
  room_id: number;
  lang_code: string;
  name: string;
}

export interface RoomType {
    type: number;
    label: string;
}

export interface User {
    username: string;
    role: number;
    name: string;
    email?: string;
};

export interface Notice {
  username: string;
  notice_id: number;
  title: string;
  content: string;
  create_time: dayjs.Dayjs;
  update_time: dayjs.Dayjs | null;
}