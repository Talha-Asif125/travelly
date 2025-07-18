import React, { useState, useEffect } from "react";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { BellIcon } from "@heroicons/react/24/outline";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../../services/notificationService";
import axios from "axios";
import ProviderBadge from "../ui/ProviderBadge";

const inside_nav = [
  {
    path: "/hotelhome",
    display: "Hotels",
  },
  {
    path: "/tours/home",
    display: "Tour Packages",
  },
  {
    path: "/vehicles",
    display: "Vehicles",
  },
  {
    path: "/Restaurants",
    display: "Restaurants",
  },
  {
    path: "/events",
    display: "Events",
  }
];

const Navbar = () => {
  const { user, loading, error, logout } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const notificationData = await getNotifications();
      setNotifications(notificationData);
      setUnreadCount(notificationData.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      loadNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    window.location.reload();
  };

  const [nav, setNav] = useState(true);

  const handleNav = () => {
    setNav(!nav);
  };

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <nav className="flex justify-around w-full py-4 bg-gray-50 sticky top-0 z-[999]">
      <div className="flex items-center">
        <h3 className="text-2xl font-bold text-[#41A4FF]">Travel Buddy</h3>
      </div>
      {/* <!-- left header section --> */}
      <div className="items-center hidden space-x-5 md:flex">
        <Link to="/">Home</Link>
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md px-3 py-2">
              Reservations
              <ChevronDownIcon
                className="-mr-1 mt-1 h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
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
            <Menu.Items className="absolute z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                {inside_nav.map((item, index) => (
                  <Menu.Item key={`nav-item-${index}`}>
                    {({ active }) => (
                      <Link
                        className={classNames(
                          active
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-700",
                          "block px-4 py-2 text-sm"
                        )}
                        to={item.path}
                      >
                        {item.display}
                      </Link>
                    )}
                  </Menu.Item>
                ))}
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
        <Link to="/community" className="text-gray-700 hover:text-blue-600 font-medium">Community</Link>
        <Link to="/map" className="text-gray-700 hover:text-blue-600 font-medium">🗺️ Map</Link>
        <Link to="/chat-hub" className="text-gray-700 hover:text-blue-600 font-medium">💬 Chat</Link>
        <Link to="/contactus">Contact us</Link>
        <Link to="/service-provider-request">Become Provider</Link>
      </div>
      {/* <!-- right header section --> */}
      <div className="items-center space-x-3 hidden md:flex">
        {user ? (
          <>
            {/* Notification Bell */}
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button className="relative rounded-full p-1 text-gray-400 hover:text-gray-600 focus:outline-none">
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                      {unreadCount}
                    </span>
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
                <Menu.Items className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-2">
                    <div className="flex justify-between items-center px-4 py-2 border-b">
                      <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-500">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((notification) => (
                          <Menu.Item key={notification.id}>
                            {({ active }) => (
                              <div
                                className={classNames(
                                  active ? "bg-gray-50" : "",
                                  !notification.read ? "bg-blue-50" : "",
                                  "block px-4 py-3 border-b border-gray-100 cursor-pointer"
                                )}
                                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                              >
                                <div className="flex justify-between">
                                  <p className={classNames(
                                    "text-sm",
                                    !notification.read ? "font-semibold text-gray-900" : "text-gray-700"
                                  )}>
                                    {notification.title}
                                  </p>
                                  <span className="text-xs text-gray-500">
                                    {getTimeAgo(notification.timestamp)}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                              </div>
                            )}
                          </Menu.Item>
                        ))
                      )}
                    </div>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>

            <button className=""></button>
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                  {/* {user.name} */}
                  <img className="h-8 w-8 rounded-full" src={user.img} alt="User"></img>
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
                <Menu.Items className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <div className="flex items-center justify-between px-4 py-2">
                      <h2 className="text-sm text-[#41A4FF] font-medium">
                        {user.name}
                      </h2>
                      <ProviderBadge user={user} size="sm" showText={false} />
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
                          to="/my-bookings"
                        >
                          My Bookings
                        </Link>
                      )}
                    </Menu.Item>
                    {user.type === 'provider' && (
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            className={classNames(
                              active
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-700",
                              "block px-4 py-2 text-sm"
                            )}
                            to="/service-provider-dashboard"
                          >
                            Provider Dashboard
                          </Link>
                        )}
                      </Menu.Item>
                    )}
                    {user.isAdmin && (
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            className={classNames(
                              active
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-700",
                              "block px-4 py-2 text-sm"
                            )}
                            to="/admin-dashboard"
                          >
                            Admin Dashboard
                          </Link>
                        )}
                      </Menu.Item>
                    )}
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
              className="px-4 py-2 text-white font-bold bg-[#41A4FF] text-center hover:bg-blue-500 cursor-pointer rounded-md"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-white font-bold bg-gray-800 text-center hover:bg-gray-600 cursor-pointer rounded-md"
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
            ? "fixed left-0 top-0 w-[60%] h-full border-r border-r-gray bg-white ease-in-out duration-500 md:hidden"
            : "fixed left-[-100%]"
        }
      >
        <h1 className="text-2xl font-medium text-blue-500 m-8">Travel Buddy</h1>
        <ul className="p-4 mt-20">
          <li className="p-4 border-b border-gray-600">
            <Link to="/">Home</Link>
          </li>
          <li className="p-4 border-b border-gray-600">
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md">
                  Reservations
                  <ChevronDownIcon
                    className="-mr-1 mt-1 h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
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
                <Menu.Items className="absolute z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    {inside_nav.map((item, index) => (
                      <Menu.Item key={`mobile-nav-item-${index}`}>
                        {({ active }) => (
                          <Link
                            className={classNames(
                              active
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-700",
                              "block px-4 py-2 text-sm"
                            )}
                            to={item.path}
                          >
                            {item.display}
                          </Link>
                        )}
                      </Menu.Item>
                    ))}
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </li>
          <li className="p-4 border-b border-gray-600">
            <Link to="/contactus">Contact us</Link>
          </li>
          <li className="p-4 border-b border-gray-600">
            <Link to="/community">Community</Link>
          </li>
          <li className="p-4 border-b border-gray-600">
            <Link to="/map">🗺️ Map</Link>
          </li>
          <li className="p-4 border-b border-gray-600">
            <Link to="/chat-hub">💬 Chat</Link>
          </li>
          <li className="p-4 border-b border-gray-600">
            <Link to="/service-provider-request">Become Provider</Link>
          </li>
          {user ? (
            <>
              <li className="p-4 border-b border-gray-600">
                <Link to="/profile">Profile</Link>
              </li>
              <li className="p-4 border-b border-gray-600">
                <Link to="/my-bookings">My Bookings</Link>
              </li>
              {user.type === 'provider' && (
                <li className="p-4 border-b border-gray-600">
                  <Link to="/service-provider-dashboard">Provider Dashboard</Link>
                </li>
              )}
              {user.isAdmin && (
                <li className="p-4 border-b border-gray-600">
                  <Link to="/admin-dashboard">Admin Dashboard</Link>
                </li>
              )}
              <li className="p-4">
                <button
                  onClick={handleLogout}
                  className="text-red-500 hover:text-red-700"
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
                  className="px-3 py-2 text-sm text-white font-bold bg-[#41A4FF] text-center hover:bg-blue-500 cursor-pointer rounded-md"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-2 ms-2 text-white  text-sm font-bold bg-gray-800 text-center hover:bg-gray-600 cursor-pointer rounded-md"
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

export default Navbar;
