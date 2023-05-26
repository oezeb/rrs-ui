import React from "react";
import { Snackbar, Alert } from "@mui/material";

interface SnackbarContextType {
    showSnackbar: ({ message, severity, duration } : {
        message: string;
        severity: "success" | "info" | "warning" | "error";
        duration?: number;
    }) => void;
    closeSnackbar: () => void;
};

const SnackbarContext = React.createContext<SnackbarContextType>(null!);

function SnackbarProvider(props: { children: React.ReactNode }) {
    const [open, setOpen] = React.useState(false);
    const [message, setMessage] = React.useState("");
    const [severity, setSeverity] = React.useState<"success" | "info" | "warning" | "error">("success");
    const [duration, setDuration] = React.useState<number|undefined>(undefined);

    const showSnackbar = ({ message, severity, duration } : {
        message: string;
        severity: "success" | "info" | "warning" | "error";
        duration?: number;
    }) => {
        setMessage(message);
        setSeverity(severity);
        setDuration(duration);
        setOpen(true);
    }

    const closeSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    }

    return (
        <SnackbarContext.Provider value={{ showSnackbar, closeSnackbar }}>
            {props.children}
            <Snackbar
                open={open}
                autoHideDuration={duration}
                onClose={closeSnackbar}
            >
                <Alert onClose={closeSnackbar} severity={severity} sx={{ width: '100%' }}>
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