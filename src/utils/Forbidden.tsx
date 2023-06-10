import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import BlockIcon from '@mui/icons-material/Block';

const Forbidden = ({ text }: { text?: string }) => (
    <Box 
        height="100vh"
        display="flex" alignItems="center" justifyContent="center"
        flexDirection="column"
    >
        <BlockIcon sx={{ fontSize: '10em' }} />
        <Typography variant="h6" component="h2" color="textSecondary" style={{ marginTop: '1em' }}>
            {text || "无权限"}
        </Typography>
    </Box>
)

export default Forbidden;