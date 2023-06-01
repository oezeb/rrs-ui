import { useState, useEffect } from "react";
import { List, ListItem, ListItemButton, ListItemText, Skeleton, Typography } from "@mui/material";
import dayjs from "dayjs";
import { Link } from "utils/Navigate";
import { paths as api_paths } from "utils/api";
import { useParams } from "react-router-dom";
import NoticeDetails from "./NoticeDetails";

function Notices() {
    const { notice_id } = useParams();

    if (notice_id === undefined) {
        return <NoticeList />;
    } else {
        return <NoticeDetails notice_id={notice_id} />;
    }
}

function NoticeList() {
    const [notices, setNotices] = useState<Record<string, any>[]|undefined>(undefined);

    useEffect(() => {
        let url = api_paths.notices;
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

    return (
        <List>
            <ListItem divider>
                <ListItemText >
                    <Typography variant="h5" component="h2" gutterBottom>
                        通知
                    </Typography>
                </ListItemText>
            </ListItem>
            {notices === undefined && Array.from(new Array(3)).map((_, i) => <ListItemSkeleton key={i} />)}
            {notices && notices.map((notice) => (
                <ListItem key={notice.notice_id} dense divider>
                    <ListItemButton component={Link} to={`/notices/${notice.notice_id}`}>
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

export default Notices;