import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
    const [user, setUser] = useState(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (!user) {
            axios.get('/user/profile').then(({ data }) => {
                setUser(data);
                setReady(true);
            }).catch(() => {
                setReady(true);
            });
        }
    }, []);

    const isLandlord = user?.role === 'landlord';

    return (
        <UserContext.Provider value={{ user, setUser, ready, isLandlord }}>
            {children}
        </UserContext.Provider>
    );
}
