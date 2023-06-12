import * as React from "react";
import { 
    Box,  
    Typography, 
    ListItemText, 
    Button,
} from "@mui/material";

import { useSnackbar } from "providers/SnackbarProvider";
import { paths as api_paths } from "utils/api";
import BinaryDialog from "utils/BinaryDialog";
import { TimeDelta } from "utils/util";
import PeriodTable from "./PeriodTable";

function Periods() {
    const [periods, setPeriods] = React.useState<Record<string, any>[]|undefined>(undefined);
    const [edited, setEdited] = React.useState<Record<string, any>[]|undefined>(undefined);
    const [del, setDel] = React.useState<Record<string, any>|undefined>(undefined);

    const { showSnackbar } = useSnackbar();

    React.useEffect(() => {
        if (periods !== undefined) return;
        setEdited(undefined);
        fetch(api_paths.admin.periods)
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(data => setPeriods(data
                .map((p: Record<string, any>) => ({
                    ...p,
                    start_time: TimeDelta.from(p.start_time),
                    end_time: TimeDelta.from(p.end_time)
                }))
            ))
            .catch(err => {
                console.error(err);
                setPeriods([]);
            });
    }, [periods]);

    React.useEffect(() => {
        if (periods === undefined || edited !== undefined) return;
        setEdited(periods);
    }, [periods, edited]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (periods === undefined || edited === undefined) return;

        // start < end
        for (let i = 0; i < edited.length; i++) {
            let p = edited[i];
            if (p.end_time.lessThan(p.start_time)) {
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
                    if (p1.end_time.lessThan(p2.start_time) || p1.end_time.equals(p2.start_time)
                        || p2.end_time.lessThan(p1.start_time) || p2.end_time.equals(p1.start_time)) {
                        continue;
                    } else {
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
                body: JSON.stringify({
                    start_time: p.start_time.format(),
                    end_time: p.end_time.format(),
                }),
            }));
        }
        for (let p of edited.filter(p => (
            p.period_id && ( !p.start_time.equals(periodsDict[p.period_id].start_time)
                || !p.end_time.equals(periodsDict[p.period_id].end_time)
            )))) {
                promises.push(fetch(api_paths.admin.periods + `/${p.period_id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        start_time: p.start_time.format(),
                        end_time: p.end_time.format(),
                    }),
                }
            ));
        }

        if (promises.length === 0) {
            showSnackbar({ message: "没有修改", severity: "info" });
        } else {
            Promise.all(promises)
                .then((res) => {
                    if (res.every(r => r.ok)) {
                        showSnackbar({ message: "保存成功", severity: "success", duration: 2000 });
                        setPeriods(undefined);
                    } else {
                        throw new Error(res.map(r => r.statusText).join(", "));
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
            <Box sx={{ p: 3, maxWidth: 700, margin: "auto" }} >
                <ListItemText primary={
                    <Typography variant="h5" component="h2" gutterBottom>
                        时段
                    </Typography>} 
                    secondary="用户只能选择一个或多个连续时段预约。时段不能重叠。"
                />
                <PeriodTable periods={edited} setPeriods={setEdited} setDel={setDel} />
                <Button fullWidth type="submit" variant="contained" sx={{ mt: 2 }}>
                    保存
                </Button>
                <DeleteDialog del={del} setDel={setDel} setPeriods={setPeriods} />
            </Box>
        </Box>
    );
}


interface DeleteDialogProps {
    del: Record<string, any>|undefined;
    setDel: React.Dispatch<React.SetStateAction<Record<string, any>|undefined>>;
    setPeriods: React.Dispatch<React.SetStateAction<Record<string, any>[]|undefined>>;
}

function DeleteDialog({ del, setDel, setPeriods }: DeleteDialogProps) {
    const { showSnackbar } = useSnackbar();

    const handleClose = () => {
        setDel(undefined);
    };

    const handleDelete = () => {
        fetch(api_paths.admin.periods + `/${del?.period_id}`, {
            method: "DELETE",
        })
            .then(res => {
                if (res.ok) {
                    setPeriods(undefined);
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
            open={del !== undefined}
            onConfirm={handleDelete}
            onClose={handleClose}
            title="删除时段"
            content={`确定要删除时段 ${del?.start_time.format("HH:mm")} ~ ${del?.end_time.format("HH:mm")} 吗？`}
        />
    );
}

export default Periods;