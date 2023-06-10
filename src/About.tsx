import { List, ListItem, ListItemText, Typography } from "@mui/material"

function About() {
    return (
        <List>
            <ListItem divider dense>
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