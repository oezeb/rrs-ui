import TextField from "@mui/material/TextField";
import { useNavigate } from "../../../Navigate";
import { useSnackbar } from "../../../SnackbarProvider";
import AddEditLabel, { Item } from "../AddEditLabel";

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

        fetch('/api/admin/room_types', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([data])
        }).then(res => {
            if (res.ok) {
                return res.json();
            } else {
                throw new Error("添加失败");
            }
        }).then(data => {
            showSnackbar({message: "添加成功", severity: "success", duration: 2000});
            navigate(`/admin/rooms/types/edit?type=${data['lastrowid'][0]}`);
        }).catch(err => {
            console.log(err);
            showSnackbar({message: "添加失败", severity: "error"});
        });
    };

    return (
        <AddEditLabel
            title="添加类型"
            id={<Item name="类型" value={<TextField
                name="type" type="number" variant="standard"
                InputLabelProps={{ shrink: true }}
                size="small"
                helperText="如果为空，将自动生成"
            />} />}
            handleSubmit={handleSubmit}
        />
    );
}

export default AddType;