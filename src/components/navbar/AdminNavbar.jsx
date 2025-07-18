import React, { useState } from "react";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";
import ProviderBadge from "../ui/ProviderBadge";


const inside_nav = [
  {
    path: "/admin",
    display: "Admin Dashboard",
  },
  {
    path: "/users",
    display: "Users",
  },
  {
    path: "/hotels",
    display: "Hotels",
  },
  {
    path: "/admin/restaurants",
    display: "Restaurants",
  },
  {
    path: "/tours",
    display: "Tour Packages",
  },
  {
    path: "/vehicle",
    display: "Vehicles",
  },
  {
    path: "/event-management",
    display: "Events",
  },
  {
    path: "/reservations",
    display: "Reservations",
  },
  {
    path: "/contact-messages",
    display: "Contact Messages",
  },
];

const AdminNavbar = () => {
  // eslint-disable-next-line no-unused-vars
  const { user, loading, error, logout } = useContext(AuthContext);
  const location = useLocation();

  // Add console logging to debug user information
  console.log("AdminNavbar - Current user:", user);
  console.log("AdminNavbar - User image:", user?.img);
  console.log("AdminNavbar - Current path:", location.pathname);

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
    window.location.reload();
  };

  const [nav, setNav] = useState(true);

  const handleNav = () => {
    setNav(!nav);
  };

  // Check if the current path is active
  const isActiveLink = (path) => {
    if (path === "/admin" && location.pathname === "/admin") {
      return true;
    }
    return location.pathname.startsWith(path) && path !== "/admin";
  };

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <nav className="flex justify-between lg:px-32 md:px-22 px-12 w-full py-4 bg-gray-50 sticky top-0 z-[999] shadow-sm">
      <div className="flex items-center">
        <Link to="/admin" className="text-2xl font-bold text-[#41A4FF]">
          Travel Buddy Admin
        </Link>
      </div>

      {/* Admin navigation links */}
      <div className="items-center hidden lg:flex space-x-5">
        {inside_nav.map((item, index) => (
          <Link 
            key={`admin-nav-${index}`}
            to={item.path}
            className={`${
              isActiveLink(item.path) ? "text-[#41A4FF] font-medium" : "text-gray-600"
            } hover:text-[#41A4FF] text-sm transition duration-150 ease-in-out`}
          >
            {item.display}
          </Link>
        ))}
      </div>

      {/* <!-- right header section --> */}
      <div className="items-center space-x-3 hidden md:flex">
        {user ? (
          <>
            {user.name && (
              <span className="text-gray-700 font-medium">
                Welcome, {user.name.split(' ')[0]}
              </span>
            )}
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                  {user && user.img ? (
                    <img className="h-8 w-8 rounded-full" src={user.img} alt="User" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      {user && user.name ? user.name.charAt(0).toUpperCase() : 'A'}
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
                      <div className="flex items-center justify-between">
                        <p className="text-[#41A4FF] font-medium">
                          {user?.name || "Admin User"}
                        </p>
                        <ProviderBadge user={user} size="sm" showText={false} />
                      </div>
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
                        <Link
                          className={classNames(
                            active
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-700",
                            "block px-4 py-2 text-sm"
                          )}
                          to="/settings"
                        >
                          Settings
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
        ) : (
          <>
            <Link
              to="/login"
              className="px-4 py-2 text-white bg-[#41A4FF] rounded-md"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-white bg-gray-400 rounded-md"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
      <div onClick={handleNav} className="block md:hidden">
        {nav ? (
          <AiOutlineMenu size={20} style={{ color: "black" }} />
        ) : (
          <AiOutlineClose size={20} style={{ color: "black" }} />
        )}
      </div>
      <div
        className={
          !nav
            ? "fixed left-0 top-0 w-[60%] h-full border-r border-r-gray bg-white ease-in-out duration-500 md:hidden z-[1000]"
            : "fixed left-[-100%]"
        }
      >
        <Link to="/admin" className="text-2xl font-medium text-blue-500 m-8 block pt-4">
          Travel Buddy
        </Link>
        <ul className="px-4 mt-6">
          {/* Mobile nav links */}
          {inside_nav.map((item, index) => (
            <li key={`mobile-admin-nav-${index}`} className="p-4 border-b border-gray-600">
              <Link 
                to={item.path}
                className={isActiveLink(item.path) ? "text-[#41A4FF] font-medium" : ""}
              >
                {item.display}
              </Link>
            </li>
          ))}
          
          {user ? (
            <>
              <li className="p-4 border-b border-gray-600 text-blue-600 font-semibold">
                {user?.name ? `Welcome, ${user.name}` : 'Welcome, Admin'}
              </li>
              <li className="p-4 border-b border-gray-600">
                <Link to="/profile" className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center mr-2">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                  Profile
                </Link>
              </li>
              <li className="p-4 border-b border-gray-600">
                <Link to="/settings" className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-gray-600 text-white flex items-center justify-center mr-2">
                    S
                  </div>
                  Settings
                </Link>
              </li>
              <li className="p-4">
                <button
                  onClick={handleLogout}
                  className="w-full text-center bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Sign out
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="p-4 mt-8">
                <Link
                  to="/login"
                  className="px-3 py-2 text-sm text-blue-100 bg-[#41A4FF] rounded-md"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-2 ms-3  text-sm text-gray-200 bg-gray-400 rounded-md"
                >
                  Sign up
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default AdminNavbar;
