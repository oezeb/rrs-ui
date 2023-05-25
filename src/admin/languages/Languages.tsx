import * as React from "react";
import { 
    Box,  
    Typography, 
    IconButton,
    TextField,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Paper,
} from "@mui/material";
import TableSortLabel from '@mui/material/TableSortLabel';
import DoneIcon from '@mui/icons-material/Done';
import InputAdornment from '@mui/material/InputAdornment';

import { useSnackbar } from "../../SnackbarProvider";
import { getComparator } from "../../util";
import { paths as api_paths } from "../../api";
import { TableSkeleton } from "../Table";

function Languages() {
    const [languages, setLanguages] = React.useState<Record<string, any>[]|undefined>(undefined);
    const [orderBy, setOrderBy] = React.useState<string>("language_id");
    const [order, setOrder] = React.useState<"asc"|"desc">("asc");
    const [sorted, setSorted] = React.useState<Record<string, any>[]>([]);

    React.useEffect(() => {
        fetch(api_paths.admin.languages)
            .then(res => res.json())
            .then(data => {
                setLanguages(data);
            });
    }, []);

    React.useEffect(() => {
        if (languages === undefined) return;
        const comparator = getComparator(order, orderBy);
        const sorted = [...languages].sort(comparator);
        setSorted(sorted);
    }, [languages, order, orderBy]);

    const handleRequestSort = React.useCallback(
        (event: React.MouseEvent<unknown>, property: string) => {
            if (languages === undefined) return;
            const isAsc = orderBy === property && order === "asc";
            setOrder(isAsc ? "desc" : "asc");
            setOrderBy(property);
        
            const comparator = getComparator(order, orderBy);
            const sorted = [...languages].sort(comparator);
            setSorted(sorted);
        },
        [order, orderBy, languages],
    );

    const SortHeadCell = (props: {field: string, label: string}) => {
        return (
            <TableCell sortDirection={orderBy === props.field ? order : false}>
                <TableSortLabel
                    active={orderBy === props.field}
                    direction={orderBy === props.field ? order : "asc"}
                    onClick={(e) => { handleRequestSort(e, props.field); }}
                ><Typography fontWeight="bold">
                    {props.label}
                </Typography></TableSortLabel>
            </TableCell>
        );
    };

    return (
        <Box>
            <Typography variant="h5" component="h2" gutterBottom>
                语言
            </Typography>
            {languages === undefined &&
            <Paper>
                <TableSkeleton rowCount={1} columns={['代码', '名称']} />
            </Paper>}
            {languages !== undefined &&
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <SortHeadCell field="lang_code" label="代码" />
                            <SortHeadCell field="name" label="名称" />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sorted.map((row) => <Row key={row.lang_code} row={row} />)}
                    </TableBody>
                </Table>
            </TableContainer>}
        </Box>
    );
}

const Row = ({ row }: {row: Record<string, any>}) => {
    const [name, setName] = React.useState<string>(row.name);

    const { showSnackbar } = useSnackbar();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const name = data.get(`${row.lang_code}_name`);
        fetch(api_paths.admin.languages + `/${row.lang_code}`, {
            method: "PATCH",
            body: JSON.stringify({name}),
            headers: { "Content-Type": "application/json" },
        }).then(res => {
            if (res.ok) {
                row.name = name;
                showSnackbar({message: "保存成功", severity: "success", duration: 2000});
            } else {
                throw new Error();
            }
        }).catch(err => {
            showSnackbar({message: "保存失败", severity: "error"});
        });
    };

    return (
        <TableRow>
            <TableCell>{row.lang_code}</TableCell>
            <TableCell>
                <Box component="form" onSubmit={handleSubmit}>
                    <TextField variant="standard" fullWidth
                        name={`${row.lang_code}_name`}
                        value={name} 
                        onChange={(e) => { setName(e.target.value); }}
                        InputProps={{
                            endAdornment:
                                <InputAdornment position="end">
                                    <Tooltip title="保存">
                                        <IconButton size="small" type="submit"
                                            disabled={name === row.name}
                                        >
                                            <DoneIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </InputAdornment>
                        }}
                    />
                </Box>
            </TableCell>
        </TableRow>
    );
};


export default Languages;