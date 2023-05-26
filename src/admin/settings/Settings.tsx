import {
    Box,
    Button,
    List, ListItemText,
    Typography
} from "@mui/material";
import * as React from "react";

import { useSnackbar } from "providers/SnackbarProvider";
import { paths as api_paths, setting } from "utils/api";
import { time } from "utils/util";
import MaxDaily from "./MaxDaily";
import TimeLimit from "./TimeLimit";
import { hms } from "./TimeView";
import TimeWindow from "./TimeWindow";

function Settings() {
    const [settings, setSettings] = React.useState<Record<string, any>[]|null|undefined>(undefined);
    const [timeWindow, setTimeWindow] = React.useState<Record<string, any>|null|undefined>(undefined); // seconds
    const [timeLimit, setTimeLimit] = React.useState<Record<string, any>|null|undefined>(undefined); // seconds
    const [maxDaily, setMaxDaily] = React.useState<Record<string, any>|null|undefined>(undefined); // seconds

    const titles : Record<number, string> = {
        [setting.timeWindow]: "时间窗口",
        [setting.timeLimit]: "时间限制",
        [setting.maxDaily]: "每日最大预约次数"
    };

    const { showSnackbar } = useSnackbar();

    React.useEffect(() => {
        if (settings !== undefined) return;
        fetch(api_paths.admin.settings)
            .then(res => res.json())
            .then(data => {
                setSettings(data);
            })
            .catch(err => {
                console.error(err);
                setSettings(null);
            });
    }, [settings]);

    React.useEffect(() => {
        if (settings === undefined) return;
        if (settings === null) {
            setTimeWindow(null);
            setTimeLimit(null);
            setMaxDaily(null);
        } else {
            let _timeWindow: Record<string, any>|null = null;
            let _timeLimit: Record<string, any>|null = null;
            let _maxDaily: Record<string, any>|null = null;
            for (let item of settings) {
                switch (item.id) {
                    case setting.timeWindow:
                        _timeWindow = {
                            ...item,
                            value: time(item.value).diff(time('00:00'), 'second')
                        };
                        break;
                    case setting.timeLimit:
                        _timeLimit = {
                            ...item,
                            value: time(item.value).diff(time('00:00'), 'second')
                        };
                        break;
                    case setting.maxDaily:
                        _maxDaily = item;
                        break;
                    default:
                        break;
                }
            }
            
            if (timeWindow === undefined) {
                setTimeWindow(_timeWindow);
            }
            if (timeLimit === undefined) {
                setTimeLimit(_timeLimit);
            }
            if (maxDaily === undefined) {
                setMaxDaily(_maxDaily);
            }
        }
    }, [settings, timeWindow, timeLimit, maxDaily]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const time_value = (id: string) => {
            let h = data.get(`${id}-hours`);
            let m = data.get(`${id}-minutes`);
            let s = data.get(`${id}-seconds`);
            return `${h}:${m}:${s}`;
        }

        let tw = {
            value: time_value('time-window'),
            name: data.get('time-window-label'),
            description: data.get('time-window-description'),
        };
        let tl = {
            value: time_value('time-limit'),
            name: data.get('time-limit-label'),
            description: data.get('time-limit-description'),
        };
        let md = {
            value: data.get('max-daily-value'),
            name: data.get('max-daily-label'),
            description: data.get('max-daily-description'),
        };

        const  _hms = (seconds: number) => {
            let __hms = hms(seconds);
            return `${__hms.h}:${__hms.m}:${__hms.s}`;
        }

        let _timeWindow = {...timeWindow, value: _hms(timeWindow?.value)};
        let _timeLimit = {...timeLimit, value: _hms(timeLimit?.value)};

        const update = async (id: number, data: any) => {
            try {
                let res =  await fetch(api_paths.admin.settings + `/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                return { id, res };
            } catch (err) {
                console.error(err);
                return { id, res: { ok: false } };
            }
        }

        const _data = (before: any, after: any) => {
            let data: any = {};
            for (let key of Object.keys(after)) {
                if (key !== 'id' && before[key] !== after[key]) {
                    data[key] = after[key];
                }
            }
            return data;
        }

        let tw_data = _data(_timeWindow, tw);
        let tl_data = _data(_timeLimit, tl);
        let md_data = _data(maxDaily, md);

        let promises: Promise<{id: number, res: any}>[] = [];
        if (Object.keys(tw_data).length > 0) {
            promises.push(update(setting.timeWindow, tw_data));
        }
        if (Object.keys(tl_data).length > 0) {
            promises.push(update(setting.timeLimit, tl_data));
        }
        if (Object.keys(md_data).length > 0) {
            promises.push(update(setting.maxDaily, md_data));
        }

        if (promises.length === 0) {
            showSnackbar({ message: '没有更改', severity: 'info' });
            return;
        }

        Promise.all(promises)
            .then(results => {
                if (results.some(r => r.res.ok)) {
                    setSettings(undefined);
                    results.forEach(r => {
                        if (!r.res.ok) return;
                        switch (r.id) {
                            case setting.timeWindow:
                                setTimeWindow(undefined);
                                break;
                            case setting.timeLimit:
                                setTimeLimit(undefined);
                                break;
                            case setting.maxDaily:
                                setMaxDaily(undefined);
                                break;
                            default:
                                break;
                        }
                    });
                }

                if (results.every(r => r.res.ok)) {
                    showSnackbar({ message: '更新成功', severity: 'success', duration: 2000 });
                } else {
                    let failed = results.filter(r => !r.res.ok).map(r => titles[r.id]).join(', ');
                    showSnackbar({ message: `更新失败: ${failed}`, severity: 'error' });
                }
            });
    };

    const BoldItalic = ({ text } : { text: string }) => (
        <span style={{fontStyle: "italic", fontWeight: "bold"}}>{text}</span>
    );

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <ListItemText primary={
                <Typography variant="h5" component="h2" gutterBottom>
                    设置
                </Typography>} 
                secondary={<><BoldItalic text="标签" />和<BoldItalic text="描述" />会在用户界面中显示。</>}
            />
            <List>
                <TimeWindow timeWindow={timeWindow} title={titles[setting.timeWindow]} />
                <TimeLimit timeLimit={timeLimit} title={titles[setting.timeLimit]} />
                <MaxDaily maxDaily={maxDaily} title={titles[setting.maxDaily]} />
            </List>
            <Button fullWidth type="submit" variant="contained" sx={{ mt: 2 }}>
                保存
            </Button>
        </Box>
    );
};

export default Settings;