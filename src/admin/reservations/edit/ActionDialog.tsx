import { Button } from "@mui/material";

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { useSnackbar } from "providers/SnackbarProvider";
import { resv_status } from "utils/api";
import { Action } from "./SlotTable";
import { paths as api_paths } from "utils/api";


interface ActionDialogProps {
    resv_id: number|string;
    username: string;
    slot_ids: (number|string)[];
    action?: Action;
    onClose: (confirmed: boolean) => void;
}

const ActionDialog = ({ resv_id, username, slot_ids, action, onClose }: ActionDialogProps) => {
    const { showSnackbar } = useSnackbar();

    const strings = {
        cancel: {
            title: "取消预约",
            content: "确定要取消预约吗？",
            success: "取消成功",
            fail: "取消失败",
        } as const,
        accept: {
            title: "确认预约",
            content: "确定要确认预约吗？",
            success: "确认成功",
            fail: "确认失败",
        } as const,
        reject: {
            title: "拒绝预约",
            content: "确定要拒绝预约吗？",
            success: "拒绝成功",
            fail: "拒绝失败",
        } as const,
    } as const;

    const handleAction = () => {
        if (action === undefined) {
            onClose(false);
            return;
        }

        if (slot_ids.length === 0) {
            showSnackbar({ message: "没有可操作的预约", severity: "error" });
            onClose(false);
            return;
        }

        let status: number;
        if (action === "cancel") {
            status = resv_status.cancelled;
        } else if (action === "accept") {
            status = resv_status.confirmed;
        } else if (action === "reject") {
            status = resv_status.rejected;
        } else {
            status = resv_status.pending;
        }

        let patch = async (slot_id: number|string) => {
            return await fetch(api_paths.admin.reservations + `/${resv_id}/${username}/${slot_id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status }),
            });
        };

        let promises = slot_ids.map(slot_id => patch(slot_id));
        Promise.all(promises).then(res => {
            if (res.every(r => r.ok)) {
                showSnackbar({ message: strings[action]?.success, severity: "success", duration: 2000 });
                onClose(true);
            } else {
                throw new Error();
            }
        }).catch(err => {
            showSnackbar({ message: strings[action]?.fail, severity: "error"});
            onClose(false);
        });
    };

    return (<>{action !== undefined &&
        <Dialog open>
            <DialogTitle>{strings[action]?.title}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {strings[action]?.content}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose(false)}>取消</Button>
                <Button onClick={handleAction} color="error">确定</Button>
            </DialogActions>
        </Dialog>}
    </>);
}

export default ActionDialog;