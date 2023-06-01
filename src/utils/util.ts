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

export class Time {
    /** @class Time
     * Time class is used to represent time in the format of HH:mm:ss
     * 
     * @param time - time in the format of HH:mm:ss or HH:mm or a number of seconds
     * @example
     * const t1 = new Time(3600); // 01:00:00
     * const t2 = new Time('3600'); // 01:00:00
     * const t3 = new Time('01:00:00'); // 01:00:00
     * const t4 = new Time('01:00'); // 01:00:00
     */
    private _time: number = 0;

    constructor(time: number|string) {
        if (typeof time === 'number') {
            this._time = time;
        } else if (typeof time === 'string') {
            const re = /(\d+)(?::(\d\d?))?(?::(\d\d)?)?/;
            const res = re.exec(time);
            if (res === null) {
                throw new Error(`Invalid time string: ${time}`);
            } else {
                let [hour, minute, second] = res.slice(1).map((x) => parseInt(x));
                if (isNaN(minute) && isNaN(second)) {
                    [hour, minute, second] = [0, 0, hour];
                } else if (isNaN(minute)) {
                    minute = 0;
                } else if (isNaN(second)) {
                    second = 0;
                }
                this._time = hour * 3600 + minute * 60 + second;
            }
        }
    }

    get hour() {
        return Math.floor(this._time / 3600);
    }

    get minute() {
        return Math.floor((this._time % 3600) / 60);
    }

    get second() {
        return this._time % 60;
    }

    get totalSeconds() {
        return this._time;
    }

    equals(t: Time) {
        return this.totalSeconds === t.totalSeconds;
    }

    lessThan(t: Time) {
        return this.totalSeconds < t.totalSeconds;
    }
    
    format(template: string = 'HH:mm:ss') {
        let hour = `${this.hour}`.padStart(2, '0');
        let minute = `${this.minute}`.padStart(2, '0');
        let second = `${this.second}`.padStart(2, '0');

        template = template.toLowerCase();
        return template.replace('hh', hour).replace('mm', minute).replace('ss', second);
    }
}

export const time = (t: string|number) => {
    return new Time(t);
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