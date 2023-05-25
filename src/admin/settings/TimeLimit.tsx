import TimeView, { hms } from "./TimeView";
import SettingItem, { SettingItemSkeleton } from "./SettingItem";
import { Typography } from "@mui/material";

interface TimeLimitProps {
    timeLimit: Record<string, any>|null|undefined; // seconds
    title: string;
}

function TimeLimit({ timeLimit, title }: TimeLimitProps) {
    if (timeLimit === undefined) {
        return <SettingItemSkeleton />;
    } else if (timeLimit === null) {
        return (
            <Typography color="error">
                获得{title}失败
            </Typography>
        );
    } else {
        const _hms = hms(timeLimit.value);
        return (
            <SettingItem id="time-limit" title={title}
                text="用户预约房间的连续最长时间"
                value={<TimeView h={_hms.h} m={_hms.m} s={_hms.s} hmax={23} id="time-limit" />}
                label={timeLimit?.name}
                description={timeLimit?.description}
            />
        );
    }
};

export default TimeLimit;