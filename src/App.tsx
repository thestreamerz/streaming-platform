import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { onAuthStateChange } from './services/auth';
import CMSPage from './pages/CMSPage';
import MainPlatform from './components/MainPlatform';




function App() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChange((authUser) => {
      console.log('Auth state changed:', authUser);
      setUser(authUser);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Routes>
      <Route path="/cms" element={<CMSPage />} />
      <Route path="/*" element={<MainPlatform user={user} setUser={setUser} />} />
    </Routes>
  );
}

export default App;