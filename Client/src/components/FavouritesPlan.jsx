import React, { useState, useContext, useEffect } from "react";
import { MapPin, Hotel, List, Plane, Clock, Star } from "lucide-react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { motion, AnimatePresence } from "framer-motion";
import { PreferencesContext } from '../contexts/PreferencesContext';
import { useSearchParams } from "react-router-dom";

const FavouritesPlan = () => {
  const { favorites } = useContext(PreferencesContext);
  const [searchParams] = useSearchParams();
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const [activeSection, setActiveSection] = useState(null);

  const MAD_RATE = 1;

  useEffect(() => {
    const urlIndex = parseInt(searchParams.get('planIndex')) || 0;
    setSelectedPlanIndex(Math.min(urlIndex, (favorites?.length || 1) - 1));
  }, [favorites, searchParams]);

  if (!favorites || favorites.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex h-screen items-center justify-center"
      >
        <p className="text-gray-600 text-lg animate-pulse">Aucun plan favori trouvé.</p>
      </motion.div>
    );
  }

  const currentPlan = favorites[selectedPlanIndex].favorite_data;
  const breakdown = currentPlan.breakdown;
  const planItems = currentPlan.plan;

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const cardHoverVariants = {
    hover: { scale: 1.02, transition: { duration: 0.2 } }
  };

  return (
    <div className="pt-24 px-4 pb-12 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <motion.div 
        className="max-w-6xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={fadeInUpVariants}
      >
        <AnimatePresence mode="wait">
          <motion.div 
            key={selectedPlanIndex}
            className="flex justify-center mb-6 space-x-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {favorites.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setSelectedPlanIndex(index)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-3 rounded-lg flex items-center space-x-2 shadow-md transition-colors duration-300 ${
                  selectedPlanIndex === index 
                    ? "bg-gradient-to-r from-teal-400 to-teal-500 text-white" 
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Star className={`w-5 h-5 ${selectedPlanIndex === index ? "text-white" : "text-teal-500"}`} />
                <span>Plan Favori {index + 1}</span>
              </motion.button>
            ))}
          </motion.div>
        </AnimatePresence>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { icon: Hotel, title: "Hotels", value: breakdown.hotels_total },
              { icon: List, title: "Activities", value: breakdown.activities_total },
              { icon: Plane, title: "Transport", value: breakdown.transport_total }
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={cardHoverVariants}
                whileHover="hover"
                className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-lg shadow-md transform transition-all duration-300"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <item.icon className="text-teal-500 w-6 h-6" />
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {Math.floor(item.value * MAD_RATE)} MAD
                </p>
              </motion.div>
            ))}
          </div>

          <div className="space-y-8">
            <AnimatePresence mode="wait">
              {planItems.map((cityPlan, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  whileHover={{ scale: 1.01 }}
                  className={`bg-gray-50 p-6 rounded-lg border-l-4 border-teal-400 shadow-md transition-all duration-300 ${
                    activeSection === index ? 'ring-2 ring-teal-400 ring-opacity-50' : ''
                  }`}
                  onClick={() => setActiveSection(activeSection === index ? null : index)}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start mb-6">
                    <div className="flex items-center space-x-3">
                      <MapPin className="text-teal-500 w-6 h-6" />
                      <h4 className="text-xl font-semibold">{cityPlan.city}</h4>
                    </div>
                    <motion.div 
                      className="flex items-center space-x-4 mt-4 md:mt-0"
                      whileHover={{ scale: 1.05 }}
                    >
                      <span className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                        {cityPlan.days_spent} jour{cityPlan.days_spent > 1 ? 's' : ''}
                      </span>
                    </motion.div>
                  </div>

                  <AnimatePresence>
                    {(activeSection === index || activeSection === null) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="mb-6">
                          <div className="flex items-center space-x-3 mb-2">
                            <Hotel className="text-teal-500 w-5 h-5" />
                            <h5 className="font-medium">Hotel</h5>
                          </div>
                          <motion.div 
                            className="bg-white p-4 rounded-lg shadow-sm"
                            whileHover={{ scale: 1.01 }}
                          >
                            <p className="font-medium">{cityPlan.hotel.name}</p>
                            <p className="text-gray-600">{Math.floor(cityPlan.hotel.pricePerNight * MAD_RATE)} MAD/night</p>
                          </motion.div>
                        </div>

                        <div>
                          <div className="flex items-center space-x-3 mb-4">
                            <Clock className="text-teal-500 w-5 h-5" />
                            <h5 className="font-medium">Activities</h5>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {cityPlan.activities.map((activity, actIndex) => (
                              <motion.div 
                                key={actIndex} 
                                className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center"
                                whileHover={{ scale: 1.02 }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: actIndex * 0.1 }}
                              >
                                <span className="text-gray-700">{activity.name}</span>
                                <span className="font-medium">{Math.floor(activity.price * MAD_RATE)} MAD</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <motion.div 
            className="mt-8 bg-gradient-to-br from-blue-50 to-white p-6 rounded-lg shadow-lg"
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold mb-2">Total Cost</h3>
                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-600">
                  {Math.floor(currentPlan.total_cost * MAD_RATE)} MAD
                </p>
              </div>
              <div className="mt-4 md:mt-0 w-32">
                <CircularProgressbar
                  value={currentPlan.total_days_spent * 20}
                  text={`${currentPlan.total_days_spent} jours`}
                  styles={buildStyles({
                    pathColor: '#2dd4bf',
                    textColor: '#2dd4bf',
                    trailColor: '#d6d6d6'
                  })}
                />
                <p className="text-center mt-2 text-sm">Durée du voyage</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FavouritesPlan;