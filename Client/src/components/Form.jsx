import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  FaPlane,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaWallet,
  FaSpinner,
} from "react-icons/fa";
import { usePreferences } from '../contexts/PreferencesContext';
import 'animate.css'; // Add animate.css for animations

const TravelPlanForm = () => {
  const { handleCreatePreference } = usePreferences();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [departureCity, setDepartureCity] = useState("");
  const [citiesToVisit, setCitiesToVisit] = useState([]);
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [budget, setBudget] = useState("");

  const availableCities = [
    "Casablanca",
    "Marrakech",
    "Fes",
    "Tangier",
    "Agadir",
    "Rabat",
    "Chefchaouen",
    "Essaouira",
  ];

  const showError = (message) => {
    Swal.fire({
      title: 'Oops!',
      text: message,
      icon: 'error',
      confirmButtonText: 'Got it',
      customClass: {
        popup: 'animate__animated animate__shakeX'
      }
    });
  };

  const handleAddCity = (e) => {
    const city = e.target.value;
    if (city && !citiesToVisit.includes(city)) {
      setCitiesToVisit([...citiesToVisit, city]);
    }
    e.target.value = "";
  };

  const handleRemoveCity = (cityToRemove) => {
    setCitiesToVisit(citiesToVisit.filter((city) => city !== cityToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation with English error messages using SweetAlert2
    if (!departureCity) {
      showError("Please choose a departure city");
      return;
    }
    if (citiesToVisit.length === 0) {
      showError("Please select at least one city to visit");
      return;
    }
    if (!departureDate) {
      showError("Please select a departure date");
      return;
    }
    if (!returnDate) {
      showError("Please select a return date");
      return;
    }
    if (!budget || parseFloat(budget) <= 500) {
      showError("The budget must be greater than 500 MAD");
      return;
    }

    // Validation des dates
    const departure = new Date(departureDate);
  const return_date = new Date(returnDate);

  if (return_date <= departure) {
    showError("Return date must be after departure date");
    return;
  }

  const tripDuration = Math.ceil((return_date - departure) / (1000 * 60 * 60 * 24));
  
  if (tripDuration > 90) {
    showError("Trip duration cannot exceed 90 days");
    return;
  }

  if (citiesToVisit.length > tripDuration) {
    showError(`Number of cities (${citiesToVisit.length}) cannot exceed the trip duration (${tripDuration} days)`);
    return;
  }

  const preferenceData = {
    lieuDepart: departureCity,
    cities: citiesToVisit,
    dateDepart: departureDate,
    dateRetour: returnDate,
    budget: parseFloat(budget)
  };

  setIsLoading(true);
  try {
    const response = await handleCreatePreference(preferenceData);
    Swal.fire({
      title: 'Success!',
      text: 'Your travel plan has been created',
      icon: 'success',
      confirmButtonText: 'Great!',
      customClass: {
        popup: 'animate__animated animate__bounceIn'
      }
    });
      
      // Reset form and navigate
      setDepartureCity('');
      setCitiesToVisit([]);
      setDepartureDate('');
      setReturnDate('');
      setBudget('');
      navigate('/dashboard/plans');
    } catch (error) {
      showError(error.message || 'An error occurred while creating the preference');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-6xl">
        <div className="px-8 py-6">
          <h2 className="text-3xl font-bold text-start text-gray-800 mb-8">
            Let’s Make a <span className="text-[#8DD3BB]">Plan</span> For You:
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Departure City */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaPlane className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={departureCity}
                onChange={(e) => setDepartureCity(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#030303ae] focus:border-[#0808087e] h-12 appearance-none"
              >
                <option value="" disabled>
                  Choose your departure city
                </option>
                {availableCities.map((city, index) => (
                  <option key={index} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Cities to Visit */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 pt-2 flex items-start pointer-events-none">
                <FaMapMarkerAlt className="h-5 w-5 text-gray-400 mt-2" />
              </div>
              <div className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white focus-within:ring-2 focus-within:ring-[#030303ae] focus-within:border-[#0808087e]">
                <div className="flex flex-wrap gap-2">
                  {citiesToVisit.map((city, index) => (
                    <span
                      key={index}
                      className="flex items-center px-2 py-1 bg-gray-200 rounded-full text-sm"
                    >
                      {city}
                      <button
                        type="button"
                        onClick={() => handleRemoveCity(city)}
                        className="ml-2 text-gray-600 hover:text-gray-800 focus:outline-none"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                <select
                  onChange={handleAddCity}
                  className="block w-full mt-2  border-none bg-white placeholder-gray-500 focus:outline-none h-6"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Choose the cities that you want to visit
                  </option>
                  {availableCities
                    .filter((city) => !citiesToVisit.includes(city))
                    .map((city, index) => (
                      <option key={index} value={city}>
                        {city}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Departure Date */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendarAlt className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className={`block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#030303ae] focus:border-[#0808087e] h-12 ${
                  !departureDate ? "text-gray-400" : "text-black"
                }`}
                placeholder="Departure Date"
              />
              {!departureDate && (
                <span className="absolute left-36 top-3.5 text-gray-400 pointer-events-none">
                  (Departure Date)
                </span>
              )}
            </div>

            {/* Return Date */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendarAlt className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className={`block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#030303ae] focus:border-[#0808087e] h-12 ${
                  !returnDate ? "text-gray-400" : "text-black"
                }`}
                placeholder="Return Date"
              />
              {!returnDate && (
                <span className="absolute left-36 top-3.5 text-gray-400 pointer-events-none">
                  (Return Date)
                </span>
              )}
            </div>

            {/* Budget */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaWallet className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Your budget in MAD"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#030303ae] focus:border-[#0808087e] h-12"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-900 bg-[#8DD3BB] hover:bg-[#0c0404] hover:text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0c0404] transition-colors duration-200 h-12 disabled:opacity-75"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  "Generate your plan"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TravelPlanForm;