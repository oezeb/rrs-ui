import * as React from "react";
import { 
    Box,  
    Typography, 
    List, ListItem, Button,
} from "@mui/material";
import TextField from "@mui/material/TextField";

import { descriptionFieldParams, labelFieldParams } from "utils/util";

interface AddEditTypeProps {
    title: string;
    type?: string|number;
    label?: string;
    description?: string;
    handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;

    _type: "add" | "edit";
}

export const AddEditType = (props: AddEditTypeProps) => {
    const { title, type, label, description, handleSubmit, _type } = props;

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h5" component="h2" gutterBottom>
                {title}
            </Typography>
            <List sx={{ ml: 4 }} dense>
                <ListItem>
                    <TextField size="small" variant="standard" type="number" fullWidth
                        name="type" label="类型" defaultValue={type}
                        disabled={_type === "edit"}
                    />
                </ListItem>
                <ListItem>
                    <TextField {...labelFieldParams} defaultValue={label} />
                </ListItem>
                <ListItem>
                    <TextField {...descriptionFieldParams} defaultValue={description} />
                </ListItem>
                <ListItem>
                    <Button fullWidth variant="contained" type="submit" color="primary">
                        {_type === "add" ? "添加" : "保存"}
                    </Button>
                </ListItem>
            </List>
        </Box>
    );
};

export default AddEditType;
