import React from "react";
import trainMainImg  from "../../assets/TrainImages/HeroTrain.jpg"

const TrainHero = ()=>{
    return(
        <div className='h-full flex items-center justify-between w-full flex-col lg:flex-row bg-cover'
             style={{backgroundImage:`url(${trainMainImg})`}}
        >
        <div className='p-8 pt-28 md:p-24 md:pt-36 lg:p-36'>
            <h2 className='text-3xl md:text-5xl  font-extrabold uppercase  text-[#41A4FF]'>
                Easily Book your<br/>Train Tickets online<br/>with 
            </h2>
            <h1 className='text-3xl md:text-5xl font-extrabold uppercase text-[#DEEFFF] py-4'>
                Travely
            </h1>
            <p className='text-sm md:text-1xl  lg:max-w-[580px] md:max-w-[900px] text-justify'>Book your train tickets online with ease. From Karachi to Lahore, Islamabad to Peshawar, and beyond, we make travel simple and convenient. Your journey starts here!</p>
        </div>        
    </div> 
    )
}


export default TrainHero;