import {
    Box,
    Button,
    ListItemText,
    Skeleton,
    TextField,
} from "@mui/material";
import dayjs from "dayjs";
import React from "react";

import Typography from '@mui/material/Typography';

import { useSnackbar } from "providers/SnackbarProvider";
import { useParams } from "react-router-dom";
import { paths as api_paths } from "utils/api";
import { descriptionFieldParams, labelFieldParams } from "utils/util";
import ResvTable from "./ResvTable";
import SlotTable, { ActionHelper } from "./SlotTable";

function EditReservation() {
    const {resv_id, username } = useParams();

    return (<>{resv_id && username &&
        <ResvDetails resv_id={resv_id} username={username} />
    }</>);
}

function ResvDetails({ resv_id, username }: { resv_id: string|number, username: string }) {
    const [resv, setResv] = React.useState<Record<string, any> | undefined>(undefined);
    const { showSnackbar } = useSnackbar();

    React.useEffect(() => {
        if (resv !== undefined) return;
        fetch(api_paths.admin.reservations + `?resv_id=${resv_id}&username=${username}`)
            .then(res => res.json())
            .then(data => setResv({
                ...data[0],
                create_time: dayjs(data[0].create_time),
                update_time: data[0].update_time ? dayjs(data[0].update_time) : null,
                slot_id: undefined,
                start_time: undefined,
                end_time: undefined,
                status: undefined,
                time_slots: data.map((item: any) => ({
                    slot_id: item.slot_id,
                    start_time: dayjs(item.start_time),
                    end_time: dayjs(item.end_time),
                    status: item.status,
                }))
            }))
            .catch(err => {
                console.log(err);
            });
    }, [resv_id, username, resv]);
        
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        let data = new FormData(event.currentTarget);
        if (resv === undefined) return;
        
        let title = (data.get("title") as string).trim();
        let note = (data.get("note") as string).trim();
        let privacy = data.get("privacy");

        if (title === resv.title && note === resv.note && privacy === `${resv.privacy}`) {
            showSnackbar({ message: "未修改", severity: "info" });
            return;
        }

        fetch(api_paths.admin.reservations + `/${resv_id}/${username}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({title, note, privacy})
        }).then(res => {
            if (res.ok) {
                setResv(undefined);
                showSnackbar({ message: "修改成功", severity: "success", duration: 2000 });
            } else {
                throw new Error();
            }
        }).catch(err => {
            showSnackbar({ message: "修改失败", severity: "error" });
        });
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 700, margin: "auto" }} >
            <Typography variant="h5" component="h2" gutterBottom>
                预约详情
            </Typography>
            <ResvTable resv={resv} />
            <ListItemText secondary={<ActionHelper />}>
                <Typography variant="h6" component="h2" gutterBottom sx={{ mt: 2 }}>
                    预约时间
                </Typography>
            </ListItemText>
            <Box sx={{ my: 2 }}>
                <SlotTable 
                    resv={resv} 
                    setResv={setResv} 
                />
            </Box>
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
    );
}

export default EditReservation;