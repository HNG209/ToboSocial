import { Link } from "react-router-dom";

export default function ChangePassword() {
    return(
        <>
            <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
                <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                    <h2 className="text-2xl font-bold text-center mb-4">Change Password</h2>
                    <form>
                        <div className="mb-4">
                            <label htmlFor="old-password" className="block text-sm font-medium text-gray-700">Old Password</label>
                            <input type="password" id="old-password" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2" required />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">New Password</label>
                            <input type="password" id="new-password" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2" required />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                            <input type="password" id="confirm-password" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2" required />
                        </div>
                        
                        <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Change Password</button>
                        <div className="mt-4 text-center">
                            <Link to="/profile" className="text-blue-500 hover:text-blue-700">Back to Profile</Link>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}