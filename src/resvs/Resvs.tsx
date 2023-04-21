import React from "react";
import {  
    Box, useTheme, useMediaQuery,
    FormControl, InputLabel, Select, Typography, ListItem, ListItemText, 
} from "@mui/material";

import MenuItem from '@mui/material/MenuItem';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { useSearchParams } from "react-router-dom";

import ResvDetails from "./ResvDetails";
import ResvsTable from "./ResvsTable";

// 0: 待审核、1: 审核通过、2: 已取消、3: 审核未通过
export const statusColors = ["#FFC107", "#00CC66", "#A9A9A9", "#FF5733"];

function Resvs() {
    const [status, setStatus] = React.useState<Record<string, any> | null>(null);
    const [statusOptions, setStatusOptions] = React.useState<Record<string, any>[]>([]);
    const [timeFilter, setTimeFilter] = React.useState<"全部" | "当前" | "历史">("当前");
    const theme = useTheme();
    const is_mobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    const [searchParams] = useSearchParams();
    const resv_id = searchParams.get('id');

    React.useEffect(() => {
        let url = '/api/resv_status';
        fetch(url).then(res => res.json()).then(res => {
            setStatusOptions(res.sort((a: any, b: any) => a.status - b.status));
        });
    }, []);

    if (resv_id) {
        return <ResvDetails resv_id={resv_id} statusList={statusOptions} mobile={is_mobile} />;
    } else {
        return (
            <Box>
                <Typography variant="h5" component="h2" gutterBottom>
                    预约记录
                </Typography>
                {/* Filters */}
                <Filter timeFilter={timeFilter} setTimeFilter={setTimeFilter} 
                    status={status} setStatus={setStatus} 
                    statusOptions={statusOptions}
                />
                {/* Table */}
                <ResvsTable timeFilter={timeFilter}
                    status={status}
                    statusOptions={statusOptions}
                    is_mobile={is_mobile}
                />
            </Box>
        );
    }
}

interface FilterProps {
    timeFilter: "全部" | "当前" | "历史";
    setTimeFilter: (time: "全部" | "当前" | "历史") => void;
    status: Record<string, any> | null;
    setStatus: (status: Record<string, any> | null) => void;
    statusOptions: Record<string, any>[];
}

function Filter(props: FilterProps) {
    const { timeFilter, setTimeFilter, status, setStatus, statusOptions } = props;
    return (
        <Box display="flex" flexDirection="row" flexWrap="wrap"
            justifyContent="space-between" alignItems="center">
            <Box flexGrow={1} />
            <>筛选<FilterAltIcon fontSize="small" />:</>
            <FormControl sx={{ ml: 1 }}>
                <InputLabel>时间</InputLabel>
                <Select autoWidth size="small" value={timeFilter} label="时间">
                    {["全部", "当前", "历史"].map((time: any) => (
                        <MenuItem key={time} value={time} onClick={() => setTimeFilter(time)}>
                            {time}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <FormControl sx={{ ml: 1 }}>
                <InputLabel>状态</InputLabel>
                <Select autoWidth size="small" label="状态" value={status?.label ?? "全部"}>
                    <MenuItem onClick={() => setStatus(null)} value="全部">
                        <em>全部</em>
                    </MenuItem>
                    {statusOptions.map((status) => (
                        <MenuItem key={status.status} value={status.label}
                            onClick={() => setStatus(status)}>
                            <Box display="inline" 
                                borderBottom={3} 
                                borderColor={statusColors[status.status]}
                            >
                                {status.label}
                            </Box>
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    )
}

export default Resvs;