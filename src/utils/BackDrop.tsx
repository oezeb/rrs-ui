import MuiBackdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

export const BackDrop = ({ open }: { open: boolean }) => (
    <MuiBackdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open||open===undefined}
    >
    <CircularProgress color="inherit" />
    </MuiBackdrop>
)