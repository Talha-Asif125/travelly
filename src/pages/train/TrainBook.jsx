import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axios";

const TrainBook = () => {
    const [train, setTrain] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTrain = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/train/get/${id}`);
                setTrain(response.data);
                console.log("Train data fetched:", response.data);
                setLoading(false);
            } catch (err) {
                setError(err.message || "Error fetching train data");
                setLoading(false);
                console.error("Error fetching train:", err);
            }
        };

        fetchTrain();
    }, [id]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">Error: {error}</div>;
    }

    if (!train) {
        return <div className="text-center p-8">No train found</div>;
    }

    const handleBook = () => {
        // Save relevant train details to localStorage
        console.log("Saving train data to localStorage:", train);
        localStorage.setItem('trainID', train._id);
        localStorage.setItem('trainName', train.trainName);
        localStorage.setItem('price', train.price);
        
        // Navigate to passenger details page
        console.log("Navigating to passenger details page");
        navigate(`/trainpassenger/${train._id}`);
    };

    return (
        <div className="container mx-auto p-4">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-4">{train.trainName}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <p className="text-gray-600"><strong>From:</strong> {train.from}</p>
                        <p className="text-gray-600"><strong>To:</strong> {train.to}</p>
                        <p className="text-gray-600"><strong>Departure:</strong> {train.departureTime}</p>
                        <p className="text-gray-600"><strong>Arrival:</strong> {train.arrivalTime}</p>
                    </div>
                    <div>
                        <p className="text-gray-600"><strong>Date:</strong> {train.date}</p>
                        <p className="text-gray-600"><strong>Price:</strong> ${train.price}</p>
                        <p className="text-gray-600"><strong>Seats Available:</strong> {train.noOfSeats}</p>
                        <p className="text-gray-600"><strong>Class:</strong> {train.classType}</p>
                    </div>
                </div>
                <button 
                    onClick={handleBook}
                    className="bg-[#41A4FF] text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200 w-full"
                >
                    Continue to Passenger Details
                </button>
            </div>
        </div>
    );
};

export default TrainBook;
