import dayjs from "dayjs";

export const email_regex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

export const time = (t: string) => {
    const re = /\d+:\d\d?(:\d\d?)?/;
    const res = re.exec(t);
    return dayjs(res ? `1970-01-01 ${res[0]}` : null);
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

let _periodsMemo: Record<string, any>[]|null = null;
export const fetchPeriods = async (no_cache: boolean = true) => {
    if (no_cache || _periodsMemo == null) {
        const res = await fetch('/api/periods');
        const data = await res.json();
        _periodsMemo = [];
        data.forEach((period: any) => {
            const start_time = time(period.start_time);
            const end_time = time(period.end_time);
            if (start_time && end_time) {
                _periodsMemo?.push({
                    ...period,
                    start_time: start_time,
                    end_time: end_time
                });
            }
        });
    }
    return _periodsMemo;
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