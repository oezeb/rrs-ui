import {
    Box,
    Button,
    Skeleton,
    TextField,
    ListItemText,
} from "@mui/material";
import dayjs from "dayjs";
import React from "react";
import Typography from '@mui/material/Typography';

import { useSnackbar } from "providers/SnackbarProvider";
import { paths as api_paths } from "utils/api";
import { descriptionFieldParams, labelFieldParams } from "utils/util";
import { useAuth } from "providers/AuthProvider";
import ResvTable from "./ResvTable";
import SlotTable, { ActionHelper } from "./SlotTable";

function ResvDetail({ resv_id }: { resv_id: string|number }) {
    const { user } = useAuth();
    const [resv, setResv] = React.useState<Record<string, any>|undefined>(undefined);
    const { showSnackbar } = useSnackbar();

    React.useEffect(() => {
        if (!user || resv !== undefined) return;
        fetch(api_paths.user_resv + `?resv_id=${resv_id}&username=${user.username}`)
            .then((res) => res.ok ? res.json() : Promise.reject(res))
            .then((data) => setResv({
                ...data[0],
                create_time: dayjs(data[0].create_time),
                slot_id: undefined,
                start_time: undefined,
                end_time: undefined,
                status: undefined,
                time_slots: data.map((item: any) => ({
                    slot_id: item.slot_id,
                    start_time: dayjs(item.start_time),
                    end_time: dayjs(item.end_time),
                    status: item.status,
                })),
            }))
            .catch((err) => {
                console.log(err);
                setResv({});
            });
    }, [resv_id, resv, user]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        let data = new FormData(event.currentTarget);
        
        let title = data.get("title");
        let note = data.get("note");

        if (resv && title === resv.title && note === resv.note) {
            showSnackbar({ message: "信息未改变", severity: "warning" });
            return;
        }


        fetch(api_paths.user_resv + `/${resv_id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({title, note}),
        }).then(res => {
            if (res.ok) {
                setResv(undefined);
                showSnackbar({ message: "修改成功", severity: "success", duration: 2000 });
            } else {
                throw new Error();
            }
        }).catch(err => {
            console.log(err);
            showSnackbar({ message: "修改失败", severity: "error" });
        });
    };

    return (
        <Box>
            <Typography variant="h5" component="h2" gutterBottom>
                预约详情
            </Typography>
            <ResvTable resv={resv} />
            <ListItemText secondary={<ActionHelper />}>
                <Typography variant="h6" component="h2" gutterBottom sx={{ mt: 2 }}>
                    预约时间
                </Typography>
            </ListItemText>
            <SlotTable 
                resv={resv} 
                setResv={setResv} 
            />
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                {resv ?
                <TextField {...labelFieldParams} 
                    id="title" name="title" label="标题" defaultValue={resv.title}/> :
                <Skeleton />}
                {resv ?
                <TextField {...descriptionFieldParams} 
                    id="note" name="note" label="备注" defaultValue={resv.note} sx={{ mt: 2 }} /> :
                <Skeleton variant="rectangular" sx={{ mt: 2, height: 100 }} />}
                <Button  type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                    保存
                </Button>
            </Box>
        </Box>
    );
}

export default ResvDetail;