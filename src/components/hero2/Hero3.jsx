import React from "react";

const Hero3 = () => {
  return (
    <>
      <div className="lg:px-36 md:py-5 px-5">
        <div className="container mx-auto">
          <div className="-mx-4 flex flex-wrap items-center justify-between">
            <div className="w-full px-4 lg:w-1/2 xl:w-5/12">
              <div className="mt-10 lg:mt-0">
                <span className="text-[#41A4FF] mb-2 block text-lg font-semibold">
                  Trvel with us
                </span>
                <h2 className="text-dark mb-8 text-3xl font-bold sm:text-4xl">
                  TAKE ONLY MEMORIES, LEAVE ONLY FOOTPRINTS
                </h2>
                <p className="text-body-color mb-8 text-base">
                Embark on unforgettable journeys across Pakistan with the ultimate travel companion—your one-stop app for seamless adventures! From the towering peaks of the Karakoram to the golden beaches of Gwadar, discover hidden gems, book hassle-free stays, and explore like a local. Whether you're chasing thrilling hikes, cultural escapes, or serene getaways, we make every trip effortless. Download now and let Pakistan's beauty unfold at your fingertips!
                </p>
             
              </div>
            </div>
            <div className="w-full lg:w-6/12">
              <div className="-mx-3 flex items-center sm:-mx-4">
                <div className="w-full px-3 sm:px-4 xl:w-1/2">
                  <div className="py-3 sm:py-4">
                    <img
                      src="https://pakistanhouse.net/wp-content/uploads/2022/07/ef2kn5-scaled-1200x900.jpg"
                      alt="Pakistan travel destination 1"
                      className="w-full rounded-2xl"
                    />
                  </div>
                  <div className="py-3 sm:py-4">
                    <img
                      src="https://dairysciencepark.org/wp-content/uploads/2024/06/maxresdefault-1024x576.jpg"
                      alt="Pakistan travel destination 2"
                      className="w-full rounded-2xl"
                    />
                  </div>
                </div>
                <div className="w-full px-3 sm:px-4 xl:w-1/2">
                  <div className="relative z-10 my-4">
                    <img
                      src="https://pakistantravelplaces.com/wp-content/uploads/2022/02/4.jpg"
                      alt="Pakistan travel destination 3"
                      className="w-full rounded-2xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Hero3;
