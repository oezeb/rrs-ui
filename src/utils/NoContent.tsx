import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
const EmptyBox = require('assets/noun-empty-box-2962127.png');

interface NoContentProps {
    height?: string;
    text?: string;
}

const NoContent = ({ height, text}: NoContentProps) => {
    return (
        <Box 
            height={height??'100vh'}
            display="flex" alignItems="center" justifyContent="center"
            flexDirection="column"
        >
            <img src={EmptyBox} alt="empty box" style={{ width: '50%' }} />
            <Typography variant="h6" component="h2" color="textSecondary" style={{ marginTop: '1em' }}>
                {text ?? '暂时无内容'}
            </Typography>
        </Box>
    );
}

export default NoContent;