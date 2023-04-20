import { useState, useEffect } from "react";
import Box from '@mui/material/Box';
import { List, ListItem, ListItemButton, ListItemText, Skeleton, Typography } from "@mui/material";
import dayjs from "dayjs";
import { Link, useSearchParams } from "react-router-dom";
import ReactMarkdown from 'react-markdown'
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EditIcon from '@mui/icons-material/Edit';

function Notices() {
    const [searchParams] = useSearchParams();
    const notice_id = searchParams.get("id");
    if (notice_id) {
        return <NoticeView notice_id={notice_id} />;
    } else {
        return <>
            <ListItem divider>
                <ListItemText >
                    <Typography variant="h5" component="h2" gutterBottom>
                        通知
                    </Typography>
                </ListItemText>
            </ListItem>
            <NoticeList />
        </>;
    }
}

function NoticeList() {
    const [notices, setNotices] = useState<Record<string, any>[]|null>(null);

    useEffect(() => {
        let url = `/api/notices`;
        fetch(url).then((res) => res.json())
            .then((data) => {
                setNotices(data.map((notice: Record<string, any>) => {
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
    }, []);

    const ListItemSkeleton = () => (
        <ListItem divider dense>
            <ListItemText><Typography ><Skeleton /></Typography></ListItemText>
        </ListItem>
    );
    
    if (notices === null) {
        return (
        <List><ListItemSkeleton /><ListItemSkeleton /><ListItemSkeleton /></List>
        )
    // } else if (notices.length === 0) {
    //    return view = <p>No Notices, Come Back Later</p>;
    } else {
        return (
            <List>
                {notices?.map((notice) => (
                    <ListItem key={notice.notice_id} dense divider>
                        <ListItemButton component={Link} to={`/notices?id=${notice.notice_id}`}>
                            <ListItemText>
                                {notice.title}
                            </ListItemText>
                            <Typography variant="caption" color="text.secondary">
                                {notice.create_time.format("YYYY-MM-DD HH:mm")}
                            </Typography>
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        );
    }
}

function NoticeView({ notice_id }: { notice_id: string }) {
    const [notice, setNotice] = useState<Record<string, any> | null>(null);

    useEffect(() => {
        let url = `/api/notices?notice_id=${notice_id}`
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
                        <Box sx={{ display: "flex", alignItems: "center", mt: 0.3 }}>
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

export default Notices;