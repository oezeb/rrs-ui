import * as React from "react";
import { 
    Box,  
    Typography, 
    List, ListItem, Button, FormControl, InputLabel, Select, MenuItem,
} from "@mui/material";
import TextField from "@mui/material/TextField";

import { paths as api_paths } from "../../api";
import { EmailFieldParams, UsernameFieldParams, NameFieldParams, PasswordFieldParams } from "../../auth/Register";

interface AddEditUserProps {
    title: string;
    username?: string
    password?: string;
    name?: string;
    email?: string;
    role?: number;
    handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;

    type: "add" | "edit";
}

export const AddEditUser = (props: AddEditUserProps) => {
    const { title, username, password, name, email, role, handleSubmit, type } = props;
    const [roles, setRoles] = React.useState<Record<number, any>|undefined>(undefined);

    React.useEffect(() => {
        fetch(api_paths.admin.user_roles)
            .then(res => res.json())
            .then(data => {
                setRoles(data.reduce((acc: Record<string, any>, cur: Record<string, any>) => {
                    acc[cur.role] = cur;
                    return acc;
                }, {}));
            })
            .catch(err => {
                console.log(err);
                setRoles({});
            });
    }, []);

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h5" component="h2" gutterBottom>
                {title}
            </Typography>
            <List sx={{ ml: 4 }} dense>
                <ListItem>
                    <TextField {...UsernameFieldParams} autoFocus defaultValue={username}
                        disabled={type === "edit"} />
                    {roles !== undefined && 
                    <FormControl sx={{ ml: 1}} fullWidth required>
                        <InputLabel>级别</InputLabel>
                        <Select variant="standard" required fullWidth size="small" label="级别" defaultValue={role!==undefined?role:''} name="role">
                            {Object.values(roles).map((role) => (
                                <MenuItem key={role.role} value={role.role}>
                                    {role.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>}
                </ListItem>
                <ListItem>
                    <TextField {...PasswordFieldParams} defaultValue={password} 
                        disabled={type === "edit"} />
                </ListItem>
                <ListItem>
                    <TextField {...NameFieldParams} defaultValue={name} />
                </ListItem>
                <ListItem>
                    <TextField {...EmailFieldParams} defaultValue={email} />
                </ListItem>
                <ListItem>
                    <Button fullWidth variant="contained" color="primary" type="submit" sx={{ mt: 2 }} >
                        提交
                    </Button>
                </ListItem>
            </List>
        </Box>
    );
};

export default AddEditUser;