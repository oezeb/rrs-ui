import TextField from "@mui/material/TextField";

import SettingItem, { SettingItemSkeleton } from "./SettingItem";
import { Typography } from "@mui/material";

interface MaxDailyProps {
    maxDaily: Record<string, any>|null|undefined;
    title: string;
}

function MaxDaily({ maxDaily, title }: MaxDailyProps) {
    if (maxDaily === undefined) {
        return <SettingItemSkeleton />;
    } else if (maxDaily === null) {
        return (
            <Typography color="error">
                获得{title}失败
            </Typography>
        );
    } else {
        return (
            <SettingItem id="max-daily" title={title}
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
                label={maxDaily.name}
                description={maxDaily.description}
            />
        );
    }
};

export default MaxDaily;