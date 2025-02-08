import React, { useState, useEffect } from "react";
import { MapPin, Wallet, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePreferences } from "../contexts/PreferencesContext";
import { TOURISM_IMAGES } from "../assets/tourismImages";

const Plans = () => {
  const { generatedPlans } = usePreferences();
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState(null);
  const [cachedImages, setCachedImages] = useState(() => {
    const saved = sessionStorage.getItem("planImages");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    const newImages = {};
    generatedPlans.forEach((_, index) => {
      newImages[index] = TOURISM_IMAGES[Math.floor(Math.random() * TOURISM_IMAGES.length)];
    });
    setCachedImages(newImages);
    sessionStorage.setItem("planImages", JSON.stringify(newImages));
  }, [generatedPlans]);

  const getPlanTitle = (index) => `Plan ${index + 1}`;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-MA", {
      style: "currency",
      currency: "MAD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const renderCityDays = (plan) => {
    return plan.plan.map((city, index) => (
      <div 
        key={index} 
        className="flex justify-between items-center mb-2 hover:bg-gray-50 p-2 rounded-lg transition-colors duration-300"
      >
        <span className="text-gray-600 font-medium">{city.city}</span>
        <span className="flex items-center text-gray-700">
          <Calendar className="mr-1 w-4 h-4 text-teal-500" />
          {city.days_spent} jour{city.days_spent > 1 ? "s" : ""}
        </span>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 py-16 transition-all duration-500 hover:scale-105">
          Your Travel{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-teal-600">
            Plans
          </span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {error ? (
            <div className="col-span-full text-center p-8 bg-white rounded-xl shadow-lg animate-pulse">
              <p className="text-red-500 mb-4 text-lg">Error generating travel plans</p>
              <button
                onClick={() => setError(false)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition duration-300 hover:-translate-y-1"
              >
                Retry
              </button>
            </div>
          ) : generatedPlans.length > 0 ? (
            generatedPlans.map((plan, index) => (
              <div
                key={index}
                className={`group bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-500 hover:shadow-2xl ${
                  selectedCard === index ? 'scale-105' : 'hover:scale-102'
                }`}
                onMouseEnter={() => setSelectedCard(index)}
                onMouseLeave={() => setSelectedCard(null)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={cachedImages[index] || TOURISM_IMAGES[index % TOURISM_IMAGES.length]}
                    alt="Travel"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = TOURISM_IMAGES[index % TOURISM_IMAGES.length];
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <div className="p-6 space-y-4">
                  <h3 className="text-xl font-bold flex items-center text-gray-800">
                    <MapPin className="mr-2 w-5 h-5 text-teal-500" />
                    {getPlanTitle(index)}
                  </h3>

                  <p className="flex items-center text-gray-700 font-medium">
                    <Wallet className="mr-2 w-5 h-5 text-teal-500" />
                    {formatCurrency(plan.total_cost)}
                  </p>

                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center text-gray-800">
                      <Calendar className="mr-2 w-5 h-5 text-teal-500" />
                      Jours par ville:
                    </h4>
                    <div className="space-y-1">
                      {renderCityDays(plan)}
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/dashboard/plan?planIndex=${index}`)}
                    className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-teal-400 to-teal-500 text-white font-medium 
                    transition-all duration-300 hover:shadow-lg hover:from-teal-500 hover:to-teal-600 
                    focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transform hover:-translate-y-0.5"
                  >
                    Voir les détails
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center p-12">
              <p className="text-gray-500 text-lg animate-pulse">
                Aucun plan de voyage généré pour le moment
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Plans;