import React from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import { Theme, CSSObject } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LanguageIcon from '@mui/icons-material/Language';
import AppBar  from '@mui/material/AppBar';
import Drawer from '@mui/material/Drawer';
import ListItemIcon from '@mui/material/ListItemIcon';
import Tooltip from '@mui/material/Tooltip';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import InfoIcon from '@mui/icons-material/Info';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MuiDrawer from '@mui/material/Drawer';
import styled from '@mui/material/styles/styled';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

import { RoomsByTypeView } from './RoomsView';
import { User } from './types';

interface Props {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window?: () => Window;
}

const title = "会议室预约系统";
const drawerWidth = 180;

const LangMenu = () => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div>
            <Tooltip title="选择语言"
                sx={{
                    display: { xs: 'block', sm: 'none' },
                }}
            >
                <IconButton onClick={handleClick} color="inherit">
                    <LanguageIcon />
                </IconButton>
            </Tooltip>
            <Button 
                onClick={handleClick}
                color="inherit"
                startIcon={<LanguageIcon />}
                endIcon={open ? <ExpandLess /> : <ExpandMore />}
                sx={{
                    display: { xs: 'none', sm: 'flex' },
                }}
            >
                选择语言
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
            >
                <MenuItem onClick={handleClose}>中文版</MenuItem>
                <MenuItem onClick={handleClose}>English</MenuItem>
            </Menu>

        </div>
    )
}

const UserMenu = (props: { user: User }) => {
    const { user } = props;
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div>
            
            <Tooltip title="个人中心"
                sx={{
                    display: { xs: 'block', sm: 'none' },
                }}
            >
                <IconButton onClick={handleClick} color="inherit">
                    <AccountCircleOutlinedIcon />
                </IconButton>
            </Tooltip>
            <Button
                onClick={handleClick}
                color="inherit"
                startIcon={<AccountCircleOutlinedIcon />}
                endIcon={open ? <ExpandLess /> : <ExpandMore />}
                sx={{
                    display: { xs: 'none', sm: 'flex' },
                }}
            >
                {user.name}
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
            >
                <MenuItem divider
                    sx={{
                        display: { xs: 'flex', sm: 'none' },
                    }}
                >
                    <PersonIcon />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                        {user.name}
                    </Typography>
                </MenuItem>
                <MenuItem onClick={handleClose}>
                    <EventAvailableIcon />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                        预约记录
                    </Typography>
                </MenuItem>
                <MenuItem onClick={handleClose}>
                    <InfoIcon />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                        基本信息
                    </Typography>
                </MenuItem>
                <MenuItem onClick={handleClose}>
                    <LogoutIcon />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                        退出
                    </Typography>
                </MenuItem>
            </Menu>
        </div>
    );
}

const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
  });
  
  const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
      width: `calc(${theme.spacing(8)} + 1px)`,
    },
  });
  
  const CustomDrawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
      width: drawerWidth,
      flexShrink: 0,
      whiteSpace: 'nowrap',
      boxSizing: 'border-box',
      ...(open && {
        ...openedMixin(theme),
        '& .MuiDrawer-paper': openedMixin(theme),
      }),
      ...(!open && {
        ...closedMixin(theme),
        '& .MuiDrawer-paper': closedMixin(theme),
      }),
    }),
  );
  

function App(props: Props) {
    const { window } = props;
    const [open, setOpen] = React.useState(true);
    const theme = useTheme();

    const toggleDrawer = () => {
        setOpen(oldOpen => !oldOpen);
    };

    const container = window !== undefined ? () => window().document.body : undefined;

    let user: any = {
        "name": "OUEDRAOGO EZEKIEL",
        "username": "zhangsan",
        "password": "123456",
        "role": 0,
    };
    // user = null;

    const DesktopDrawerItemView = (item: { name: string, icon: React.ReactElement }) => {
        return (
            <ListItem key={item.name} disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                    sx={{
                        minHeight: 48,
                        justifyContent: open ? 'initial' : 'center',
                        px: 2.5,
                    }}
                >
                    <ListItemIcon
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            minWidth: 0,
                            mr: open ? 3 : 'auto',
                            justifyContent: 'center',
                        }}
                    >
                        {item.icon}
                        <Typography variant="caption" sx={{ display: open ? 'none' : 'block' }}>
                            {item.name}
                        </Typography>
                    </ListItemIcon>
                    <ListItemText primary={item.name} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
            </ListItem>
        );
    }

    const MobileDrawerItemView = (item: { name: string, icon: React.ReactElement }) => {
        return (
            <ListItem key={item.name} disablePadding sx={{ display: 'block' }}>
                <ListItemButton>
                    <ListItemIcon>
                        {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.name} />
                </ListItemButton>
            </ListItem>
        );
    }

    

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={toggleDrawer}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div">
                        {title}
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <LangMenu />
                    {
                        user ? (
                            <UserMenu  user={user} />
                        ) : (<>
                            <Tooltip title="登录">
                                <IconButton
                                    color="inherit"
                                    sx={{ display: { xs: 'block', sm: 'none' } }}
                                >
                                    <AccountCircleOutlinedIcon />
                                </IconButton>
                            </Tooltip>
                            <Button 
                                color="inherit" 
                                startIcon={<AccountCircleOutlinedIcon />}
                                sx={{ display: { xs: 'none', sm: 'flex' } }}
                            >
                                登录
                            </Button>
                        </>)
                    }
                </Toolbar>
            </AppBar>
            <CustomDrawer
                variant="permanent"
                open={open}
                sx={{
                    display: { xs: 'none', sm: 'block' }
                }}
            >
                <Toolbar />
                <List>
                    { user && <DesktopDrawerItemView name="预约" icon={<EventAvailableIcon />} /> }
                    <DesktopDrawerItemView name="通知" icon={<NotificationsIcon />} />
                    <DesktopDrawerItemView name="关于" icon={<InfoIcon />} />
                </List>
            </CustomDrawer>
            <Drawer
                container={container}
                variant="temporary"
                open={useMediaQuery(theme.breakpoints.up('sm')) ? false : open}
                onClose={toggleDrawer}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile.
                }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
                >
                <Toolbar />
                <List>
                    { user && <MobileDrawerItemView name="预约" icon={<EventAvailableIcon />} /> }
                    <MobileDrawerItemView name="通知" icon={<NotificationsIcon />} />
                    <MobileDrawerItemView name="关于" icon={<InfoIcon />} />
                </List>
            </Drawer>
            <Box 
                component="main"
                sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                <RoomsByTypeView />
            </Box>
        </Box>
    );
}

