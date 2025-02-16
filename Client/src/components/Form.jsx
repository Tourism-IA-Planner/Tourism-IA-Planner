import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from 'sweetalert2';
import { motion } from "framer-motion";
import { usePreferences } from '../contexts/PreferencesContext';
import { 
  Plane, 
  MapPin, 
  Calendar, 
  Wallet, 
  Loader2, 
  PlaneTakeoff,
  PlaneLanding
} from "lucide-react";

const TravelPlanForm = () => {
  const { handleCreatePreference } = usePreferences();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [departureCity, setDepartureCity] = useState("");
  const [citiesToVisit, setCitiesToVisit] = useState([]);
  const [departureDate, setDepartureDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
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
        popup: 'animate_animated animate_shakeX'
      }
    });
  };
  
  const handleAddCity = (e) => {
    const city = e.target.value;
    if (city && !citiesToVisit.includes(city)) {
      setCitiesToVisit(prev => [...prev, city]);
    }
    e.target.value = "";
  };

  const handleRemoveCity = (cityToRemove) => {
    setCitiesToVisit(prev => 
      prev.filter(city => city !== cityToRemove)
    );
  };
  const formatDateForAPI = (date) => {
    if (!date) return null;
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

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

    const tripDuration = Math.ceil((returnDate - departureDate) / (1000 * 60 * 60 * 24));
    
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
      dateDepart: formatDateForAPI(departureDate),  // Now in YYYY-MM-DD format
      dateRetour: formatDateForAPI(returnDate),     // Now in YYYY-MM-DD format
      budget: parseFloat(budget)
    };


    setIsLoading(true);
    try {
      await handleCreatePreference(preferenceData);
      Swal.fire({
        title: 'Success!',
        text: 'Your travel plan has been created with estimated prices, which may vary.',
        icon: 'success',
        confirmButtonText: 'Confirm and Proceed',
        customClass: {
          popup: 'animate_animated animate_bounceIn'
        }
      });
      
      setDepartureCity('');
      setCitiesToVisit([]);
      setDepartureDate(null);
      setReturnDate(null);
      setBudget('');
      navigate('/dashboard/plans');
    } catch (error) {
      showError(error.message || 'An error occurred while creating the preference');
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  // Custom date input to format the display
  const CustomDateInput = React.forwardRef(({ value, onClick, placeholder, icon: Icon }, ref) => (
    <div className="relative group" onClick={onClick}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400 group-hover:text-[#8DD3BB] transition-colors duration-300" />
      </div>
      <input
        ref={ref}
        value={value}
        placeholder={placeholder}
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8DD3BB] focus:border-[#8DD3BB] h-12 transition-all duration-300 hover:border-[#8DD3BB] cursor-pointer"
        readOnly
      />
    </div>
  ));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-24 px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden md:max-w-6xl transform hover:shadow-2xl transition-all duration-300"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="px-8 py-6">
          <motion.h2 
            className="text-3xl font-bold text-start text-gray-800 mb-8"
            variants={itemVariants}
          >
<div className="flex flex-col items-center justify-center text-center gap-2">
  <h1 className="text-3xl md:text-4xl font-bold mb-2">
    Let's Build Your  
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8DD3BB] to-[#6bab93] hover:bg-gradient-to-l transition-all duration-500 mx-2">
      Perfect
    </span>
    <span className="text-[#8DD3BB] hover:text-[#6bab93] transition-colors duration-300 font-bold text-4xl md:text-4xl relative group">
      Plan    
      <span className="absolute -right-4 -top-2 transform rotate-12 text-2xl">✨</span>
    </span> 
  </h1>
  <p className="text-sm text-gray-500 italic animate-pulse">
    🤖 AI-powered and constantly improving • 💰 Estimated pricing included
  </p>
</div>
          </motion.h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div variants={itemVariants} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Plane className="h-5 w-5 text-gray-400 group-hover:text-[#8DD3BB] transition-colors duration-300" />
              </div>
              <select
                value={departureCity}
                onChange={(e) => setDepartureCity(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8DD3BB] focus:border-[#8DD3BB] h-12 appearance-none transition-all duration-300 hover:border-[#8DD3BB]"
              >
                <option value="" disabled>Choose your departure city</option>
                {availableCities.map((city, index) => (
                  <option key={index} value={city}>{city}</option>
                ))}
              </select>
            </motion.div>

            <motion.div variants={itemVariants} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 pt-2 flex items-start pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400 group-hover:text-[#8DD3BB] transition-colors duration-300" />
              </div>
              <div className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white focus-within:ring-2 focus-within:ring-[#8DD3BB] focus-within:border-[#8DD3BB] transition-all duration-300">
                <div className="flex flex-wrap gap-2">
                  {citiesToVisit.map((city, index) => (
                    <motion.span
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="flex items-center px-2 py-1 bg-[#8DD3BB] text-white rounded-full text-sm"
                    >
                      {city}
                      <button
                        type="button"
                        onClick={() => handleRemoveCity(city)}
                        className="ml-2 text-white hover:text-gray-200 focus:outline-none"
                      >
                        ×
                      </button>
                    </motion.span>
                  ))}
                </div>
                <select
                  onChange={handleAddCity}
                  className="block w-full mt-2 border-none bg-white placeholder-gray-500 focus:outline-none h-6"
                  defaultValue=""
                >
                  <option value="" disabled>Choose cities to visit</option>
                  {availableCities
                    .filter(city => !citiesToVisit.includes(city))
                    .map((city, index) => (
                      <option key={index} value={city}>{city}</option>
                    ))}
                </select>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <DatePicker
                selected={departureDate}
                onChange={date => setDepartureDate(date)}
                selectsStart
                startDate={departureDate}
                endDate={returnDate}
                minDate={new Date()}
                dateFormat="dd-MM-yyyy"
                placeholderText="Select departure date"
                customInput={<CustomDateInput icon={PlaneTakeoff} />}
                wrapperClassName="w-full"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <DatePicker
                selected={returnDate}
                onChange={date => setReturnDate(date)}
                selectsEnd
                startDate={departureDate}
                endDate={returnDate}
                minDate={departureDate}
                dateFormat="dd-MM-yyyy"
                placeholderText="Select return date"
                customInput={<CustomDateInput icon={PlaneLanding} />}
                wrapperClassName="w-full"
              />
            </motion.div>

            <motion.div variants={itemVariants} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Wallet className="h-5 w-5 text-gray-400 group-hover:text-[#8DD3BB] transition-colors duration-300" />
              </div>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Your budget in MAD"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8DD3BB] focus:border-[#8DD3BB] h-12 transition-all duration-300 hover:border-[#8DD3BB]"
              />
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="pt-4"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-900 bg-[#8DD3BB] hover:bg-[#6bab93] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8DD3BB] transition-all duration-300 h-12 disabled:opacity-75 group"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <span className="group-hover:scale-105 transition-transform duration-300">
                    Generate your plan
                  </span>
                )}
              </button>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default TravelPlanForm;