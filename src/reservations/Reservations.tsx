import { useParams } from "react-router-dom";
import ResvDetails from "./resv-detail/ResvDetails";
import ResvList from "./resv-list/ResvList";

function Reservations() {
    const { resv_id } = useParams();
    return resv_id === undefined ? <ResvList /> : <ResvDetails resv_id={resv_id} />;
}

export default Reservations;