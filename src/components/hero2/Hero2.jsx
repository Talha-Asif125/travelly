import React, { useState } from "react";

const Hero2 = () => {
  const [isScrolling, setIsScrolling] = useState(false);

  const easeInOutCubic = (t) => {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  };

  const smoothScrollTo = (element, duration = 1200) => {
    const targetPosition = element.offsetTop - 80; // 80px offset from top
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    const animation = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const ease = easeInOutCubic(progress);
      
      window.scrollTo(0, startPosition + distance * ease);
      
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      } else {
        setIsScrolling(false);
      }
    };

    requestAnimationFrame(animation);
  };

  const scrollToServices = () => {
    const servicesSection = document.getElementById('services-section');
    if (servicesSection && !isScrolling) {
      setIsScrolling(true);
      
      // Add a gentle bounce effect to the button
      const button = document.querySelector('.get-started-btn');
      if (button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
          button.style.transform = 'scale(1)';
        }, 150);
      }
      
      // Start smooth scroll after button animation
      setTimeout(() => {
        smoothScrollTo(servicesSection);
      }, 200);
    }
  };

  return (
    <>
      <div class="md:px-36 px-8 md:py-28 py-5">
        <div class="flex lg:flex-row flex-col grid-cols-2 gap-10">
          <div class="flex flex-col gap-5 justify-center p-5">
            <h1 class="text-4xl md:text-5xl font-bold">Explore</h1>
            <h1 class="text-4xl md:text-5xl font-bold">the Wonders in</h1>
            <h1 class="text-4xl md:text-6xl font-bold text-[#41A4FF]">
              Pakistan
            </h1>
            <p class="mt-4">
            From the majestic mountains of the north to the vibrant streets of Karachi, discover Pakistan like never before.
            </p>
            <button 
              onClick={scrollToServices}
              disabled={isScrolling}
              className={`get-started-btn bg-black text-white px-6 py-4 rounded-lg font-semibold text-lg mt-4 transition-all duration-300 ease-in-out transform shadow-lg ${
                isScrolling 
                  ? 'opacity-75 cursor-not-allowed' 
                  : 'hover:bg-white hover:text-black hover:border-2 hover:border-black hover:scale-105 hover:shadow-xl active:scale-95'
              }`}
            >
              {isScrolling ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>Scrolling...</span>
                </div>
              ) : (
                'Get Started ✨'
              )}
            </button>
          </div>
          <div class="">
            <img
              src="https://cdn-blog.zameen.com/blog/wp-content/uploads/2021/03/1440x625-6.jpg"
              alt="heroimg"
              class="rounded-3xl h-[100%] w-full object-cover"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Hero2;
