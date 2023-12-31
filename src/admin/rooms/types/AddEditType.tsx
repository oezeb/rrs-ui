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
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 700, margin: "auto" }} >
            <List dense>
                <ListItem divider sx={{ mb: 2 }}>
                    <Typography variant="h5" component="h2" gutterBottom>
                        {title}
                    </Typography>
                </ListItem>
                <ListItem>
                    <TextField size="small" variant="standard" type="number" fullWidth
                        name="type" label="类型" defaultValue={type}
                        disabled={_type === "edit"}
                    />
                </ListItem>
                <ListItem>
                    <TextField {...labelFieldParams}  
                        label="标签" defaultValue={label}
                    />
                </ListItem>
                <ListItem>
                    <TextField {...descriptionFieldParams} 
                        label="描述" defaultValue={description}
                    />
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
