import { useEffect, useState } from "react";
import { 
    Box, 
    TextField,
    Typography,
    ListItemText,
} from "@mui/material";
import { Button } from "@mui/material";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import dayjs, { Dayjs } from "dayjs";
import 'dayjs/locale/zh-cn'
import { MaxDailyDialog } from "./new/NewResv";

dayjs.locale('zh-cn');

function Advanced() {
    return (
        <Box component="form" >
            <ListItemText secondary={<MaxDailyDialog />}>
                <Typography variant="h5" component="h2" gutterBottom>
                    高级预约选项
                </Typography>
            </ListItemText>
        </Box>
    );
}

export default Advanced;