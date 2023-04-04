import { useState, useEffect } from "react";
import { RoomsByTypeView } from "./RoomsView";
import Template from "./templates/Main";
import { Dict, User } from "./types";

export interface HomeProps {
    strings: Dict;
    links: Dict;
}

export default function Home(props: HomeProps) {
    const [user, setUser] = useState<User | undefined>(undefined);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            fetch("/api/auth", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            })
                .then((res) => res.json())
                .then((data) => {
                    const username = data["username"];
                    fetch(`/api/users?username=${username}`, {
                        headers: {
                            "Authorization": `Bearer ${token}`,
                        },
                    })
                        .then((res) => res.json())
                        .then((data) => {
                            const user = data[0];
                            setUser(user);
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, []);
    
    return (
        <Template
            mainView={<RoomsByTypeView />}
            user={user}
            setUser={setUser}

            strings={props.strings}
            links={props.links}
        />
    );
}