import * as React from "react";
import { 
    Typography,
    Button,
    IconButton,
    Tooltip,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import { TimeDelta } from "utils/util";
import Table, { TableSkeleton } from "admin/Table";

interface PeriodTableProps {
    periods: Record<string, any>[]|undefined;
    setPeriods: React.Dispatch<React.SetStateAction<Record<string, any>[]|undefined>>;

    setDel: React.Dispatch<React.SetStateAction<Record<string, any>|undefined>>;
}

function PeriodTable({ periods, setPeriods, setDel }: PeriodTableProps) {
    const [scrollBottom, setScrollBottom] = React.useState(false);

    const handleAdd = () => {
        if (periods === undefined) return;
        setPeriods([...periods, {
            start_time: null,
            end_time: null,
        }]);
        setTimeout(() => {
            setScrollBottom(true);
        }, 100);
    };

    const handleDelete = (row: Record<string, any>) => {
        if (row.period_id) {
            setDel(row);
        } else {
            setPeriods(periods?.filter((_, i) => i !== row.no - 1));
        }
    };

    const onTimeChange = (row: Record<string, any>, field: string, value: string) => {
        // field: start_time | end_time
        setPeriods(periods?.map((p, i) => i !== row.no - 1 ? p : {
            ...p,
            [field]: TimeDelta.from(value)
        }));
    };

    const columns = [
        { field: "no", label: "编号", noSort: true },
        { field: "start_time", label: "开始时间", noSort: true  },
        { field: "to", label: ""},
        { field: "end_time", label: "结束时间", noSort: true  },
        { field: "actions", label: "操作", noSort: true },
    ];

    return (<>
        {periods !== undefined &&
        <Table
            columns={columns}
            rows={periods.map((p, i) => ({...p, no: i + 1 }))}
            height="60vh"
            minWidth="500px"
            scrollBottom={scrollBottom}
            setScrollBottom={setScrollBottom}
            getValueLabel={(row, field) => {
                if (field === "start_time" || field === "end_time") {
                    return (
                        <TextField required size="small" type="time" variant="standard"
                            name={field}
                            value={row[field]?.format("HH:mm")??''}
                            onChange={e => onTimeChange(row, field, e.target.value)}
                        />
                    );
                } else if (field === "to") {
                    return <Typography align="center">~</Typography>;
                } else if (field === "actions") {
                    return (
                        <Tooltip title="删除">
                            <IconButton size="small" onClick={() => handleDelete(row)}>
                                <DeleteIcon fontSize="inherit" />
                            </IconButton>
                        </Tooltip>
                    );
                } else {
                    return row[field];
                }
            }}
        />}
        {periods === undefined &&
        <TableSkeleton rowCount={12} height="60vh" minWidth="600px"
            columns={columns.map(column => column.label)} 
        />}
        <Button size="small" fullWidth startIcon={<AddIcon />} onClick={handleAdd}>
            添加时间段
        </Button>
    </>);
}

export default PeriodTable;