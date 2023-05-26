import {
    Box,
    List, ListItem, ListItemText,
    Skeleton,
    Typography,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import { descriptionFieldParams, labelFieldParams } from "utils/util";

const SettingItem = (props: any) => {
    const { id, title, text, value, label, description } = props;

    const Field = (props: any) => (<TextField {...props} fullWidth
        id={`${id}-${props.name}`}
        name={`${id}-${props.name}`}
        type="text"
        InputLabelProps={{
            shrink: true,
        }}
    />);

    return (<>
        <ListItem divider>
            <ListItemText sx={{ flex: 'none' }}>
                <Typography fontWeight="bold">
                    {title}：
                </Typography>
            </ListItemText>
            <ListItemText>
                {text}
            </ListItemText>
        </ListItem>
        <List sx={{ ml: 4 }} dense>
            <ListItem><Item name="值" value={value} /></ListItem>
            <ListItem>
                <Item name="标签" value={<Field {...labelFieldParams}
                    required
                    label={undefined}
                    defaultValue={label}
                />} />
            </ListItem>
            <ListItem>
                <Item name="描述" value={<Field {...descriptionFieldParams}
                    label={undefined}
                    defaultValue={description}
                />} />
            </ListItem>
        </List>
    </>);
};

export const SettingItemSkeleton = () => (<>
    <ListItem divider>
        <ListItemText><Skeleton /></ListItemText>
    </ListItem>
    <List sx={{ ml: 4 }} dense>
        <ListItem><Item name="值" value={<Skeleton />} /></ListItem>
        <ListItem><Item name="标签" value={<Skeleton />} /></ListItem>
        <ListItem><Item name="描述" value={<Skeleton variant="rectangular" height={90} />} /></ListItem>
    </List>
</>);


const Item = ({name, value}:{name: string, value: JSX.Element}) => (<>
    <ListItemText sx={{ flex: 'none', width: 50 }} >
        <Typography fontWeight="bold">
            {name}：
        </Typography>
    </ListItemText>
    <Box sx={{ flexGrow: 1 }} >
        {value}
    </Box>
</>);

export default SettingItem;