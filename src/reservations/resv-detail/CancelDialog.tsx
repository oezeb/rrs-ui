import { Button } from "@mui/material";

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { useSnackbar } from "providers/SnackbarProvider";
import { paths as api_paths, resv_status } from "utils/api";


interface CancelDialogProps {
    resv_id: number|string;
    slot_ids: (number|string)[];
    onClose: (confirmed: boolean) => void;
}

const CancelDialog = ({ resv_id, slot_ids, onClose }: CancelDialogProps) => {
    const { showSnackbar } = useSnackbar();

    const handleCancel = () => {
        const cancel = async (slot_id: number|string) => {
            return await fetch(api_paths.user_resv + `/${resv_id}/${slot_id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: resv_status.cancelled }),
            });
        };

        let promises = slot_ids.map(slot_id => cancel(slot_id));
        Promise.all(promises).then(res => {
            if (res.every(r => r.ok)) {
                showSnackbar({ message: "取消成功", severity: "success", duration: 2000 });
                onClose(true);
            } else {
                throw new Error();
            }
        }).catch(err => {
            showSnackbar({ message: "取消失败", severity: "error"});
            onClose(false);
        });
    }

    return (<>{
        <Dialog open={slot_ids.length > 0}>
            <DialogTitle>
                取消预约
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    确定要取消预约吗？
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose(false)}>取消</Button>
                <Button onClick={handleCancel} color="error">确定</Button>
            </DialogActions>
        </Dialog>}
    </>);
}

export default CancelDialog;