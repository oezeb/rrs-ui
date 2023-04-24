import dayjs from "dayjs";

export const email_regex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

export const SecuLevel = {
    public: 0,
    private: 2,
};

export const ResvStatus = {
    pending: 0,
    confirmed: 1,
    cancelled: 2,
    rejected: 3,
};

export const RoomStatus = {
    unavailable: 0,
    available: 1,
};

export const UserRole = {
    blocked: -1,
    restricted: 0,
    basic: 1,
    advanced: 2,
    admin: 3,
};

export const Setting = {
    timeWindow: 1,
    timeLimit: 2,
    maxDaily: 3,
};

export const time = (t: string) => {
    const re = /\d+:\d\d?(:\d\d?)?/;
    const res = re.exec(t);
    return dayjs(res ? `1970-01-01 ${res[0]}` : null);
}

export const FileToBase64 = (file: File, callback: (data: string|undefined) => void) => {
    const reader = new FileReader();
    reader.onload = () => {
        let base64 = reader.result?.toString()
            .replace('data:', '')
            .replace(/^.+,/, '');
        callback(base64);
    };
    reader.readAsDataURL(file);
}

export const compareStartEndTime = (a: any, b: any) => {
    // used for sorting objects with `start_time` and `end_time` Day.js objects
    if (a.start_time.isBefore(b.start_time)) {
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

export const groupResvTimeSlots = (resvs: Record<string, any>[]) => {
    return Object.values(resvs.reduce((acc: Record<string, any>, resv: any) => {
        let _key = `${resv.resv_id}-${resv.username}`;
        if (acc[_key] === undefined) {
            acc[_key] = resv;
            acc[_key].time_slots = [];
        }
        acc[_key].time_slots.push({
            start_time: dayjs(resv.start_time),
            end_time: dayjs(resv.end_time),
        });
        return acc;
    }, {}));
}
  
export const defaultLanguage: string = "zh";

const _linksMemo: Record<string, any> = {};
export const links = (lang_code: string, baseURL: string) => {
  let key = `${lang_code}${baseURL}`;
  if (!(key in _linksMemo)) {
    const links: Record<string, any> = {};
    if (lang_code === defaultLanguage) {
        links.home = "/";
        links.login = "/login";
        links.register = "/register";
        links.notices = "/notices";
        links.profile = "/profile";
        links.reservation = "/reservation";
    } else {
        links.home = `/${lang_code}`;
        links.login = `/${lang_code}/login`;
        links.register = `/${lang_code}/register`;
        links.notices = `/${lang_code}/notices`;
        links.profile = `/${lang_code}/profile`;
        links.reservation = `/${lang_code}/reservation`;
    }

    if (defaultLanguage === "en") {
        links.chineseVersion = `/zh${baseURL}`;
        links.englishVersion = baseURL;
    } else {
        links.chineseVersion = baseURL;
        links.englishVersion = `/en${baseURL}`;
    }
    _linksMemo[key] = links;
  }
  return _linksMemo[key];
}

const _fetch = async (url: string) => {
    try {
        const res = await fetch(url);
        return await res.json();
    } catch (e) {
        console.error(e);
        return null;
    }
}

export const fetchTranslation = async (url: string, lang_code: string) => {
    if (lang_code === defaultLanguage) {
        return await _fetch(url);
    } else {
        let data = await _fetch(url.indexOf('?') > 0 ? 
            `${url}&lang_code=${lang_code}` : `${url}?lang_code=${lang_code}`);
        if (data == null || Object.keys(data).length === 0) {
            data = await _fetch(url);
        }
        return data;
    }
}