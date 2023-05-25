// import * as React from "react";
// import { useSearchParams } from "react-router-dom";

// import { paths as api_paths } from "../../api";
// import { Box, Button, List, ListItem, TextField, Typography } from "@mui/material";
// import { useSnackbar } from "../../SnackbarProvider";

// function EditLang() {
//     const [lang, setLang] = React.useState<Record<string, any>|null>(null);
//     const [searchParams] = useSearchParams();
//     const {showSnackbar} = useSnackbar();

//     let id = searchParams.get('lang_code');

//     React.useEffect(() => {
//         fetch(api_paths.admin.languages + `?lang_code=${id}`)
//             .then(res => res.json())
//             .then(res => {
//                 setLang(res[0]);
//             });
//     }, [id]);

//     const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
//         event.preventDefault();
//         if (lang === null) return;

//         let data = new FormData(event.currentTarget);
//         let name = (data.get('name') as string).trim();

//         if (name === "") {
//             showSnackbar({ message: "语言名称不能为空", severity: "error" });
//             return;
//         }
//         if (name === lang.name.trim()) {
//             showSnackbar({ message: "未修改", severity: "warning" });
//             return;
//         }

//         fetch(api_paths.admin.languages + `/${id}`, {
//             method: "PATCH",
//             body: JSON.stringify({ name }),
//             headers: { "Content-Type": "application/json" },
//         })
//             .then(res => {
//                 if (res.ok) {
//                     showSnackbar({ message: "修改成功", severity: "success", duration: 1000 });
//                 } else {
//                     throw new Error("修改失败");
//                 }
//             })
//             .catch(err => {
//                 console.error(err);
//                 showSnackbar({ message: err.message, severity: "error" });
//             });            
//     };

//     return (<>{lang &&
//         <Box component="form" onSubmit={handleSubmit}>
//             <Typography variant="h5" component="h1" gutterBottom>
//                 编辑语言
//             </Typography>
//             <List sx={{ ml: 4 }} dense>
//                 <ListItem>
//                     <TextField disabled variant="standard"
//                         name="lang_code" label="语言代码" defaultValue={lang.lang_code} />
                        
//                     <TextField variant="standard" fullWidth sx={{ ml: 2 }}
//                         name="name" label="语言名称" defaultValue={lang.name} />
//                 </ListItem>
//                 <ListItem>
//                     <Button fullWidth type="submit" variant="contained" sx={{ mt: 2 }}>
//                         保存
//                     </Button>
//                 </ListItem>
//             </List>
//         </Box>
//     }</>);
// }

// export default EditLang;

export {};