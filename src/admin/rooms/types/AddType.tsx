import { useNavigate } from "../../../Navigate";
import { useSnackbar } from "../../../SnackbarProvider";
import AddEditType from "./AddEditType";
import { paths as api_paths } from "../../../api";

function AddType() {
    const navigate = useNavigate();
    const {showSnackbar} = useSnackbar();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        let form = new FormData(e.currentTarget);

        let data: Record<string, any> = {
            label: form.get('label'),
            description: form.get('description'),
        };

        let type = form.get('type');
        if (type !== "") {
            data.type = type;
        }

        fetch(api_paths.admin.room_types, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(res => {
            if (res.ok) {
                return res.json();
            } else {
                throw new Error("添加失败");
            }
        }).then(data => {
            showSnackbar({message: "添加成功", severity: "success", duration: 2000});
            navigate(`/admin/rooms/types/edit?type=${data.type}`);
        }).catch(err => {
            console.log(err);
            showSnackbar({message: "添加失败", severity: "error"});
        });
    };

    return (
        <AddEditType
            title="添加类型"
            handleSubmit={handleSubmit}
            _type="add"
        />
    );
}

export default AddType;