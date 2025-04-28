import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ConfirmEmail = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const confirmEmail = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:5000/confirm/${token}`);
                const data = await response.json();
                if (response.ok) {
                    setMessage("Email confirmed successfully! You will be redirected to login shortly.");
                    setIsSuccess(true);
                    setTimeout(() => navigate("/login"), 3000);
                } else {
                    setMessage(data.error || "Failed to confirm email.");
                    setIsSuccess(false);
                }
            } catch (error) {
                setMessage("An error occurred while confirming your email.");
                setIsSuccess(false);
            }
        };

        confirmEmail();
    }, [token, navigate]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">
                        Email Confirmation
                    </h1>
                    
                    <div className={`mb-6 p-4 rounded-md ${isSuccess ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                        <p className="text-center font-medium">
                            {message}
                        </p>
                    </div>

                    {!isSuccess && (
                        <button
                            onClick={() => navigate("/")}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Return to Home
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConfirmEmail;