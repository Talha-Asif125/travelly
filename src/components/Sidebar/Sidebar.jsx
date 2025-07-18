import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <ul className="sidebar-menu">
        <li>
          <Link to="/hotel-reservations">
            <i className="fas fa-book"></i>
            <span>Hotel Reservations</span>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar; 