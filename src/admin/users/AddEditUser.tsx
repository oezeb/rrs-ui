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
import { useLang } from "providers/LangProvider";

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
    const lang = useLang();

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
                    <TextField {...UsernameFieldParams} 
                        autoFocus 
                        label={strings[lang].username}
                        defaultValue={username}
                        disabled={type === "edit"}
                    />
                    {roles !== undefined && 
                    <FormControl sx={{ ml: 1}} fullWidth required>
                        <InputLabel>{strings[lang].role}</InputLabel>
                        <Select variant="standard" required fullWidth size="small" 
                            name="role"
                            label={strings[lang].role}
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
                        label={strings[lang].password}
                        defaultValue={password} 
                        disabled={type === "edit"}
                    />
                </ListItem>
                <ListItem>
                    <TextField {...NameFieldParams} 
                        label={strings[lang].name}
                        defaultValue={name} 
                    />
                </ListItem>
                <ListItem>
                    <TextField {...EmailFieldParams} 
                        label={strings[lang].email}
                        defaultValue={email}
                    />
                </ListItem>
                <ListItem>
                    <Button fullWidth variant="contained" color="primary" type="submit" sx={{ mt: 2 }} >
                        {strings[lang].submit}
                    </Button>
                </ListItem>
            </List>
        </Box>
    );
};

const strings = {
    zh: {
        username: "用户名",
        role: "角色",
        password: "密码",
        name: "姓名",
        email: "邮箱",
        submit: "提交",
    } as const,
    en: {
        username: "Username",
        role: "Role",
        password: "Password",
        name: "Name",
        email: "Email",
        submit: "Submit",
    } as const,
} as const;

export default AddEditUser;