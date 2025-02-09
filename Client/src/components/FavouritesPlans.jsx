import React, { useState, useEffect } from "react";
import { MapPin, Wallet, Calendar, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePreferences } from "../contexts/PreferencesContext";
import { TOURISM_IMAGES } from "../assets/tourismImages";

const FavouritesPlans = () => {
  const { favorites } = usePreferences();
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState(null);
  const [cachedImages, setCachedImages] = useState(() => {
    const saved = sessionStorage.getItem("favoriteImages");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    if (!Array.isArray(favorites)) return;
    
    const newImages = {};
    favorites.forEach((_, index) => {
      newImages[index] = TOURISM_IMAGES[Math.floor(Math.random() * TOURISM_IMAGES.length)];
    });
    setCachedImages(newImages);
    sessionStorage.setItem("favoriteImages", JSON.stringify(newImages));
  }, [favorites]);

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return '0 MAD';
    return new Intl.NumberFormat("fr-MA", {
      style: "currency",
      currency: "MAD",
      minimumFractionDigits: 0,
    }).format(Math.round(amount));
  };

  const renderCityDays = (plan) => {
    if (!plan?.plan || !Array.isArray(plan.plan)) return null;
    
    return plan.plan.map((city, index) => (
      <div 
        key={index} 
        className="flex justify-between items-center mb-2 hover:bg-gray-50 p-2 rounded-lg transition-colors duration-300"
      >
        <span className="text-gray-600 font-medium">{city?.city || 'Unknown city'}</span>
        <span className="flex items-center text-gray-700">
          <Calendar className="mr-1 w-4 h-4 text-teal-500" />
          {Math.round(city?.days_spent || 0)} day{Math.round(city?.days_spent || 0) > 1 ? "s" : ""}
        </span>
      </div>
    ));
  };

  const renderFavoriteCard = (favorite, index) => {
    if (!favorite?.favorite_data) return null;

    const {
      total_cost = 0,
      total_days_spent = 0,
      breakdown = {
        hotels_total: 0,
        activities_total: 0,
        transport_total: 0
      }
    } = favorite.favorite_data;

    return (
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
          <div className="absolute top-2 right-2">
            <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
          </div>
        </div>

        <div className="p-6 space-y-4">
          <h3 className="text-xl font-bold flex items-center text-gray-800">
            <MapPin className="mr-2 w-5 h-5 text-teal-500" />
            Favorite Plan {index + 1}
          </h3>

          <p className="flex items-center text-gray-700 font-medium">
            <Wallet className="mr-2 w-5 h-5 text-teal-500" />
            {formatCurrency(total_cost)}
          </p>

          <div className="space-y-2">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold flex items-center text-gray-800">
                <Calendar className="mr-2 w-5 h-5 text-teal-500" />
                Total Duration:
              </h4>
              <span className="text-gray-700">
                {Math.round(total_days_spent)} days
              </span>
            </div>
            
            <h4 className="font-semibold text-gray-800 mb-2">
              Details by City:
            </h4>
            <div className="space-y-1">
              {renderCityDays(favorite.favorite_data)}
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <h4 className="font-semibold text-gray-800 mb-2">Budget Breakdown:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span>Hotels:</span>
                <span>{formatCurrency(breakdown.hotels_total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Activities:</span>
                <span>{formatCurrency(breakdown.activities_total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Transport:</span>
                <span>{formatCurrency(breakdown.transport_total)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate(`/dashboard/FavouritesPlan?planIndex=${index}&isFavorite=true`)}
            className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-teal-400 to-teal-500 text-white font-medium 
            transition-all duration-300 hover:shadow-lg hover:from-teal-500 hover:to-teal-600 
            focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transform hover:-translate-y-0.5"
          >
            View Details
          </button>
        </div>
      </div>
    );
  };

  if (!Array.isArray(favorites)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 py-16">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 py-16 transition-all duration-500 hover:scale-105">
          Your Favorite{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-teal-600">
            Plans
          </span>
        </h1>

        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {favorites.map((favorite, index) => renderFavoriteCard(favorite, index))}
          </div>
        ) : (
          <div className="text-center p-12 bg-white rounded-xl shadow-lg">
            <p className="text-gray-500 text-lg">
              You don't have any favorite plans yet
            </p>
            <button
              onClick={() => navigate('/dashboard/plans')}
              className="mt-4 px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors duration-300"
            >
              Discover Plans
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavouritesPlans;
