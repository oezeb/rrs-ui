
import { Button } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

interface BinaryDialogProps {
    open: boolean;
    title: string;
    content: JSX.Element | string;
    onConfirm: () => void;
    onClose: () => void;
};

const BinaryDialog = ({ open, title, content, onConfirm, onClose }: BinaryDialogProps) => {
    return (
        <Dialog open={open} >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                {typeof content === 'string' ?
                    <DialogContentText>{content}</DialogContentText> : content}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>
                    {strings.zh['cancel']}
                </Button>
                <Button onClick={onConfirm} autoFocus>
                    {strings.zh['confirm']}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const strings = {
    zh: {
        cancel: "取消",
        confirm: "确定",
    } as const,
} as const;

export default BinaryDialog;