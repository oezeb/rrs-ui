import React from "react";
import { 
    Box,  
    Typography, 
    List, ListItem, ListItemText, Button,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import InputAdornment from '@mui/material/InputAdornment';

interface Props {
    title: string;
    id: JSX.Element;
    labelDefault?: string;
    descriptionDefault?: string;
    handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

function AddEditLabel(props: Props) {
    const {title, id, labelDefault, descriptionDefault, handleSubmit} = props;
    const [label, setLabel] = React.useState(labelDefault);
    const [description, setDescription] = React.useState(descriptionDefault);

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h5" component="h2" gutterBottom>
                {title}
            </Typography>
            <List sx={{ ml: 4 }} dense>
                <ListItem>{id}</ListItem>
                <ListItem>
                    <Item name="标签" value={<Field required
                        name="label"
                        value={label}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLabel(e.target.value)}
                        variant="standard"
                        inputProps={{ 
                            maxLength: 50,
                         }}
                         InputProps={{
                            endAdornment: <InputAdornment position="end">{label?.length??0}/50</InputAdornment>,
                        }}
                    />} />
                </ListItem>
                <ListItem>
                    <Item name="描述" value={<Field
                        name="description"
                        value={description}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
                        multiline maxRows={4} minRows={2}
                        inputProps={{ maxLength: 200 }}
                        helperText={`${description?.length??0}/200`}
                    />} />
                </ListItem>
                <ListItem>
                    <Button fullWidth type="submit" variant="contained" sx={{ mt: 2 }}>
                        保存
                    </Button>
                </ListItem>
            </List>
        </Box>
    );
}

export const Item = ({name, value, nameWidth}:{name: string, value: JSX.Element|string|undefined, nameWidth?: number}) => (<>
    <ListItemText sx={{ flex: 'none', width: nameWidth??50 }} >
        <Typography fontWeight="bold">
            {name}：
        </Typography>
    </ListItemText>
    <Box sx={{ flexGrow: 1 }} >
        {value}
    </Box>
</>);

export const Field = (props: any) => (<TextField {...props} fullWidth
    id={props.name}
    name={props.name}
    type="text"
    InputLabelProps={{
        shrink: true,
    }}
/>);

export default AddEditLabel;