export default App;

// interface Period {
//   period_id: number;
//   start_time: dayjs.Dayjs;
//   end_time: dayjs.Dayjs;
// }

// interface Reservation {
//   resv_id: number;
//   username: string;
//   slot_id: number;
//   name: string;
//   title: string;
//   status: number;
//   start_time: dayjs.Dayjs;
//   end_time: dayjs.Dayjs;
// }

// interface Room {
//   room_id: number;
//   status: number;
//   name: string;
//   seating_capacity: number;
//   open_time: dayjs.Dayjs;
//   close_time: dayjs.Dayjs;
// }

// const Views = ({data, start, end, color}
//   : {data: (Period | Reservation)[], start: dayjs.Dayjs, end: dayjs.Dayjs, color: string}) => {
//   const totalDuration = end.diff(start, 'second');
//   console.log("Total Duration: ", totalDuration, " seconds");
//   const views: JSX.Element[] = [];
//   const view = (key:any, start:dayjs.Dayjs, end:dayjs.Dayjs, bgcolor=false) => {
//     return (
//       <Box
//         key={key}
//         height={`${100 * end.diff(start, 'second') / totalDuration}%`}
//         borderBottom="1px dotted rgba(0,0,0,.1)"
//         bgcolor={bgcolor? color : undefined }
//       />
//     );
//   };

//   data.forEach((item, i) => {
//     if (i <= 0 && start.isBefore(item.start_time)) {
//       views.push(view(data.length + i, start, item.start_time, true))
//     }

//     if (i > 0 && data[i - 1].end_time.isBefore(item.start_time)) {
//       views.push(view(data.length + i, data[i - 1].end_time, item.start_time, true))
//     }

//     let key = 'period_id' in item? item.period_id : item.resv_id;
//     views.push(view(key, item.start_time, item.end_time, false));

//     if (i >= data.length - 1 && item.end_time.isBefore(end)) {
//       views.push(view(2*data.length + i, item.end_time, end, true))
//     }
//   });

//   return (
//     <Box
//       height={140}
//     >{views}</Box>
//   );
// }

// const PeriodsView = ({periods, start, end}
//   : {periods: Period[], start: dayjs.Dayjs, end: dayjs.Dayjs}) => {
//     return (
//       <Views data={periods} start={start} end={end} color="rgba(0,0,0,.03)" />
//     );
// }

// const ReservationsView = ({reservations, start, end}
//   : {reservations: Reservation[], start: dayjs.Dayjs, end: dayjs.Dayjs}) => {
//   return (
//     <Views data={reservations} start={start} end={end} color="#ebfde0" />
//   );
// }


