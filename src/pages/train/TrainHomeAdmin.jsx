import React ,{useState,useEffect} from "react";
import TrainHero from "../../components/train/TrainHero";
import TrainCardAdmin from "../../components/train/TrainCardAdmin";
import TrainListheader from "../../components/train/TrainListheader";
import axios from "axios";


const TrainHomeAdmmin = () => {

    const [trains,setTrains] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getAllTrain = async () => {
            try {
                console.log("Fetching all trains...");
                const response = await axios.get("http://localhost:5000/api/train");
                console.log("Train data received:", response.data);
                setTrains(response.data);
            } catch (err) {
                console.error("Error fetching trains:", err);
                console.error("Error details:", err.response ? err.response.data : "No response data");
                console.error("Error status:", err.response ? err.response.status : "No status");
                setError(err.message);
            }
        };

        getAllTrain();
    }, []);

   /* const location = useLocation();
    const data = location.state;

    console.log("data",data);*/

    return (
        <div>
            <TrainHero />  
            
            <TrainListheader />
            <div className="md:px-24">
                <div className="flex flex-wrap flex-col md:flex-row lg:mx-16 gap-[30px]">
                    {
                        trains.map((item)=>(
                            <TrainCardAdmin
                                trainName ={item.trainName}
                                from = {item.from}
                                to = {item.to}
                                arrivalTime={item.arrivalTime}
                                depatureTime = {item.depatureTime}
                                noOfSeats = {item.noOfSeats}
                                id={item._id}
                                price={item.price}
                            />
                        ))
                    }
                    
                </div>
            </div>
        </div>
    )
}

export default TrainHomeAdmmin;