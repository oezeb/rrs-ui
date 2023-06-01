import { Button } from "@mui/material";
import React from "react";

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { useSnackbar } from "providers/SnackbarProvider";
import { paths as api_paths, resv_status } from "utils/api";

interface CancelResvDialogProps {
    resv_id: number|string;
    slot_id?: number|string;
    open: boolean;
    onClose: (confirmed: boolean) => void;
}

const CancelResvDialog = ({ resv_id, slot_id, open, onClose }: CancelResvDialogProps) => {
    const { showSnackbar } = useSnackbar();

    const handleCancel = () => {
        let url = api_paths.user_resv + `/${resv_id}` + (slot_id !== undefined ? `/${slot_id}` : "");
        console.log(url);
        fetch(url, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({status: resv_status.cancelled}),
        }).then(res => {
            if (res.ok) {
                showSnackbar({ message: "取消成功", severity: "success", duration: 2000 });
                onClose(true);
            } else {
                throw new Error("取消失败");
            }
        }).catch(err => {
            showSnackbar({ message: "取消失败", severity: "error" });
            onClose(false);
        });
    }

    return (
        <Dialog open={open}>
            <DialogTitle>取消预约</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    确定要取消预约吗？
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose(false)}>取消</Button>
                <Button onClick={handleCancel} color="error">确定</Button>
            </DialogActions>
        </Dialog>
    );
}

export default CancelResvDialog;