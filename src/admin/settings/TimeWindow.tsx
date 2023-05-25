import * as React from "react";
import { FormHelperText, Typography } from "@mui/material";

import TimeView, { Time, hms } from "./TimeView";
import SettingItem, { SettingItemSkeleton } from "./SettingItem";

interface TimeWindowProps {
    timeWindow: Record<string, any>|null|undefined; // seconds
    title: string;
}

const TimeWindow = ({ timeWindow, title }: TimeWindowProps) => {
    const [h, setH] = React.useState<number>(0);
    const [m, setM] = React.useState<number>(0);
    const [s, setS] = React.useState<number>(0);

    React.useEffect(() => {
        if (timeWindow) {
            let _hms = hms(timeWindow.value);
            setH(_hms.h); setM(_hms.m); setS(_hms.s);
        }
    }, [timeWindow]);

    const HelperText = ({ h, m, s }: Time) => {
        let _d = h ? Math.floor(h / 24) : 0;
        let _h = h ? h % 24 : 0;
        return (
            <FormHelperText>
                {_d?_d+' 天':''} {_h?_h+' 小时':''} {m?m+' 分钟':''} {s?s+' 秒':''}
            </FormHelperText>
        );
    }

    if (timeWindow === undefined) {
        return <SettingItemSkeleton />;
    } else if (timeWindow === null){
        return (
        <Typography color="error">
            获得{title}失败
        </Typography>
        );
    } else {
        return (<>
            <SettingItem id="time-window" title={title}
                text="从当前时间开始，用户最多可以提前多久预约房间"
                value={<>
                    <TimeView h={h} m={m} s={s} setH={setH} setM={setM} setS={setS} hmax={8760} id="time-window" /> 
                    <HelperText h={h} m={m} s={s} />
                </>}
                label={timeWindow.name}
                description={timeWindow.description}
            />
        </>);
    }
};

export default TimeWindow;