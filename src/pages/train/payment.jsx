import React, { useState, useEffect } from 'react'
import { FaLock } from 'react-icons/fa'

const Payment = ({ price, noOfTickets }) => {
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (price && noOfTickets) {
      setTotalPrice(price * noOfTickets);
    } else {
      setTotalPrice(price || 0);
    }
  }, [price, noOfTickets]);

  return (
    <div className='lg:p-12 p-6 bg-white rounded-lg shadow-sm mt-8'>
      <h1 className='lg:text-2xl text-2xl font-bold border-b pb-4'>Payment Details</h1>
      
      <div className='p-4'>
        <h1 className='font-semibold text-[#565656] lg:text-lg'>Card Number</h1>
        <p className='text-[#929292] text-sm pt-2'>Enter the 16 digit card number on the card</p>
        <input 
          type='text' 
          placeholder='2412 7654 1234 0987' 
          className='border rounded-md p-2 w-full mt-2 text-center'
          maxLength={19}
        />

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div>
            <h1 className='font-semibold text-[#565656] lg:text-lg'>CVV</h1>
            <p className='text-[#929292] text-sm pt-2'>Enter the 3 or 4 digit number</p>      
            <input 
              type='text' 
              placeholder='241' 
              className='border rounded-md p-2 w-[80px] mt-2 text-center'
              maxLength={4}
            />
          </div>
          
          <div>
            <h1 className='font-semibold text-[#565656] lg:text-lg'>Expiry Date</h1>
            <p className='text-[#929292] text-sm pt-2'>Enter expiry date</p>
            <div className='flex'>
              <input 
                type='text' 
                placeholder='MM' 
                className='border rounded-md p-2 w-[50px] mt-2 text-center'
                maxLength={2}
              />
              <span className="flex items-center mx-2 mt-2">/</span>
              <input 
                type='text' 
                placeholder='YY' 
                className='border rounded-md p-2 w-[50px] mt-2 text-center'
                maxLength={2}
              />
            </div>
          </div>
        </div>
      </div>

      <div className='mt-8 border-t pt-6'>
        <div className='bg-[#f8f8f8] rounded-lg p-6'>
          <h1 className='font-semibold pb-4 border-b'>Summary</h1>
          
          <div className='flex justify-between py-3'>
            <p>Price per ticket</p>
            <p>${price}</p>
          </div>
          
          {noOfTickets && (
            <div className='flex justify-between py-2'>
              <p>Number of tickets</p>
              <p>{noOfTickets}</p>
            </div>
          )}
          
          <div className='flex justify-between py-3 font-bold border-t mt-2 pt-4'>
            <p>Total</p>
            <p>${totalPrice}</p>
          </div>
        </div>
        
        <div className='flex items-center pt-4 justify-center'>
          <FaLock className='text-[#b4b4b4]'/>
          <h1 className='text-[#b4b4b4] font-extralight pl-2'>Payments are secured and encrypted.</h1>
        </div>
      </div>
    </div>
  )
}

export default Payment