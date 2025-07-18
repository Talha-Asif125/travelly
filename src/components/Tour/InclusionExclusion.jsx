import React from "react";
import { BsHandThumbsUpFill, BsHandThumbsDownFill } from "react-icons/bs";
import { IoCheckmarkDoneSharp } from "react-icons/io5";
import { AiOutlineCloseCircle } from "react-icons/ai";

const InclusionExclusion = ({ tourData }) => {
  // Default inclusions and exclusions if not provided in tour data
  const defaultInclusions = [
    "Professional tour guide",
    "Transportation during the tour",
    "Entrance fees to attractions",
    "Hotel accommodations (if multi-day)",
    "Breakfast (if specified)"
  ];

  const defaultExclusions = [
    "Personal expenses",
    "Meals not mentioned in inclusions",
    "Travel insurance",
    "Tips and gratuities",
    "International flights"
  ];

  // Use tour data inclusions/exclusions if available, otherwise use defaults
  const inclusions = tourData?.inclusions || defaultInclusions;
  const exclusions = tourData?.exclusions || defaultExclusions;

  return (
    <div>
      {" "}
      <div className="text-5xl  mb-11">
        <p>Inclusion and Exclusions</p>
      </div>
      {/* stepper */}
      <div>
        <ul
          className="relative m-0 w-full list-none overflow-hidden p-0 transition-[height] duration-200 ease-in-out"
          data-te-stepper-init
          data-te-stepper-type="vertical"
        >
          {/* inclusoins */}
          <li
            data-te-stepper-step-ref
            className="relative h-fit after:absolute after:left-[2.45rem] after:top-[3.6rem] after:mt-px after:h-[calc(100%-2.45rem)] after:w-px after:bg-[#e0e0e0] after:content-[''] dark:after:bg-neutral-600"
          >
            <div
              data-te-stepper-head-ref
              className="flex cursor-pointer items-center p-6 leading-[1.3rem] no-underline after:bg-[#e0e0e0] after:content-[''] hover:bg-[#f9f9f9] focus:outline-none dark:after:bg-neutral-600 dark:hover:bg-[#41A4FF]"
            >
              <span
                data-te-stepper-head-icon-ref
                className="mr-3 flex h-[1.938rem] w-[1.938rem] items-center justify-center rounded-full bg-[#ebedef] text-xl font-medium text-[#40464f]"
              >
                <BsHandThumbsUpFill className="text-green-500" />
              </span>
              <span
                data-te-stepper-head-text-ref
                className="text-neutral-500 text-2xl after:absolute after:flex after:text-[0.8rem] after:content-[data-content] dark:text-black"
              >
                <div className="flex flex-row gap-3">Inclusions</div>
              </span>
            </div>
            <div
              data-te-stepper-content-ref
              className="transition-[height, margin-bottom, padding-top, padding-bottom] text-xl left-0 overflow-hidden pb-6 ps-1 duration-300 ease-in-out pl-28 pr-28"
            >
              {inclusions.map((include, index) => (
                <div key={index} className="mb-3">
                  <div className="flex flex-row gap-4 items-center">
                    <IoCheckmarkDoneSharp className="text-3xl text-green-500 flex-shrink-0" />
                    <span>{include}</span>
                  </div>
                </div>
              ))}
            </div>
          </li>
          {/* exclusions */}
          <li
            data-te-stepper-step-ref
            className="relative h-fit after:absolute after:left-[2.45rem] after:top-[3.6rem] after:mt-px after:h-[calc(100%-2.45rem)] after:w-px after:bg-[#e0e0e0] after:content-[''] dark:after:bg-neutral-600"
          >
            <div
              data-te-stepper-head-ref
              className="flex cursor-pointer items-center p-6 leading-[1.3rem] no-underline after:bg-[#e0e0e0] after:content-[''] hover:bg-[#f9f9f9] focus:outline-none dark:after:bg-neutral-600 dark:hover:bg-[#41A4FF]"
            >
              <span
                data-te-stepper-head-icon-ref
                className="mr-3 flex h-[1.938rem] w-[1.938rem] items-center justify-center rounded-full bg-[#ebedef] text-xl font-medium text-[#40464f]"
              >
                <BsHandThumbsDownFill className="text-red-700" />
              </span>
              <span
                data-te-stepper-head-text-ref
                className="text-neutral-500 text-2xl after:absolute after:flex after:text-[0.8rem] after:content-[data-content] dark:text-black"
              >
                <div className="flex flex-row gap-3">Exclusions</div>
              </span>
            </div>
            <div
              data-te-stepper-content-ref
              className="transition-[height, margin-bottom, padding-top, padding-bottom] text-xl left-0 overflow-hidden pb-6 ps-1 duration-300 ease-in-out pl-28 pr-28"
            >
              {exclusions.map((exclude, index) => (
                <div key={index} className="mb-3">
                  <div className="flex flex-row gap-4 items-center">
                    <AiOutlineCloseCircle className="text-3xl text-red-600 flex-shrink-0" />
                    <span>{exclude}</span>
                  </div>
                </div>
              ))}
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default InclusionExclusion;
