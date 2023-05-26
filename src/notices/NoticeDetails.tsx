import { useState, useEffect } from "react";
import Box from '@mui/material/Box';
import { List, ListItem, ListItemText, Skeleton, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import ReactMarkdown from 'react-markdown'
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EditIcon from '@mui/icons-material/Edit';
import { paths as api_paths } from "utils/api";

function NoticeDetails() {
    const [notice, setNotice] = useState<Record<string, any> | null>(null);
    const { notice_id } = useParams();

    useEffect(() => {
        if (notice_id === undefined) return;
        let url = api_paths.notices + `?notice_id=${notice_id}`;
        fetch(url).then((res) => res.json())
            .then((data) => {
                setNotice({
                    ...data[0],
                    create_time: dayjs(data[0].create_time),
                    update_time: data[0].update_time ? dayjs(data[0].update_time) : null,
                });
            })
            .catch((err) => {
                console.log(err);
            });
    }, [notice_id]);

    if (notice_id === undefined) return null;
    return (
        <List>
            <ListItem divider dense>
                <ListItemText
                    primary={
                        <Typography variant="h4">
                            {notice? notice.title : <Skeleton />}
                        </Typography>
                    }
                    secondary={
                        <Box component="span" sx={{ display: "flex", alignItems: "center", mt: 0.3 }}>
                            <AccessTimeIcon fontSize="small" color="disabled" sx={{ mr: 1 }} />
                            {notice? notice.create_time.format("YYYY-MM-DD HH:mm")
                                : <Skeleton width={110} />}
                            {notice? notice.update_time && (
                                <>
                                    <EditIcon fontSize="small" color="disabled" sx={{ ml: 2, mr: 1 }} />
                                    {notice?.update_time.format("YYYY-MM-DD HH:mm")}
                                </>
                            ) : (
                                <>
                                    <EditIcon fontSize="small" color="disabled" sx={{ mr: 1 }} />
                                    <Typography variant="caption" color="text.secondary">
                                        <Skeleton width={110} />
                                    </Typography>
                                </>
                            )}
                        </Box>    
                    }
                />
            </ListItem>
            {notice ? (
                <ReactMarkdown children={notice?.content || ""} />
            ) : (
                <Typography variant="body1" sx={{ mt: 2 }}>
                    <Skeleton /><Skeleton /><Skeleton />
                </Typography>
            )}
        </List>
    );
}

export default NoticeDetails;