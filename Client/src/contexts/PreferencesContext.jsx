import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const API_URL = import.meta.env.VITE_API_URL;

export const PreferencesContext = createContext();

const STORAGE_KEYS = {
  PREFERENCES: "userPreferences",
  GENERATED_PLANS: "generatedPlans",
  FAVORITES: "userFavorites",
};

export const PreferencesProvider = ({ children }) => {
  const { token } = useContext(AuthContext);

  const [preferences, setPreferences] = useState(() => {
    const savedPreferences = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    return savedPreferences ? JSON.parse(savedPreferences) : [];
  });

  const [generatedPlans, setGeneratedPlans] = useState(() => {
    const savedPlans = localStorage.getItem(STORAGE_KEYS.GENERATED_PLANS);
    return savedPlans ? JSON.parse(savedPlans) : [];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    try {
      const parsed = savedFavorites ? JSON.parse(savedFavorites) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!token) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${API_URL}/preferencesFavorites/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Correction ici ↓
        const apiData = response.data.data || []; // Structure API: {message, data: [...]}

        if (Array.isArray(apiData)) {
          setFavorites(apiData);
        } else {
          console.error("Structure de données inattendue:", apiData);
          setFavorites([]);
        }
      } catch (error) {
        console.error("Error fetching favorites:", error);
        setError(
          error.response?.data?.message || "Échec du chargement des favoris"
        );
        setFavorites([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [token]);

  // Existing localStorage sync effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.GENERATED_PLANS,
      JSON.stringify(generatedPlans)
    );
  }, [generatedPlans]);

  const handleCreatePreference = async (preferenceData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${API_URL}/preferences/`,
        {
          lieuDepart: preferenceData.lieuDepart,
          cities: preferenceData.cities,
          dateDepart: preferenceData.dateDepart,
          dateRetour: preferenceData.dateRetour,
          budget: parseFloat(preferenceData.budget),
        },
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      const data = response.data;

      localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
      localStorage.removeItem(STORAGE_KEYS.GENERATED_PLANS);

      setPreferences([data.preference]);
      setGeneratedPlans(data.generated_plans);

      return data;
    } catch (error) {
      let errorMessage = "Une erreur est survenue";

      if (error.response) {
        const errorData = error.response.data;
        
        // Gestion spécifique de l'erreur de budget insuffisant
        if (errorData.detail?.error && errorData.detail.error.includes("Not enough budget")) {
          const budgetError = errorData.detail.error;
          // Extraction du message plus user-friendly
          errorMessage = "Budget insuffisant. " + 
            budgetError.substring(budgetError.indexOf("Not enough budget"));
          
          // Notification plus détaillée avec toast
          toast.error("Budget exceeded! 🚨 Your budget is insufficient. Please increase it or reduce the number of cities. 😊💰.", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        } else {
          // Gestion des autres types d'erreurs
          errorMessage = errorData.detail?.message || 
                        errorData.message || 
                        `Erreur ${error.response.status}`;
        }
      } else if (error.request) {
        errorMessage = "Pas de réponse du serveur";
      } else {
        errorMessage = error.message;
      }

      console.error("Erreur lors de la création de la préférence:", error);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  const addToFavorites = async (planIndex) => {
    setIsLoading(true);
    setError(null);

    try {
      const plan = generatedPlans[planIndex];
      // Récupérer l'ID de la préférence associée
      const preferenceId = preferences[preferences.length - 1]?.id;

      if (!preferenceId) {
        throw new Error("Aucune préférence trouvée");
      }

      const response = await axios.post(
        `${API_URL}/preferencesFavorites/`,
        {
          idPlan: preferenceId, // Utiliser l'ID de la préférence au lieu de l'index
          ...plan,
        },
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      if (response.data.message === "Favorite ajouté avec succès") {
        setFavorites((prev) => [...prev, response.data.data]);
        toast.success("Plan successfully added to favorites!");
        return true;
      }
      return false;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Erreur lors de l'ajout aux favoris";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromFavorites = async (index) => {
    setIsLoading(true);
    setError(null);

    try {
      // Récupérer les favoris du localStorage
      const savedFavorites = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      const parsedFavorites = savedFavorites ? JSON.parse(savedFavorites) : [];

      // Trouver le favorite_id correspondant à l'index
      const favorite = parsedFavorites[index];
      if (!favorite || !favorite.favorite_id) {
        throw new Error("Favori non trouvé");
      }

      const response = await axios.delete(
        `${API_URL}/preferencesFavorites/${favorite.favorite_id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.message === "Favori supprimé avec succès") {
        // Mettre à jour le state et le localStorage
        const updatedFavorites = parsedFavorites.filter((_, i) => i !== index);
        setFavorites(updatedFavorites);
        localStorage.setItem(
          STORAGE_KEYS.FAVORITES,
          JSON.stringify(updatedFavorites)
        );

        toast.success("Plan successfully removed from favorites!");
        return true;
      }
      return false;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Erreur lors de la suppression du favori";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PreferencesContext.Provider
      value={{
        handleCreatePreference,
        preferences,
        generatedPlans,
        isLoading,
        error,
        removeFromFavorites,
        favorites,
        addToFavorites,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error(
      "usePreferences doit être utilisé dans un PreferencesProvider"
    );
  }
  return context;
};
