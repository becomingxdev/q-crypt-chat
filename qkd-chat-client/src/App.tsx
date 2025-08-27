import { useState, useEffect } from 'react';
import { auth } from './firebase';
// --- THIS IS THE CORRECTED LINE ---
import { onAuthStateChanged, type User } from 'firebase/auth';
// --- END OF CORRECTION ---
import { LoginPage } from './components/LoginPage';
import { ChatPage } from './components/ChatPage';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <p>Loading...</p>
        </div>
    );
  }

  return (
    <>
      {user ? <ChatPage /> : <LoginPage />}
    </>
  );
}

export default App;