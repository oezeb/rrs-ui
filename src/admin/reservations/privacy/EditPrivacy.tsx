import * as React from "react";
import { useSearchParams } from "react-router-dom";

// import { useSnackbar } from "../../../SnackbarProvider";
import { paths as api_paths } from "../../../api";
import { Box, Button, List, ListItem, TextField, Typography } from "@mui/material";
import { descriptionFieldParams, labelFieldParams } from "../../../util";

function EditPrivacy() {
    const [privacy, setPrivacy] = React.useState<Record<string, any>|null>(null);
    const [searchParams] = useSearchParams();
    // const {showSnackbar} = useSnackbar();

    let id = searchParams.get('privacy');

    React.useEffect(() => {
        fetch(api_paths.admin.resv_privacy + `?privacy=${id}`)
            .then(res => res.json())
            .then(res => {
                setPrivacy(res[0]);
            });
    }, [id]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
    };

    return (<>{privacy &&
        <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h5" component="h2" gutterBottom>
                编辑预约隐私设置
            </Typography>
            <List sx={{ ml: 4 }} dense>
                <ListItem>
                    <TextField disabled variant="standard" type="number"
                        name="privacy" label="隐私" defaultValue={privacy.privacy} />
                    <TextField {...labelFieldParams} defaultValue={privacy.label} sx={{ml: 1}} />
                </ListItem>
                <ListItem>
                    <TextField {...descriptionFieldParams} defaultValue={privacy.description} sx={{ mt: 1 }} />
                </ListItem>
                <ListItem>
                    <Button fullWidth type="submit" variant="contained" sx={{ mt: 2 }}>
                        保存
                    </Button>
                </ListItem>
            </List>
        </Box> 
    }</>);
}

export default EditPrivacy;