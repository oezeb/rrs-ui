
import { Button } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

interface BinaryDialogProps {
    open: boolean;
    title: string;
    content: string;
    onConfirm: () => void;
    onClose: () => void;
}

const BinaryDialog = ({ open, title, content, onConfirm, onClose }: BinaryDialogProps) => {
    return (
        <Dialog open={open} >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {content}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>取消</Button>
                <Button onClick={onConfirm} autoFocus>
                    确定
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BinaryDialog;