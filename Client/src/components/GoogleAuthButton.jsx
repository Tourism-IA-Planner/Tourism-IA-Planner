import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const GoogleAuthButton = () => {
  const navigate = useNavigate();
  const { handleGoogleLogin } = useContext(AuthContext);

  useEffect(() => {
    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    };

    const cleanup = loadGoogleScript();

    const initializeGoogle = setInterval(() => {
      if (window.google) {
        clearInterval(initializeGoogle);
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById('googleButton'),
          {
            theme: 'outline',
            size: 'large',
            width: '100%',
          }
        );
      }
    }, 100);

    return () => {
      clearInterval(initializeGoogle);
      cleanup();
    };
  }, []);

  const handleCredentialResponse = async (response) => {
  try {
    console.log('Google credential response:', response); // Debug log

    if (!response.credential) {
      console.error('No credential in response');
      return;
    }

    const result = await handleGoogleLogin(response);
    console.log('handleGoogleLogin result:', result); // Debug log

    if (result) {
      navigate('/dashboard/form');
    } else {
      console.error('Google login failed without error');
    }
  } catch (error) {
    console.error('Google login error:', error);
  }
};

  return (
    <div
      id="googleButton"
      className="w-full flex justify-center items-center min-h-[40px]"
    ></div>
  );
};

export default GoogleAuthButton;