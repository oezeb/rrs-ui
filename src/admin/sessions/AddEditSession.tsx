import * as React from "react";
import { 
    Box,  
    Typography, 
    List, ListItem, Button,
} from "@mui/material";
import TextField from "@mui/material/TextField";

interface AddEditSessionProps {
    title: string;
    session_id?: string|number;
    name?: string;
    startTime?: string;
    endTime?: string;
    handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;

    type: "add" | "edit";
}

export const AddEditSession = (props: AddEditSessionProps) => {
    const { title, session_id, name, startTime, endTime, handleSubmit, type } = props;

    return (
        <Box component="form" onSubmit={handleSubmit}sx={{ maxWidth: 700, margin: "auto" }} >
            
            <List dense>
                <ListItem divider sx={{ mb: 2 }}>
                    <Typography variant="h5" component="h2" gutterBottom>
                        {title}
                    </Typography>
                </ListItem>
                <ListItem>
                    <TextField size="small" variant="standard" type="number" fullWidth
                        name="session_id" label="会话号" defaultValue={session_id}
                        disabled={type === "edit"}
                    />
                </ListItem>
                <ListItem>
                    <TextField size="small" variant="standard" fullWidth
                        name="name" label="会话名" defaultValue={name}
                        required
                        inputProps={{ maxLength: 50 }}
                    />
                </ListItem>
                <ListItem>
                    <TextField required fullWidth size="small" variant="standard" type="datetime-local"
                        name="start_time" label="开始时间"
                        defaultValue={startTime}
                        disabled={type === "edit"}
                    />
                    ~
                    <TextField required fullWidth size="small" variant="standard" type="datetime-local"
                        name="end_time" label="结束时间"
                        defaultValue={endTime}
                        disabled={type === "edit"}
                    />
                </ListItem>
                <ListItem>
                    <Button fullWidth variant="contained" color="primary" type="submit">
                        {type === "add" ? "添加" : "保存"}
                    </Button>
                </ListItem>
            </List>
        </Box>
    );
};

export default AddEditSession;