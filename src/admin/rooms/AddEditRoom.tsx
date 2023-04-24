import * as React from "react";
import { 
    Box,  
    Typography, 
    List, ListItem, Button, Autocomplete,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import InputAdornment from '@mui/material/InputAdornment';

import { Item as AddEditLabelItem } from "./AddEditLabel";

interface AddEditRoomProps {
    title: string;
    room_id: JSX.Element;
    nameDefault?: string;
    capacityDefault?: number;
    status: number|null;
    setStatus: (status: number|null) => void;
    type: number|null;
    setType: (type: number|null) => void;
    handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    image?: JSX.Element;
}

export const AddEditRoom = (props: AddEditRoomProps) => {
    const { title, room_id, nameDefault, capacityDefault, status, setStatus, type, setType, handleSubmit, image } = props;
    const [name, setName] = React.useState(nameDefault);
    const [roomTypes, setRoomTypes] = React.useState<Record<number, any>>({});
    const [roomStatus, setRoomStatus] = React.useState<Record<number, any>>({});

    React.useEffect(() => {
        fetch('/api/admin/room_types')
            .then(res => res.json())
            .then(data => {
                setRoomTypes(data.reduce((acc: Record<string, any>, cur: Record<string, any>) => {
                    acc[cur.type] = cur;
                    return acc;
                }, {}));
            })
            .catch(err => {
                console.log(err);
            });

        fetch('/api/admin/room_status')
            .then(res => res.json())
            .then(data => {
                setRoomStatus(data.reduce((acc: Record<string, any>, cur: Record<string, any>) => {
                    acc[cur.status] = cur;
                    return acc;
                }, {}));
            })
            .catch(err => {
                console.log(err);
            });
    }, []);
    
    return (
        <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h5" component="h2" gutterBottom>
                {title}
            </Typography>
            <List sx={{ ml: 4 }} dense>
                <ListItem>
                    {room_id}
                </ListItem>
                <ListItem>
                    <Item name="房间名" value={<TextField required
                        name="name" variant="standard"
                        size="small"
                        value={name}
                        onChange={(event) => {
                            setName(event.target.value);
                        }}
                        inputProps={{ 
                            maxLength: 50,
                         }}
                         InputProps={{
                            endAdornment: <InputAdornment position="end">{name?.length??0}/50</InputAdornment>,
                        }}
                    />} />
                </ListItem>
                <ListItem>
                    <Item name="容量" value={<TextField required
                        name="capacity" type="number" variant="standard"
                        size="small" defaultValue={capacityDefault}
                    />} />
                </ListItem>
                <ListItem>
                    <Item name="状态" value={<Autocomplete 
                        options={Object.values(roomStatus)}
                        getOptionLabel={(option) => option.label}
                        renderInput={(params) => <TextField {...params} required name="status" />}
                        size="small"
                        value={status !== null ? roomStatus[status]??null:null}
                        onChange={(event, newValue) => {
                            if (newValue) {
                                setStatus(newValue.status);
                            }
                        }}
                    />} />
                </ListItem>
                <ListItem>
                    <Item name="类型" value={<Autocomplete
                        options={Object.values(roomTypes)}
                        getOptionLabel={(option) => option.label}
                        renderInput={(params) => <TextField {...params} required name="type" />}
                        size="small"
                        value={type !== null ? roomTypes[type]??null:null}
                        onChange={(event, newValue) => {
                            if (newValue) {
                                setType(newValue.type);
                            }
                        }}
                    />} />
                </ListItem>
                <ListItem>
                    <Item name="图片" value={<>
                        <input 
                            type="file" name="image" 
                            accept="image/png, image/jpeg" 
                        />
                    </>} />
                    {image}
                </ListItem>
            </List>
            <Button fullWidth variant="contained" color="primary" type="submit">
                提交
            </Button>
        </Box>
    );
}

export const Item = ({name, value}:{name: string, value: JSX.Element}) => (
    <AddEditLabelItem name={name} value={value} nameWidth={70} />
);

export default AddEditRoom;