import * as React from "react";
import { 
    Box,  
    Typography, 
    List, ListItem, ListItemText, 
    FormHelperText, 
    Button 
} from "@mui/material";
import TextField from "@mui/material/TextField";
import InputAdornment from '@mui/material/InputAdornment';

import { Setting } from "../util";
import { time } from "../util";
import { useSnackbar } from "../SnackbarProvider";

function Settings() {
    const [timeWindow, setTimeWindow] = React.useState<Record<string, any>|null>(null); // seconds
    const [timeLimit, setTimeLimit] = React.useState<Record<string, any>|null>(null); // seconds
    const [maxDaily, setMaxDaily] = React.useState<Record<string, any>|null>(null);

    const [tw_hms, setTwHms] = React.useState<Time>({ h: 0, m: 0, s: 0 });
    const [tl_hms, setTlHms] = React.useState<Time>({ h: 0, m: 0, s: 0 });
    const [tw_dhms, setTwDhms] = React.useState<Time&{d?: number}>({ d: 0, h: 0, m: 0, s: 0 });

    const { showSnackbar } = useSnackbar();

    React.useEffect(() => {
        fetch("/api/admin/settings")
            .then(res => res.json())
            .then(data => {
                data.forEach((item: any) => {
                    switch (item.id) {
                        case Setting.timeWindow:
                            setTimeWindow({
                                ...item,
                                value: time(item.value).diff(time('00:00'), 'second')
                            });
                            break;
                        case Setting.timeLimit:
                            setTimeLimit({
                                ...item,
                                value: time(item.value).diff(time('00:00'), 'second')
                            });
                            break;
                        case Setting.maxDaily:
                            setMaxDaily(item);
                            break;
                        default:
                            break;
                    }
                });
            });
    }, []);

    React.useEffect(() => {
        if (timeWindow) {
            setTwHms(hms(timeWindow.value));
        }
    }, [timeWindow]);

    React.useEffect(() => {
        if (timeLimit) {
            setTlHms(hms(timeLimit.value));
        }
    }, [timeLimit]);

    React.useEffect(() => {
        let d = tw_hms.h ? Math.floor(tw_hms.h / 24) : 0;
        let h = tw_hms.h ? tw_hms.h % 24 : 0;
        setTwDhms({ d, h, m: tw_hms.m, s: tw_hms.s });
    }, [tw_hms]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        let tw = {
            value: tw_hms.h*3600 + tw_hms.m*60 + tw_hms.s*0,
            label: data.get('time-window-label'),
            description: data.get('time-window-description'),
        };
        let tl = {
            value: tl_hms.h*3600 + tl_hms.m*60 + tl_hms.s,
            label: data.get('time-limit-label'),
            description: data.get('time-limit-description'),
        };
        let md = {
            value: data.get('max-daily-value'),
            label: data.get('max-daily-label'),
            description: data.get('max-daily-description'),
        };

        const changed = (e: any, v: any) => (
            e.value !== v.value || e.label !== v.label || e.description !== v.description
        );
        
        let toUpdate: any = [];
        if (changed(tw, timeWindow)) {
            // toChange.push({ id: Setting.timeWindow, data: {
            //     ...tw,
            //     value: `${tw_hms.h}:${tw_hms.m}:${tw_hms.s}`,
            // } });
            toUpdate.push({
                where: { id: Setting.timeWindow },
                data: {
                    ...tw,
                    value: `${tw_hms.h}:${tw_hms.m}:${tw_hms.s}`,
                }
            })
        }
        if (changed(tl, timeLimit)) {
            toUpdate.push({
                where: { id: Setting.timeLimit },
                data: {
                    ...tl,
                    value: `${tl_hms.h}:${tl_hms.m}:${tl_hms.s}`,
                }
            })
        }
        if (changed(md, maxDaily)) {
            toUpdate.push({
                where: { id: Setting.maxDaily },
                data: md
            })
        }

        if (toUpdate.length === 0) {
            showSnackbar({message: "没有更改", severity: "info", duration: 2000});
        } else {
            fetch("/api/admin/settings", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(toUpdate)
            }).then(res => {
                if (res.ok) {
                    showSnackbar({message: "更新成功", severity: "success", duration: 2000});
                } else {
                    showSnackbar({message: "更新失败", severity: "error"});
                }
            }).catch(err => {
                showSnackbar({message: "更新失败", severity: "error"});
            });
        }
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
                <SettingItem id="time-window" title="时间窗口"
                    text="从当前时间开始，用户最多可以提前多久预约房间"
                    value={<>
                        <TimeView hms={tw_hms} setHms={setTwHms} hmax={8760} />
                        <FormHelperText>
                            {tw_dhms.d?tw_dhms.d+' 天':''} {tw_dhms.h?tw_dhms.h+' 小时':''} {tw_dhms.m?tw_dhms.m+' 分钟':''} {tw_dhms.s?tw_dhms.s+' 秒':''}
                        </FormHelperText>
                    </>}
                    label={timeWindow?.label}
                    description={timeWindow?.description}
                />
                <SettingItem id="time-limit" title="时间限制"
                    text="用户预约房间的连续最长时间"
                    value={<TimeView hms={tl_hms} setHms={setTlHms} hmax={23} />}
                    label={timeLimit?.label}
                    description={timeLimit?.description}
                />
                <SettingItem id="max-daily" title="每日最大预约次数"
                    text="用户每天最多可以预约多少次房间"
                    value={<TextField required id="max-daily-value" type="number" 
                        name="max-daily-value"
                        label="天数"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        defaultValue={maxDaily?.value}
                        variant="standard"
                    />}
                    label={maxDaily?.label}
                    description={maxDaily?.description}
                />
            </List>
            <Button fullWidth type="submit" variant="contained" sx={{ mt: 2 }}>
                保存
            </Button>
        </Box>
    );
};

