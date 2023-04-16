import React from "react";
import { Snackbar, Alert } from "@mui/material";

interface ShowProps {
    message: string;
    severity: "success" | "info" | "warning" | "error";
    duration?: number;
}

interface SnackbarContextType {
    show: (props: ShowProps) => void;
    close: () => void;
}

const SnackbarContext = React.createContext<SnackbarContextType>(null!);

function SnackbarProvider(props: { children: React.ReactNode }) {
    const [open, setOpen] = React.useState(false);
    const [message, setMessage] = React.useState("");
    const [severity, setSeverity] = React.useState<"success" | "info" | "warning" | "error">("success");
    const [duration, setDuration] = React.useState<number|undefined>(undefined);

    const show = (props: ShowProps) => {
        setMessage(props.message);
        setSeverity(props.severity);
        setDuration(props.duration);
        setOpen(true);
    }

    const close = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    }

    return (
        <SnackbarContext.Provider value={{ show, close }}>
            {props.children}
            <Snackbar
                open={open}
                autoHideDuration={duration}
                onClose={close}
                // anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={close} severity={severity} sx={{ width: '100%' }}>
                    {message}
                </Alert>
            </Snackbar>
        </SnackbarContext.Provider>
    );
}

export function useSnackbar() {
    return React.useContext(SnackbarContext);
}

export default SnackbarProvider;