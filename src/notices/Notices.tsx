import { useState, useEffect } from "react";
import { List, ListItem, ListItemButton, ListItemText, Skeleton, Typography } from "@mui/material";
import dayjs from "dayjs";
import { Link } from "utils/Navigate";
import { paths as api_paths } from "utils/api";
import { useParams } from "react-router-dom";
import NoticeDetails from "./NoticeDetails";
import NoContent from "utils/NoContent";

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
        fetch(url).then((res) => res.ok ? res.json() : Promise.reject(res))
            .then((data) => setNotices(data
                .map((notice: Record<string, any>) => ({
                        ...notice,
                        create_time: dayjs(notice.create_time),
                        update_time: dayjs(notice.update_time),
                    })
                )
            ))
            .catch((err) => {
                console.log(err);
                setNotices([]);
            });
    }, []);

    const Title = () => (
        <ListItem divider>
            <ListItemText>
                <Typography variant="h5" component="h2" gutterBottom>
                    通知
                </Typography>
            </ListItemText>
        </ListItem>
    );

    const ListItemSkeleton = () => (
        <ListItem divider dense>
            <ListItemText><Typography ><Skeleton /></Typography></ListItemText>
        </ListItem>
    );


    if (notices === undefined) return (
        <List>
            <Title />
            {Array.from(new Array(10)).map((_, i) => <ListItemSkeleton key={i} />)}
        </List>
    );

    if (notices.length === 0) return (
        <List>
            <Title />
            <NoContent />
        </List>
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
            {notices.map((notice) => (
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