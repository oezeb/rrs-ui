import * as React from "react";
import { 
    Box,  
    Typography, 
    ListItemText, 
    Button,
    IconButton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';

import { time } from "../util";
import { useSnackbar } from "../SnackbarProvider";

//TODO: add a preview??

function Periods() {
    const [periods, setPeriods] = React.useState<Record<string, any>[]>([]);
    const [edited, setEdited] = React.useState<Record<string, any>[]>([]);

    const { showSnackbar } = useSnackbar();

    React.useEffect(() => {
        fetch("/api/admin/periods")
            .then(res => res.json())
            .then(data => {
                setPeriods(data);
            });
    }, []);

    React.useEffect(() => {
        setEdited(periods);
    }, [periods]);

    React.useEffect(() => {
        let overlap = overlaps(edited.filter(p => p.start_time && p.end_time));
        if (overlap) {
            showSnackbar({ message: `第${overlap.i+1}行与第${overlap.j+1}行的时间段重叠`, severity: "error" });
        }
    }, [edited, showSnackbar]);


    
    const overlaps = (periods: Record<string, any>[]) => {
        for (let i = 0; i < periods.length; i++) {
            let p1 = periods[i];
            for (let j = i + 1; j < periods.length; j++) {
                let p2 = periods[j];
                if (!(time(p1.end_time) <= time(p2.start_time) || time(p2.end_time) <= time(p1.start_time))) {
                    return { i, j, p1, p2 };
                }
            }
        }
        return null;
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        for (let i = 0; i < edited.length; i++) {
            let p = edited[i];
            let start = time(p.start_time);
            let end = time(p.end_time);
            if (start === null || end === null) {
                showSnackbar({ message: "时间格式错误", severity: "error" });
                return;
            }
            if (start >= end) {
                showSnackbar({ message: `第${i + 1}行的开始时间必须早于结束时间`, severity: "error" });
                return;
            }
        }
        
        let periodsDict = periods.reduce((acc, p) => {
            acc[p.period_id] = p;
            return acc;
        }, {} as Record<string, any>);
        
        let editedDict = edited.reduce((acc, p) => {
            acc[p.period_id] = p;
            return acc;
        }, {} as Record<string, any>);
        
        let toAdd = edited.filter(p => !p.period_id);
        let toUpdate = edited.filter(p => p.period_id && (p.start_time !== periodsDict[p.period_id].start_time || p.end_time !== periodsDict[p.period_id].end_time));
        let toDelete = periods.filter(p => !editedDict[p.period_id]);

        console.log(toAdd, toUpdate, toDelete);

        let promises = [];
        if (toAdd.length > 0) {
            promises.push(fetch("/api/admin/periods", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(toAdd),
            }));
        }
        if (toUpdate.length > 0) {
            promises.push(fetch("/api/admin/periods", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(toUpdate.map(p => ({
                    where: { period_id: p.period_id },
                    data: p,
                }))),
            }));
        }
        if (toDelete.length > 0) {
            promises.push(fetch("/api/admin/periods", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(toDelete),
            }));
        }

        console.log(promises);

        if (promises.length === 0) {
            showSnackbar({ message: "没有修改", severity: "info" });
        } else {
            Promise.all(promises)
                .then((res) => {
                    if (res.every(r => r.ok)) {
                        showSnackbar({ message: "保存成功", severity: "success", duration: 2000 });
                        setPeriods(edited);
                    } else {
                        showSnackbar({ message: "保存失败", severity: "error" });
                    }
                })
                .catch(err => {
                    console.error(err);
                    showSnackbar({ message: "保存失败", severity: "error" });
                });
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <ListItemText primary={
                <Typography variant="h5" component="h2" gutterBottom>
                    时段
                </Typography>} 
                secondary="用户只能选择一个或多个连续时段预约。时段不能重叠。"
            />
            <TableContainer>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>编号</TableCell>
                        <TableCell>开始时间</TableCell>
                        <TableCell />
                        <TableCell>结束时间</TableCell>
                        <TableCell />
                    </TableRow>
                </TableHead>
                <TableBody>
                    {edited.map((p, i) =>(
                        <TableRow key={i}>
                            <TableCell>{i + 1}</TableCell>
                            <TableCell>
                                <TextField required
                                    id="start_time"
                                    type="time"
                                    variant="standard"
                                    value={p.start_time}
                                    onChange={e => {
                                        let value = e.target.value;
                                        setEdited(edited.map((p, j) => i === j ? { ...p, start_time: value } : p));
                                    }}
                                />
                            </TableCell>
                            <TableCell>~</TableCell>
                            <TableCell>
                                <TextField required
                                    id="end_time"
                                    type="time"
                                    variant="standard"
                                    value={p.end_time}
                                    onChange={e => {
                                        let value = e.target.value;
                                        setEdited(edited.map((p, j) => i === j ? { ...p, end_time: value } : p));
                                    }}
                                />
                            </TableCell>
                            <TableCell>
                                <Tooltip title="删除">
                                    <IconButton
                                        onClick={() => {
                                            setEdited(edited.filter((p, j) => i !== j));
                                        }}
                                    >
                                        <ClearIcon />
                                    </IconButton>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    ))}
                    <TableRow>
                        <TableCell>
                            <Tooltip title="添加">
                                <IconButton
                                    onClick={() => {
                                        setEdited([...edited, { start_time: '', end_time: '' }]);
                                    }}
                                >
                                    <AddIcon />
                                </IconButton>
                            </Tooltip>
                        </TableCell>
                        <TableCell />
                        <TableCell />
                        <TableCell />
                        <TableCell />
                    </TableRow>
                </TableBody>
            </Table>
            </TableContainer>
            <Button fullWidth type="submit" variant="contained" sx={{ mt: 2 }}>
                保存
            </Button>
            {/* <Box height={400}>
                <ResvsView reservations={[]} periods={edited
                    .filter(p => p.start_time && p.end_time)
                    .map(p => ({
                        ...p,
                        start_time: time(p.start_time),
                        end_time: time(p.end_time),
                    }))
                    .sort((a, b) => a.start_time.diff(b.start_time))} />
            </Box> */}
        </Box>
    );
}

export default Periods;