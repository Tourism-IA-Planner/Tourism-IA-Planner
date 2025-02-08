import React, { useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const GoogleAuth = ({ onSuccess, onError }) => {
  const { googleLogin } = useContext(AuthContext);

  useEffect(() => {
    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      return () => document.body.removeChild(script);
    };

    const initializeGoogleSignIn = () => {
      window.google.accounts.id.initialize({
        client_id: '103830107527-er6pmilg0sdqn8m6i1elpavsddm1vbpi.apps.googleusercontent.com',
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        {
          type: 'standard',
          size: 'large',
          theme: 'outline',
          text: 'sign_in_with',
          shape: 'rectangular',
          logo_alignment: 'left',
        }
      );
    };

    const handleCredentialResponse = async (response) => {
      try {
        const success = await googleLogin({ credential: response.credential });
        if (success) {
          onSuccess();
        } else {
          onError('Échec de la connexion Google');
        }
      } catch (error) {
        onError('Erreur lors de la connexion Google');
      }
    };

    const cleanupScript = loadGoogleScript();
    
    const timer = setInterval(() => {
      if (window.google) {
        clearInterval(timer);
        initializeGoogleSignIn();
      }
    }, 100);

    return () => {
      cleanupScript();
      clearInterval(timer);
    };
  }, [googleLogin, onSuccess, onError]);

  return (
    <div className="w-full mt-5">
      <div id="google-signin-button" className="w-full flex justify-center" />
    </div>
  );
};

// Changer la dernière ligne
export default GoogleAuth;