const SettingItem = (props: any) => {
    const { id, title, text, value } = props;
    const [label, setLabel] = React.useState(props.label);
    const [description, setDescription] = React.useState(props.description);

    const Item = ({name, value}:{name: string, value: JSX.Element}) => (<>
        <ListItemText sx={{ flex: 'none', width: 50 }} >
            <Typography fontWeight="bold">
                {name}：
            </Typography>
        </ListItemText>
        <Box sx={{ flexGrow: 1 }} >
            {value}
        </Box>
    </>);

    const Field = (props: any) => (<TextField {...props} fullWidth
        id={`${id}-${props.name}`}
        name={`${id}-${props.name}`}
        type="text"
        InputLabelProps={{
            shrink: true,
        }}
    />);

    return (<>
        <ListItem divider>
            <ListItemText sx={{ flex: 'none' }}>
                <Typography fontWeight="bold">
                    {title}：
                </Typography>
            </ListItemText>
            <ListItemText>
                {text}
            </ListItemText>
        </ListItem>
        <List sx={{ ml: 4 }} dense>
            <ListItem><Item name="值" value={value} /></ListItem>
            <ListItem>
                <Item name="标签" value={<Field required 
                    name="label" variant="standard"
                    value={label} 
                    onChange={(e: any) => setLabel(e.target.value)}
                    inputProps={{ 
                        maxLength: 50,
                    }}
                     InputProps={{
                        endAdornment: <InputAdornment position="end">{label?.length??0}/50</InputAdornment>,
                    }}
                />} />
            </ListItem>
            <ListItem>
                <Item name="描述" value={<Field
                    name="description"
                    value={description}
                    onChange={(e: any) => setDescription(e.target.value)}
                    multiline maxRows={4} minRows={2}
                    inputProps={{ maxLength: 200 }}
                    helperText={`${description?.length??0}/200`}
                />} />
            </ListItem>
        </List>
    </>);
};

interface Time {
    h: number; m: number; s: number;
}

const hms = (seconds: number) => {
    // function to get number of hours, minutes, and seconds from seconds
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return { h, m, s };
};

interface TimeViewProps {
    hms: Time;
    setHms: (hms: Time) => void;
    hmax?: number;
}

const TimeView = (props: TimeViewProps) => {
    const { setHms, hmax } = props;

    const NumberField = ({ id, label, max, value, onChange }: {
        id: string,
        label: string,
        max?: number,
        value?: number,
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    }) => {
        return (
            <TextField required id={id} label={label}
                type="number" variant="standard"
                value={value} onChange={onChange}
                InputLabelProps={{
                    shrink: true,
                }}
                inputProps={{
                    min: 0, max: max
                }}
            />
        );
    };

    const onChange = (event: React.ChangeEvent<HTMLInputElement>, key: string) => {
        const value = event.target.value;
        if (value) {
            setHms({ ...props.hms, [key]: parseInt(value) });
        } else {
            setHms({ ...props.hms, [key]: 0 })
        }
    };

    return (
        <Box display="flex" flexDirection="row" alignItems="center">
            <NumberField id="hours" label="小时"
                value={props.hms.h} max={hmax}
                onChange={(event) => { onChange(event, 'h'); }}
            />
            <NumberField id="minutes" label="分钟"
                value={props.hms.m} max={59}
                onChange={(event) => { onChange(event, 'm'); }} 
            />
            <NumberField id="seconds" label="秒"
                max={59} value={props.hms.s}
                onChange={(event) => { onChange(event, 's'); }}
            />
        </Box>
    );
};

export default Settings;