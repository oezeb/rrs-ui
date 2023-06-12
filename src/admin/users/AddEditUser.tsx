import {
    Box,
    Button, FormControl, InputLabel,
    List, ListItem,
    MenuItem,
    Select,
    Typography,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import * as React from "react";

import { EmailFieldParams, NameFieldParams, PasswordFieldParams, UsernameFieldParams } from "utils/util";
import { paths as api_paths } from "utils/api";

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
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(data => setRoles(data
                .reduce((acc: Record<string, any>, cur: Record<string, any>) => {
                    acc[cur.role] = cur;
                    return acc;
                }, {})
            ))
            .catch(err => {
                console.log(err);
                setRoles({});
            });
    }, []);

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 700, margin: "auto" }} >
            <List dense>
                <ListItem divider sx={{ mb: 2 }}>
                    <Typography variant="h5" component="h2" gutterBottom>
                        {title}
                    </Typography>
                </ListItem>
                <ListItem>
                    <TextField {...UsernameFieldParams} 
                        autoFocus 
                        label="用户名"
                        defaultValue={username}
                        disabled={type === "edit"}
                    />
                    {roles !== undefined && 
                    <FormControl sx={{ ml: 1}} fullWidth required>
                        <InputLabel>角色</InputLabel>
                        <Select variant="standard" required fullWidth size="small" 
                            name="role"
                            label="角色"
                            defaultValue={role!==undefined?role:''} 
                        >
                            {Object.values(roles).map((role) => (
                                <MenuItem key={role.role} value={role.role}>
                                    {role.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>}
                </ListItem>
                <ListItem>
                    <TextField {...PasswordFieldParams} 
                        label="密码"
                        defaultValue={password} 
                        disabled={type === "edit"}
                    />
                </ListItem>
                <ListItem>
                    <TextField {...NameFieldParams} 
                        label="姓名"
                        defaultValue={name} 
                    />
                </ListItem>
                <ListItem>
                    <TextField {...EmailFieldParams} 
                        label="邮箱"
                        defaultValue={email}
                    />
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