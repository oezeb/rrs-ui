import * as React from "react";
import { 
    Box,  
    Typography, 
    ListItemText, 
    Button,
    IconButton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip,
    Skeleton,
    Paper,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import { time } from "utils/util";
import { useSnackbar } from "providers/SnackbarProvider";
import { paths as api_paths } from "utils/api";
import BinaryDialog from "utils/BinaryDialog";

function Periods() {
    const [periods, setPeriods] = React.useState<Record<string, any>[]|undefined>(undefined);
    const [edited, setEdited] = React.useState<Record<string, any>[]>([]);
    const [del, setDel] = React.useState<Record<string, any>|null>(null);

    const { showSnackbar } = useSnackbar();

    React.useEffect(() => {
        fetch(api_paths.admin.periods)
            .then(res => res.json())
            .then(data => {
                setPeriods(data);
            })
            .catch(err => {
                console.error(err);
                setPeriods([]);
            });
    }, []);

    React.useEffect(() => {
        if (periods === undefined) return;
        setEdited(periods);
    }, [periods]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (periods === undefined) return;

        // start < end
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

        // conflict
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

        let overlap = overlaps(edited.filter(p => p.start_time && p.end_time));
        if (overlap) {
            showSnackbar({ message: `第${overlap.i+1}行与第${overlap.j+1}行的时间段重叠`, severity: "error" });
            return;
        }

        // save
        let periodsDict = periods.reduce((acc, p) => {
            acc[p.period_id] = p;
            return acc;
        }, {} as Record<string, any>);
        
        let promises = [];
        for (let p of edited.filter(p => !p.period_id)) {
            promises.push(fetch(api_paths.admin.periods, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(p),
            }));
        }
        for (let p of edited.filter(p => (
            p.period_id && ( p.start_time !== periodsDict[p.period_id].start_time 
                || p.end_time !== periodsDict[p.period_id].end_time
            )))) {
            promises.push(fetch(api_paths.admin.periods + `/${p.period_id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(p),
            }));
        }

        if (promises.length === 0) {
            showSnackbar({ message: "没有修改", severity: "info" });
        } else {
            Promise.all(promises)
                .then((res) => {
                    if (res.every(r => r.ok)) {
                        showSnackbar({ message: "保存成功", severity: "success", duration: 2000 });
                        setPeriods(edited);
                    } else {
                        throw new Error();
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
            <Paper sx={{ my: 1, width: '100%', overflow: 'hidden' }}>
                <TableContainer sx={{ height: "60vh"}}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell><Typography fontWeight="bold">编号</Typography></TableCell>
                                <TableCell><Typography fontWeight="bold">开始时间</Typography></TableCell>
                                <TableCell />
                                <TableCell><Typography fontWeight="bold">结束时间</Typography></TableCell>
                                <TableCell><Typography fontWeight="bold">操作</Typography></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {periods === undefined && Array(12).fill(0).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton /></TableCell>
                                    <TableCell><Skeleton /></TableCell>
                                    <TableCell align="center">~</TableCell>
                                    <TableCell><Skeleton /></TableCell>
                                    <TableCell><Skeleton /></TableCell>
                                </TableRow>
                            ))}
                            {periods !== undefined && edited.map((p, i) =>(
                                <TableRow key={i}>
                                    <TableCell>{i + 1}</TableCell>
                                    <TableCell>
                                        <TextField required
                                            size="small"
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
                                    <TableCell align="center">~</TableCell>
                                    <TableCell>
                                        <TextField required
                                            size="small"
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
                                                    if (p.period_id) {
                                                        setDel(p);
                                                    } else {
                                                        setEdited(edited.filter((_, j) => i !== j));
                                                    }
                                                }}
                                                size="small"
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
            <Button size="small" fullWidth variant="text" color="primary" startIcon={<AddIcon fontSize="small"/>}
                                onClick={() => {
                                    setEdited([...edited, { start_time: '', end_time: '' }]);
                                }}
                            >
                                添加
                            </Button>
            <Button fullWidth type="submit" variant="contained" sx={{ mt: 2 }}>
                保存
            </Button>
            <DeleteDialog del={del} setDel={setDel} setPeriods={setPeriods} />
        </Box>
    );
}


interface DeleteDialogProps {
    del: Record<string, any>|null;
    setDel: React.Dispatch<React.SetStateAction<Record<string, any>|null>>;
    setPeriods: React.Dispatch<React.SetStateAction<Record<string, any>[]|undefined>>;
}

function DeleteDialog({ del, setDel, setPeriods }: DeleteDialogProps) {
    const { showSnackbar } = useSnackbar();

    const handleClose = () => {
        setDel(null);
    };

    const handleDelete = () => {
        fetch(api_paths.admin.periods + `/${del?.period_id}`, {
            method: "DELETE",
        })
            .then(res => {
                if (res.ok) {
                    setPeriods(periods => periods?.filter(p => p.period_id !== del?.period_id));
                    showSnackbar({ message: "删除成功", severity: "success", duration: 2000 });
                    handleClose();
                } else {
                    throw new Error();
                }
            })
            .catch(err => {
                console.error(err);
                showSnackbar({ message: "删除失败", severity: "error" });
            });
    };

    return (
        <BinaryDialog
            open={del !== null}
            onConfirm={handleDelete}
            onClose={handleClose}
            title="删除时段"
            content={`确定要删除时段 ${del?.start_time} ~ ${del?.end_time} 吗？`}
        />
    );
}

export default Periods;