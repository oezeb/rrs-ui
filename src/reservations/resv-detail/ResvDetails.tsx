import {
    Box,
    Button,
    Skeleton,
    TextField,
} from "@mui/material";
import dayjs from "dayjs";
import React from "react";
import Typography from '@mui/material/Typography';

import { useSnackbar } from "providers/SnackbarProvider";
import { paths as api_paths } from "utils/api";
import { descriptionFieldParams, labelFieldParams } from "utils/util";
import { useAuth } from "providers/AuthProvider";
import SlotTable from "./SlotTable";
import ResvTable from "./ResvTable";
import CancelResvDialog from "./CancelDialog";

function ResvDetails({ resv_id }: { resv_id: string|number }) {
    const { user } = useAuth();
    const [resv, setResv] = React.useState<Record<string, any>|null|undefined>(undefined);
    const [open, setOpen] = React.useState(false);
    const [slot_id, setSlotId] = React.useState<number | undefined>(undefined); // slot to cancel
    const { showSnackbar } = useSnackbar();

    React.useEffect(() => {
        if (!user || resv !== undefined) return;
        fetch(api_paths.user_resv + `?resv_id=${resv_id}&username=${user.username}`)
            .then((res) => res.json())
            .then((data) => {
                setResv({
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
                });
            })
            .catch((err) => {
                console.log(err);
                setResv(null);
            });
    }, [resv_id, resv, user]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        let data = new FormData(event.currentTarget);
        
        let title = data.get("title");
        let note = data.get("note");

        if (resv && title === resv.title && note === resv.note) {
            showSnackbar({ message: strings.zh['no_change'], severity: "info" });
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
                showSnackbar({ message: strings.zh['edit_success'], severity: "success", duration: 2000 });
            } else {
                throw new Error();
            }
        }).catch(err => {
            showSnackbar({ message: strings.zh['edit_fail'], severity: "error" });
        });
    }

    const handleCancel = (slot_id?: number) => {
        setOpen(true);
        setSlotId(slot_id);
    }

    const handleCancelConfirm = (confirm: boolean) => {
        setOpen(false);
        if (confirm) {
            setResv(undefined);
        }
    }

    return (
        <Box>
            <Typography variant="h5" component="h2" gutterBottom>
                {strings.zh['resv_details']}
            </Typography>
            <ResvTable resv={resv} />
            <Typography variant="h6" component="h2" gutterBottom sx={{ mt: 2 }}>
                {strings.zh['resv_time']}
            </Typography>
            <SlotTable resv={resv} onCancel={handleCancel} />
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
            <CancelResvDialog resv_id={resv_id} slot_id={slot_id} open={open} onClose={handleCancelConfirm} />
        </Box>
    );
}

const strings = {
    zh: {
        resv_details: "预约详情",
        resv_time: "预约时间",
        title: "标题",
        note: "备注",
        save: "保存",

        no_change: "未修改",
        edit_success: "修改成功",
        edit_fail: "修改失败",
    } as const,
} as const;

export default ResvDetails;