// function ReservationsView({periods, reservations, breakTime}
//   : {periods: Period[], reservations: Reservation[], breakTime: number}) {
//   // const res = calculateDuration(periods, reservations, breakTime);
//   return (
//     <div
//       style={{
//         position: 'relative',
//       }}
//     >
//       <ul 
//         style={{
//           height: '200px',
//           width: '100%',
//           borderTop: '1px dotted rgba(0,0,0,.1)',
//           padding: '0',
//           margin: '0',
//         }}
//       >
//         {reservations.map((reservation) => {
//           var duration = reservation.end_time.diff(reservation.start_time, 'second');
//             var height = `${100 * resReservation.duration / res.totalDuration}%`;
//             return (
//               <li 
//                 key={resReservation.reservation.id}
//                 style={{
//                   listStyle: 'none',
//                   height: `calc(${height} - 1px)`,
//                   borderBottom: '1px dotted rgba(0,0,0,.1)',
//                   backgroundColor: 'id' in resReservation.reservation ? 'rgba(0,0,0,0)' : '#ebfde0',
//                 }}
//               >
//                 <span
//                   style={{
//                     display: 'block',
//                     textAlign: 'center',
//                     overflow: 'hidden',
//                     fontSize: '12px',
//                     opacity: '.9',
//                   }}
//                 >
//                 {'id' in resReservation.reservation ? '' : resReservation.reservation.title}
//                 </span>
//               </li>
//         )})}
//       </ul>
//       <ul 
//         style={{
//           height: '200px',
//           width: '100%',
//           borderTop: '1px dotted rgba(0,0,0,.1)',
//           padding: '0',
//           margin: '0',
//           position: 'absolute',
//           top: '0',
//           left: '0',
//         }}
//       >
//         {res.resPeriods.map((resPeriod) => {
//             var height = `${100 * resPeriod.duration / res.totalDuration}%`;
//             return (
//               <li 
//                 key={resPeriod.period.id}
//                 style={{
//                   listStyle: 'none',
//                   height: `calc(${height} - 1px)`,
//                   borderBottom: '1px dotted rgba(0,0,0,.1)',
//                   backgroundColor: 'id' in resPeriod.period ? 'rgba(0,0,0,.03)' : undefined,
//                 }}
//               >
//               </li>
//         )})}
//       </ul>
//     </div>
//   );
// }

// function RoomView({room}
//   : {room: Room}) {
//   const [periods, setPeriods] = useState<Period[]>([]);
//   const [reservations, setReservations] = useState<Reservation[]>([]);
//   let start = null, end = null;

//   useEffect(() => {
//     fetch_periods()
//       .then(periods => {
//         setPeriods(periods.map((period: TimeRange) => {
//           return {
//             period_id: period.id,
//             start_time: period.start_time,
//             end_time: period.end_time,
//           }
//         }));
//       })
//       .catch(err => console.error(err));

//     fetch(`/api/public/reservations?room_id=${room.room_id}`)
//       .then(res => res.json())
//       .then(data => {
//         const reservations = data.map((reservation: any) => {
//           return {
//             ...reservation,
//             start_time: time(reservation.start_time),
//             end_time: time(reservation.end_time),
//           };
//         });
//         setReservations(reservations);
//       });
//   }, [room.room_id]);

//   if (periods.length > 0 && reservations.length > 0) {
//     if (periods[0].start_time.isBefore(reservations[0].start_time)) {
//       start = periods[0].start_time;
//     }
//     else {
//       start = reservations[0].start_time;
//     }
//     if (periods[periods.length - 1].end_time.isAfter(reservations[reservations.length - 1].end_time)) {
//       end = periods[periods.length - 1].end_time;
//     }
//     else {
//       end = reservations[reservations.length - 1].end_time;
//     }
//   }

//   return (
//     <Box
//       width='140px'
//       border='1px solid #ccc'
//       boxShadow='0 0 4px rgba(0,0,0,.1)'
//       margin='3px'
//     >
//       <h6
//         style={{
//           fontSize: '.8em',
//           textAlign: 'center',
//           padding: '0.2em',
//           color: '#1669b8',
//           borderBottom: '1px solid #ccc',
//           margin: '0',
//         }}
//       >{room.name}</h6>
//       <div
//         style={{
//           display: 'flex',
//           fontSize: '.7em',
//           background: '#f8f8f8',
//           justifyContent: 'center',
//           color: '#999',
//           padding: '0 0.2em',
//           margin: '0',
//         }}
//       >
//         <span><EventSeatIcon fontSize='inherit'/>{room.seating_capacity}</span>
//       </div>
//       <div>
//         <Box>
//           {start && end && <PeriodsView periods={periods} start={start} end={end}/>
//           && <ReservationsView reservations={reservations} start={start} end={end}/>}
//         </Box>
//       </div>
//     </Box>
//   );
// }

// function App() {
//   const [rooms, setRooms] = useState<Room[]>([]);

//   useEffect(() => {
//     fetch('/api/rooms')
//       .then(res => res.json())
//       .then(data => {
//         const rooms = data.map((room: any) => {
//           return {
//             ...room,
//             open_time: time(room.open_time),
//             close_time: time(room.close_time),
//           };
//         });
//         setRooms(rooms);
//       })
//       .catch(err => console.error(err));
//   }, []);

//   return (
//     <Box
//       display='flex'
//       flexWrap='wrap'
//     >
//       {rooms.map((room: Room) => (
//         <RoomView key={room.room_id} room={room} />
//       ))}
//     </Box>
//   );
// }

// function App() {
//   const [periods, setPeriods] = useState<Period[]>([]);

//   return (
//     <span>Hello</span>
//     );
// }

// export default App;
