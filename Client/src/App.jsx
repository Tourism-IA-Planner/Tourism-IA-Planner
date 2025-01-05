import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PrivateRoute from "./components/PrivateRoute";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import { AuthProvider } from './contexts/AuthContext';
import { PreferencesProvider  } from './contexts/PreferencesContext'; // Import du UsersProvider
import UserInterface from "./pages/UserInterface";
import Form from "./components/Form";
import Plans from "./components/Plans";

const App = () => {
  return (
    
      <PreferencesProvider>{/* Enveloppement avec UsersProvider */}
        <Router>
          <Routes>
            {/* Route principale */}
            <Route path="/" element={<Home />} />
            
            {/* Routes d'authentification */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Route protégée pour /dashboard1 */}
            <Route
              path="/dashboard1"
              element={
                <PrivateRoute>
                  <UserInterface />
                </PrivateRoute>
              }
            >
              {/* Routes imbriquées sous /dashboard1 */}
              <Route path="form" element={<Form />} />
              <Route path="plans" element={<Plans />} />
            </Route>

            {/* Vous pouvez ajouter d'autres routes ici */}
          </Routes>
        </Router>
        </PreferencesProvider>
   
  );
};

export default App;
