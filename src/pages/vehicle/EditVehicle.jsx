import React, {useState, useEffect} from 'react'

import Swal from 'sweetalert2'
import axios from 'axios';
import {useLocation, useNavigate, useParams} from 'react-router-dom';




const EditVehicle = () => {


  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  

    const [loading, setLoading] = useState(!state);
    const [price, setPrice] = useState(state?.price || '');
    const [location, setLocation] = useState(state?.location || '');
    const [description, setDescription] = useState(state?.description || '');
    const [vehicleData, setVehicleData] = useState(state || null);

    useEffect(() => {
      // If state is null, fetch vehicle data
      if (!state && id) {
        setLoading(true);
        console.log("State is null, fetching vehicle data for ID:", id);
        
        axios.get(`http://localhost:5000/api/vehicle/${id}`)
          .then(response => {
            console.log("Vehicle data fetched:", response.data);
            setVehicleData(response.data);
            setPrice(response.data.price);
            setLocation(response.data.location);
            setDescription(response.data.description);
            setLoading(false);
          })
          .catch(err => {
            console.error("Error fetching vehicle data:", err);
            console.error("Error details:", err.response ? err.response.data : "No response data");
            console.error("Error status:", err.response ? err.response.status : "No status");
            setLoading(false);
            
            Swal.fire({
              icon: 'error',
              title: 'Error Loading Vehicle',
              text: `Could not load vehicle data: ${err.message}`,
              footer: err.response ? JSON.stringify(err.response.data) : "No server response"
            });
          });
      }
    }, [state, id]);

    function sendData(e){
        e.preventDefault();

        // Use either the state's _id or the id from params
        const vehicleId = (state?._id || id);
        
        if (!vehicleId) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Could not determine vehicle ID'
          });
          return;
        }

        const updateVehicle = {price, location, description}
        console.log("Updating vehicle with ID:", vehicleId, "with data:", updateVehicle);

      axios
      .patch(`http://localhost:5000/api/vehicle/${vehicleId}`, updateVehicle) 
      .then((response) => {
        console.log("Update response:", response);
        Swal.fire({
          icon: 'success',
          title: 'Your Vehicle updated Successfully',
          showConfirmButton: false,
          timer: 2000
        }) 
        navigate('/vehicle')
      })
      .catch((err) => {
        console.error("Error updating vehicle:", err);
        console.error("Error details:", err.response ? err.response.data : "No response data");
        console.error("Error status:", err.response ? err.response.status : "No status");
        
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: `Error: ${err.message}`,
            footer: err.response ? JSON.stringify(err.response.data) : "No server response"
        });
      });
    }

    if (loading) {
      return <div className="flex justify-center items-center h-screen">Loading vehicle data...</div>;
    }

  return (
    <div>
        <form className='p-4 text-[#383838]  justify-center lg:px-96' onSubmit={sendData}>
        <h1 className='text-lg lg:text-2xl font-bold py-6  text-center'>Edit Vehicle</h1>
            
            <label for className='lg:text-lg text-left'>Price</label>
            <input type='number' className='border rounded-lg w-full p-2 mb-6 mt-2' value={price} placeholder='8000' required onChange={(e) => setPrice(e.target.value) } />

            
            <label for className='lg:text-lg text-left'>Location</label>
            <input type='text' className='border rounded-lg w-full p-2 mb-6 mt-2' value={location} placeholder='Islamabad' required onChange={(e) => setLocation(e.target.value) }/>

            <label for className='lg:text-lg text-left'>Description</label>
            <textarea rows = '4' className='border rounded-lg w-full p-2 mb-6 mt-2' value={description} placeholder='Add your description here' required onChange={(e) => setDescription(e.target.value) }/>

            <div className='flex flex-col lg:flex-row items-center justify-between lg:my-6'>
          <button className="bg-[#41A4FF] text-white rounded-md font-bold p-3 my-5 lg:my-0  w-full">
                Update Vehicle
              </button>
          <button className="bg-[#636363] text-white rounded-md font-bold p-3 lg:ml-6   w-full mb-12 lg:mb-0" type = 'reset'>
                Reset
              </button>
          </div>



        </form>
    </div>
  )
}

export default EditVehicle