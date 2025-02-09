// Import de React et des outils de routage
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import des pages principales
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import { AuthProvider } from './contexts/AuthContext';
import { ProfileProvider } from './contexts/ProfileContext'; // Add ProfileProvider
import { PreferencesProvider } from './contexts/PreferencesContext';
import UserInterface from "./pages/UserInterface";

// Import des composants
import PrivateRoute from "./components/PrivateRoute";
import Form from "./components/Form";
import Plans from "./components/Plans";
import Profil from "./components/Profil";
import Plan from "./components/Plan";
import FavouritesPlans from "./components/FavouritesPlans";
import FavouritesPlan from './components/FavouritesPlan';
import { ToastContainer } from 'react-toastify';
// Import des contextes pour la gestion d'état globale



const App = () => {
  return (
    // AuthProvider: Gère l'état d'authentification dans toute l'application
    <AuthProvider>
      <ProfileProvider> {/* Add ProfileProvider here */}
        <PreferencesProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <UserInterface />
                  </PrivateRoute>
                }
              >
                <Route path="form" element={<Form />} />
                <Route path="plans" element={<Plans />} />
                <Route path="plan" element={<Plan />} />
                <Route path="profil" element={<Profil />} />
                <Route path="FavouritesPlans" element={<FavouritesPlans />} />
                <Route path="FavouritesPlan" element={<FavouritesPlan />} />
              </Route>
            </Routes>
          </Router>
          <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
        </PreferencesProvider>
      </ProfileProvider> {/* Close ProfileProvider here */}
    </AuthProvider>
  );
};

export default App;