import { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase'; // Import our auth and provider

export const LoginPage = () => {
  // State to hold any error messages
  const [error, setError] = useState<string | null>(null);

  // Function to handle the Google sign-in process
  const handleGoogleSignIn = async () => {
    setError(null); // Clear previous errors
    try {
      // This function opens the Google login popup
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged in App.tsx will handle the successful login
    } catch (err) {
      console.error("Error signing in with Google:", err);
      setError("Failed to sign in with Google. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="text-center p-8 bg-gray-800 rounded-lg shadow-2xl max-w-sm w-full">
        <h1 className="text-4xl font-bold text-cyan-400 mb-2">Q-Crypt Chat</h1>
        <p className="text-gray-400 mb-8">A new era of secure communication.</p>

        <button
          onClick={handleGoogleSignIn}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out flex items-center justify-center space-x-2"
        >
          {/* Simple Google Icon SVG */}
          <svg className="w-6 h-6" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.53-4.18 7.13-10.12 7.13-17.65z"></path>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.82l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
            <path fill="none" d="M0 0h48v48H0z"></path>
          </svg>
          <span>Sign in with Google</span>
        </button>

        {/* Display error message if sign-in fails */}
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
};