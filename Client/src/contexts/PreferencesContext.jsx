import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const API_URL = import.meta.env.VITE_API_URL;

export const PreferencesContext = createContext();

const STORAGE_KEYS = {
  PREFERENCES: 'userPreferences',
  GENERATED_PLANS: 'generatedPlans',
  FAVORITES: 'userFavorites'
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
          headers: { Authorization: `Bearer ${token}` }
        });
  
        // Correction ici ↓
        const apiData = response.data.data || []; // Structure API: {message, data: [...]}
        
        if (Array.isArray(apiData)) {
          setFavorites(apiData);
        } else {
          console.error('Structure de données inattendue:', apiData);
          setFavorites([]);
        }
        
      } catch (error) {
        console.error('Error fetching favorites:', error);
        setError(error.response?.data?.message || 'Échec du chargement des favoris');
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
    localStorage.setItem(STORAGE_KEYS.GENERATED_PLANS, JSON.stringify(generatedPlans));
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
          budget: parseFloat(preferenceData.budget)
        },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
          }
        }
      );

      const data = response.data;
      
      // Vider le localStorage avant de mettre à jour avec les nouvelles données
      localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
      localStorage.removeItem(STORAGE_KEYS.GENERATED_PLANS);
      
      // Mettre à jour les états avec uniquement les nouvelles données
      setPreferences([data.preference]);
      setGeneratedPlans(data.generated_plans);
      
      return data;
    } catch (error) {
      let errorMessage = 'Une erreur est survenue';
      
      if (error.response) {
        const errorData = error.response.data;
        errorMessage = errorData.message || `Erreur ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Pas de réponse du serveur';
      } else {
        errorMessage = error.message;
      }

      console.error('Erreur lors de la création de la préférence:', error);
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
        throw new Error('Aucune préférence trouvée');
      }
  
      const response = await axios.post(
        `${API_URL}/preferencesFavorites/`,
        {
          idPlan: preferenceId, // Utiliser l'ID de la préférence au lieu de l'index
          ...plan
        },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
          }
        }
      );
  
      if (response.data.message === "Favorite ajouté avec succès") {
        setFavorites(prev => [...prev, response.data.data]);
        toast.success('Plan ajouté aux favoris avec succès!');
        return true;
      }
      return false;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de l\'ajout aux favoris';
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

        favorites,
        addToFavorites
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};



export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences doit être utilisé dans un PreferencesProvider');
  }
  return context;
};