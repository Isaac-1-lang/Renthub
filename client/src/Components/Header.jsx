import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { UserContext } from "../Context/userContext";

const Header = ({ searchInput, handleQueryChange }) => {
  const { user, isLandlord } = useContext(UserContext);
  const { pathname } = useLocation();

  return (
    <header className="py-4 flex justify-between xs:px-2 sm:px-4 lg:px-18 flex-wrap sm:flex-nowrap gap-y-3 gap-x-3 border-b border-gray-100 shadow-sm">
      {/* Logo */}
      <div className="logo order-0 pl-3">
        <Link to="/" className="flex items-center gap-1 relative top-1.5 xs:top-0.5">
          <div className="flex flex-col leading-none">
            <span className="font-bold text-xl text-brand xs:text-2xl">RentHub</span>
            <span className="text-[10px] text-gray-400 tracking-widest uppercase">Rwanda</span>
          </div>
        </Link>
      </div>

      {/* Search bar — visible on home page */}
      {pathname === "/" && (
        <div className="order-2 sm:order-1 flex items-center border-2 border-gray-300 rounded-full px-2 gap-1 shadow-md
          sm:gap-3 sm:px-4 w-full max-w-[400px] lg:max-w-[500px] justify-between h-12 mx-4 xxs:mx-auto focus-within:border-brand transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Search Kigali, Musanze, Rubavu..."
            className="outline-none w-full pl-1 h-full rounded-full text-sm"
            value={searchInput}
            onChange={handleQueryChange}
          />
        </div>
      )}

      {/* Right nav */}
      <div className="sm:order-2 flex items-center gap-3">
        {isLandlord && (
          <Link to="/dashboard"
            className="hidden md:flex items-center gap-1 text-sm font-semibold text-brand border border-brand rounded-full px-4 py-1.5 hover:bg-brand hover:text-white transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
            </svg>
            Dashboard
          </Link>
        )}

        <Link to={user == null ? "/login" : "/account"}
          className="flex items-center py-2 px-4 gap-2 rounded-full border-gray-300 hover:scale-105 transition-all md:border">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 hidden md:block">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
          <div className="bg-gray-500 text-white rounded-full border border-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
              className="w-7 h-7 relative top-1">
              <path fillRule="evenodd"
                d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                clipRule="evenodd" />
            </svg>
          </div>
          {user && (
            <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[100px] truncate">
              {user.name}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
};

export default Header;
