import { use, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getCurrentUser, updateUser } from "../redux/profile/profileSlice";

export default function ChangePassword() {
    const dispatch = useDispatch();

    const currentUser = useSelector((state) => state.profile.user);

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        dispatch(getCurrentUser({}));
    }, [dispatch]);

    console.log("Current User:", currentUser);

    const handleOldPasswordChange = (e) => {
        setOldPassword(e.target.value);
    }

    const handleNewPasswordChange = (e) => {
        setNewPassword(e.target.value);
    }

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        //check if old password is correct
        if (oldPassword !== currentUser.password) {
            //add validation to input field
            //show error message
            //add red border to input field
            document.getElementById("old-password").classList.add("border-red-500");
            document.getElementById("old-password").classList.remove("border-gray-300");
            document.getElementById("old-password").classList.add("focus:border-red-500");
            document.getElementById("old-password").classList.add("focus:ring-red-500");
            document.getElementById("old-password").classList.remove("focus:ring-blue-500");
            document.getElementById("old-password").classList.remove("focus:ring-gray-500");
            document.getElementById("old-password").classList.remove("focus:ring-red-500");

            return;
        }
        //check if new password and confirm password are the same and new password must be different from old password
        if (newPassword !== confirmPassword || newPassword === oldPassword) {
            //add validation to input field
            //show error message
            //add red border to input field
            document.getElementById("new-password").classList.add("border-red-500");
            document.getElementById("new-password").classList.remove("border-gray-300");
            document.getElementById("new-password").classList.add("focus:border-red-500");
            document.getElementById("new-password").classList.add("focus:ring-red-500");
            document.getElementById("new-password").classList.remove("focus:ring-blue-500");

            return;
        }

        //check if new password is strong enough
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/; // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        if (!passwordRegex.test(newPassword)) {
            alert("New password must be at least 8 characters long, contain at least 1 uppercase letter, 1 lowercase letter and 1 number!");
            return;
        }

        await dispatch(updateUser({
            _id: currentUser._id,
            password: newPassword,
        })); // Dispatch the update action

        await dispatch(getCurrentUser({})); // Fetch the updated user data
    }

    return (
        <>
            <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
                <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                    <h2 className="text-2xl font-bold text-center mb-4">Change Password</h2>
                    <form>
                        <div className="mb-4">
                            <label htmlFor="old-password" className="block text-sm font-medium text-gray-700">Old Password</label>
                            <input onChange={handleOldPasswordChange} type="password" id="old-password" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2" required />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">New Password</label>
                            <input onChange={handleNewPasswordChange} type="password" id="new-password" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2" required />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                            <input onChange={handleConfirmPasswordChange} type="password" id="confirm-password" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2" required />
                        </div>

                        <button onClick={handleSubmit} type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Change Password</button>
                        <div className="mt-4 text-center">
                            <Link to="/profile" className="text-blue-500 hover:text-blue-700">Back to Profile</Link>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}