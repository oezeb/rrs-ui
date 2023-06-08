import dayjs from 'dayjs';
import { resv_status, room_status } from './api';

export const email_regex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

export const resvStatusColors = {
    [resv_status.pending as number]: "#FFC107" as const,
    [resv_status.confirmed as number]: "#00CC66" as const,
    [resv_status.cancelled as number]: "#A9A9A9" as const,
    [resv_status.rejected as number]: "#FF5733" as const,
};

export const roomStatusColors = {
    [room_status.unavailable as number]: "#FF5733" as const,
    [room_status.available as number]: "#00CC66" as const,
};

interface TimeDeltaParams {
    days?: number|string,
    hours?: number|string,
    minutes?: number|string,
    seconds?: number|string,
}

export class TimeDelta {
    private _totalSeconds: number = 0;

    constructor({ days=0, hours=0, minutes=0, seconds=0 }: TimeDeltaParams) {
        this._totalSeconds = +days * 24 * 3600 + +hours * 3600 + +minutes * 60 + +seconds;
    }

    static from(str: string) {
        /**
         * @param {string} str - A string in the format of 'HH:mm:ss' or 'HH:mm' or 'ss'
         */
        let [hour, minute, second] = str.split(':').map(Number);
        if (minute === undefined && second === undefined) {
            second = hour;
            hour = 0;
        }
        return new TimeDelta({ hours: hour, minutes: minute, seconds: second });
    }

    get hour() { return Math.floor(this._totalSeconds / 3600); }
    get minute() { return Math.floor((this._totalSeconds % 3600) / 60); }
    get second() { return this._totalSeconds % 60; }
    get totalSeconds() { return this._totalSeconds; }

    equals(t: TimeDelta) {
        return this.totalSeconds === t.totalSeconds;
    }

    lessThan(t: TimeDelta) {
        return this.totalSeconds < t.totalSeconds;
    }
    
    format(template: string = 'HH:mm:ss') {
        let hour = `${this.hour}`.padStart(2, '0');
        let minute = `${this.minute}`.padStart(2, '0');
        let second = `${this.second}`.padStart(2, '0');

        template = template.toLowerCase();
        return template.replace('hh', hour).replace('mm', minute).replace('ss', second);
    }

    toString() {
        return this.format();
    }
}

export const fileToBase64 = (file: File, callback: (data: string|undefined) => void) => {
    // https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
    // Note: To retrieve only the Base64 encoded string, first remove data:*/*;base64, from the result.
    const reader = new FileReader();
    reader.onload = () => {
        let base64 = reader.result?.toString().split(',')[1];
        callback(base64);
    };
    reader.readAsDataURL(file);
}

export type Order = 'asc' | 'desc';
export type DescendingComparator<T> = (a: T, b: T, orderBy: keyof T) => number;

export function descComp<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

export function getComparator<T>(
    order: Order,
    orderBy: keyof T,
    _descComp: DescendingComparator<T>=descComp,
  ): (
    a: T,
    b: T,
  ) => number {
    return order === 'desc'
        ? (a, b) => _descComp(a, b, orderBy)
        : (a, b) => -_descComp(a, b, orderBy);
}


export type TimeFilter = "全部" | "当前" | "历史";

export const selectTimeSlot = (
    time_slots: Record<string, any>[],
    timeFilter?: TimeFilter,
) => {
    if (time_slots.length === 0) return null;
    let now = dayjs();
    let time_slot = null;
    if (timeFilter !== undefined) {
        if (timeFilter === "当前" || timeFilter === "全部") {
            time_slot = time_slots.find((ts) => {
                return ts.end_time.isAfter(now)
            });
        } else if (timeFilter === "历史") {
            time_slot = time_slots.find((ts) => {
                return ts.end_time.isBefore(now)
            });
        }
    }
    return time_slot ?? time_slots[0];
}

export const compareTimeSlot = (a: Record<string, any>|null, b: Record<string, any>|null) => {  
    if (a === null && b === null) {
        return 0;
    } else if (a === null) {
        return -1;
    } else if (b === null) {
        return 1;
    } else if (a.start_time.isBefore(b.start_time)) {
        return -1;
    } else if (a.start_time.isAfter(b.start_time)) {
        return 1;
    } else if (a.end_time.isBefore(b.end_time)) {
        return -1;
    } else if (a.end_time.isAfter(b.end_time)) {
        return 1;
    } else {
        return 0;
    }
}

export const labelFieldParams = {
    variant: "standard",
    id: "label",
    name: "label",
    required: true,
    size: "small",
    fullWidth: true,
} as const;

export const descriptionFieldParams = {
    id: "description",
    name: "description",
    multiline: true,
    minRows: 3,
    maxRows: 5,
    size: "small",
    fullWidth: true,
} as const;

export const UsernameFieldParams = {
    id: "username",
    name: "username",
    inputProps: { minLength: 1, pattern: "[a-zA-Z0-9_]+" },
    variant: "standard",
    fullWidth: true,
    required: true,
} as const;

export const PasswordFieldParams = {
    id: "password",
    name: "password",
    type: "password",
    inputProps: { minLength: 1 },
    variant: "standard",
    fullWidth: true,
    required: true,
} as const;

export const NameFieldParams = {
    id: "name",
    name: "name",
    inputProps: { minLength: 1 },
    variant: "standard",
    fullWidth: true,
    required: true,
} as const;

export const EmailFieldParams = {
    id: "email",
    name: "email",
    type: "email",
    inputProps: { pattern: email_regex.source },
    variant: "standard",
    fullWidth: true,
} as const;