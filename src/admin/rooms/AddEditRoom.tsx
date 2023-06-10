import * as React from "react";
import { 
    Box,  
    Typography, 
    List, ListItem, ListItemText, Button, FormControl, InputLabel, Select, MenuItem,
} from "@mui/material";
import TextField from "@mui/material/TextField";

import { paths as api_paths, room_status } from "utils/api";

interface AddEditRoomProps {
    title: string;
    room_id?: number|string;
    name?: string;
    capacity?: number|string;
    status?: number|string;
    type?: number|string;
    image?: JSX.Element;
    handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;

    _type: "add" | "edit";
}

export const AddEditRoom = (props: AddEditRoomProps) => {
    const { title, room_id, name, capacity, status, type, image, handleSubmit, _type } = props;
    const [roomTypes, setRoomTypes] = React.useState<Record<number, any>|undefined>(undefined);
    const [roomStatus, setRoomStatus] = React.useState<Record<number, any>|undefined>(undefined);

    React.useEffect(() => {
        fetch(api_paths.admin.room_types)
            .then(res => res.json())
            .then(data => {
                setRoomTypes(data.reduce((acc: Record<string, any>, cur: Record<string, any>) => {
                    acc[cur.type] = cur;
                    return acc;
                }, {}));
            })
            .catch(err => {
                console.log(err);
                setRoomTypes({});
            });

        fetch(api_paths.admin.room_status)
            .then(res => res.json())
            .then(data => {
                setRoomStatus(data.reduce((acc: Record<string, any>, cur: Record<string, any>) => {
                    acc[cur.status] = cur;
                    return acc;
                }, {}));
            })
            .catch(err => {
                console.log(err);
                setRoomStatus({});
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
                    <TextField size="small" variant="standard" type="number" fullWidth
                        name="room_id" label="房间号" defaultValue={room_id}
                        disabled={_type === "edit"}
                    />
                    {roomStatus !== undefined &&
                    <FormControl sx={{ ml: 1}} fullWidth required>
                        <InputLabel>状态</InputLabel>
                        <Select variant="standard" required size="small"
                            name="status" label="状态" defaultValue={status??room_status.available}
                        >
                            {Object.values(roomStatus).map((status: any) => (
                                <MenuItem key={status.status} value={status.status}>
                                    {status.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>}
                    {roomTypes !== undefined &&
                    <FormControl sx={{ ml: 1}} fullWidth required>
                        <InputLabel>类型</InputLabel>
                        <Select variant="standard" required size="small"
                            name="type" label="类型" defaultValue={type}
                        >
                            {Object.values(roomTypes).map((type: any) => (
                                <MenuItem key={type.type} value={type.type}>
                                    {type.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>}
                </ListItem>
                <ListItem>
                    <TextField required size="small" variant="standard" fullWidth
                        name="name" label="房间名" defaultValue={name}
                        inputProps={{ maxLength: 50 }}
                    />
                </ListItem>
                <ListItem>
                <TextField required size="small" variant="standard" type="number" fullWidth
                        name="capacity" label="容量" defaultValue={capacity}
                    />
                </ListItem>
                <ListItem>
                    {/* <Item name="图片" value={<>
                        <input 
                            type="file" name="image" 
                            accept="image/png, image/jpeg" 
                        />
                    </>} />
                    {image} */}

                    <ListItemText sx={{ flex: 'none', width: 50 }} >
                        <Typography fontWeight="bold">
                            图片：
                        </Typography>
                    </ListItemText>
                    <Box sx={{ flexGrow: 1 }} >
                        <input
                            type="file" name="image"
                            accept="image/png, image/jpeg"
                        />
                    </Box>
                    {image}
                </ListItem>
                <ListItem>
                    <Button fullWidth variant="contained" color="primary" type="submit">
                        {_type === "add" ? "添加" : "保存"}
                    </Button>
                </ListItem>
            </List>
        </Box>
    );
}

export default AddEditRoom;