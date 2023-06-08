import { List, ListItem, ListItemIcon, ListItemText, Typography, IconButton } from "@mui/material"
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import { useLocation } from "react-router-dom";
import { Link } from "utils/Navigate";

function About() {
    const location = useLocation();

    const from = location.state?.from || "/";
    return (
        <List>
            <ListItem divider dense>
                {/* <ListItemIcon>
                    <IconButton component={Link}  to={from}>
                        <NavigateBeforeIcon fontSize="large" color="primary" />
                    </IconButton>
                </ListItemIcon> */}
                <ListItemText disableTypography>
                    <Typography variant="h4">
                        关于
                    </Typography>
                </ListItemText>
            </ListItem>
        </List>     
    );
}

export default About;