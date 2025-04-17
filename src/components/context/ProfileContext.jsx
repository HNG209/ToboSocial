import React, { createContext, useContext, useEffect, useState } from 'react';

const ProfileContext = createContext({});
const UserIdContext = createContext();
const SetUserIdContext = createContext();
const setUserContext = createContext();

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error("useProfile must be used within a ProfileProvider");
    }
    return context;
}

export const useUserId = () => {
    const context = useContext(UserIdContext);
    if (!context) {
        throw new Error("useUserId must be used within a UserIdProvider");
    }
    return context;
}

export const useSetUserId = () => {
    const context = useContext(SetUserIdContext);
    if (!context) {
        throw new Error("useSetUserId must be used within a SetUserIdProvider");
    }
    return context;
}

export const useSetUser = () => {
    const context = useContext(setUserContext);
    if (!context) {
        throw new Error("useSetUser must be used within a SetUserProvider");
    }
    return context;
}

export default function ProfileProvider({ children }) {
    //set user id to local storage, will replace with actual logic
    localStorage.setItem("userId", "1"); // Example userId, replace with actual logic

    //getting user data from local storage
    const userData = localStorage.getItem("userId");

    const [userId, setUserId] = useState(userData); // Example userId, replace with actual logic
    const [user, setUser] = useState({}); // Example user data, replace with actual logic

    useEffect(() => {
        fetch(`https://67da34cd35c87309f52b67a2.mockapi.io/user/${userId}`)
            .then((response) => response.json())
            .then((data) => {
                setUser(data);
            })
            .catch((error) => {
                console.error("Error fetching user data:", error);
            });
    }, [userId]);

    const updateUser = (newUserData) => {
        async function updateUser() {
            try {
                const response = await fetch(`https://67da34cd35c87309f52b67a2.mockapi.io/user/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newUserData),
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setUser(data);
                console.log("User updated successfully:", data);
            } catch (error) {
                console.error("Error updating user:", error);
            }
        }
        updateUser();
    }

    return (
        <ProfileContext.Provider value={user}>
            <UserIdContext.Provider value={userId}>
                <SetUserIdContext.Provider value={setUserId}>
                    <setUserContext.Provider value={updateUser}>
                        {children}
                    </setUserContext.Provider>
                </SetUserIdContext.Provider>
            </UserIdContext.Provider>
        </ProfileContext.Provider>
    )
}