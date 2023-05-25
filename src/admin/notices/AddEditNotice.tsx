import * as React from "react";
import { 
    Box,  
    Typography, 
    List, ListItem, Button,
} from "@mui/material";
import TextField from "@mui/material/TextField";

interface AddEditSessionProps {
    _title: string;
    notice_id?: string|number;
    user?: Record<string, any>;
    title?: string;
    content?: string;
    handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;

    type: "add" | "edit";
    disabled?: boolean;
}

export const AddEditNotice = (props: AddEditSessionProps) => {
    const { _title, notice_id, title, content, handleSubmit, type, disabled } = props;

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h5" component="h2" gutterBottom>
                {_title}
            </Typography>
            <List sx={{ ml: 4 }} dense>
                <ListItem>
                    <TextField size="small" variant="standard" type="number" fullWidth
                        name="notice_id" label="公告号" defaultValue={notice_id}
                        disabled={type === "edit"}
                    />
                    <TextField size="small" variant="standard" fullWidth sx={{ ml: 2 }}
                        name="username" label="发布者" defaultValue={props.user?.name}
                        disabled
                    />
                </ListItem>
                <ListItem>
                    <TextField size="small" variant="standard" fullWidth
                        name="title" label="标题" defaultValue={title}
                        required
                        inputProps={{ maxLength: 50 }}
                    />
                </ListItem>
                <ListItem>
                    <TextField required fullWidth size="small" sx={{ mt: 1 }}
                        name="content" label="内容"
                        defaultValue={content}
                        multiline
                        rows={10}
                    />
                </ListItem>
                <ListItem>
                    <Button fullWidth variant="contained" color="primary" type="submit"
                        disabled={disabled}
                    >
                        {type === "add" ? "添加" : "保存"}
                    </Button>
                </ListItem>
            </List>
        </Box>
    );
}

export default AddEditNotice;