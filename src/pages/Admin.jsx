import { useContext } from "react";
import { AuthContext } from "../context/authContext";
import { Link, useNavigate } from "react-router-dom";
import backgroundImage from "../assets/images/bg.jpg";
import React, { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

const data = [
  {
    name: "Page A",
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: "Page B",
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: "Page C",
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: "Page D",
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    name: "Page E",
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: "Page F",
    uv: 2390,
    pv: 3800,
    amt: 2500,
  },
  {
    name: "Page G",
    uv: 3490,
    pv: 4300,
    amt: 2100,
  },
];

const data2 = [
  { name: "Users", value: 800 },
  { name: "Hotels", value: 300 },
  { name: "Vehicles", value: 300 },
  { name: "Tours", value: 200 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// Helper function for combining class names
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Admin = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
    window.location.reload();
  };

  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Admin Profile Header */}
      <div className="bg-white py-3 px-8 flex justify-between items-center shadow-sm">
        <h1 className="text-[#41A4FF] text-xl font-bold">Travel Buddy Admin</h1>
        
        <div className="flex items-center space-x-4">
          {user && (
            <>
              <span className="text-gray-700 font-medium hidden md:block">
                Welcome, {user.name ? user.name.split(' ')[0] : 'Admin'}
              </span>
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <Menu.Button className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white">
                    {user.img ? (
                      <img className="h-8 w-8 rounded-full" src={user.img} alt="User" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                      </div>
                    )}
                  </Menu.Button>
                </div>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <div className="block px-4 py-3 text-sm border-b border-gray-100">
                        <p className="text-[#41A4FF] font-medium">
                          {user?.name || "Admin User"}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          {user?.email || "admin@travely.com"}
                        </p>
                      </div>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            className={classNames(
                              active
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-700",
                              "block px-4 py-2 text-sm"
                            )}
                            to="/profile"
                          >
                            Profile
                          </Link>
                        )}
                      </Menu.Item>

                      <Menu.Item>
                        {({ active }) => (
                          <button
                            type="button"
                            onClick={handleLogout}
                            className={classNames(
                              active
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-700",
                              "block w-full px-4 py-2 text-left text-sm"
                            )}
                          >
                            Sign out
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </>
          )}
        </div>
      </div>

      <div className="md:px-20 md:pt-20 md:pb-48 p-5 pb-20">
        <h1 className="text-center text-[#41A4FF] text-3xl font-bold ">
          Traverly Admin Dashboard
        </h1>
        <h1 className="text-center text-lg pb-5">Welcome to your admin control panel</h1>

        <div className="flex flex-row col-span-3 lg:px-32 px-8 pt-8 justify-between items-stretch gap-10">
          <Link
            to="/users"
            className="p-10 flex-1 hover:bg-[#41A4FF] hover:text-2xl transition duration-300 ease-in-out hover:text-white rounded-lg font-bold shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]"
          >
            User Management
          </Link>
          <Link
            to="/hotels"
            className="p-10 flex-1 hover:bg-[#41A4FF] hover:text-2xl transition duration-300 ease-in-out hover:text-white rounded-lg font-bold shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]"
          >
            Hotel Management
          </Link>
          <Link
            to="/tours"
            className="p-10 flex-1 hover:bg-[#41A4FF] hover:text-2xl transition duration-300 ease-in-out hover:text-white rounded-lg font-bold shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]"
          >
            Tour Packages
          </Link>
        </div>

        <div className="flex flex-row col-span-3 lg:px-32 px-8 pt-8 justify-between items-stretch gap-10">
          <Link
            to="/vehicle"
            className="p-10 flex-1 hover:bg-[#41A4FF] hover:text-2xl transition duration-300 ease-in-out hover:text-white rounded-lg font-bold shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]"
          >
            Vehicle Management
          </Link>
          <Link
            to="/admin/restaurants"
            className="p-10 flex-1 hover:bg-[#41A4FF] hover:text-2xl transition duration-300 ease-in-out hover:text-white rounded-lg font-bold shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]"
          >
            Restaurant Management
          </Link>
          <Link
            to="/event-management"
            className="p-10 flex-1 hover:bg-[#41A4FF] hover:text-2xl transition duration-300 ease-in-out hover:text-white rounded-lg font-bold shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]"
          >
            Event Management
          </Link>
        </div>

        <div className="flex flex-row col-span-3 lg:px-32 px-8 pt-8 justify-between items-stretch gap-10">
          <Link
            to="/reservations"
            className="p-10 flex-1 hover:bg-[#41A4FF] hover:text-2xl transition duration-300 ease-in-out hover:text-white rounded-lg font-bold shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]"
          >
            Reservation Management
          </Link>
          <div className="p-10 flex-1"></div>
          <div className="p-10 flex-1"></div>
        </div>
        <div className="flex flex-row col-span-2 lg:px-32 px-8 pt-8 justify-between items-stretch gap-10">
          <div className="p-10 flex-1  rounded-lg font-bold shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                width={500}
                height={300}
                data={data}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pv" fill="#8884d8" />
                <Bar dataKey="uv" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="p-10 flex-1 rounded-lg font-bold shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]">
            <div className="w-full">
              <PieChart width={400} height={400}>
                <Pie
                  data={data2}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </div>
            <div className="grid grid-cols-4">
              {data2.map((item, index) => (
                <p key={index} className="cursor-pointer font-bold">
                  {item.name}
                </p>
              ))}
            </div>
            <div className="grid grid-cols-4">
              {COLORS.map((item, index) => (
                <div
                  key={index}
                  className="h-[30px] w-[30px]"
                  style={{ backgroundColor: item }}
                >
                  {item.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Admin Navigation Cards */}
        <div className="py-8 px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Service Provider Requests */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Provider Requests</h3>
                  <p className="text-gray-600 text-sm mt-1">Manage service provider applications</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <Link
                to="/admin-dashboard"
                className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                View Requests
              </Link>
            </div>



            {/* Contact Messages */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Contact Messages</h3>
                  <p className="text-gray-600 text-sm mt-1">Manage customer inquiries</p>
                </div>
                <div className="bg-indigo-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <Link
                to="/contact-messages"
                className="mt-4 inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                View Messages
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
