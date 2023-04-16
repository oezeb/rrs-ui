import { useEffect, useState } from "react";
import { Dict, Notice } from "../types";
import { fetchTranslation } from "../util";
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { Link } from "react-router-dom";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import dayjs from "dayjs";
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

function NoticesView({ strings } : { strings: Dict }) {
    const [data, setData] = useState<Notice[]|null>(null);

    useEffect(() => {
        const url = "/api/notices";
        fetchTranslation(url, strings.lang_code)
            .then((data) => {
                setData(data.map((notice: Notice) => {
                    return {
                        ...notice,
                        create_time: dayjs(notice.create_time),
                        update_time: dayjs(notice.update_time),
                    };
                }));
            })
            .catch((err) => {
                console.log(err);
            });
    }, [strings.lang_code]);

    if (data === null) {
        return <p>Loading...</p>;
    } else if (data.length === 0) {
        return <p>No Notices, Come Back Later</p>;
    } else {
        return (
            <List>
                {data.map((notice) => (
                    <><ListItem key={notice.notice_id} dense>
                        <ListItemButton>
                            <ListItemText>
                                {notice.title}
                            </ListItemText>
                            <Typography variant="caption" color="text.secondary">
                                {notice.create_time.format("YYYY-MM-DD HH:mm")}
                            </Typography>
                        </ListItemButton>
                    </ListItem>
                    <Divider /></>
                ))}
            </List>
        );
    }
}

export default NoticesView;