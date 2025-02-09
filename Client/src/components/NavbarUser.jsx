import { useNavigate } from "react-router-dom";
import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from '../contexts/AuthContext';
import { useProfile } from '../contexts/ProfileContext';

const NavbarUser = () => {
  const [menuActive, setMenuActive] = useState(false);
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const { profile, getProfileImage } = useProfile();
  const [imagePreview, setImagePreview] = useState(null);

  // Load profile image when component mounts or profile changes
  useEffect(() => {
    const loadImage = async () => {
      if (profile) {
        const imageUrl = await getProfileImage();
        setImagePreview(imageUrl);
      }
    };
    loadImage();
  }, [profile, getProfileImage]);

  const toggleMenu = () => {
    setMenuActive(!menuActive);
  };

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="navbar bg-base-200 shadow-md fixed z-40">
      <div className="navbar-start">
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            onClick={toggleMenu}
            className="btn btn-ghost lg:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
          >
            <li><a href="/">Home</a></li>
            <li><a href="/dashboard/form">Find Plan</a></li>
            <li><a href="/dashboard/plans">Plans</a></li>
            <li><a href="/dashboard/FavouritesPlans">Favourites</a></li>
          </ul>
        </div>

        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            <li>
              <a href="/" className="line-under hover:bg-transparent">Home</a>
            </li>
            <li>
              <a href="/dashboard/form" className="line-under hover:bg-transparent">
                Find Plan
              </a>
            </li>
            <li>
              <a href="/dashboard/plans" className="line-under hover:bg-transparent">
                Plans
              </a>
            </li>
            <li>
              <a href="/dashboard/FavouritesPlans" className="line-under hover:bg-transparent">
                Favourites
              </a>
            </li>
          </ul>
        </div>
      </div>

      <a className="btn btn-ghost text-xl">
        <span>L<span className="text-[#8DD3BB]">O</span>GO</span>
      </a>
      
      <div className="navbar-end">
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
            <button className="btn btn-ghost btn-circle">
              <div className="indicator">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="badge badge-xs badge-primary indicator-item"></span>
              </div>
            </button>
          </div>
        </div>

        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle avatar"
          >
            <div className="w-10 rounded-full">
              <img
                alt="User avatar"
                src={imagePreview || '/default-avatar.png'}
              />
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
          >
            <li>
              <a href="/dashboard/profil" className="justify-between">
                Profile
                <span className="badge">New</span>
              </a>
            </li>
            <li><a>Settings</a></li>
            <li>
              <a onClick={handleLogout} className="cursor-pointer">
                Logout
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NavbarUser;