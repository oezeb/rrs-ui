import { Route } from "react-router-dom";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

import AddReservation from "./reservations/AddReservation";
import EditReservation from "./reservations/EditReservation";
import Reservations from "./reservations/Reservations";
import EditPrivacy from "./reservations/privacy/EditPrivacy";
import ResvPrivacy from "./reservations/privacy/Privacy";
import EditStatus from "./reservations/status/EditStatus";
import ResvStatus from "./reservations/status/Status";

import AddUser from "./users/AddUser";
import EditUser from "./users/EditUser";
import Users from "./users/Users";
import EditUserRole from "./users/roles/EditRole";
import UserRoles from "./users/roles/Roles";

import AddRoom from "./rooms/AddRoom";
import EditRoom from "./rooms/EditRoom";
import Rooms from "./rooms/Rooms";
import EditRoomStatus from "./rooms/status/EditStatus";
import RoomStatus from "./rooms/status/Status";
import AddRoomType from "./rooms/types/AddType";
import EditRoomType from "./rooms/types/EditType";
import RoomTypes from "./rooms/types/Types";

import AddSession from "./sessions/AddSession";
import EditSession from "./sessions/EditSession";
import Sessions from "./sessions/Sessions";

import AddNotice from "./notices/AddNotice";
import EditNotice from "./notices/EditNotice";
import Notices from "./notices/Notices";

import Periods from "./periods/Periods";
import Settings from "./settings/Settings";

import { paths } from "utils/api";

export const routes = [
    <Route path="reservations" element={<Reservations />} />,
    <Route path="reservations/add" element={<AddReservation />} />,
    <Route path="reservations/edit" element={<EditReservation />} />,
    <Route path="reservations/privacy" element={<ResvPrivacy />} />,
    <Route path="reservations/privacy/edit" element={<EditPrivacy />} />,
    <Route path="reservations/status" element={<ResvStatus />} />,
    <Route path="reservations/status/edit" element={<EditStatus />} />,
    
    <Route path="users" element={<Users />} />,
    <Route path="users/edit" element={<EditUser />} />,
    <Route path="users/add" element={<AddUser />} />,
    <Route path="users/roles" element={<UserRoles />} />,
    <Route path="users/roles/edit" element={<EditUserRole />} />,

    <Route path="rooms" element={<Rooms />} />,
    <Route path="rooms/add" element={<AddRoom />} />,
    <Route path="rooms/edit" element={<EditRoom />} />,
    <Route path="rooms/status" element={<RoomStatus />} />,
    <Route path="rooms/status/edit" element={<EditRoomStatus />} />,
    <Route path="rooms/types" element={<RoomTypes />} />,
    <Route path="rooms/types/add" element={<AddRoomType />} />,
    <Route path="rooms/types/edit" element={<EditRoomType />} />,

    <Route path="sessions" element={<Sessions />} />,
    <Route path="sessions/add" element={<AddSession />} />,
    <Route path="sessions/edit" element={<EditSession />} />,

    <Route path="notices" element={<Notices />} />,
    <Route path="notices/add" element={<AddNotice />} />,
    <Route path="notices/edit" element={<EditNotice />} />,

    <Route path="periods" element={<Periods />} />,
    <Route path="settings" element={<Settings />} />,

    <Route path="api-docs" element={<SwaggerUI url={paths.docs} />} />
];

export default routes;
