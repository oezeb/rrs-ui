import * as React from "react";
import { Box } from "@mui/material";
import TextField from "@mui/material/TextField";

export interface Time {
    h: number; m: number; s: number;
}

export const hms = (seconds: number) => {
    // function to get number of hours, minutes, and seconds from seconds
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return { h, m, s };
};

interface TimeViewProps {
    h: number; m: number; s: number;
    setH?: (h: number) => void;
    setM?: (m: number) => void;
    setS?: (s: number) => void;
    hmax?: number;
    id?: string;
}

const TimeView = (props: TimeViewProps) => {
    const { h, m, s, setH, setM, setS, hmax, id } = props;

    const params = {
        required: true,
        type: "number",
        variant: "standard",
        InputLabelProps: { shrink: true },
        inputProps: { min: 0, max: 59 },
    } as const;

    return (
        <Box display="flex" flexDirection="row" alignItems="center">
            <TextField {...params}
                label="小时"
                name={id ? id + "-hours" : "hours"}
                defaultValue={setH ? undefined : h}
                value={setH ? h : undefined}
                onChange={setH ? (e) => { setH(parseInt(e.target.value)); } : undefined}
                inputProps={{ min: 0, max: hmax }}
            />
            <TextField {...params}
                label="分钟"
                name={id ? id + "-minutes" : "minutes"}
                defaultValue={setM ? undefined : m}
                value={setM ? m : undefined}
                onChange={setM ? (e) => setM(parseInt(e.target.value)) : undefined}
            />
            <TextField {...params}
                label="秒"
                name={id ? id + "-seconds" : "seconds"}
                defaultValue={setS ? undefined : s}
                value={setS ? s : undefined}
                onChange={setS ? (e) => setS(parseInt(e.target.value)) : undefined}
            />
        </Box>
    );
};

export default TimeView;